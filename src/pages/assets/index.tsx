import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  CheckCircle2,
  DollarSign,
  LayoutGrid,
  List,
  Megaphone,
  Package,
  Search,
  Wrench,
} from 'lucide-react'
import api from '@/lib/api'
import { PageHeader } from '@/design-system/components/PageHeader'
import { AppMetricCard } from '@/design-system/components/AppMetricCard'
import { AppBadge } from '@/design-system/components/AppBadge'
import { AppInput } from '@/design-system/components/AppInput'
import { AppSelect } from '@/design-system/components/AppSelect'
import { AppButton } from '@/design-system/components/AppButton'
import { AppTable } from '@/design-system/components/AppTable'
import { EmptyState } from '@/design-system/components/EmptyState'
import { AssetCard, AssetCardSkeleton } from '@/components/assets/AssetCard'
import { AssetTypeIllustration } from '@/components/assets/AssetTypeIllustration'
import {
  type Asset,
  STATUS_FILTER_OPTIONS,
  formatMoney,
  formatRate,
  getStatusMeta,
} from '@/components/assets/assetMeta'

type ViewMode = 'cards' | 'table'

function pct(value: number, total: number): string {
  return total > 0 ? `${Math.round((value / total) * 100)}% del inventario` : '—'
}

export function AssetsPage() {
  const queryClient = useQueryClient()
  const [view, setView] = useState<ViewMode>('cards')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [zoneFilter, setZoneFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => (await api.get('/api/assets?per_page=100')).data,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/assets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
  })

  const assets: Asset[] = data?.data ?? []

  // KPIs computed over the loaded inventory.
  const kpis = useMemo(() => {
    let disponibles = 0
    let ocupados = 0
    let mantenimiento = 0
    let potential = 0
    let currency = 'USD'
    for (const a of assets) {
      if (a.status === 'active') {
        disponibles++
        const amt = Number(a.monthly_rate_amount)
        if (!Number.isNaN(amt)) potential += amt
        if (a.monthly_rate_currency) currency = a.monthly_rate_currency
      } else if (a.status === 'occupied') {
        ocupados++
      } else if (a.status === 'maintenance') {
        mantenimiento++
      }
    }
    return { total: assets.length, disponibles, ocupados, mantenimiento, potential, currency }
  }, [assets])

  const typeOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of assets) if (a.asset_type) map.set(a.asset_type.id, a.asset_type.name)
    return Array.from(map, ([value, label]) => ({ value, label }))
  }, [assets])

  const zoneOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of assets) if (a.zone) map.set(a.zone.id, a.zone.name)
    return Array.from(map, ([value, label]) => ({ value, label }))
  }, [assets])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return assets.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false
      if (typeFilter && a.asset_type_id !== typeFilter) return false
      if (zoneFilter && a.zone_id !== zoneFilter) return false
      if (q) {
        const hay = [a.name, a.code, a.address].filter(Boolean).join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [assets, search, statusFilter, typeFilter, zoneFilter])

  const filtersActive = Boolean(search || statusFilter || typeFilter || zoneFilter)
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setTypeFilter('')
    setZoneFilter('')
  }

  return (
    <div>
      <PageHeader
        title="Activos publicitarios"
        description="Gestiona el inventario comercializable de vallas, pantallas y espacios publicitarios."
        action={{ label: 'Nuevo activo', to: '/assets/create' }}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <AppMetricCard icon={Package} label="Total activos" value={String(kpis.total)} />
            <AppMetricCard
              icon={CheckCircle2}
              label="Disponibles"
              value={String(kpis.disponibles)}
              detail={pct(kpis.disponibles, kpis.total)}
            />
            <AppMetricCard
              icon={Megaphone}
              label="Ocupados"
              value={String(kpis.ocupados)}
              detail={pct(kpis.ocupados, kpis.total)}
            />
            <AppMetricCard
              icon={Wrench}
              label="En mantenimiento"
              value={String(kpis.mantenimiento)}
            />
            <AppMetricCard
              icon={DollarSign}
              label="Ingreso potencial"
              value={formatMoney(kpis.potential, kpis.currency)}
              detail="Tarifas de disponibles / mes"
            />
          </>
        )}
      </div>

      {/* Toolbar: search + filters + view toggle */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center mb-5">
        <div className="lg:flex-1">
          <AppInput
            icon={Search}
            placeholder="Buscar por nombre, código o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-44">
            <AppSelect
              placeholder="Todos los estados"
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-40">
            <AppSelect
              placeholder="Todos los tipos"
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-40">
            <AppSelect
              placeholder="Todas las zonas"
              options={zoneOptions}
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
            />
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {/* Results bar */}
      {!isLoading && assets.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] text-[#64748B]">
            {filtered.length === assets.length
              ? `${assets.length} activos`
              : `${filtered.length} de ${assets.length} activos`}
          </p>
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <AssetCardSkeleton key={i} />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          title="Aún no tienes activos publicitarios"
          description="Registra tu primera valla, pantalla o espacio publicitario para comenzar a gestionar disponibilidad y reservas."
          actionLabel="Nuevo activo"
          actionTo="/assets/create"
        />
      ) : filtered.length === 0 ? (
        <NoResults onClear={clearFilters} />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      ) : (
        <AssetsTable
          assets={filtered}
          onDelete={(id) => {
            if (confirm('¿Eliminar este activo?')) deleteMutation.mutate(id)
          }}
        />
      )}
    </div>
  )
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  const base =
    'inline-flex h-full items-center gap-1.5 rounded-[9px] px-3 text-[13px] font-medium transition-colors'
  return (
    <div className="inline-flex h-[52px] items-center rounded-[12px] border border-[#E5E7EB] bg-white p-1">
      <button
        type="button"
        onClick={() => onChange('cards')}
        aria-pressed={view === 'cards'}
        className={`${base} ${view === 'cards' ? 'bg-[#111827] text-white' : 'text-[#64748B] hover:text-[#0F172A]'}`}
      >
        <LayoutGrid className="h-4 w-4" />
        Cards
      </button>
      <button
        type="button"
        onClick={() => onChange('table')}
        aria-pressed={view === 'table'}
        className={`${base} ${view === 'table' ? 'bg-[#111827] text-white' : 'text-[#64748B] hover:text-[#0F172A]'}`}
      >
        <List className="h-4 w-4" />
        Tabla
      </button>
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="rounded-[16px] border border-[#E5E7EB]/80 bg-white p-5">
      <div className="h-4 w-24 animate-pulse rounded bg-[#F1F5F9]" />
      <div className="mt-3 h-7 w-16 animate-pulse rounded bg-[#F1F5F9]" />
    </div>
  )
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-[16px] border border-dashed border-[#E5E7EB] bg-white py-16 px-8 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6]">
        <Search className="h-5 w-5 text-[#9CA3AF]" />
      </div>
      <p className="text-[14px] font-medium text-[#374151]">No encontramos activos con esos filtros</p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">Prueba ajustar la búsqueda o quitar algunos filtros.</p>
      <div className="mt-5 flex justify-center">
        <AppButton variant="secondary" onClick={onClear}>
          Limpiar filtros
        </AppButton>
      </div>
    </div>
  )
}

