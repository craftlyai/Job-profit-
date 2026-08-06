import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidUrl = (str) => {
  if (!str || typeof str !== 'string') return false
  try {
    const url = new URL(str.trim())
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

let supabase = null

try {
  const url = supabaseUrl?.trim?.()
  const key = supabaseAnonKey?.trim?.()

  if (isValidUrl(url) && key && key.length > 20) {
    supabase = createClient(url, key)
  } else {
    console.warn('[Supabase] Invalid or missing env vars. App running in degraded mode.')
    supabase = createClient('https://placeholder.supabase.co', 'placeholder')
  }
} catch (err) {
  console.error('[Supabase] Init failed:', err.message)
  supabase = createClient('https://placeholder.supabase.co', 'placeholder')
}

export { supabase }
    
