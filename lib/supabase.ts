import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://efrjpocadsjqxzitnihr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcmpwb2NhZHNqcXh6aXRuaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MDA2NDEsImV4cCI6MjA3MjA3NjY0MX0.uSUOa3lFgnE7Ln-mH5FwregaGFLPpfmYo4svhHSJsb8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour les tables Supabase
export interface Recipe {
  id: string
  title: string
  subtitle?: string
  img?: string
  time?: number
  difficulty?: 'Facile' | 'Moyen' | 'Difficile'
  kcal?: number
  protein?: number
  carb?: number
  fat?: number
  ingredients?: string[]
  vegetarian?: boolean
  recipe_url?: string
  favorite?: boolean
  created_at?: string
  updated_at?: string
}

export interface MealPlan {
  id: string
  user_id: string
  day: number // 0-6 (Dimanche-Samedi)
  meal_type: 'lunch' | 'dinner'
  recipe_id: string
  created_at?: string
}

export interface GroceryItem {
  id: string
  user_id: string
  label: string
  section: string
  done: boolean
  created_at?: string
}

export interface GrocerySection {
  title: string
  items: GroceryItem[]
}
