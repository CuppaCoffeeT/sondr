import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xxgwyqjdznauuhrlzjjh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4Z3d5cWpkem5hdXVocmx6ampoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4OTczMjQsImV4cCI6MjA4NjQ3MzMyNH0.2f_9RAPl60VAyBnMmMzCFuwCoxonqNQgVpSgXhLNOyw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
