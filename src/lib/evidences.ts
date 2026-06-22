import api, { getCsrfCookie } from '@/lib/api'

export interface Evidence {
  id: string
  work_order_id: string
  campaign_asset_id: string | null
  type: string
  file_path: string
  file_name: string
  mime_type: string
  file_size: number
  notes: string | null
  url: string | null
  uploaded_by: { id: string; name: string }
  campaign_asset?: { id: string; asset: { id: string; name: string; code: string | null } } | null
  created_at: string
}

export async function fetchEvidences(workOrderId: string): Promise<Evidence[]> {
  const response = await api.get<{ data: Evidence[] }>(`/api/work-orders/${workOrderId}/evidences`)
  return response.data.data
}

export async function uploadEvidences(
  workOrderId: string,
  photos: File[],
  type: string,
  campaignAssetId?: string,
  notes?: string
): Promise<Evidence[]> {
  await getCsrfCookie()
  const formData = new FormData()
  photos.forEach((photo) => formData.append('photos[]', photo))
  formData.append('type', type)
  if (campaignAssetId) formData.append('campaign_asset_id', campaignAssetId)
  if (notes) formData.append('notes', notes)

  const response = await api.post<{ data: Evidence[] }>(
    `/api/work-orders/${workOrderId}/evidences`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data.data
}

export async function deleteEvidence(workOrderId: string, evidenceId: string): Promise<void> {
  await getCsrfCookie()
  await api.delete(`/api/work-orders/${workOrderId}/evidences/${evidenceId}`)
}
