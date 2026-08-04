import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.error('Missing Supabase environment variables. App will not function correctly.')
  // Create a dummy client so imports don't crash
  supabase = createClient('https://placeholder.supabase.co', 'placeholder')
}

export { supabase }
