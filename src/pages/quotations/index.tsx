import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import {
  CheckCircle2,
  FileText,
  LayoutGrid,
  List,
  PencilLine,
  Repeat,
  Search,
  Send,
} from 'lucide-react'
import {
  fetchQuotations,
  transitionQuotation,
  convertQuotation,
  type Quotation,
} from '@/lib/quotations'
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

const STATUS_META: Record<string, { label: string; badge: BadgeVariant }> = {
  draft: { label: 'Borrador', badge: 'neutral' },
  sent: { label: 'Enviada', badge: 'info' },
  accepted: { label: 'Aceptada', badge: 'success' },
  rejected: { label: 'Rechazada', badge: 'danger' },
  expired: { label: 'Vencida', badge: 'warning' },
  converted: { label: 'Convertida', badge: 'purple' },
}

const STATUS_FILTER_OPTIONS = [
  { value: 'draft', label: 'Borrador' },
  { value: 'sent', label: 'Enviada' },
  { value: 'accepted', label: 'Aceptada' },
  { value: 'rejected', label: 'Rechazada' },
  { value: 'expired', label: 'Vencida' },
  { value: 'converted', label: 'Convertida' },
]

function getStatusMeta(status: string): { label: string; badge: BadgeVariant } {
  return STATUS_META[status] ?? { label: status, badge: 'neutral' }
}

function formatTotal(q: Quotation): string {
  const n = Number(q.total)
  const amount = Number.isNaN(n) ? '0' : n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return `${q.currency} ${amount}`
}

function getItemsCount(q: Quotation): number {
  return q.items_count ?? q.items?.length ?? 0
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface QuickAction {
  label: string
  kind: 'transition' | 'convert'
  target?: string
}

/** Reuses the existing transition/convert flow; only surfaces the next step. */
function getQuickAction(status: string): QuickAction | null {
  switch (status) {
    case 'draft':
      return { label: 'Enviar', kind: 'transition', target: 'sent' }
    case 'sent':
      return { label: 'Aceptar', kind: 'transition', target: 'accepted' }
    case 'accepted':
      return { label: 'Convertir', kind: 'convert' }
    default:
      return null
  }
}

type ViewMode = 'cards' | 'table'

export function QuotationsPage() {
  const queryClient = useQueryClient()
  const [view, setView] = useState<ViewMode>('cards')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => fetchQuotations(),
  })

  const quotations: Quotation[] = data?.data ?? []

  const handleActionError = (error: unknown) => {
    if (error instanceof AxiosError && error.response) {
      const d = error.response.data as Record<string, unknown>
      setActionError(String(d.message ?? 'No se pudo completar la acción.'))
    } else {
      setActionError('No se pudo completar la acción.')
    }
    setPendingId(null)
  }

  const transitionMutation = useMutation({
    mutationFn: (vars: { id: string; status: string }) => transitionQuotation(vars.id, vars.status),
    onSuccess: () => {
      setActionError(null)
      setPendingId(null)
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: handleActionError,
  })

  const convertMutation = useMutation({
    mutationFn: (id: string) => convertQuotation(id),
    onSuccess: () => {
      setActionError(null)
      setPendingId(null)
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: handleActionError,
  })

  const runQuickAction = (q: Quotation) => {
    const action = getQuickAction(q.status)
    if (!action) return
    setActionError(null)
    setPendingId(q.id)
    if (action.kind === 'convert') {
      convertMutation.mutate(q.id)
    } else if (action.target) {
      transitionMutation.mutate({ id: q.id, status: action.target })
    }
  }

  const kpis = useMemo(() => {
    let draft = 0
    let sent = 0
    let accepted = 0
    let converted = 0
    for (const q of quotations) {
      if (q.status === 'draft') draft++
      else if (q.status === 'sent') sent++
      else if (q.status === 'accepted') accepted++
      else if (q.status === 'converted') converted++
    }
    return { total: quotations.length, draft, sent, accepted, converted }
  }, [quotations])

  const clientOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const q of quotations) if (q.client) map.set(q.client.id, q.client.name)
    return Array.from(map, ([value, label]) => ({ value, label }))
  }, [quotations])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return quotations.filter((q) => {
      if (statusFilter && q.status !== statusFilter) return false
      if (clientFilter && q.client_id !== clientFilter) return false
      if (query) {
        const hay = [q.number, q.client?.name, getStatusMeta(q.status).label]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(query)) return false
      }
      return true
    })
  }, [quotations, search, statusFilter, clientFilter])

  const filtersActive = Boolean(search || statusFilter || clientFilter)
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setClientFilter('')
  }

  return (
    <div>
      <PageHeader
        title="Cotizaciones"
        description="Gestiona propuestas comerciales antes de convertirlas en reservas."
        action={{ label: 'Nueva cotización', to: '/cotizaciones/crear' }}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <AppMetricCard icon={FileText} label="Total cotizaciones" value={String(kpis.total)} />
            <AppMetricCard icon={PencilLine} label="Borradores" value={String(kpis.draft)} />
            <AppMetricCard icon={Send} label="Enviadas" value={String(kpis.sent)} />
            <AppMetricCard icon={CheckCircle2} label="Aceptadas" value={String(kpis.accepted)} />
            <AppMetricCard icon={Repeat} label="Convertidas" value={String(kpis.converted)} />
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center mb-5">
        <div className="lg:flex-1">
          <AppInput
            icon={Search}
            placeholder="Buscar por número, cliente o estado..."
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
          {clientOptions.length > 0 && (
            <div className="w-full sm:w-48">
              <AppSelect
                placeholder="Todos los clientes"
                options={clientOptions}
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              />
            </div>
          )}
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
          {actionError}
        </div>
      )}

      {/* Results bar */}
      {!isLoading && quotations.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] text-[#64748B]">
            {filtered.length === quotations.length
              ? `${quotations.length} cotizaciones`
              : `${filtered.length} de ${quotations.length} cotizaciones`}
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
      ) : quotations.length === 0 ? (
        <EmptyState
          title="Aún no tienes cotizaciones"
          description="Crea tu primera cotización para iniciar el flujo comercial y convertirla en reservas."
          actionLabel="Nueva cotización"
          actionTo="/cotizaciones/crear"
        />
      ) : filtered.length === 0 ? (
        <NoResults onClear={clearFilters} />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((q) => (
            <QuotationCard
              key={q.id}
              quotation={q}
              pending={pendingId === q.id}
              onQuickAction={() => runQuickAction(q)}
            />
          ))}
        </div>
      ) : (
        <QuotationsTable
          quotations={filtered}
          pendingId={pendingId}
          onQuickAction={runQuickAction}
        />
      )}
    </div>
  )
}

