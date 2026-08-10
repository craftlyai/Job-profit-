import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { calculateJobCosts, calculateProfit, formatCurrency } from '../lib/calculations'

function JobCard({ job, materials = [], labor = [], onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false)

  const { totalJobCost } = calculateJobCosts(materials, labor)
  const { profit, margin, hasBid, isProfitable } = calculateProfit(job.bid_amount, totalJobCost)

  const statusColors = {
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-purple-100 text-purple-700',
    invoiced: 'bg-orange-100 text-orange-700',
    paid: 'bg-green-100 text-green-700',
  }

  const statusLabels = {
    in_progress: 'In Progress',
    completed: 'Completed',
    invoiced: 'Invoiced',
    paid: 'Paid',
  }

  const handleDeleteClick = () => {
    setShowConfirm(true)
  }

  const handleConfirmDelete = () => {
    setShowConfirm(false)
    if (onDelete) onDelete(job.id)
  }

  const handleCancelDelete = () => {
    setShowConfirm(false)
  }

  return (
    <>
      <div className="card mb-3 relative">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-navy-900 truncate">{job.job_name}</h3>
            <p className="text-sm text-gray-500 truncate">{job.client_name}</p>
          </div>
          <span className={`status-badge ml-2 shrink-0 ${statusColors[job.status] || 'bg-gray-100 text-gray-600'}`}>
            {statusLabels[job.status] || job.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">Bid Amount</p>
            <p className="font-semibold text-navy-900">{formatCurrency(job.bid_amount)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">Actual Cost</p>
            <p className="font-semibold text-navy-900">{formatCurrency(totalJobCost)}</p>
          </div>
        </div>

        {hasBid && (
          <div className={`flex items-center justify-between p-2 rounded-lg mb-3 ${
            isProfitable ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div>
              <p className="text-xs text-gray-500">Profit</p>
              <p className={`font-bold ${isProfitable ? 'text-profit' : 'text-loss'}`}>
                {formatCurrency(profit)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Margin</p>
              <p className={`font-bold ${isProfitable ? 'text-profit' : 'text-loss'}`}>
                {margin}%
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Link
            to={`/jobs/${job.id}`}
            className="flex-1 bg-navy-900 text-white text-sm font-medium py-2.5 rounded-xl text-center active:scale-95 transition-transform"
          >
            View
          </Link>
          <Link
            to={`/jobs/${job.id}`}
            className="flex items-center justify-center w-12 bg-gray-100 text-navy-900 rounded-xl active:scale-95 transition-transform"
          >
            <Pencil size={18} />
          </Link>
          <Link
            to={`/jobs/${job.id}/invoice`}
            className="flex items-center justify-center w-12 bg-gray-100 text-navy-900 rounded-xl active:scale-95 transition-transform"
          >
            <FileText size={18} />
          </Link>
          <button
            onClick={handleDeleteClick}
            className="flex items-center justify-center w-12 bg-gray-100 text-loss rounded-xl active:scale-95 transition-transform"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-loss" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Delete Job?</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-navy-900">"{job.job_name}"</span>? This will also remove all materials, labour, and expenses for this job. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-navy-900 bg-gray-100 active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-loss active:scale-95 transition-transform"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default JobCard
  
