import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

const METHODS = [
  { key: 'per_day', label: 'Per Day', desc: 'Workers × Days × Daily Rate' },
  { key: 'per_hour', label: 'Per Hour', desc: 'Workers × Hours × Hourly Rate' },
  { key: 'fixed', label: 'Fixed Amount', desc: 'Direct labour amount' },
]

function LabourForm({ onSave, onCancel, defaultRate }) {
  const [method, setMethod] = useState('per_hour')
  const [workerName, setWorkerName] = useState('')
  const [workers, setWorkers] = useState('1')
  const [days, setDays] = useState('')
  const [hours, setHours] = useState('')
  const [dailyRate, setDailyRate] = useState('')
  const [hourlyRate, setHourlyRate] = useState(defaultRate ? String(defaultRate) : '')
  const [fixedAmount, setFixedAmount] = useState('')
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0])

  const getTotal = () => {
    if (method === 'per_day') {
      return (parseFloat(workers) || 0) * (parseFloat(days) || 0) * (parseFloat(dailyRate) || 0)
    }
    if (method === 'per_hour') {
      return (parseFloat(workers) || 0) * (parseFloat(hours) || 0) * (parseFloat(hourlyRate) || 0)
    }
    return parseFloat(fixedAmount) || 0
  }

  const total = getTotal()

  const handleSubmit = (e) => {
    e.preventDefault()

    const baseData = {
      worker_name: workerName.trim() || 'Labour',
      work_date: workDate,
      calculation_method: method,
      total_cost: total,
    }

    let methodData = {}
    if (method === 'per_day') {
      methodData = {
        workers: parseFloat(workers) || 1,
        days: parseFloat(days) || 0,
        daily_rate: parseFloat(dailyRate) || 0,
        hours: null,
        hourly_rate: null,
        fixed_amount: null,
      }
    } else if (method === 'per_hour') {
      methodData = {
        workers: parseFloat(workers) || 1,
        hours: parseFloat(hours) || 0,
        hourly_rate: parseFloat(hourlyRate) || 0,
        days: null,
        daily_rate: null,
        fixed_amount: null,
      }
    } else {
      methodData = {
        fixed_amount: parseFloat(fixedAmount) || 0,
        workers: null,
        days: null,
        hours: null,
        daily_rate: null,
        hourly_rate: null,
      }
    }

    onSave({ ...baseData, ...methodData })
  }

  const isValid = () => {
    if (method === 'per_day') return days && dailyRate
    if (method === 'per_hour') return hours && hourlyRate
    return fixedAmount
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-navy-900">Add Labour</h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Method selector */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Calculation Method</label>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map(m => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMethod(m.key)}
                className={`px-2 py-2 rounded-lg text-xs font-semibold text-center transition-colors ${
                  method === m.key
                    ? 'bg-navy-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{METHODS.find(m => m.key === method)?.desc}</p>
        </div>

        <input
          type="text"
          value={workerName}
          onChange={e => setWorkerName(e.target.value)}
          placeholder="Worker / Team name (optional)"
          className="input-field"
        />

        <input
          type="date"
          value={workDate}
          onChange={e => setWorkDate(e.target.value)}
          className="input-field"
          required
        />

        {/* Per Day fields */}
        {method === 'per_day' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Workers</label>
                <input type="number" min="1" step="1" value={workers} onChange={e => setWorkers(e.target.value)} placeholder="2" className="input-field" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Days</label>
                <input type="number" min="0" step="0.5" value={days} onChange={e => setDays(e.target.value)} placeholder="3" className="input-field" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Daily Rate ($)</label>
                <input type="number" min="0" step="0.01" value={dailyRate} onChange={e => setDailyRate(e.target.value)} placeholder="500" className="input-field" required />
              </div>
            </div>
          </div>
        )}

        {/* Per Hour fields */}
        {method === 'per_hour' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Workers</label>
                <input type="number" min="1" step="1" value={workers} onChange={e => setWorkers(e.target.value)} placeholder="2" className="input-field" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hours</label>
                <input type="number" min="0" step="0.25" value={hours} onChange={e => setHours(e.target.value)} placeholder="5" className="input-field" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hourly Rate ($)</label>
                <input type="number" min="0" step="0.01" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="150" className="input-field" required />
              </div>
            </div>
          </div>
        )}

        {/* Fixed Amount fields */}
        {method === 'fixed' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fixed Labour Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fixedAmount}
              onChange={e => setFixedAmount(e.target.value)}
              placeholder="2000"
              className="input-field"
              required
            />
          </div>
        )}

        <div className="bg-white rounded-lg p-3 border border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">Total Labour Cost</span>
          <span className="text-lg font-bold text-navy-900">${total.toFixed(2)}</span>
        </div>

        <button type="submit" disabled={!isValid()} className="btn-primary disabled:opacity-50 disabled:active:scale-100">
          <Plus size={18} /> Save Labour Entry
        </button>
      </form>
    </div>
  )
}

export default LabourForm