function QuotationCard({
  quotation,
  pending,
  onQuickAction,
}: {
  quotation: Quotation
  pending: boolean
  onQuickAction: () => void
}) {
  const status = getStatusMeta(quotation.status)
  const count = getItemsCount(quotation)

  return (
    <AppCard variant="default" className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[12px] text-[#64748B]">{quotation.number}</p>
          <h3 className="mt-0.5 truncate text-[15px] font-semibold text-[#0F172A]">
            {quotation.client?.name ?? 'Cliente'}
          </h3>
        </div>
        <AppBadge label={status.label} variant={status.badge} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-2 border-t border-[#F3F4F6] pt-4">
        <div>
          <p className="text-[20px] font-bold leading-none text-[#0F172A]">{formatTotal(quotation)}</p>
          <p className="mt-1 text-[11px] text-[#94A3B8]">
            {count} {count === 1 ? 'activo' : 'activos'}
          </p>
        </div>
        <p className="text-[12px] text-[#64748B]">{formatDate(quotation.created_at)}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F3F4F6] pt-4">
        <div className="flex items-center gap-3">
          <Link
            to="/cotizaciones/$quotationId"
            params={{ quotationId: quotation.id }}
            className="text-[12px] font-semibold text-[#2563EB] hover:underline"
          >
            Ver detalle
          </Link>
          {quotation.status === 'draft' && (
            <Link
              to="/cotizaciones/$quotationId/edit"
              params={{ quotationId: quotation.id }}
              className="text-[12px] font-semibold text-[#64748B] hover:text-[#0F172A] hover:underline"
            >
              Editar
            </Link>
          )}
        </div>
        <QuickActionButton status={quotation.status} pending={pending} onClick={onQuickAction} />
      </div>
    </AppCard>
  )
}

function QuickActionButton({
  status,
  pending,
  onClick,
}: {
  status: string
  pending: boolean
  onClick: () => void
}) {
  const action = getQuickAction(status)
  if (!action) return null
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex h-[30px] items-center gap-1.5 rounded-[8px] bg-[#111827] px-3 text-[12px] font-semibold text-white transition-colors hover:bg-[#1F2937] disabled:opacity-50"
    >
      {pending && (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {action.label}
    </button>
  )
}

function QuotationsTable({
  quotations,
  pendingId,
  onQuickAction,
}: {
  quotations: Quotation[]
  pendingId: string | null
  onQuickAction: (q: Quotation) => void
}) {
  const navigate = useNavigate()
  return (
    <AppTable<Quotation>
      data={quotations}
      keyExtractor={(q) => q.id}
      onRowClick={(q) => navigate({ to: '/cotizaciones/$quotationId', params: { quotationId: q.id } })}
      columns={[
        {
          key: 'number',
          header: 'Número',
          render: (q) => <span className="font-mono text-[12px] text-[#64748B]">{q.number}</span>,
        },
        {
          key: 'client',
          header: 'Cliente',
          render: (q) => <span className="font-medium text-[#0F172A]">{q.client?.name ?? '—'}</span>,
        },
        {
          key: 'total',
          header: 'Total',
          render: (q) => <span className="text-[#374151]">{formatTotal(q)}</span>,
        },
        {
          key: 'items',
          header: 'Activos',
          render: (q) => <span className="text-[#64748B]">{getItemsCount(q)}</span>,
        },
        {
          key: 'status',
          header: 'Estado',
          render: (q) => {
            const s = getStatusMeta(q.status)
            return <AppBadge label={s.label} variant={s.badge} />
          },
        },
        {
          key: 'created',
          header: 'Fecha',
          render: (q) => <span className="text-[#64748B]">{formatDate(q.created_at)}</span>,
        },
        {
          key: 'actions',
          header: 'Acciones',
          align: 'right',
          render: (q) => (
            <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
              <Link
                to="/cotizaciones/$quotationId"
                params={{ quotationId: q.id }}
                className="text-[12px] font-semibold text-[#2563EB] hover:underline"
              >
                Ver detalle
              </Link>
              {q.status === 'draft' && (
                <Link
                  to="/cotizaciones/$quotationId/edit"
                  params={{ quotationId: q.id }}
                  className="text-[12px] font-semibold text-[#64748B] hover:text-[#0F172A] hover:underline"
                >
                  Editar
                </Link>
              )}
              <QuickActionButton
                status={q.status}
                pending={pendingId === q.id}
                onClick={() => onQuickAction(q)}
              />
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
      <p className="text-[14px] font-medium text-[#374151]">No encontramos cotizaciones con esos filtros</p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">Prueba ajustar la búsqueda o quitar algunos filtros.</p>
      <div className="mt-5 flex justify-center">
        <AppButton variant="secondary" onClick={onClear}>
          Limpiar filtros
        </AppButton>
      </div>
    </div>
  )
}
