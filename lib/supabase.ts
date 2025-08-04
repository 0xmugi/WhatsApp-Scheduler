import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sweflwpenmacdrzhgxbb.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZWZsd3Blbm1hY2RyemhneGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjM0OTgsImV4cCI6MjA2OTczOTQ5OH0.Oh_T66yyz3yc_YI8-D1Fcg4s5z18u6jcvOde8nLpO2g"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface User {
  id: string
  phone: string
  name: string
  role: "admin" | "user"
  status: "pending" | "approved" | "rejected"
  password_hash: string
  created_at: string
  approved_at?: string
  approved_by?: string
  last_active?: string
  is_active: boolean
}

export interface ScheduledMessage {
  id: string
  user_id: string
  message: string
  contact_file_path?: string
  contact_count: number
  month: string
  dates: number[]
  time: string
  status: "active" | "paused" | "completed" | "failed"
  created_at: string
  updated_at: string
  next_run?: string
  completed_at?: string
}

export interface MessageLog {
  id: string
  scheduled_message_id: string
  user_id: string
  message: string
  contact_count: number
  success_count: number
  failed_count: number
  status: "success" | "partial" | "failed"
  duration_seconds: number
  started_at: string
  completed_at?: string
  error_message?: string
}

export interface SystemSettings {
  id: string
  key: string
  value: string
  description: string
  updated_at: string
  updated_by?: string
}
