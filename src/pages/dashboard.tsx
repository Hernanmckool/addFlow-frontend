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
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen operativo de AdFlow</p>
        </div>
        <Link
          to="/cotizaciones/crear"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors"
        >
          Nueva cotización
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard label="Ingresos reservados" value={`$${(data?.reserved_revenue ?? 0).toLocaleString()}`} change={`${data?.total_reservations ?? 0} reservas`} />
        <KpiCard label="Tasa ocupación" value={`${data?.occupancy_rate ?? 0}%`} change={`${data?.occupied_assets ?? 0} de ${(data?.active_assets ?? 0) + (data?.occupied_assets ?? 0)}`} />
        <KpiCard label="Campañas activas" value={String(data?.active_campaigns ?? 0)} change={`${data?.planning_campaigns ?? 0} planificándose`} />
        <KpiCard label="OTs pendientes" value={String(data?.pending_work_orders ?? 0)} change={`${data?.completed_work_orders ?? 0} completadas`} />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory */}
        <section className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-900">Inventario de activos</h2>
            <Link to="/assets" className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">Ver todos</Link>
          </div>
          <div className="p-5 space-y-3">
            <StatRow label="Disponibles" value={data?.active_assets ?? 0} total={data?.total_assets ?? 0} color="bg-green-500" />
            <StatRow label="Ocupados" value={data?.occupied_assets ?? 0} total={data?.total_assets ?? 0} color="bg-blue-500" />
            <StatRow label="Mantenimiento" value={data?.maintenance_assets ?? 0} total={data?.total_assets ?? 0} color="bg-amber-500" />
            <StatRow label="Borrador" value={data?.draft_assets ?? 0} total={data?.total_assets ?? 0} color="bg-gray-300" />
          </div>
        </section>

        {/* Quick actions */}
        <section className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">Acciones rápidas</h2>
          </div>
          <div className="p-5 space-y-2">
            <QuickAction to="/clientes/crear" label="Registrar cliente" description="Agregar un nuevo cliente al sistema" />
            <QuickAction to="/cotizaciones/crear" label="Crear cotización" description="Preparar propuesta comercial" />
            <QuickAction to="/reservas/crear" label="Reservar activo" description="Reservar directamente sin cotización" />
            <QuickAction to="/campanas/crear" label="Crear campaña" description="Organizar activos reservados" />
            <QuickAction to="/ordenes/crear" label="Crear orden de trabajo" description="Programar instalación o retiro" />
          </div>
        </section>
      </div>
    </div>
  )
}

function KpiCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5">
      <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1.5">{value}</p>
      <p className="text-[12px] text-gray-400 mt-1">{change}</p>
    </div>
  )
}

function StatRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-gray-600 w-28">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[13px] font-medium text-gray-900 w-8 text-right">{value}</span>
    </div>
  )
}

function QuickAction({ to, label, description }: { to: string; label: string; description: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between px-3.5 py-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all group"
    >
      <div>
        <p className="text-[13px] font-medium text-gray-900 group-hover:text-gray-900">{label}</p>
        <p className="text-[12px] text-gray-400">{description}</p>
      </div>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
