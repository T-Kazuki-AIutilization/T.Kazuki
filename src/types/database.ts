export type Profile = {
  id: string
  display_name: string | null
  business_name: string | null
  email: string
  plan: 'free' | 'pro' | 'pro_plus'
  role: 'user' | 'admin'
  stripe_customer_id: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export type Client = {
  id: string
  user_id: string
  name: string
  company_name: string | null
  email: string | null
  phone: string | null
  memo: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
}

export type Tag = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export type Category = {
  id: string
  user_id: string
  name: string
  color: string
  sort_order: number
  created_at: string
}

export type ProjectStatus = 'in_progress' | 'completed' | 'paid' | 'cancelled'

export type Project = {
  id: string
  user_id: string
  client_id: string | null
  category_id: string | null
  title: string
  status: ProjectStatus
  amount: number
  deadline: string | null
  memo: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type PaymentStatus = 'unbilled' | 'billed' | 'paid'

export type RevenueEntry = {
  id: string
  user_id: string
  project_id: string | null
  amount: number
  payment_status: PaymentStatus
  billed_date: string | null
  due_date: string | null
  paid_date: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export type Notice = {
  id: string
  author_id: string
  title: string
  body: string
  category: 'info' | 'maintenance' | 'feature'
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export type ActivityLog = {
  id: string
  user_id: string | null
  action: string
  details: Record<string, unknown> | null
  created_at: string
}
