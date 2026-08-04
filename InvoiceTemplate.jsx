import React from 'react'
import { formatCurrency, formatDate } from '../lib/calculations'

function InvoiceTemplate({ job, materials, labor, profile, invoiceNumber, taxRate = 0 }) {
  const totalMaterialCost = materials.reduce((sum, m) => sum + (parseFloat(m.total_cost) || 0), 0)
  const totalLaborCost = labor.reduce((sum, l) => sum + (parseFloat(l.total_cost) || 0), 0)
  const totalJobCost = totalMaterialCost + totalLaborCost

  const subtotal = totalJobCost
  const taxAmount = subtotal * (taxRate / 100)
  const totalDue = subtotal + taxAmount

  const totalLaborHours = labor.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0)
  const avgHourlyRate = labor.length > 0 
    ? labor.reduce((sum, l) => sum + (parseFloat(l.hourly_rate) || 0), 0) / labor.length 
    : 0

  return (
    <div className="bg-white p-6 md:p-10 min-h-[800px]" id="invoice-content">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-navy-900 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">
            {profile?.business_name || 'Your Business'}
          </h1>
          <p className="text-gray-600">{profile?.full_name}</p>
          {profile?.phone && <p className="text-gray-500 text-sm">{profile.phone}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-navy-900">INVOICE</h2>
          <p className="text-gray-600 font-mono">{invoiceNumber}</p>
          <p className="text-gray-500 text-sm mt-1">{formatDate(new Date())}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
        <h3 className="font-bold text-navy-900">{job.client_name}</h3>
        {job.client_email && <p className="text-gray-600 text-sm">{job.client_email}</p>}
        {job.client_phone && <p className="text-gray-600 text-sm">{job.client_phone}</p>}
        {job.job_address && <p className="text-gray-600 text-sm mt-1">{job.job_address}</p>}
      </div>

      {/* Job Info */}
      <div className="mb-6 bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600"><span className="font-semibold">Job:</span> {job.job_name}</p>
      </div>

      {/* Line Items */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-navy-900">
            <th className="text-left py-2 text-sm font-bold text-navy-900">Description</th>
            <th className="text-right py-2 text-sm font-bold text-navy-900">Qty</th>
            <th className="text-right py-2 text-sm font-bold text-navy-900">Rate</th>
            <th className="text-right py-2 text-sm font-bold text-navy-900">Amount</th>
          </tr>
        </thead>
        <tbody>
          {totalLaborHours > 0 && (
            <tr className="border-b border-gray-200">
              <td className="py-3 text-sm">
                <span className="font-semibold">Labor</span>
                <span className="text-gray-500 block text-xs">
                  {totalLaborHours.toFixed(1)} hours @ {formatCurrency(avgHourlyRate)}/hr
                </span>
              </td>
              <td className="py-3 text-sm text-right">{totalLaborHours.toFixed(1)} hrs</td>
              <td className="py-3 text-sm text-right">{formatCurrency(avgHourlyRate)}</td>
              <td className="py-3 text-sm text-right font-semibold">{formatCurrency(totalLaborCost)}</td>
            </tr>
          )}

          {materials.map((material) => (
            <tr key={material.id} className="border-b border-gray-200">
              <td className="py-3 text-sm">{material.name}</td>
              <td className="py-3 text-sm text-right">
                {material.quantity} {material.unit}
              </td>
              <td className="py-3 text-sm text-right">{formatCurrency(material.unit_cost)}</td>
              <td className="py-3 text-sm text-right font-semibold">{formatCurrency(material.total_cost)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-full md:w-64">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Tax ({taxRate}%)</span>
              <span className="font-semibold">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-2 border-navy-900 mt-2">
            <span className="font-bold text-navy-900 text-lg">TOTAL DUE</span>
            <span className="font-bold text-navy-900 text-lg">{formatCurrency(totalDue)}</span>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      {profile?.payment_instructions && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Instructions</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">{profile.payment_instructions}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-gray-400">
        <p>Thank you for your business!</p>
      </div>
    </div>
  )
}

export default InvoiceTemplate
