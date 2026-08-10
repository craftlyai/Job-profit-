import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import JobCard from '../components/JobCard'

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'invoiced', label: 'Invoiced' },
  { key: 'paid', label: 'Paid' },
]

function Jobs() {
  const [jobs, setJobs] = useState([])
  const [materials, setMaterials] = useState([])
  const [labor, setLabor] = useState([])
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
      // Refresh list after delete
      fetchData()
    } catch (err) {
      console.error('Error deleting job:', err)
      alert('Failed to delete job: ' + err.message)
    }
  }

  const filteredJobs = activeFilter === 'all'
    ? jobs
    : jobs.filter(job => job.status === activeFilter)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-navy-900 text-white px-4 pt-8 pb-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">My Jobs</h1>
          <p className="text-gray-300 text-sm">{jobs.length} total</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
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
        className="fixed bottom-20 right-4 w-14 h-14 bg-navy-900 text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <Plus size={28} />
      </Link>
    </div>
  )
}

export default Jobs
      
