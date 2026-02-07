import { createClient } from '@supabase/supabase-js'

// ============================================
// SUPABASE CONFIGURATION
// ============================================
//
// 1. Go to your Supabase project dashboard
// 2. Navigate to Settings > API
// 3. Copy "Project URL" and "anon public" key
// 4. Create a .env file in project root with:
//
//    VITE_SUPABASE_URL=your-project-url
//    VITE_SUPABASE_ANON_KEY=your-anon-key
//
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
