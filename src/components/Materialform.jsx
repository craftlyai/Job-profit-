import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { calculateMaterialTotal } from '../lib/calculations'

function MaterialForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [unitCost, setUnitCost] = useState('')

  const totalCost = calculateMaterialTotal(quantity, unitCost)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !quantity || !unitCost) return

    onSave({
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit: unit.trim() || 'pcs',
      unit_cost: parseFloat(unitCost),
      total_cost: totalCost
    })
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-navy-900">Add Material</h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Material Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Copper Wire"
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="meter, kg, pcs"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Price / Unit ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder="50"
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">Total Cost</span>
          <span className="text-lg font-bold text-navy-900">
            ${totalCost.toFixed(2)}
          </span>
        </div>

        <button type="submit" className="btn-primary">
          <Plus size={18} /> Save Material
        </button>
      </form>
    </div>
  )
}

export default MaterialForm
    
