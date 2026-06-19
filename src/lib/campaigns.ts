import api, { getCsrfCookie } from '@/lib/api'

export interface CampaignAssetItem {
  id: string
  asset_id: string
  reservation_id: string | null
  starts_at: string
  ends_at: string
  asset: { id: string; name: string; code: string | null }
  reservation?: { id: string; total_amount: string | null; currency: string | null } | null
}

export interface Campaign {
  id: string
  name: string
  status: string
  client_id: string
  client: { id: string; name: string }
  created_by: string
  created_by_user?: { id: string; name: string }
  starts_at: string
  ends_at: string
  notes: string | null
  campaign_assets: CampaignAssetItem[]
  campaign_assets_count?: number
  created_at: string
}

export interface CampaignListResponse {
  data: Campaign[]
  current_page: number
  last_page: number
  total: number
}

export interface CreateCampaignPayload {
  name: string
  client_id: string
  starts_at: string
  ends_at: string
  notes?: string
  reservation_ids: string[]
}

export async function fetchCampaigns(page = 1): Promise<CampaignListResponse> {
  const response = await api.get<CampaignListResponse>('/api/campaigns', {
    params: { page, per_page: 20 },
  })
  return response.data
}

export async function fetchCampaign(id: string): Promise<Campaign> {
  const response = await api.get<Campaign>(`/api/campaigns/${id}`)
  return response.data
}

export async function createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
  await getCsrfCookie()
  const response = await api.post<Campaign>('/api/campaigns', payload)
  return response.data
}

export async function transitionCampaign(id: string, status: string): Promise<Campaign> {
  await getCsrfCookie()
  const response = await api.put<Campaign>(`/api/campaigns/${id}/transition`, { status })
  return response.data
}
