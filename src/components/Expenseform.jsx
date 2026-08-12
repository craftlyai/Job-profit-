import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

function ExpenseForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !amount) return

    onSave({
      name: name.trim(),
      amount: parseFloat(amount),
      category: category.trim() || 'Miscellaneous'
    })
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-navy-900">Add Expense</h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Expense Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Transport, Tool Rental, Parking"
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Travel, Food, etc."
              className="input-field"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary">
          <Plus size={18} /> Save Expense
        </button>
      </form>
    </div>
  )
}

export default ExpenseForm

