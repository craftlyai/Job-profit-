import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { formatCurrency } from '../lib/calculations'

function CostSummaryBox({ materialsCost, laborCost, expensesCost, bidAmount, profit, margin, hasBid, isProfitable }) {
  const totalCost = materialsCost + laborCost + (expensesCost || 0)

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-navy-900 p-5 sticky bottom-4 z-40 mx-0">
      <h3 className="font-bold text-navy-900 text-lg mb-3">Job Cost Summary</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Materials Cost</span>
          <span className="font-semibold">{formatCurrency(materialsCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Labour Cost</span>
          <span className="font-semibold">{formatCurrency(laborCost)}</span>
        </div>
        {(expensesCost > 0) && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Other Expenses</span>
            <span className="font-semibold">{formatCurrency(expensesCost)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 my-2 pt-2">
          <div className="flex justify-between">
            <span className="font-semibold text-navy-900">Total Job Cost</span>
            <span className="font-bold text-navy-900">{formatCurrency(totalCost)}</span>
          </div>
        </div>
        
        {hasBid && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Final / Agreed Amount</span>
              <span className="font-semibold">{formatCurrency(bidAmount)}</span>
            </div>
            <div className="border-t-2 border-navy-900 my-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-navy-900">PROFIT</span>
                <span className={`font-bold text-xl ${isProfitable ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(profit)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="font-medium text-navy-900">Margin</span>
                <span className={`font-bold ${isProfitable ? 'text-profit' : 'text-loss'}`}>
                  {margin}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {!hasBid && (
        <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700 text-center">No final/agreed amount entered</p>
        </div>
      )}

      {hasBid && !isProfitable && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
          <AlertTriangle size={18} className="text-loss shrink-0" />
          <p className="text-sm font-medium text-loss">You are losing money on this job</p>
        </div>
      )}
    </div>
  )
}

export default CostSummaryBox
                
