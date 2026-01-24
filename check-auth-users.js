// Check if there are any authenticated users
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dumhphyhvnyyqnmnahno.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bWhwaHlodm55eXFubW5haG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjM0ODUsImV4cCI6MjA3MzUzOTQ4NX0.JlTOmEJyMGH3cBSeiO3LOuQdHLDdB57Vi3Hm8rGeDOI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAuthUsers() {
  try {
    console.log('🔍 Checking authentication and profiles...')
    
    // Check if we can access the profiles table at all
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10)
    
    console.log('📊 Profiles table access:', { profiles, error: profilesError })
    
    // Check if we can access user_groups table
    const { data: userGroups, error: userGroupsError } = await supabase
      .from('user_groups')
      .select('*')
      .limit(10)
    
    console.log('📊 User groups table access:', { userGroups, error: userGroupsError })
    
    // Check if we can access auth.users (this might not work with anon key)
    try {
      const { data: authUsers, error: authError } = await supabase.auth.getUser()
      console.log('🔐 Current auth user:', { authUsers, error: authError })
    } catch (authErr) {
      console.log('🔐 Auth check failed (expected with anon key):', authErr.message)
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkAuthUsers()



