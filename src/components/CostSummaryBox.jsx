import React from 'react';

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const CostSummaryBox = ({ job, materials = [], labor = [], expenses = [] }) => {
  if (!job) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        Loading job details…
      </div>
    );
  }

  // Support both prop-passing and nested patterns
  const mats = materials.length > 0 ? materials : (job.materials || []);
  const lab = labor.length > 0 ? labor : (job.labor || []);
  const exps = expenses.length > 0 ? expenses : (job.expenses || []);

  // Exact column names from your forms
  const materialsTotal = mats.reduce((sum, m) => sum + (Number(m.total_cost) || 0), 0);
  const laborTotal = lab.reduce((sum, l) => sum + (Number(l.total_cost) || 0), 0);
  const expensesTotal = exps.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalCost = materialsTotal + laborTotal + expensesTotal;
  const finalAmount = Number(job.bid_amount || 0);
  const profit = finalAmount - totalCost;
  const profitMargin = finalAmount > 0 ? ((profit / finalAmount) * 100).toFixed(1) : '0.0';

  // Payments not yet implemented
  const totalPaid = 0;
  const balance = finalAmount - totalPaid;

  const profitColor =
    profit > 0 ? 'text-green-700 bg-green-50 border-green-200' :
    profit < 0 ? 'text-red-700 bg-red-50 border-red-200' :
    'text-gray-700 bg-gray-50 border-gray-200';

  const getLaborDisplay = (entry) => {
    if (entry.calculation_method === 'per_day') {
      const w = entry.workers || 1;
      const d = entry.days || 0;
      const r = entry.daily_rate || 0;
      return `${w} worker${w > 1 ? 's' : ''} × ${d} day${d > 1 ? 's' : ''} × ${formatCurrency(r)}/day`;
    }
    if (entry.calculation_method === 'per_hour') {
      const w = entry.workers || 1;
      const h = entry.hours || 0;
      const r = entry.hourly_rate || 0;
      return `${w} worker${w > 1 ? 's' : ''} × ${h} hr${h > 1 ? 's' : ''} × ${formatCurrency(r)}/hr`;
    }
    return 'Fixed labour amount';
  };

  return (
    <div className="space-y-6">
      {/* SUMMARY BOX */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Job Summary</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Final / Agreed Amount</p>
            <p className="text-2xl font-extrabold text-blue-900">{formatCurrency(finalAmount)}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Cost</p>
            <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(totalCost)}</p>
            <p className="text-xs text-gray-400 mt-1">
              M: {formatCurrency(materialsTotal)} · L: {formatCurrency(laborTotal)} · E: {formatCurrency(expensesTotal)}
            </p>
          </div>

          <div className={`rounded-lg border p-4 ${profitColor}`}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-80">Profit</p>
            <p className="text-2xl font-extrabold">{formatCurrency(profit)}</p>
          </div>

          <div className={`rounded-lg border p-4 ${profitColor}`}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-80">Profit Margin</p>
            <p className="text-2xl font-extrabold">{profitMargin}%</p>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Balance Due</p>
            <p className="text-2xl font-extrabold text-purple-900">{formatCurrency(balance)}</p>
            <p className="text-xs text-purple-500 mt-1">Payments feature coming soon</p>
          </div>
        </div>
      </div>

      {/* DETAILED BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Materials */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Materials</h3>
            <span className="text-lg font-bold text-gray-800">{formatCurrency(materialsTotal)}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {mats.length > 0 ? mats.map((m, idx) => (
              <div key={idx} className="py-3 flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.name || 'Unnamed'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.quantity} {m.unit || 'units'} × {formatCurrency(m.unit_cost)}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">{formatCurrency(m.total_cost)}</p>
              </div>
            )) : <p className="text-sm text-gray-400 italic py-4">No materials added</p>}
          </div>
        </div>

        {/* Labour */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Labour</h3>
            <span className="text-lg font-bold text-gray-800">{formatCurrency(laborTotal)}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {lab.length > 0 ? lab.map((l, idx) => (
              <div key={idx} className="py-3 flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{l.worker_name || 'Labour'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(l.work_date)} — {getLaborDisplay(l)}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">{formatCurrency(l.total_cost)}</p>
              </div>
            )) : <p className="text-sm text-gray-400 italic py-4">No labour added</p>}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Expenses</h3>
            <span className="text-lg font-bold text-gray-800">{formatCurrency(expensesTotal)}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {exps.length > 0 ? exps.map((e, idx) => (
              <div key={idx} className="py-3 flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.name || 'Unnamed'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{e.category || 'Miscellaneous'}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">{formatCurrency(e.amount)}</p>
              </div>
            )) : <p className="text-sm text-gray-400 italic py-4">No expenses added</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSummaryBox;
                                                       
