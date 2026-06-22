import api, { getCsrfCookie } from '@/lib/api'

export interface WorkOrderAssetItem {
  id: string
  campaign_asset: {
    id: string
    asset: { id: string; name: string; code: string | null }
    starts_at: string
    ends_at: string
  }
}

export interface WorkOrder {
  id: string
  campaign_id: string
  campaign: { id: string; name: string; client?: { id: string; name: string } }
  assigned_to: { id: string; name: string } | null
  created_by: { id: string; name: string }
  type: string
  status: string
  scheduled_date: string
  completed_date: string | null
  description: string | null
  notes: string | null
  work_order_assets: WorkOrderAssetItem[]
  work_order_assets_count?: number
  created_at: string
}

export interface WorkOrderListResponse {
  data: WorkOrder[]
  current_page: number
  last_page: number
  total: number
}

export interface CreateWorkOrderPayload {
  campaign_id: string
  type: string
  scheduled_date: string
  assigned_to?: string
  description?: string
  notes?: string
  campaign_asset_ids: string[]
}

export async function fetchWorkOrders(page = 1): Promise<WorkOrderListResponse> {
  const response = await api.get<WorkOrderListResponse>('/api/work-orders', {
    params: { page, per_page: 20 },
  })
  return response.data
}

export async function fetchWorkOrder(id: string): Promise<WorkOrder> {
  const response = await api.get<WorkOrder>(`/api/work-orders/${id}`)
  return response.data
}

export async function createWorkOrder(payload: CreateWorkOrderPayload): Promise<WorkOrder> {
  await getCsrfCookie()
  const response = await api.post<WorkOrder>('/api/work-orders', payload)
  return response.data
}

export async function transitionWorkOrder(id: string, status: string): Promise<WorkOrder> {
  await getCsrfCookie()
  const response = await api.put<WorkOrder>(`/api/work-orders/${id}/transition`, { status })
  return response.data
}
