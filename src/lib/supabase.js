import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Helper: check if string looks like a valid https URL
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
    console.log('[Supabase] Client initialized')
  } else {
    console.warn(
      '[Supabase] Missing or invalid env vars. ' +
      'URL valid:', isValidUrl(url),
      '| Key present:', !!key,
      '| App running in degraded mode.'
    )
    // Dummy client so the app renders; auth/db calls will fail gracefully
    supabase = createClient('https://placeholder.supabase.co', 'placeholder')
  }
} catch (err) {
  console.error('[Supabase] createClient crashed:', err.message)
  supabase = createClient('https://placeholder.supabase.co', 'placeholder')
}

export { supabase }
      
