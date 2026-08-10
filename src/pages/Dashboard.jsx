import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import JobCard from '../components/JobCard'
import { calculateJobCosts, calculateProfit, formatCurrency } from '../lib/calculations'

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'invoiced', label: 'Invoiced' },
  { key: 'paid', label: 'Paid' },
]

function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [materials, setMaterials] = useState([])
  const [labor, setLabor] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setJobs(jobsData || [])

      const { data: materialsData } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', user.id)
      setMaterials(materialsData || [])

      const { data: laborData } = await supabase
        .from('labor_entries')
        .select('*')
        .eq('user_id', user.id)
      setLabor(laborData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getJobMaterials = (jobId) => materials.filter(m => m.job_id === jobId)
  const getJobLabor = (jobId) => labor.filter(l => l.job_id === jobId)

  const handleDeleteJob = async (jobId) => {
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId)
      if (error) throw error
      fetchData()
    } catch (err) {
      console.error('Error deleting job:', err)
      alert('Failed to delete job: ' + err.message)
    }
  }

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const thisMonthJobs = jobs.filter(job => {
    const jobDate = new Date(job.created_at)
    return jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear
  })

  const totalJobs = thisMonthJobs.length
  const totalRevenue = thisMonthJobs
    .filter(j => j.status === 'invoiced' || j.status === 'paid')
    .reduce((sum, j) => sum + (parseFloat(j.bid_amount) || 0), 0)

  const totalProfit = thisMonthJobs.reduce((sum, job) => {
    const jobMats = getJobMaterials(job.id)
    const jobLab = getJobLabor(job.id)
    const { totalJobCost } = calculateJobCosts(jobMats, jobLab)
    const { profit, hasBid } = calculateProfit(job.bid_amount, totalJobCost)
    return hasBid ? sum + profit : sum
  }, 0)

  const profitMargins = thisMonthJobs.map(job => {
    const jobMats = getJobMaterials(job.id)
    const jobLab = getJobLabor(job.id)
    const { totalJobCost } = calculateJobCosts(jobMats, jobLab)
    const { margin, hasBid } = calculateProfit(job.bid_amount, totalJobCost)
    return hasBid ? margin : null
  }).filter(m => m !== null)

  const avgMargin = profitMargins.length > 0
    ? (profitMargins.reduce((a, b) => a + b, 0) / profitMargins.length).toFixed(1)
    : 0

  const filteredJobs = activeFilter === 'all'
    ? jobs
    : jobs.filter(job => job.status === activeFilter)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy-900 text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          <p className="text-gray-300 text-sm">{greeting()},</p>
          <h1 className="text-2xl font-bold">{profile?.full_name || 'Contractor'}</h1>
          <p className="text-gray-400 text-sm">{profile?.business_name}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Jobs This Month</p>
            <p className="text-2xl font-bold text-navy-900">{totalJobs}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Revenue Billed</p>
            <p className="text-2xl font-bold text-navy-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Total Profit</p>
            <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatCurrency(totalProfit)}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Avg Margin</p>
            <p className="text-2xl font-bold text-navy-900">{avgMargin}%</p>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
          {statusFilters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === filter.key
                  ? 'bg-navy-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-navy-900"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Filter size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No jobs found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first job to get started</p>
          </div>
        ) : (
          <div className="pb-4">
            {filteredJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                materials={getJobMaterials(job.id)}
                labor={getJobLabor(job.id)}
                onDelete={handleDeleteJob}
              />
            ))}
          </div>
        )}
      </div>

      <Link
        to="/jobs/new"
        className="fixed bottom-20 right-4 md:bottom-8 w-14 h-14 bg-navy-900 text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <Plus size={28} />
      </Link>
    </div>
  )
}

export default Dashboard
    
