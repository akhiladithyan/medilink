import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ylswdeykgaqithedsybr.supabase.co'
const supabaseAnonKey = 'sb_publishable_RLgUyU0bv9Wx0XtSg0Meeg_4XxUnmyP'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data, error } = await supabase.from('hospitals').select('*').limit(1)
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Columns:', Object.keys(data[0] || {}))
  }
}

check()
