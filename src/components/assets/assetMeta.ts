// Shared types and presentation helpers for the Assets module.
// Keeps status labels, badge variants, formatting and type-resolution in one
// place so the card and the table stay visually consistent.

export type AssetStatus =
  | 'draft'
  | 'active'
  | 'occupied'
  | 'maintenance'
  | 'out_of_service'
  | 'decommissioned'

// Mirrors the variants supported by AppBadge.
export type AssetBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'

export interface AssetTypeRef {
  id: string
  name: string
}

export interface ZoneRef {
  id: string
  name: string
}

export interface Asset {
  id: string
  name: string
  code: string | null
  status: string
  asset_type_id: string
  zone_id: string | null
  address: string | null
  width: string | number | null
  height: string | number | null
  has_illumination: boolean
  orientation: string | null
  monthly_rate_amount: string | number | null
  monthly_rate_currency: string | null
  photos: string[] | null
  asset_type: AssetTypeRef | null
  zone: ZoneRef | null
}

interface StatusMeta {
  label: string
  badge: AssetBadgeVariant
}

const STATUS_META: Record<AssetStatus, StatusMeta> = {
  draft: { label: 'Borrador', badge: 'neutral' },
  active: { label: 'Activo', badge: 'success' },
  occupied: { label: 'Ocupado', badge: 'info' },
  maintenance: { label: 'Mantenimiento', badge: 'warning' },
  out_of_service: { label: 'Fuera de servicio', badge: 'danger' },
  decommissioned: { label: 'Dado de baja', badge: 'neutral' },
}

const FALLBACK_STATUS: StatusMeta = { label: 'Desconocido', badge: 'neutral' }

export function getStatusMeta(status: string): StatusMeta {
  return STATUS_META[status as AssetStatus] ?? FALLBACK_STATUS
}

/** Status options for the filter dropdown, in lifecycle order. */
export const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = (
  Object.keys(STATUS_META) as AssetStatus[]
).map((value) => ({ value, label: STATUS_META[value].label }))

export interface OccupancyInfo {
  /** 0-100 when meaningful, null when occupancy does not apply to the state. */
  value: number | null
  label: string
  tone: 'available' | 'occupied' | 'muted'
}

/**
 * Derives a simple occupancy reading from the asset's operational state.
 * Phase 1 has no time-based availability data wired into the listing, so this
 * reflects the current commercial state (occupied = in use, active = free).
 */
export function getOccupancy(status: string): OccupancyInfo {
  switch (status) {
    case 'occupied':
      return { value: 100, label: 'Ocupado', tone: 'occupied' }
    case 'active':
      return { value: 0, label: 'Disponible', tone: 'available' }
    case 'maintenance':
      return { value: null, label: 'En mantenimiento', tone: 'muted' }
    case 'out_of_service':
      return { value: null, label: 'Fuera de servicio', tone: 'muted' }
    case 'draft':
      return { value: null, label: 'Sin publicar', tone: 'muted' }
    case 'decommissioned':
      return { value: null, label: 'Dado de baja', tone: 'muted' }
    default:
      return { value: null, label: '—', tone: 'muted' }
  }
}

function toNumber(value: string | number | null): number | null {
  if (value === null || value === undefined) return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(n) ? null : n
}

/** Formats a monthly rate as e.g. "USD 1,200". Returns null when no rate. */
export function formatRate(
  amount: string | number | null,
  currency: string | null,
): string | null {
  const n = toNumber(amount)
  if (n === null) return null
  return `${currency ?? 'USD'} ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

/** Formats a plain money amount with a currency code, e.g. "USD 182,400". */
export function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

/** Formats dimensions as e.g. "8 × 4 m". Returns null when not set. */
export function formatDimensions(
  width: string | number | null,
  height: string | number | null,
): string | null {
  const w = toNumber(width)
  const h = toNumber(height)
  if (w === null || h === null || (w === 0 && h === 0)) return null
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))
  return `${fmt(w)} × ${fmt(h)} m`
}

export type AssetKind = 'billboard' | 'screen' | 'mupi' | 'indoor' | 'generic'

/** Maps a (tenant-defined, free-text) asset type name to an illustration kind. */
export function resolveAssetKind(typeName?: string | null): AssetKind {
  const n = (typeName ?? '').toLowerCase()
  if (/(led|pantalla|digital|screen|display)/.test(n)) return 'screen'
  if (/(mupi|parada|paradero|abribus|street)/.test(n)) return 'mupi'
  if (/(interior|mall|centro comercial|c\.c\.|indoor|hall|aeropuerto)/.test(n)) return 'indoor'
  if (/(valla|unipolar|bipolar|espectacular|billboard|panel|cartelera)/.test(n)) return 'billboard'
  return 'generic'
}
