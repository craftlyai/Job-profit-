import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, LogOut, Camera, Save, User, Building, Phone, DollarSign, CreditCard } from 'lucide-react'

function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    business_name: '',
    phone: '',
    default_hourly_rate: '',
    payment_instructions: '',
  })
  const [logoUrl, setLogoUrl] = useState(null)

  useEffect(() => { fetchProfile() }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error) throw error

      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        business_name: data.business_name || '',
        phone: data.phone || '',
        default_hourly_rate: data.default_hourly_rate || '',
        payment_instructions: data.payment_instructions || '',
      })

      if (data.logo_path) {
        const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(data.logo_path)
        setLogoUrl(publicUrl)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('profiles').update({
        full_name: formData.full_name,
        business_name: formData.business_name,
        phone: formData.phone || null,
        default_hourly_rate: formData.default_hourly_rate ? parseFloat(formData.default_hourly_rate) : null,
        payment_instructions: formData.payment_instructions || null,
      }).eq('id', user.id)

      if (error) throw error
      showToast('Profile saved successfully')
    } catch (err) {
      showToast('Error saving profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { error: updateError } = await supabase.from('profiles').update({ logo_path: filePath }).eq('id', user.id)
      if (updateError) throw updateError

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath)
      setLogoUrl(publicUrl)
      showToast('Logo uploaded')
    } catch (err) {
      showToast('Error uploading logo', 'error')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 left-4 right-4 flex justify-center z-50">
          <div className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-navy-900 text-white'}`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="bg-navy-900 text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-white/10">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Profile Settings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="card flex flex-col items-center">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden mb-3 relative"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Camera size={28} className="text-gray-400" />
            )}
            {uploadingLogo && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          <p className="text-sm text-gray-500 font-medium">Tap to upload business logo</p>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <User size={16} /> Full Name
            </label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input-field" placeholder="Your full name" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Building size={16} /> Business Name
            </label>
            <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} className="input-field" placeholder="Your business name" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Phone size={16} /> Phone Number
            </label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="(555) 123-4567" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <DollarSign size={16} /> Default Hourly Rate ($)
            </label>
            <input type="number" step="0.01" min="0" name="default_hourly_rate" value={formData.default_hourly_rate} onChange={handleChange} className="input-field" placeholder="0.00" />
            <p className="text-xs text-gray-400 mt-1">Pre-fills when adding labor entries</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <CreditCard size={16} /> Payment Instructions
            </label>
            <textarea name="payment_instructions" value={formData.payment_instructions} onChange={handleChange} rows={3} className="input-field resize-none" placeholder="Pay via bank transfer to...&#10;Account: 1234567890&#10;Routing: 0987654321" />
            <p className="text-xs text-gray-400 mt-1">Shown on generated invoices</p>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        <button onClick={handleSignOut} className="w-full py-3 px-4 rounded-xl font-semibold text-red-600 bg-red-50 border border-red-200 flex items-center justify-center gap-2 min-h-[48px] active:scale-95 transition-transform">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  )
}

export default Profile
