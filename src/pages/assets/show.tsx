import { type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { CalendarDays, Clock, Lightbulb, MapPin, Pencil, Ruler } from 'lucide-react'
import api from '@/lib/api'
import { PageHeader } from '@/design-system/components/PageHeader'
import { AppCard } from '@/design-system/components/AppCard'
import { SectionCard } from '@/design-system/components/SectionCard'
import { AppBadge } from '@/design-system/components/AppBadge'
import { AppButton } from '@/design-system/components/AppButton'
import { EmptyState } from '@/design-system/components/EmptyState'
import { LoadingState } from '@/design-system/components/LoadingState'
import { AssetTypeIllustration } from '@/components/assets/AssetTypeIllustration'
import {
  type Asset,
  formatDimensions,
  formatRate,
  getStatusMeta,
  resolveAssetKind,
} from '@/components/assets/assetMeta'

type AssetDetail = Asset & {
  created_at?: string | null
  updated_at?: string | null
}

interface Reservation {
  id: string
  asset_id: string
  status: string
  type: string
  starts_at: string
  ends_at: string
  total_amount: string | number | null
  currency: string | null
  client: { id: string; name: string } | null
}

interface HistoryItem {
  label: string
  date: string
}

function formatDate(value?: string | null): string {
  if (!value) return 'No disponible'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'No disponible'
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

const RESERVATION_STATUS: Record<string, { label: string; badge: 'success' | 'neutral' }> = {
  confirmed: { label: 'Confirmada', badge: 'success' },
  cancelled: { label: 'Cancelada', badge: 'neutral' },
}

export function AssetShowPage() {
  const { assetId } = useParams({ from: '/assets/$assetId' })
  const navigate = useNavigate()

  const { data: asset, isLoading } = useQuery<AssetDetail>({
    queryKey: ['asset', assetId],
    queryFn: async () => (await api.get(`/api/assets/${assetId}`)).data,
  })

  const { data: reservationsData } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => (await api.get('/api/reservations?per_page=100')).data,
  })

  if (isLoading) return <LoadingState />

  if (!asset) {
    return (
      <div>
        <PageHeader title="Activo no encontrado" secondaryAction={{ label: '← Activos', to: '/assets' }} />
        <EmptyState
          title="No encontramos este activo"
          description="Es posible que haya sido eliminado o que el enlace sea incorrecto."
          actionLabel="Volver al listado"
          actionTo="/assets"
        />
      </div>
    )
  }

  const status = getStatusMeta(asset.status)
  const kind = resolveAssetKind(asset.asset_type?.name)
  const heroRate = formatRate(asset.monthly_rate_amount, asset.monthly_rate_currency)
  const dimensions = formatDimensions(asset.width, asset.height)
  const isAvailable = asset.status === 'active'

  const allReservations: Reservation[] = reservationsData?.data ?? []
  const reservations = allReservations.filter((r) => r.asset_id === assetId)
  const latestReservation = reservations[0]

  const rateAmount =
    asset.monthly_rate_amount != null && !Number.isNaN(Number(asset.monthly_rate_amount))
      ? Number(asset.monthly_rate_amount).toLocaleString('en-US', { maximumFractionDigits: 0 })
      : null

  const history: HistoryItem[] = []
  if (asset.created_at) history.push({ label: 'Activo creado', date: asset.created_at })
  if (asset.updated_at) history.push({ label: 'Última modificación', date: asset.updated_at })
  if (latestReservation) history.push({ label: 'Última reserva', date: latestReservation.starts_at })

  const description = [asset.code, asset.asset_type?.name].filter(Boolean).join(' · ')

  return (
    <div>
      <PageHeader
        title={asset.name}
        description={description || undefined}
        secondaryAction={{ label: '← Activos', to: '/assets' }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Hero + Información + Historial */}
        <div className="flex flex-col gap-6">
          {/* 1. Hero */}
          <AppCard variant="default" className="overflow-hidden">
            <div className="relative aspect-[16/9]">
              <AssetTypeIllustration
                type={asset.asset_type?.name}
                kind={kind}
                className="absolute inset-0 h-full w-full"
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <AppBadge label={status.label} variant={status.badge} />
              </div>
              {asset.asset_type?.name && (
                <span className="absolute top-4 right-4 inline-flex items-center rounded-[8px] bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-[#374151] backdrop-blur-sm">
                  {asset.asset_type.name}
                </span>
              )}
              {asset.code && (
                <span className="absolute bottom-4 left-4 font-mono text-[12px] font-medium text-white/90">
                  {asset.code}
                </span>
              )}
            </div>

            <div className="p-5">
              <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">{asset.name}</h2>
              <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#64748B]">
                <MapPin className="h-4 w-4 text-[#94A3B8]" />
                <span>{asset.zone?.name ?? asset.address ?? 'Sin ubicación'}</span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[24px] font-bold text-[#0F172A] leading-none">
                    {heroRate ?? 'Sin tarifa'}
                  </p>
                  {heroRate && <p className="mt-1 text-[12px] text-[#94A3B8]">por mes</p>}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <AppButton
                  type="button"
                  variant="primary"
                  onClick={() => navigate({ to: '/assets/$assetId/edit', params: { assetId } })}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </AppButton>
                <AppButton type="button" variant="secondary" onClick={() => navigate({ to: '/disponibilidad' })}>
                  <CalendarDays className="h-4 w-4" />
                  Ver disponibilidad
                </AppButton>
              </div>
            </div>
          </AppCard>

          {/* 2. Información General */}
          <SectionCard title="Información general">
            <div>
              <InfoRow label="Código">
                <span className="font-mono">{asset.code ?? 'No disponible'}</span>
              </InfoRow>
              <InfoRow label="Tipo">{asset.asset_type?.name ?? 'No disponible'}</InfoRow>
              <InfoRow label="Estado">
                <AppBadge label={status.label} variant={status.badge} />
              </InfoRow>
              <InfoRow label="Zona">{asset.zone?.name ?? 'No disponible'}</InfoRow>
              <InfoRow label="Dimensiones">
                <span className="inline-flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-[#94A3B8]" />
                  {dimensions ?? 'No disponible'}
                </span>
              </InfoRow>
              <InfoRow label="Iluminación">
                <span className="inline-flex items-center gap-1.5">
                  {asset.has_illumination && <Lightbulb className="h-3.5 w-3.5 text-[#F59E0B]" />}
                  {asset.has_illumination ? 'Sí' : 'No'}
                </span>
              </InfoRow>
              <InfoRow label="Tarifa mensual">{rateAmount ?? 'No disponible'}</InfoRow>
              <InfoRow label="Moneda">{asset.monthly_rate_currency ?? 'No disponible'}</InfoRow>
              <InfoRow label="Fecha de creación">{formatDate(asset.created_at)}</InfoRow>
            </div>
          </SectionCard>

          {/* 8. Historial */}
          <SectionCard title="Historial">
            {history.length === 0 ? (
              <p className="text-[13px] text-[#94A3B8]">Historial disponible próximamente</p>
            ) : (
              <ol className="relative ml-1.5 border-l border-[#E5E7EB]">
                {history.map((item, i) => (
                  <li key={i} className="relative pl-5 pb-4 last:pb-0">
                    <span className="absolute -left-[5px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#2563EB]" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#94A3B8]" />
                      <p className="text-[13px] font-medium text-[#0F172A]">{item.label}</p>
                    </div>
                    <p className="mt-0.5 text-[12px] text-[#64748B]">{formatDate(item.date)}</p>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
        </div>

        {/* Right column: Disponibilidad + Reservas + Campañas + OTs + Evidencias */}
        <div className="flex flex-col gap-6">
          {/* 3. Disponibilidad */}
          <SectionCard title="Disponibilidad">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${isAvailable ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}
              />
              <p className="text-[14px] font-semibold text-[#0F172A]">
                {isAvailable ? 'Disponible para reservas' : 'No disponible'}
              </p>
            </div>
            <p className="mt-1.5 text-[12px] text-[#64748B]">
              {isAvailable
                ? 'Este activo puede incluirse en nuevas reservas y cotizaciones.'
                : `Estado actual: ${status.label}.`}
            </p>
            <div className="mt-4">
              <AppButton type="button" variant="secondary" onClick={() => navigate({ to: '/disponibilidad' })}>
                <CalendarDays className="h-4 w-4" />
                Ver disponibilidad
              </AppButton>
            </div>
          </SectionCard>

          {/* 4. Reservas */}
          <SectionCard title="Reservas">
            {reservations.length === 0 ? (
              <EmptyState
                title="Sin reservas registradas"
                description="Las reservas de este activo aparecerán aquí."
              />
            ) : (
              <div>
                {reservations.map((r) => {
                  const meta = RESERVATION_STATUS[r.status] ?? { label: r.status, badge: 'neutral' as const }
                  const amount = formatRate(r.total_amount, r.currency)
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] py-3 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[#0F172A]">
                          {r.client?.name ?? 'Cliente'}
                        </p>
                        <p className="text-[12px] text-[#64748B]">
                          {formatDate(r.starts_at)} – {formatDate(r.ends_at)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <AppBadge label={meta.label} variant={meta.badge} />
                        {amount && <p className="mt-1 text-[12px] text-[#64748B]">{amount}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>

          {/* 5. Campañas */}
          <SectionCard title="Campañas">
            <EmptyState
              title="Sin campañas asociadas"
              description="Las campañas que incluyan este activo aparecerán aquí."
            />
          </SectionCard>

          {/* 6. Órdenes de Trabajo */}
          <SectionCard title="Órdenes de trabajo">
            <EmptyState
              title="Sin órdenes de trabajo"
              description="Las órdenes de trabajo del activo aparecerán aquí."
            />
          </SectionCard>

          {/* 7. Evidencias */}
          <SectionCard title="Evidencias">
            <EmptyState
              title="Sin evidencias registradas"
              description="Las evidencias de instalación del activo aparecerán aquí."
            />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] py-2.5 last:border-0">
      <span className="text-[13px] text-[#64748B]">{label}</span>
      <span className="text-right text-[13px] font-medium text-[#0F172A]">{children}</span>
    </div>
  )
}
