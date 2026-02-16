import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Type definitions for our Supabase tables
export type ContentPipeline = {
  id: string
  title: string
  content_type: 'blog_post' | 'linkedin_post' | 'tweet_thread' | 'podcast_summary' | string
  source_type: string | null
  source_ref: string | null
  status: 'idea' | 'researching' | 'draft' | 'review' | 'revision' | 'approved' | 'published' | 'promoted' | string
  outline: string | null
  draft: string | null
  final_content: string | null
  target_platform: string | null
  language: string | null
  keywords: string[] | null
  word_count: number | null
  quality_score: number | null
  quality_notes: string | null
  revision_count: number | null
  claimed_by: string | null
  claimed_at: string | null
  created_at: string
  updated_at: string
  published_at: string | null
  published_url: string | null
}

export type PipelineEvent = {
  id: string
  pipeline_id: string | null
  agent: string
  action: string
  details: string | Record<string, any> | null
  created_at: string
  title?: string // joined from content_pipeline
}

export type QualityScore = {
  id: string
  pipeline_id: string
  score: number
  criteria: Record<string, any>
  feedback: string | null
  created_at: string
}

export type CRMContact = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  company: string | null
  title: string | null
  linkedin_url: string | null
  location: string | null
  source: 'linkedin' | 'apollo' | 'manual' | 'rijkste_belgen' | 'event' | null
  status: 'new' | 'contacted' | 'connected' | 'conversation' | 'qualified' | 'proposal' | 'client' | 'lost' | 'nurture'
  pipeline_stage: string | null
  lead_score: number
  ai_readiness: 'low' | 'medium' | 'high' | null
  last_contacted_at: string | null
  last_response_at: string | null
  next_followup_at: string | null
  notes: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export type CRMActivity = {
  id: string
  contact_id: string
  type: 'linkedin_dm' | 'email' | 'call' | 'meeting' | 'note' | 'connection_request'
  direction: 'outbound' | 'inbound' | null
  subject: string | null
  content: string | null
  status: 'draft' | 'sent' | 'delivered' | 'replied' | 'bounced' | null
  created_at: string
}

export type CRMDeal = {
  id: string
  contact_id: string
  title: string
  value: number | null
  currency: string
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expected_close_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
