import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchWorkOrders, type WorkOrder } from '@/lib/work-orders'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

const TYPE_LABELS: Record<string, string> = {
  instalacion: 'Instalación',
  retiro: 'Retiro',
  inspeccion: 'Inspección',
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' }> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  assigned: { label: 'Asignada', variant: 'info' },
  in_progress: { label: 'En progreso', variant: 'purple' },
  completed: { label: 'Completada', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'error' },
}

export function WorkOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['work-orders'],
    queryFn: () => fetchWorkOrders(),
  })

  const workOrders: WorkOrder[] = data?.data ?? []

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="Órdenes de Trabajo"
        description="Instalaciones, retiros e inspecciones"
        action={{ label: 'Nueva OT', to: '/ordenes/crear' }}
      />

      {workOrders.length === 0 ? (
        <EmptyState
          title="Sin órdenes de trabajo"
          description="Crea una OT desde una campaña activa"
          actionLabel="Crear OT"
          actionTo="/ordenes/crear"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Campaña</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Programada</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Responsable</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {workOrders.map((wo) => {
                const status = STATUS_MAP[wo.status] ?? { label: wo.status, variant: 'default' as const }
                return (
                  <tr key={wo.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{TYPE_LABELS[wo.type] ?? wo.type}</td>
                    <td className="px-5 py-3.5 text-gray-600">{wo.campaign.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{wo.scheduled_date}</td>
                    <td className="px-5 py-3.5 text-gray-600">{wo.assigned_to?.name ?? '—'}</td>
                    <td className="px-5 py-3.5"><Badge label={status.label} variant={status.variant} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to="/ordenes/$workOrderId" params={{ workOrderId: wo.id }} className="text-[12px] text-gray-500 hover:text-gray-900 font-medium transition-colors">
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
