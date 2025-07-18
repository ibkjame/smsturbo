import { createClient } from '@supabase/supabase-js';

// ดึงค่า URL และ Key จาก environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// สร้างและ export client ของ Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
