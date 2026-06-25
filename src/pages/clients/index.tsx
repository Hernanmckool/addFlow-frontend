import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Search,
  User,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react'
import api from '@/lib/api'
import { PageHeader } from '@/design-system/components/PageHeader'
import { AppMetricCard } from '@/design-system/components/AppMetricCard'
import { AppCard } from '@/design-system/components/AppCard'
import { AppBadge } from '@/design-system/components/AppBadge'
import { AppButton } from '@/design-system/components/AppButton'
import { AppInput } from '@/design-system/components/AppInput'
import { AppSelect } from '@/design-system/components/AppSelect'
import { AppTable } from '@/design-system/components/AppTable'
import { EmptyState } from '@/design-system/components/EmptyState'
import { LoadingState } from '@/design-system/components/LoadingState'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'

interface ClientContact {
  id: string
  name: string
  position: string | null
  email: string | null
  phone: string | null
  is_primary: boolean
  is_active: boolean
}

interface Client {
  id: string
  name: string
  legal_name: string | null
  tax_id: string | null
  type: string
  status: string
  industry: string | null
  contacts: ClientContact[] | null
}

const STATUS_META: Record<string, { label: string; badge: BadgeVariant }> = {
  prospect: { label: 'Prospecto', badge: 'info' },
  active: { label: 'Activo', badge: 'success' },
  inactive: { label: 'Inactivo', badge: 'neutral' },
  deactivated: { label: 'Desactivado', badge: 'danger' },
}

const TYPE_LABEL: Record<string, string> = {
  direct: 'Directo',
  agency: 'Agencia',
  other: 'Otro',
}

const STATUS_FILTER_OPTIONS = [
  { value: 'prospect', label: 'Prospecto' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'deactivated', label: 'Desactivado' },
]

const TYPE_FILTER_OPTIONS = [
  { value: 'direct', label: 'Directo' },
  { value: 'agency', label: 'Agencia' },
  { value: 'other', label: 'Otro' },
]

function getStatusMeta(status: string): { label: string; badge: BadgeVariant } {
  return STATUS_META[status] ?? { label: status, badge: 'neutral' }
}

function getTypeLabel(type: string): string {
  return TYPE_LABEL[type] ?? type
}

function getPrimaryContact(client: Client): ClientContact | null {
  const contacts = client.contacts ?? []
  return contacts.find((c) => c.is_primary) ?? contacts[0] ?? null
}

type ViewMode = 'cards' | 'table'

export function ClientsPage() {
  const [view, setView] = useState<ViewMode>('cards')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['clients'],
    // Always refetch on mount so a newly created client appears immediately.
    staleTime: 0,
    queryFn: async () => (await api.get('/api/clients?per_page=100')).data,
  })

  const clients: Client[] = data?.data ?? []

  const kpis = useMemo(() => {
    let active = 0
    let prospect = 0
    let inactive = 0
    for (const c of clients) {
      if (c.status === 'active') active++
      else if (c.status === 'prospect') prospect++
      else if (c.status === 'inactive') inactive++
    }
    return { total: clients.length, active, prospect, inactive }
  }, [clients])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false
      if (typeFilter && c.type !== typeFilter) return false
      if (q) {
        const contact = getPrimaryContact(c)
        const hay = [c.name, c.legal_name, contact?.email, contact?.phone]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [clients, search, statusFilter, typeFilter])

  const filtersActive = Boolean(search || statusFilter || typeFilter)
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setTypeFilter('')
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gestiona empresas, contactos y oportunidades comerciales."
        action={{ label: 'Nuevo cliente', to: '/clientes/crear' }}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <AppMetricCard icon={Users} label="Total clientes" value={String(kpis.total)} />
            <AppMetricCard icon={UserCheck} label="Activos" value={String(kpis.active)} />
            <AppMetricCard icon={UserPlus} label="Prospectos" value={String(kpis.prospect)} />
            <AppMetricCard icon={UserX} label="Inactivos" value={String(kpis.inactive)} />
          </>
        )}
      </div>

      {/* Toolbar: search + filters + view toggle */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center mb-5">
        <div className="lg:flex-1">
          <AppInput
            icon={Search}
            placeholder="Buscar por nombre, email o teléfono..."
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
              options={TYPE_FILTER_OPTIONS}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {/* Results bar */}
      {!isLoading && clients.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] text-[#64748B]">
            {filtered.length === clients.length
              ? `${clients.length} clientes`
              : `${filtered.length} de ${clients.length} clientes`}
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
        <LoadingState />
      ) : clients.length === 0 ? (
        <EmptyState
          title="Aún no tienes clientes"
          description="Registra tu primer cliente o agencia para comenzar a gestionar contactos, cotizaciones y reservas."
          actionLabel="Nuevo cliente"
          actionTo="/clientes/crear"
        />
      ) : filtered.length === 0 ? (
        <NoResults onClear={clearFilters} />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <ClientCard key={c.id} client={c} />
          ))}
        </div>
      ) : (
        <ClientsTable clients={filtered} />
      )}
    </div>
  )
}

