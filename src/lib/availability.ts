import api from '@/lib/api'

export interface AvailabilityConflict {
  id: string
  type: string
  starts_at: string
  ends_at: string
  notes: string | null
}

export interface AvailabilityResult {
  available: boolean
  asset_status: string
  reason?: string
  conflicts: AvailabilityConflict[]
  checked_range: {
    start_date: string
    end_date: string
  }
}

export interface AssetOption {
  id: string
  name: string
  code: string | null
  status: string
}

export async function checkAvailability(
  assetId: string,
  startDate: string,
  endDate: string
): Promise<AvailabilityResult> {
  const response = await api.get<AvailabilityResult>(
    `/api/assets/${assetId}/availability`,
    { params: { start_date: startDate, end_date: endDate } }
  )
  return response.data
}

export async function fetchAssetOptions(): Promise<AssetOption[]> {
  const response = await api.get<{ data: AssetOption[] }>('/api/assets?per_page=100')
  return response.data.data
}
