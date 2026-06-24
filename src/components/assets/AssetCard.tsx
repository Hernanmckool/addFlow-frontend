import { Link } from '@tanstack/react-router'
import { CalendarDays, Lightbulb, MapPin, Pencil, Ruler } from 'lucide-react'
import { AppCard } from '@/design-system/components/AppCard'
import { AppBadge } from '@/design-system/components/AppBadge'
import { AssetTypeIllustration } from './AssetTypeIllustration'
import {
  type Asset,
  formatDimensions,
  formatRate,
  getOccupancy,
  getStatusMeta,
  resolveAssetKind,
} from './assetMeta'

interface AssetCardProps {
  asset: Asset
}

const OCCUPANCY_TONE: Record<string, string> = {
  available: '#22C55E',
  occupied: '#2563EB',
  muted: '#CBD5E1',
}

export function AssetCard({ asset }: AssetCardProps) {
  const status = getStatusMeta(asset.status)
  const occupancy = getOccupancy(asset.status)
  const rate = formatRate(asset.monthly_rate_amount, asset.monthly_rate_currency)
  const dimensions = formatDimensions(asset.width, asset.height)
  const kind = resolveAssetKind(asset.asset_type?.name)
  const barColor = OCCUPANCY_TONE[occupancy.tone] ?? OCCUPANCY_TONE.muted

  return (
    <AppCard
      variant="default"
      className="group overflow-hidden hover:shadow-md hover:border-[#D1D5DB] hover:-translate-y-0.5 transition-all duration-200"
    >
      <Link to="/assets/$assetId" params={{ assetId: asset.id }} className="block">
        {/* Media / placeholder by type */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <AssetTypeIllustration
          type={asset.asset_type?.name}
          kind={kind}
          className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
        <div className="absolute top-3 left-3">
          <AppBadge label={status.label} variant={status.badge} />
        </div>
        {asset.asset_type?.name && (
          <span className="absolute top-3 right-3 inline-flex items-center rounded-[8px] bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#374151] backdrop-blur-sm">
            {asset.asset_type.name}
          </span>
        )}
        {asset.code && (
          <span className="absolute bottom-3 left-3 font-mono text-[11px] font-medium text-white/90">
            {asset.code}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="truncate text-[15px] font-semibold text-[#0F172A]" title={asset.name}>
          {asset.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[#64748B]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
          <span className="truncate">{asset.zone?.name ?? asset.address ?? 'Sin ubicación'}</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[17px] font-bold text-[#0F172A] leading-none">
              {rate ?? 'Sin tarifa'}
            </p>
            {rate && <p className="mt-1 text-[11px] text-[#94A3B8]">por mes</p>}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
            {dimensions && (
              <span className="inline-flex items-center gap-1" title="Dimensiones">
                <Ruler className="h-3.5 w-3.5 text-[#94A3B8]" />
                {dimensions}
              </span>
            )}
            {asset.has_illumination && (
              <span className="inline-flex items-center gap-1" title="Con iluminación">
                <Lightbulb className="h-3.5 w-3.5 text-[#F59E0B]" />
              </span>
            )}
          </div>
        </div>

        {/* Occupancy bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B]">Ocupación</span>
            <span className="text-[11px] font-semibold text-[#374151]">
              {occupancy.value === null ? occupancy.label : `${occupancy.value}%`}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${occupancy.value ?? 0}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
        </div>
      </div>

      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-[#F3F4F6] p-3">
        <Link
          to="/disponibilidad"
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#F8FAFC] text-[12px] font-semibold text-[#374151] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
        >
          <CalendarDays className="h-4 w-4" />
          Ver disponibilidad
        </Link>
        <Link
          to="/assets/$assetId/edit"
          params={{ assetId: asset.id }}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-[#E5E7EB] px-3 text-[12px] font-semibold text-[#374151] transition-colors hover:bg-[#F9FAFB] hover:text-[#0F172A]"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Link>
      </div>
    </AppCard>
  )
}

export function AssetCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[16px] border border-[#E5E7EB]/80 bg-white">
      <div className="aspect-[16/10] animate-pulse bg-[#F1F5F9]" />
      <div className="p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#F1F5F9]" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#F1F5F9]" />
        <div className="mt-4 h-5 w-2/5 animate-pulse rounded bg-[#F1F5F9]" />
        <div className="mt-4 h-1.5 w-full animate-pulse rounded-full bg-[#F1F5F9]" />
      </div>
      <div className="flex gap-2 border-t border-[#F3F4F6] p-3">
        <div className="h-9 flex-1 animate-pulse rounded-[10px] bg-[#F1F5F9]" />
        <div className="h-9 w-20 animate-pulse rounded-[10px] bg-[#F1F5F9]" />
      </div>
    </div>
  )
}