function AssetsTable({
  assets,
  onDelete,
}: {
  assets: Asset[]
  onDelete: (id: string) => void
}) {
  const navigate = useNavigate()
  return (
    <AppTable<Asset>
      data={assets}
      keyExtractor={(a) => a.id}
      onRowClick={(a) => navigate({ to: '/assets/$assetId', params: { assetId: a.id } })}
      columns={[
        {
          key: 'code',
          header: 'Código',
          render: (a) => (
            <span className="font-mono text-[12px] text-[#64748B]">{a.code ?? '—'}</span>
          ),
        },
        {
          key: 'name',
          header: 'Activo',
          render: (a) => (
            <div className="flex items-center gap-3">
              <div className="h-9 w-12 shrink-0 overflow-hidden rounded-[8px]">
                <AssetTypeIllustration type={a.asset_type?.name} className="h-full w-full" />
              </div>
              <span className="font-medium text-[#0F172A]">{a.name}</span>
            </div>
          ),
        },
        {
          key: 'type',
          header: 'Tipo',
          render: (a) => <span className="text-[#64748B]">{a.asset_type?.name ?? '—'}</span>,
        },
        {
          key: 'zone',
          header: 'Zona',
          render: (a) => <span className="text-[#64748B]">{a.zone?.name ?? '—'}</span>,
        },
        {
          key: 'rate',
          header: 'Tarifa',
          render: (a) => (
            <span className="text-[#374151]">
              {formatRate(a.monthly_rate_amount, a.monthly_rate_currency) ?? '—'}
            </span>
          ),
        },
        {
          key: 'status',
          header: 'Estado',
          render: (a) => {
            const s = getStatusMeta(a.status)
            return <AppBadge label={s.label} variant={s.badge} />
          },
        },
        {
          key: 'actions',
          header: 'Acciones',
          align: 'right',
          render: (a) => (
            <div
              className="flex items-center justify-end gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                to="/assets/$assetId/edit"
                params={{ assetId: a.id }}
                className="text-[12px] font-semibold text-[#2563EB] hover:underline"
              >
                Editar
              </Link>
              {a.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => onDelete(a.id)}
                  className="text-[12px] font-semibold text-[#EF4444] hover:underline"
                >
                  Eliminar
                </button>
              )}
            </div>
          ),
        },
      ]}
    />
  )
}
