import { supabase } from './supabase'

export type FeedbackCategory = 'correction' | 'new_school' | 'general' | 'other'
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

export interface Feedback {
  id: number
  created_at: string
  category: FeedbackCategory
  school_id: number | null
  school_name: string | null
  message: string
  contact_name: string | null
  contact_phone: string | null
  status: FeedbackStatus
}

export async function submitFeedback(input: {
  category: FeedbackCategory
  school_id?: number | null
  school_name?: string | null
  message: string
  contact_name?: string | null
  contact_phone?: string | null
}): Promise<{ error?: string }> {
  const { error } = await supabase.from('feedback').insert({
    category: input.category,
    school_id: input.school_id ?? null,
    school_name: input.school_name || null,
    message: input.message,
    contact_name: input.contact_name || null,
    contact_phone: input.contact_phone || null,
  })
  return { error: error?.message }
}

export async function fetchAllFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data as Feedback[]
}

export async function updateFeedbackStatus(id: number, status: FeedbackStatus): Promise<string | null> {
  const { error } = await supabase.from('feedback').update({ status }).eq('id', id)
  return error?.message ?? null
}

export async function deleteFeedback(id: number): Promise<string | null> {
  const { error } = await supabase.from('feedback').delete().eq('id', id)
  return error?.message ?? null
}
