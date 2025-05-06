import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ruwscznlijhccdfawrgb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1d3Njem5saWpoY2NkZmF3cmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjU4NjgsImV4cCI6MjA2MTk0MTg2OH0.1K9d1YIS1LhkEK1CgGzryW7ebEkh20RYn6J_KOqqIyQ'


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})
