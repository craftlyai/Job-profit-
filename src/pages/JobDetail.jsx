import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Trash2, Plus, FileText, ChevronDown, Pencil, X } from 'lucide-react'
import MaterialForm from '../components/MaterialForm'
import LabourForm from '../components/LabourForm'
import CostSummaryBox from '../components/CostSummaryBox'
import { calculateJobCosts, calculateProfit, formatCurrency, formatDate } from '../lib/calculations'

const statusOptions = [
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-700' },
  { value: 'invoiced', label: 'Invoiced', color: 'bg-orange-100 text-orange-700' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-700' },
]

function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [materials, setMaterials] = useState([])
  const [labor, setLabor] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [showLaborForm, setShowLaborForm] = useState(false)
  const [editingJob, setEditingJob] = useState(false)
  const [editForm, setEditForm] = useState({})
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
      setEditForm(jobData || {})

      const { data: materialsData } = await supabase.from('materials').select('*').eq('job_id', id).order('created_at', { ascending: true })
      setMaterials(materialsData || [])

      const { data: laborData } = await supabase.from('labor_entries').select('*').eq('job_id', id).order('work_date', { ascending: true })
      setLabor(laborData || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', id)
      if (error) throw error
      setJob(prev => ({ ...prev, status: newStatus }))
      showToast('Status updated')
    } catch (err) {
      showToast('Error updating status', 'error')
    }
  }

  const handleAddMaterial = async (materialData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('materials').insert([{ ...materialData, job_id: id, user_id: user.id }])
      if (error) throw error
      setShowMaterialForm(false)
      fetchData()
      showToast('Material added')
    } catch (err) {
      showToast('Error adding material', 'error')
    }
  }

  const handleDeleteMaterial = async (materialId) => {
    if (!confirm('Delete this material?')) return
    try {
      const { error } = await supabase.from('materials').delete().eq('id', materialId)
      if (error) throw error
      fetchData()
      showToast('Material deleted')
    } catch (err) {
      showToast('Error deleting material', 'error')
    }
  }

  const handleAddLabor = async (laborData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('labor_entries').insert([{ ...laborData, job_id: id, user_id: user.id }])
      if (error) throw error
      setShowLaborForm(false)
      fetchData()
      showToast('Labour entry added')
    } catch (err) {
      showToast('Error adding labour', 'error')
    }
  }

  const handleDeleteLabor = async (laborId) => {
    if (!confirm('Delete this labour entry?')) return
    try {
      const { error } = await supabase.from('labor_entries').delete().eq('id', laborId)
      if (error) throw error
      fetchData()
      showToast('Labour entry deleted')
    } catch (err) {
      showToast('Error deleting labour', 'error')
    }
  }

  const handleSaveJobEdit = async () => {
    try {
      const { error } = await supabase.from('jobs').update({
        job_name: editForm.job_name,
        client_name: editForm.client_name,
        client_phone: editForm.client_phone,
        client_email: editForm.client_email,
        job_address: editForm.job_address,
        visit_date: editForm.visit_date || null,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
        estimated_amount: editForm.estimated_amount ? parseFloat(editForm.estimated_amount) : null,
        bid_amount: editForm.bid_amount ? parseFloat(editForm.bid_amount) : null,
        work_description: editForm.work_description || null,
      }).eq('id', id)
      if (error) throw error
      setJob(editForm)
      setEditingJob(false)
      showToast('Job updated')
    } catch (err) {
      showToast('Error updating job', 'error')
    }
  }

  const getLaborDisplay = (entry) => {
    if (entry.calculation_method === 'per_day') {
      const w = entry.workers || 1
      const d = entry.days || 0
      const r = entry.daily_rate || 0
      return `${w} worker${w > 1 ? 's' : ''} × ${d} day${d > 1 ? 's' : ''} × ${formatCurrency(r)}/day`
    }
    if (entry.calculation_method === 'per_hour') {
      const w = entry.workers || 1
      const h = entry.hours || 0
      const r = entry.hourly_rate || 0
      return `${w} worker${w > 1 ? 's' : ''} × ${h} hr${h > 1 ? 's' : ''} × ${formatCurrency(r)}/hr`
    }
    return 'Fixed labour amount'
  }

  const { totalMaterialCost, totalLaborCost, totalJobCost } = calculateJobCosts(materials, labor)
  const { profit, margin, hasBid, isProfitable } = calculateProfit(job?.bid_amount, totalJobCost)
  const currentStatus = statusOptions.find(s => s.value === job?.status)

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
    <div className="min-h-screen bg-gray-50 pb-8">
      {toast && (
        <div className="fixed top-4 left-4 right-4 flex justify-center z-50">
          <div className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-navy-900 text-white'}`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="bg-navy-900 text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-white/10">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold truncate">{job.job_name}</h1>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">{job.client_name}</p>
              <p className="text-gray-400 text-xs">{job.job_address}</p>
            </div>
            <div className="relative">
              <select
                value={job.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-semibold cursor-pointer ${currentStatus?.color || 'bg-gray-100 text-gray-700'}`}
              >
                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {editingJob ? (
          <div className="card space-y-3">
            <h3 className="font-bold text-navy-900">Edit Job Details</h3>
            <input type="text" value={editForm.job_name || ''} onChange={e => setEditForm(prev => ({ ...prev, job_name: e.target.value }))} className="input-field" placeholder="Job Name" />
            <input type="text" value={editForm.client_name || ''} onChange={e => setEditForm(prev => ({ ...prev, client_name: e.target.value }))} className="input-field" placeholder="Client Name" />
            <input type="text" value={editForm.client_phone || ''} onChange={e => setEditForm(prev => ({ ...prev, client_phone: e.target.value }))} className="input-field" placeholder="Client Phone" />
            <input type="email" value={editForm.client_email || ''} onChange={e => setEditForm(prev => ({ ...prev, client_email: e.target.value }))} className="input-field" placeholder="Client Email" />
            <input type="text" value={editForm.job_address || ''} onChange={e => setEditForm(prev => ({ ...prev, job_address: e.target.value }))} className="input-field" placeholder="Job Address" />
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Visit Date</label>
                <input type="date" value={editForm.visit_date || ''} onChange={e => setEditForm(prev => ({ ...prev, visit_date: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input type="date" value={editForm.start_date || ''} onChange={e => setEditForm(prev => ({ ...prev, start_date: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input type="date" value={editForm.end_date || ''} onChange={e => setEditForm(prev => ({ ...prev, end_date: e.target.value }))} className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Estimated Amount</label>
                <input type="number" step="0.01" value={editForm.estimated_amount || ''} onChange={e => setEditForm(prev => ({ ...prev, estimated_amount: e.target.value }))} className="input-field" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Final / Agreed Amount</label>
                <input type="number" step="0.01" value={editForm.bid_amount || ''} onChange={e => setEditForm(prev => ({ ...prev, bid_amount: e.target.value }))} className="input-field" placeholder="0.00" />
              </div>
            </div>

            <textarea value={editForm.work_description || ''} onChange={e => setEditForm(prev => ({ ...prev, work_description: e.target.value }))} className="input-field resize-none" rows={3} placeholder="Work Requirement / Description" />
            
            <div className="flex gap-2">
              <button onClick={handleSaveJobEdit} className="btn-primary flex-1">Save</button>
              <button onClick={() => { setEditingJob(false); setEditForm(job) }} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="card space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-navy-900">Job Details</h3>
              <button onClick={() => setEditingJob(true)} className="p-2 text-gray-400 hover:text-navy-900">
                <Pencil size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">Visit Date</p>
                <p className="font-medium">{formatDate(job.visit_date) || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="font-medium">{formatDate(job.start_date) || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">End Date</p>
                <p className="font-medium">{formatDate(job.end_date) || '—'}</p>
              </div>
            </div>

            {(job.estimated_amount > 0 || job.bid_amount > 0) && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Estimated Amount</p>
                  <p className="font-semibold text-navy-900">{formatCurrency(job.estimated_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Final / Agreed Amount</p>
                  <p className="font-semibold text-navy-900">{formatCurrency(job.bid_amount)}</p>
                </div>
              </div>
            )}

            {job.work_description && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Work Requirement / Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{job.work_description}</p>
              </div>
            )}
          </div>
        )}

        {/* Materials */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-navy-900 text-lg">Materials</h2>
            <button onClick={() => setShowMaterialForm(!showMaterialForm)} className="flex items-center gap-1 text-sm font-semibold text-navy-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Plus size={16} /> Add
            </button>
          </div>
          {showMaterialForm && (
            <MaterialForm
              onSave={handleAddMaterial}
              onCancel={() => setShowMaterialForm(false)}
            />
          )}
          {materials.length === 0 ? (
            <div className="card text-center py-6"><p className="text-gray-400 text-sm">No materials added yet</p></div>
          ) : (
            <div className="space-y-2">
              {materials.map(m => (
                <div key={m.id} className="card flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-navy-900 truncate">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.quantity} {m.unit} @ {formatCurrency(m.unit_cost)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-navy-900">{formatCurrency(m.total_cost)}</span>
                    <button onClick={() => handleDeleteMaterial(m.id)} className="p-2 text-gray-400 hover:text-loss rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between px-2 pt-2 border-t border-gray-200">
                <span className="font-semibold text-sm text-gray-600">Materials Total</span>
                <span className="font-bold text-navy-900">{formatCurrency(totalMaterialCost)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Labour */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-navy-900 text-lg">Labour</h2>
            <button onClick={() => setShowLaborForm(!showLaborForm)} className="flex items-center gap-1 text-sm font-semibold text-navy-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Plus size={16} /> Add
            </button>
          </div>
          {showLaborForm && (
            <LabourForm
              onSave={handleAddLabor}
              onCancel={() => setShowLaborForm(false)}
              defaultRate={profile?.default_hourly_rate}
            />
          )}
          {labor.length === 0 ? (
            <div className="card text-center py-6"><p className="text-gray-400 text-sm">No labour entries added yet</p></div>
          ) : (
            <div className="space-y-2">
              {labor.map(entry => (
                <div key={entry.id} className="card flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-navy-900 truncate">{entry.worker_name || 'Labour'}</p>
                    <p className="text-xs text-gray-500">{formatDate(entry.work_date)} — {getLaborDisplay(entry)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-navy-900">{formatCurrency(entry.total_cost)}</span>
                    <button onClick={() => handleDeleteLabor(entry.id)} className="p-2 text-gray-400 hover:text-loss rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between px-2 pt-2 border-t border-gray-200">
                <span className="font-semibold text-sm text-gray-600">Labour Total</span>
                <span className="font-bold text-navy-900">{formatCurrency(totalLaborCost)}</span>
              </div>
            </div>
          )}
        </div>

        <CostSummaryBox
          materialsCost={totalMaterialCost}
          laborCost={totalLaborCost}
          bidAmount={job.bid_amount}
          profit={profit}
          margin={margin}
          hasBid={hasBid}
          isProfitable={isProfitable}
        />

        <Link to={`/jobs/${id}/invoice`} className="btn-primary block text-center">
          <FileText size={18} /> Generate Invoice PDF
        </Link>
      </div>
    </div>
  )
}

export default JobDetail
                                            
