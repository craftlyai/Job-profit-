import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Save } from 'lucide-react'

function CreateJob() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    job_name: '',
    client_name: '',
    client_phone: '',
    client_email: '',
    job_address: '',
    visit_date: '',
    start_date: '',
    end_date: '',
    estimated_amount: '',
    bid_amount: '',
    work_description: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('jobs')
        .insert([
          {
            user_id: user.id,
            job_name: formData.job_name,
            client_name: formData.client_name,
            client_phone: formData.client_phone || null,
            client_email: formData.client_email || null,
            job_address: formData.job_address || null,
            visit_date: formData.visit_date || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            estimated_amount: formData.estimated_amount ? parseFloat(formData.estimated_amount) : null,
            bid_amount: formData.bid_amount ? parseFloat(formData.bid_amount) : null,
            work_description: formData.work_description || null,
            status: 'in_progress',
          }
        ])
        .select()

      if (error) throw error

      if (data && data[0]) {
        navigate(`/jobs/${data[0].id}`)
      }
    } catch (err) {
      alert('Error creating job: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy-900 text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-white/10">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Create New Job</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Name *</label>
            <input
              type="text"
              name="job_name"
              value={formData.job_name}
              onChange={handleChange}
              placeholder="e.g. Kitchen Remodel"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Phone</label>
              <input
                type="tel"
                name="client_phone"
                value={formData.client_phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
              <input
                type="email"
                name="client_email"
                value={formData.client_email}
                onChange={handleChange}
                placeholder="client@email.com"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Address</label>
            <input
              type="text"
              name="job_address"
              value={formData.job_address}
              onChange={handleChange}
              placeholder="123 Main St, City, ST 12345"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Requirement / Description</label>
            <textarea
              name="work_description"
              value={formData.work_description}
              onChange={handleChange}
              placeholder="Describe the work required for this job..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
              <input
                type="date"
                name="visit_date"
                value={formData.visit_date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Amount ($)</label>
              <p className="text-xs text-gray-400 mb-1">Approximate quote before site visit</p>
              <input
                type="number"
                step="0.01"
                min="0"
                name="estimated_amount"
                value={formData.estimated_amount}
                onChange={handleChange}
                placeholder="0.00"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Final / Agreed Amount ($)</label>
              <p className="text-xs text-gray-400 mb-1">Actual amount after discussion</p>
              <input
                type="number"
                step="0.01"
                min="0"
                name="bid_amount"
                value={formData.bid_amount}
                onChange={handleChange}
                placeholder="0.00"
                className="input-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-6"
          >
            <Save size={18} />
            {loading ? 'Creating...' : 'Create Job'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateJob
             
