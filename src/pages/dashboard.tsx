import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import api from '@/lib/api'

interface DashboardData {
  total_assets: number
  active_assets: number
  occupied_assets: number
  draft_assets: number
  maintenance_assets: number
  occupancy_rate: number
  total_reservations: number
  active_reservations: number
  upcoming_reservations: number
  reserved_revenue: number
  total_campaigns: number
  active_campaigns: number
  planning_campaigns: number
  pending_work_orders: number
  completed_work_orders: number
  total_evidences: number
  work_orders_with_evidence: number
}

export function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/api/dashboard')).data,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header with quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Resumen general de AdFlow</p>
        </div>
        <div className="flex gap-2">
          <Link to="/cotizaciones/crear" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            Nueva Cotización
          </Link>
          <Link to="/clientes/crear" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Nuevo Cliente
          </Link>
        </div>
      </div>

      {/* Main KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Tasa de Ocupación"
          value={`${data?.occupancy_rate ?? 0}%`}
          subtitle={`${data?.active_assets ?? 0} disponibles`}
          accent="blue"
        />
        <KpiCard
          title="Ingresos Reservados"
          value={`$${(data?.reserved_revenue ?? 0).toLocaleString()}`}
          subtitle={`${data?.total_reservations ?? 0} reservas`}
          accent="green"
        />
        <KpiCard
          title="Campañas Activas"
          value={String(data?.active_campaigns ?? 0)}
          subtitle={`${data?.planning_campaigns ?? 0} en planificación`}
          accent="purple"
        />
        <KpiCard
          title="OTs Pendientes"
          value={String(data?.pending_work_orders ?? 0)}
          subtitle={`${data?.completed_work_orders ?? 0} completadas`}
          accent="orange"
        />
      </div>

      {/* Detail sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activos */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Activos Publicitarios</h3>
            <Link to="/assets" className="text-xs text-blue-600 hover:text-blue-800">Ver todos</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Totales" value={data?.total_assets ?? 0} />
            <MiniStat label="Disponibles" value={data?.active_assets ?? 0} color="green" />
            <MiniStat label="Ocupados" value={data?.occupied_assets ?? 0} color="blue" />
            <MiniStat label="Mantenimiento" value={data?.maintenance_assets ?? 0} color="yellow" />
          </div>
        </div>

        {/* Reservas */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Reservas</h3>
            <Link to="/reservas" className="text-xs text-blue-600 hover:text-blue-800">Ver todas</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Confirmadas" value={data?.total_reservations ?? 0} color="green" />
            <MiniStat label="Activas ahora" value={data?.active_reservations ?? 0} color="blue" />
            <MiniStat label="Próximas" value={data?.upcoming_reservations ?? 0} color="purple" />
            <MiniStat label="Total Evidencias" value={data?.total_evidences ?? 0} />
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ title, value, subtitle, accent }: { title: string; value: string; subtitle: string; accent: string }) {
  const accents: Record<string, string> = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    orange: 'border-l-orange-500',
  }

  return (
    <div className={`bg-white rounded-xl border border-l-4 ${accents[accent]} p-5 shadow-sm`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color?: string }) {
  const dotColor = color
    ? { green: 'bg-green-500', blue: 'bg-blue-500', yellow: 'bg-yellow-500', purple: 'bg-purple-500' }[color] ?? 'bg-gray-400'
    : 'bg-gray-400'

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900 ml-auto">{value}</span>
    </div>
  )
}
