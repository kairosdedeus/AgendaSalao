import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hnqnkgizfvhhusaaovfx.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhucW5rZ2l6ZnZoaHVzYWFvdmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzIzNjUsImV4cCI6MjA5MDg0ODM2NX0.O2eaHxWmS-OhHvbBN3hjelSvMrIWwfFGjrNSw78TD_Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
