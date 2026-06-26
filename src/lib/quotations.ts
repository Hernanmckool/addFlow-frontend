import api, { getCsrfCookie } from '@/lib/api'

export interface QuotationItem {
  id: string
  asset_id: string
  starts_at: string
  ends_at: string
  unit_price: string
  quantity_months: string
  line_total: string
  notes: string | null
  asset: { id: string; name: string; code: string | null }
}

export interface Quotation {
  id: string
  number: string
  status: string
  client_id: string
  client: { id: string; name: string }
  created_by: string
  created_by_user?: { id: string; name: string }
  valid_until: string | null
  subtotal: string
  discount_percent: string
  discount_amount: string
  total: string
  currency: string
  notes: string | null
  items: QuotationItem[]
  items_count?: number
  created_at: string
}

export interface QuotationListResponse {
  data: Quotation[]
  current_page: number
  last_page: number
  total: number
}

export interface CreateQuotationItemPayload {
  asset_id: string
  starts_at: string
  ends_at: string
  notes?: string
}

export interface CreateQuotationPayload {
  client_id: string
  valid_until?: string
  discount_percent?: number
  currency?: string
  notes?: string
  items: CreateQuotationItemPayload[]
}

export interface ConvertResult {
  message: string
  quotation_status: string
  reservations_created: number
}

export async function fetchQuotations(page = 1): Promise<QuotationListResponse> {
  const response = await api.get<QuotationListResponse>('/api/quotations', {
    params: { page, per_page: 20 },
  })
  return response.data
}

export async function fetchQuotation(id: string): Promise<Quotation> {
  const response = await api.get<Quotation>(`/api/quotations/${id}`)
  return response.data
}

export async function createQuotation(payload: CreateQuotationPayload): Promise<Quotation> {
  await getCsrfCookie()
  const response = await api.post<Quotation>('/api/quotations', payload)
  return response.data
}

export async function updateQuotation(id: string, payload: CreateQuotationPayload): Promise<Quotation> {
  await getCsrfCookie()
  const response = await api.put<Quotation>(`/api/quotations/${id}`, payload)
  return response.data
}

export async function transitionQuotation(id: string, status: string): Promise<Quotation> {
  await getCsrfCookie()
  const response = await api.put<Quotation>(`/api/quotations/${id}/transition`, { status })
  return response.data
}

export async function convertQuotation(id: string): Promise<ConvertResult> {
  await getCsrfCookie()
  const response = await api.post<ConvertResult>(`/api/quotations/${id}/convert`)
  return response.data
}
