import { type ReactNode, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { ArrowRight, CircleDot, DollarSign, Layers, Percent } from 'lucide-react'
import { fetchQuotation, transitionQuotation, convertQuotation, type Quotation } from '@/lib/quotations'
import { PageHeader } from '@/design-system/components/PageHeader'
import { AppCard } from '@/design-system/components/AppCard'
import { SectionCard } from '@/design-system/components/SectionCard'
import { AppMetricCard } from '@/design-system/components/AppMetricCard'
import { AppBadge } from '@/design-system/components/AppBadge'
import { AppButton } from '@/design-system/components/AppButton'
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

// Same targets/flow as before — only labels and button styling are refined.
const TRANSITIONS: Record<string, { target: string }[]> = {
  draft: [{ target: 'sent' }, { target: 'rejected' }],
  sent: [{ target: 'accepted' }, { target: 'rejected' }],
  accepted: [{ target: '_convert' }, { target: 'rejected' }],
}

const ACTION_META: Record<string, { label: string; variant: 'primary' | 'secondary' }> = {
  sent: { label: 'Enviar', variant: 'primary' },
  accepted: { label: 'Marcar como aceptada', variant: 'primary' },
  _convert: { label: 'Convertir a reservas', variant: 'primary' },
  rejected: { label: 'Rechazar', variant: 'secondary' },
}

function getStatusMeta(status: string): { label: string; badge: BadgeVariant } {
  return STATUS_META[status] ?? { label: status, badge: 'neutral' }
}

function formatMoney(value: string | number | null, currency: string): string {
  const n = Number(value)
  const amount = Number.isNaN(n) ? '0' : n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return `${currency} ${amount}`
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function QuotationShowPage() {
  const { quotationId } = useParams({ strict: false }) as { quotationId: string }
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [convertSuccess, setConvertSuccess] = useState<string | null>(null)

  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', quotationId],
    queryFn: () => fetchQuotation(quotationId),
  })

  const transitionMutation = useMutation({
    mutationFn: (status: string) => transitionQuotation(quotationId, status),
    onSuccess: () => {
      setActionError(null)
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] })
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data as Record<string, unknown>
        setActionError(String(data.message ?? 'Error en la transición.'))
      }
    },
  })

  const convertMutation = useMutation({
    mutationFn: () => convertQuotation(quotationId),
    onSuccess: (data) => {
      setActionError(null)
      setConvertSuccess(`${data.message} (${data.reservations_created} reserva(s) creada(s))`)
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] })
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data as Record<string, unknown>
        setActionError(String(data.message ?? 'Error al convertir.'))
      }
    },
  })

  if (isLoading) return <LoadingState />

  if (!quotation) {
    return (
      <div>
        <PageHeader title="Cotización no encontrada" secondaryAction={{ label: '← Cotizaciones', to: '/cotizaciones' }} />
        <EmptyState
          title="No encontramos esta cotización"
          description="Es posible que haya sido eliminada o que el enlace sea incorrecto."
          actionLabel="Volver al listado"
          actionTo="/cotizaciones"
        />
      </div>
    )
  }

  const status = getStatusMeta(quotation.status)
  const availableTransitions = TRANSITIONS[quotation.status] ?? []
  const isBusy = transitionMutation.isPending || convertMutation.isPending
  const items = quotation.items ?? []

  const handleAction = (target: string) => {
    setActionError(null)
    setConvertSuccess(null)
    if (target === '_convert') {
      convertMutation.mutate()
    } else {
      transitionMutation.mutate(target)
    }
  }

  return (
    <div>
      <PageHeader
        title={`Cotización ${quotation.number}`}
        description={`${quotation.client.name} · ${status.label}`}
        actions={
          <>
            <AppButton type="button" variant="secondary" onClick={() => navigate({ to: '/cotizaciones' })}>
              Volver a cotizaciones
            </AppButton>
            {quotation.status === 'draft' && (
              <AppButton
                type="button"
                variant="secondary"
                onClick={() => navigate({ to: '/cotizaciones/$quotationId/edit', params: { quotationId: quotation.id } })}
              >
                Editar
              </AppButton>
            )}
            {availableTransitions.map((t) => {
              const meta = ACTION_META[t.target] ?? { label: t.target, variant: 'secondary' as const }
              return (
                <AppButton
                  key={t.target}
                  type="button"
                  variant={meta.variant}
                  disabled={isBusy}
                  onClick={() => handleAction(t.target)}
                >
                  {meta.label}
                </AppButton>
              )
            })}
          </>
        }
      />

      {actionError && (
        <div className="mb-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
          {actionError}
        </div>
      )}

      {convertSuccess && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
          <p className="text-[13px] text-[#16A34A]">{convertSuccess}</p>
          <button
            type="button"
            onClick={() => navigate({ to: '/reservas' })}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#16A34A] hover:underline"
          >
            Ver reservas
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Resumen superior */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <AppMetricCard
          icon={DollarSign}
          label="Subtotal"
          value={formatMoney(quotation.subtotal, quotation.currency)}
        />
        <AppMetricCard
          icon={Percent}
          label="Descuento"
          value={formatMoney(quotation.discount_amount, quotation.currency)}
          detail={`${Number(quotation.discount_percent)}% aplicado`}
        />
        <AppMetricCard
          icon={DollarSign}
          label="Total"
          value={formatMoney(quotation.total, quotation.currency)}
        />
        <AppMetricCard icon={Layers} label="Activos" value={String(items.length)} />
        <AppCard variant="metric" className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#F3F4F6]">
              <CircleDot className="h-4 w-4 text-[#64748B]" />
            </div>
            <span className="text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Estado</span>
          </div>
          <AppBadge label={status.label} variant={status.badge} />
        </AppCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Información comercial */}
        <div className="lg:col-span-1">
          <SectionCard title="Información comercial">
            <div>
              <InfoRow label="Cliente">{quotation.client.name}</InfoRow>
              <InfoRow label="Número">
                <span className="font-mono">{quotation.number}</span>
              </InfoRow>
              <InfoRow label="Estado">
                <AppBadge label={status.label} variant={status.badge} />
              </InfoRow>
              <InfoRow label="Fecha de creación">{formatDate(quotation.created_at)}</InfoRow>
              {quotation.valid_until && <InfoRow label="Vigencia">{formatDate(quotation.valid_until)}</InfoRow>}
              <InfoRow label="Moneda">{quotation.currency}</InfoRow>
            </div>
          </SectionCard>

          {quotation.notes && (
            <div className="mt-6">
              <SectionCard title="Notas">
                <p className="text-[13px] leading-relaxed text-[#64748B]">{quotation.notes}</p>
              </SectionCard>
            </div>
          )}
        </div>

        {/* Activos cotizados */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#0F172A]">Activos cotizados</h2>
            <span className="text-[12px] text-[#64748B]">
              {items.length} {items.length === 1 ? 'activo' : 'activos'}
            </span>
          </div>

          {items.length === 0 ? (
            <EmptyState
              title="Sin activos en la cotización"
              description="Esta cotización todavía no tiene activos asociados."
            />
          ) : (
            <AppTable<Quotation['items'][number]>
              data={items}
              keyExtractor={(item) => item.id}
              columns={[
                {
                  key: 'asset',
                  header: 'Activo',
                  render: (item) => (
                    <span className="font-medium text-[#0F172A]">{item.asset.name}</span>
                  ),
                },
                {
                  key: 'code',
                  header: 'Código',
                  render: (item) => (
                    <span className="font-mono text-[12px] text-[#64748B]">
                      {item.asset.code ?? '—'}
                    </span>
                  ),
                },
                {
                  key: 'from',
                  header: 'Desde',
                  render: (item) => <span className="text-[#64748B]">{formatDate(item.starts_at)}</span>,
                },
                {
                  key: 'to',
                  header: 'Hasta',
                  render: (item) => <span className="text-[#64748B]">{formatDate(item.ends_at)}</span>,
                },
                {
                  key: 'rate',
                  header: 'Tarifa/mes',
                  render: (item) => (
                    <span className="text-[#374151]">{formatMoney(item.unit_price, quotation.currency)}</span>
                  ),
                },
                {
                  key: 'months',
                  header: 'Meses',
                  render: (item) => <span className="text-[#64748B]">{item.quantity_months}</span>,
                },
                {
                  key: 'subtotal',
                  header: 'Subtotal',
                  align: 'right',
                  render: (item) => (
                    <span className="font-semibold text-[#0F172A]">
                      {formatMoney(item.line_total, quotation.currency)}
                    </span>
                  ),
                },
              ]}
            />
          )}
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
