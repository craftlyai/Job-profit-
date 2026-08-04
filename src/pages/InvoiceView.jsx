import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Download, CheckCircle, Percent } from 'lucide-react'
import InvoiceTemplate from '../components/InvoiceTemplate'
import { generateInvoiceNumber } from '../lib/calculations'

function InvoiceView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const invoiceRef = useRef(null)
  const [job, setJob] = useState(null)
  const [materials, setMaterials] = useState([])
  const [labor, setLabor] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [taxRate, setTaxRate] = useState(0)
  const [markingInvoiced, setMarkingInvoiced] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchData() }, [id])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      const { data: jobData } = await supabase.from('jobs').select('*').eq('id', id).single()
      setJob(jobData)

      const { data: materialsData } = await supabase.from('materials').select('*').eq('job_id', id)
      setMaterials(materialsData || [])

      const { data: laborData } = await supabase.from('labor_entries').select('*').eq('job_id', id)
      setLabor(laborData || [])

      const { count } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).not('invoice_number', 'is', null)
      setInvoiceNumber(generateInvoiceNumber(count || 0))
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = () => {
    const doc = new jsPDF('p', 'pt', 'letter')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 40

    const addText = (text, x, y, options = {}) => {
      doc.text(text, x, y, options)
      return y + (options.size || 12) + 4
    }

    let y = margin

    doc.setFontSize(24)
    doc.setTextColor(26, 35, 64)
    doc.setFont('helvetica', 'bold')
    y = addText(profile?.business_name || 'Your Business', margin, y, { size: 24 })

    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    y = addText(profile?.full_name || '', margin, y, { size: 11 })
    if (profile?.phone) y = addText(profile.phone, margin, y, { size: 11 })

    doc.setFontSize(20)
    doc.setTextColor(26, 35, 64)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', pageWidth - margin - 100, margin + 20, { align: 'right' })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(invoiceNumber, pageWidth - margin, margin + 36, { align: 'right' })
    doc.text(new Date().toLocaleDateString('en-US'), pageWidth - margin, margin + 50, { align: 'right' })

    y = Math.max(y, margin + 60)

    y += 10
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'bold')
    y = addText('BILL TO', margin, y, { size: 9 })

    doc.setFontSize(11)
    doc.setTextColor(50, 50, 50)
    doc.setFont('helvetica', 'normal')
    y = addText(job.client_name, margin, y, { size: 11 })
    if (job.client_email) y = addText(job.client_email, margin, y, { size: 11 })
    if (job.client_phone) y = addText(job.client_phone, margin, y, { size: 11 })
    if (job.job_address) y = addText(job.job_address, margin, y, { size: 11 })

    y += 15
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 25, 3, 3, 'F')
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    addText(`Job: ${job.job_name}`, margin + 5, y + 12, { size: 10 })

    y += 35

    const colWidths = [pageWidth - margin * 2 - 180, 60, 60, 60]
    const colX = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]]

    doc.setFillColor(26, 35, 64)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.rect(margin, y, pageWidth - margin * 2, 22, 'F')
    doc.text('Description', colX[0] + 5, y + 14)
    doc.text('Qty', colX[1] + 5, y + 14)
    doc.text('Rate', colX[2] + 5, y + 14)
    doc.text('Amount', colX[3] + 5, y + 14)

    y += 22

    doc.setTextColor(50, 50, 50)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    const totalLaborHours = labor.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0)
    const avgHourlyRate = labor.length > 0 ? labor.reduce((sum, l) => sum + (parseFloat(l.hourly_rate) || 0), 0) / labor.length : 0
    const totalLaborCost = labor.reduce((sum, l) => sum + (parseFloat(l.total_cost) || 0), 0)

    if (totalLaborHours > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text('Labor', colX[0] + 5, y + 12)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.text(`${totalLaborHours.toFixed(1)} hours @ $${avgHourlyRate.toFixed(2)}/hr`, colX[0] + 5, y + 22)
      doc.setFontSize(10)
      doc.setTextColor(50, 50, 50)
      doc.text(`${totalLaborHours.toFixed(1)} hrs`, colX[1] + 5, y + 12)
      doc.text(`$${avgHourlyRate.toFixed(2)}`, colX[2] + 5, y + 12)
      doc.text(`$${totalLaborCost.toFixed(2)}`, colX[3] + 5, y + 12)
      y += 30
    }

    materials.forEach(material => {
      if (y > pageHeight - 100) { doc.addPage(); y = margin }
      doc.text(material.name, colX[0] + 5, y + 12)
      doc.text(`${material.quantity} ${material.unit}`, colX[1] + 5, y + 12)
      doc.text(`$${parseFloat(material.unit_cost).toFixed(2)}`, colX[2] + 5, y + 12)
      doc.text(`$${parseFloat(material.total_cost).toFixed(2)}`, colX[3] + 5, y + 12)
      y += 20
    })

    y += 10
    const subtotal = materials.reduce((sum, m) => sum + (parseFloat(m.total_cost) || 0), 0) + totalLaborCost
    const taxAmount = subtotal * (taxRate / 100)
    const totalDue = subtotal + taxAmount

    doc.setDrawColor(200, 200, 200)
    doc.line(pageWidth - margin - 200, y, pageWidth - margin, y)
    y += 15

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text('Subtotal', pageWidth - margin - 100, y, { align: 'right' })
    doc.setTextColor(50, 50, 50)
    doc.setFont('helvetica', 'bold')
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
    y += 18

    if (taxRate > 0) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      doc.text(`Tax (${taxRate}%)`, pageWidth - margin - 100, y, { align: 'right' })
      doc.setTextColor(50, 50, 50)
      doc.setFont('helvetica', 'bold')
      doc.text(`$${taxAmount.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })
      y += 18
    }

    doc.setDrawColor(26, 35, 64)
    doc.setLineWidth(1.5)
    doc.line(pageWidth - margin - 200, y - 5, pageWidth - margin, y - 5)
    y += 15

    doc.setFontSize(12)
    doc.setTextColor(26, 35, 64)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL DUE', pageWidth - margin - 100, y, { align: 'right' })
    doc.setFontSize(14)
    doc.text(`$${totalDue.toFixed(2)}`, pageWidth - margin, y, { align: 'right' })

    if (profile?.payment_instructions) {
      y += 40
      if (y > pageHeight - 80) { doc.addPage(); y = margin }
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.setFont('helvetica', 'bold')
      y = addText('PAYMENT INSTRUCTIONS', margin, y, { size: 9 })
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      doc.setFontSize(10)
      const lines = doc.splitTextToSize(profile.payment_instructions, pageWidth - margin * 2)
      lines.forEach(line => { y = addText(line, margin, y, { size: 10 }) })
    }

    doc.setFontSize(9)
    doc.setTextColor(180, 180, 180)
    doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 30, { align: 'center' })

    doc.save(`${invoiceNumber}-${job.client_name.replace(/\s+/g, '_')}.pdf`)
  }

  const handleMarkInvoiced = async () => {
    setMarkingInvoiced(true)
    try {
      const { error } = await supabase.from('jobs').update({
        status: 'invoiced',
        invoice_number: invoiceNumber,
        end_date: new Date().toISOString().split('T')[0]
      }).eq('id', id)
      if (error) throw error
      showToast('Marked as Invoiced')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      showToast('Error marking as invoiced', 'error')
    } finally {
      setMarkingInvoiced(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Job not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 left-4 right-4 flex justify-center z-50">
          <div className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-navy-900 text-white'}`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="bg-navy-900 text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(`/jobs/${id}`)} className="p-2 -ml-2 rounded-lg hover:bg-white/10">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Invoice Preview</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="card mb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Percent size={16} /> Tax Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            className="input-field"
            placeholder="0.00"
          />
        </div>

        <div className="mb-4 overflow-hidden rounded-2xl shadow-lg border border-gray-200">
          <div ref={invoiceRef}>
            <InvoiceTemplate
              job={job}
              materials={materials}
              labor={labor}
              profile={profile}
              invoiceNumber={invoiceNumber}
              taxRate={taxRate}
            />
          </div>
        </div>

        <div className="space-y-3 pb-8">
          <button onClick={generatePDF} className="btn-primary">
            <Download size={18} /> Download PDF
          </button>

          <button
            onClick={handleMarkInvoiced}
            disabled={markingInvoiced || job.status === 'invoiced' || job.status === 'paid'}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 min-h-[48px] transition-transform active:scale-95 ${
              job.status === 'invoiced' || job.status === 'paid'
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-profit text-white'
            }`}
          >
            <CheckCircle size={18} />
            {job.status === 'invoiced' || job.status === 'paid' ? 'Already Invoiced' : (markingInvoiced ? 'Marking...' : 'Mark as Invoiced')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InvoiceView
