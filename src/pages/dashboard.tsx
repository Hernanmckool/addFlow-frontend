import { useQuery } from '@tanstack/react-query'
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
}

export function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/api/dashboard')).data,
  })

  if (isLoading) return <p className="text-gray-500">Cargando dashboard...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard title="Tasa de Ocupación" value={`${data?.occupancy_rate ?? 0}%`} color="blue" />
        <StatCard title="Activos Totales" value={String(data?.total_assets ?? 0)} color="gray" />
        <StatCard title="Activos Disponibles" value={String(data?.active_assets ?? 0)} color="green" />
        <StatCard title="Activos Ocupados" value={String(data?.occupied_assets ?? 0)} color="yellow" />
        <StatCard title="En Borrador" value={String(data?.draft_assets ?? 0)} color="gray" />
        <StatCard title="En Mantenimiento" value={String(data?.maintenance_assets ?? 0)} color="red" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Reservas Confirmadas" value={String(data?.total_reservations ?? 0)} color="blue" />
        <StatCard title="Reservas Activas" value={String(data?.active_reservations ?? 0)} color="green" />
        <StatCard title="Próximas" value={String(data?.upcoming_reservations ?? 0)} color="yellow" />
        <StatCard
          title="Ingresos Reservados"
          value={`$${(data?.reserved_revenue ?? 0).toLocaleString()}`}
          color="green"
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8">Campañas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Campañas" value={String(data?.total_campaigns ?? 0)} color="blue" />
        <StatCard title="Campañas Activas" value={String(data?.active_campaigns ?? 0)} color="green" />
        <StatCard title="En Planificación" value={String(data?.planning_campaigns ?? 0)} color="yellow" />
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
  }

  return (
    <div className={`rounded-lg border p-6 ${colors[color]}`}>
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}