function ClientCard({ client }: { client: Client }) {
  const status = getStatusMeta(client.status)
  const contact = getPrimaryContact(client)

  return (
    <AppCard variant="default" className="flex flex-col p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6]">
            <Building2 className="h-5 w-5 text-[#64748B]" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-[#0F172A]">{client.name}</h3>
            <p className="mt-0.5 text-[12px] text-[#64748B]">{getTypeLabel(client.type)}</p>
          </div>
        </div>
        <AppBadge label={status.label} variant={status.badge} />
      </div>

      {/* Contact */}
      <div className="mt-4 space-y-2 border-t border-[#F3F4F6] pt-4">
        <div className="flex items-center gap-2 text-[13px] text-[#374151]">
          <User className="h-4 w-4 shrink-0 text-[#94A3B8]" />
          <span className="truncate">{contact?.name ?? 'Sin contacto principal'}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[#64748B]">
          <Mail className="h-4 w-4 shrink-0 text-[#94A3B8]" />
          <span className="truncate">{contact?.email ?? '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[#64748B]">
          <Phone className="h-4 w-4 shrink-0 text-[#94A3B8]" />
          <span className="truncate">{contact?.phone ?? '—'}</span>
        </div>
      </div>

      {/* Counts */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#F3F4F6] pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">Cotizaciones</p>
          <p className="mt-0.5 text-[15px] font-semibold text-[#0F172A]">—</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">Reservas</p>
          <p className="mt-0.5 text-[15px] font-semibold text-[#0F172A]">—</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-end gap-3 border-t border-[#F3F4F6] pt-4">
        <RowActions />
      </div>
    </AppCard>
  )
}

/**
 * Detail/edit screens for clients don't exist yet (this task covers the listing
 * only). Actions are rendered as disabled placeholders to preserve the premium
 * layout without linking to non-existent routes.
 */
function RowActions() {
  return (
    <>
      <button
        type="button"
        disabled
        title="Disponible próximamente"
        className="text-[12px] font-semibold text-[#94A3B8] cursor-not-allowed"
      >
        Ver detalle
      </button>
      <button
        type="button"
        disabled
        title="Disponible próximamente"
        className="text-[12px] font-semibold text-[#94A3B8] cursor-not-allowed"
      >
        Editar
      </button>
    </>
  )
}

function ClientsTable({ clients }: { clients: Client[] }) {
  return (
    <AppTable<Client>
      data={clients}
      keyExtractor={(c) => c.id}
      columns={[
        {
          key: 'name',
          header: 'Empresa',
          render: (c) => (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#F3F4F6]">
                <Building2 className="h-4 w-4 text-[#64748B]" />
              </div>
              <span className="font-medium text-[#0F172A]">{c.name}</span>
            </div>
          ),
        },
        {
          key: 'type',
          header: 'Tipo',
          render: (c) => <span className="text-[#64748B]">{getTypeLabel(c.type)}</span>,
        },
        {
          key: 'status',
          header: 'Estado',
          render: (c) => {
            const s = getStatusMeta(c.status)
            return <AppBadge label={s.label} variant={s.badge} />
          },
        },
        {
          key: 'contact',
          header: 'Contacto',
          render: (c) => {
            const contact = getPrimaryContact(c)
            return <span className="text-[#374151]">{contact?.name ?? '—'}</span>
          },
        },
        {
          key: 'email',
          header: 'Email',
          render: (c) => {
            const contact = getPrimaryContact(c)
            return <span className="text-[#64748B]">{contact?.email ?? '—'}</span>
          },
        },
        {
          key: 'phone',
          header: 'Teléfono',
          render: (c) => {
            const contact = getPrimaryContact(c)
            return <span className="text-[#64748B]">{contact?.phone ?? '—'}</span>
          },
        },
        {
          key: 'counts',
          header: 'Cot. / Res.',
          render: () => <span className="text-[#64748B]">— / —</span>,
        },
        {
          key: 'actions',
          header: 'Acciones',
          align: 'right',
          render: () => (
            <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
              <RowActions />
            </div>
          ),
        },
      ]}
    />
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
      <p className="text-[14px] font-medium text-[#374151]">No encontramos clientes con esos filtros</p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">Prueba ajustar la búsqueda o quitar algunos filtros.</p>
      <div className="mt-5 flex justify-center">
        <AppButton variant="secondary" onClick={onClear}>
          Limpiar filtros
        </AppButton>
      </div>
    </div>
  )
}
