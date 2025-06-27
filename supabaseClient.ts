import { createClient } from '@supabase/supabase-js';

// IMPORTANT: In a real-world application, these should be environment variables.
// For this exercise, using the provided values directly.
const supabaseUrl = 'https://vslamrnywrbydomwgfhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbGFtcm55d3JieWRvbXdnZmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MjMzMzYsImV4cCI6MjA2NjQ5OTMzNn0.MDgG8cz6R5Zn9y6_3Eal5wBYV6i7Fl6jT5mfI0QXtD0';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);