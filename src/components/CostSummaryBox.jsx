import React from 'react';

// ─── Self-contained currency formatter ───
const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const CostSummaryBox = ({ job }) => {
  // ─── Guard against undefined job ───
  if (!job) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        Loading job details…
      </div>
    );
  }

  // ─── Calculate totals ───
  const materialsTotal =
    job.materials?.reduce((sum, m) => sum + (Number(m.total) || 0), 0) || 0;

  const labourTotal =
    job.labour?.reduce((sum, l) => sum + (Number(l.total) || 0), 0) || 0;

  const expensesTotal =
    job.expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

  const totalCost = materialsTotal + labourTotal + expensesTotal;

  const finalAmount = Number(job.final_amount || job.agreed_amount || 0);
  const profit = finalAmount - totalCost;
  const profitMargin = finalAmount > 0 ? ((profit / finalAmount) * 100).toFixed(1) : '0.0';

  const totalPaid =
    job.payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
  const balance = finalAmount - totalPaid;

  // ─── Helpers ───
  const profitColor =
    profit > 0 ? 'text-green-700 bg-green-50 border-green-200' :
    profit < 0 ? 'text-red-700 bg-red-50 border-red-200' :
    'text-gray-700 bg-gray-50 border-gray-200';

  const statusBadge = () => {
    if (balance <= 0 && finalAmount > 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>;
    }
    if (totalPaid > 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Partial</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Unpaid</span>;
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════
          SECTION 7 — SUMMARY BOX (TOP)
          ═══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Job Summary</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            {statusBadge()}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Final / Agreed Amount */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
              Final / Agreed Amount
            </p>
            <p className="text-2xl font-extrabold text-blue-900">
              {formatCurrency(finalAmount)}
            </p>
          </div>

          {/* Total Cost */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Total Cost
            </p>
            <p className="text-2xl font-extrabold text-gray-900">
              {formatCurrency(totalCost)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              M: {formatCurrency(materialsTotal)} · L: {formatCurrency(labourTotal)} · E: {formatCurrency(expensesTotal)}
            </p>
          </div>

          {/* Profit */}
          <div className={`rounded-lg border p-4 ${profitColor}`}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-80">
              Profit
            </p>
            <p className="text-2xl font-extrabold">
              {formatCurrency(profit)}
            </p>
          </div>

          {/* Profit Margin */}
          <div className={`rounded-lg border p-4 ${profitColor}`}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-80">
              Profit Margin
            </p>
            <p className="text-2xl font-extrabold">
              {profitMargin}%
            </p>
          </div>

          {/* Payment Status / Balance */}
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
              Balance Due
            </p>
            <p className="text-2xl font-extrabold text-purple-900">
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-purple-500 mt-1">
              Paid {formatCurrency(totalPaid)} of {formatCurrency(finalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          DETAILED BREAKDOWN (BELOW SUMMARY)
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Materials ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Materials</h3>
            <span className="text-lg font-bold text-gray-800">{formatCurrency(materialsTotal)}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {job.materials?.length > 0 ? (
              job.materials.map((m, idx) => (
                <div key={idx} className="py-3 flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {m.quantity} {m.unit || 'units'} × {formatCurrency(m.rate)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{formatCurrency(m.total)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic py-4">No materials added</p>
            )}
          </div>
        </div>

        {/* ── Labour ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Labour</h3>
            <span className="text-lg font-bold text-gray-800">{formatCurrency(labourTotal)}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {job.labour?.length > 0 ? (
              job.labour.map((l, idx) => (
                <div key={idx} className="py-3 flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{l.description || l.name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {l.hours || l.quantity || 0} {l.unit || 'hrs'} × {formatCurrency(l.rate)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{formatCurrency(l.total)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic py-4">No labour added</p>
            )}
          </div>
        </div>

        {/* ── Expenses ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Expenses</h3>
            <span className="text-lg font-bold text-gray-800">{formatCurrency(expensesTotal)}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {job.expenses?.length > 0 ? (
              job.expenses.map((e, idx) => (
                <div key={idx} className="py-3 flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.description || e.name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(e.date)}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{formatCurrency(e.amount)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic py-4">No expenses added</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSummaryBox;
                        
