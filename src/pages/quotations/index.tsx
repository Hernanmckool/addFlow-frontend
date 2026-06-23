import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchQuotations, type Quotation } from '@/lib/quotations'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' }> = {
  draft: { label: 'Borrador', variant: 'default' },
  sent: { label: 'Enviada', variant: 'info' },
  accepted: { label: 'Aceptada', variant: 'success' },
  rejected: { label: 'Rechazada', variant: 'error' },
  expired: { label: 'Vencida', variant: 'warning' },
  converted: { label: 'Convertida', variant: 'purple' },
}

export function QuotationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => fetchQuotations(),
  })

  const quotations: Quotation[] = data?.data ?? []

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="Cotizaciones"
        description="Propuestas comerciales para clientes"
        action={{ label: 'Nueva cotización', to: '/cotizaciones/crear' }}
      />

      {quotations.length === 0 ? (
        <EmptyState
          title="Sin cotizaciones"
          description="Crea tu primera cotización para iniciar el flujo comercial"
          actionLabel="Crear cotización"
          actionTo="/cotizaciones/crear"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Número</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {quotations.map((q) => {
                const status = STATUS_MAP[q.status] ?? { label: q.status, variant: 'default' as const }
                return (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[12px] text-gray-600">{q.number}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">{q.client.name}</td>
                    <td className="px-5 py-3.5 text-gray-700">{q.currency} {Number(q.total).toLocaleString()}</td>
                    <td className="px-5 py-3.5"><Badge label={status.label} variant={status.variant} /></td>
                    <td className="px-5 py-3.5 text-gray-500">{new Date(q.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to="/cotizaciones/$quotationId" params={{ quotationId: q.id }} className="text-[12px] text-gray-500 hover:text-gray-900 font-medium transition-colors">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
