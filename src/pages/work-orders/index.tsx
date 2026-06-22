import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchWorkOrders, type WorkOrder } from '@/lib/work-orders'

const TYPE_LABELS: Record<string, string> = {
  instalacion: 'Instalación',
  retiro: 'Retiro',
  inspeccion: 'Inspección',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  assigned: 'Asignada',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function WorkOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['work-orders'],
    queryFn: () => fetchWorkOrders(),
  })

  const workOrders: WorkOrder[] = data?.data ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h2>
        <Link to="/ordenes/crear" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          Nueva OT
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Campaña</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Asignado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Programada</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Activos</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{TYPE_LABELS[wo.type] ?? wo.type}</td>
                  <td className="px-4 py-3 text-gray-700">{wo.campaign.name}</td>
                  <td className="px-4 py-3 text-gray-600">{wo.assigned_to?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{wo.scheduled_date}</td>
                  <td className="px-4 py-3 text-gray-600">{wo.work_order_assets_count ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[wo.status] ?? 'bg-gray-100'}`}>
                      {STATUS_LABELS[wo.status] ?? wo.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/ordenes/$workOrderId" params={{ workOrderId: wo.id }} className="text-blue-600 hover:text-blue-800 text-xs">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {workOrders.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay órdenes de trabajo registradas.</p>
          )}
        </div>
      )}
    </div>
  )
}
