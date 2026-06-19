import api, { getCsrfCookie } from '@/lib/api'

export interface ReservationAsset {
  id: string
  name: string
  code: string | null
}

export interface ReservationClient {
  id: string
  name: string
}

export interface Reservation {
  id: string
  asset_id: string
  client_id: string
  type: string
  status: string
  starts_at: string
  ends_at: string
  total_amount: string | null
  currency: string | null
  notes: string | null
  created_at: string
  asset: ReservationAsset
  client: ReservationClient
}

export interface ReservationListResponse {
  data: Reservation[]
  current_page: number
  last_page: number
  total: number
}

export interface CreateReservationPayload {
  asset_id: string
  client_id: string
  starts_at: string
  ends_at: string
  notes?: string
}

export interface ClientOption {
  id: string
  name: string
  status: string
}

export async function fetchReservations(page = 1): Promise<ReservationListResponse> {
  const response = await api.get<ReservationListResponse>('/api/reservations', {
    params: { page, per_page: 20 },
  })
  return response.data
}

export async function createReservation(payload: CreateReservationPayload): Promise<Reservation> {
  await getCsrfCookie()
  const response = await api.post<Reservation>('/api/reservations', payload)
  return response.data
}

export async function fetchClients(): Promise<ClientOption[]> {
  const response = await api.get<{ data: ClientOption[] }>('/api/clients?per_page=100')
  return response.data.data
}
