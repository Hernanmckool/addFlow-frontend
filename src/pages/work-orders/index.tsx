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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h2>
          <p className="text-sm text-gray-500 mt-1">Instalaciones, retiros e inspecciones</p>
        </div>
        <Link to="/ordenes/crear" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          Nueva OT
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : workOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No hay órdenes de trabajo</p>
          <p className="text-sm text-gray-400 mt-1">Crea una OT desde una campaña activa</p>
          <Link to="/ordenes/crear" className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
            Crear OT
          </Link>
        </div>
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
