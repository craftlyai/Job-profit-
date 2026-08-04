/**
 * Calculate total cost for a material entry
 */
export const calculateMaterialTotal = (quantity, unitCost) => {
  const qty = parseFloat(quantity) || 0
  const cost = parseFloat(unitCost) || 0
  return qty * cost
}

/**
 * Calculate total cost for a labor entry
 */
export const calculateLaborTotal = (hours, hourlyRate) => {
  const hrs = parseFloat(hours) || 0
  const rate = parseFloat(hourlyRate) || 0
  return hrs * rate
}

/**
 * Calculate all job costs from materials and labor arrays
 */
export const calculateJobCosts = (materials = [], labor = []) => {
  const totalMaterialCost = materials.reduce((sum, m) => {
    return sum + (parseFloat(m.total_cost) || 0)
  }, 0)

  const totalLaborCost = labor.reduce((sum, l) => {
    return sum + (parseFloat(l.total_cost) || 0)
  }, 0)

  const totalJobCost = totalMaterialCost + totalLaborCost

  return {
    totalMaterialCost,
    totalLaborCost,
    totalJobCost
  }
}

/**
 * Calculate profit and margin from bid amount and total cost
 */
export const calculateProfit = (bidAmount, totalJobCost) => {
  const bid = parseFloat(bidAmount) || 0
  const cost = parseFloat(totalJobCost) || 0

  if (bid === 0) {
    return {
      profit: null,
      margin: null,
      hasBid: false
    }
  }

  const profit = bid - cost
  const margin = bid > 0 ? (profit / bid) * 100 : 0

  return {
    profit,
    margin: parseFloat(margin.toFixed(1)),
    hasBid: true,
    isProfitable: profit >= 0
  }
}

/**
 * Format currency for display
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00'
  const num = parseFloat(amount)
  if (isNaN(num)) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(num)
}

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = (existingCount = 0) => {
  const nextNum = (existingCount + 1).toString().padStart(4, '0')
  return `INV-${nextNum}`
}
