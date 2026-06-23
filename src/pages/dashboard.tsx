import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  DollarSign,
  BarChart3,
  Megaphone,
  ClipboardList,
  Plus,
  UserPlus,
  FileText,
  Calendar,
  ArrowRight,
  Package,
} from 'lucide-react'
import api from '@/lib/api'
import { fetchWorkOrders } from '@/lib/work-orders'
import { fetchCampaigns } from '@/lib/campaigns'
import { fetchQuotations } from '@/lib/quotations'

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

  const { data: workOrdersData } = useQuery({
    queryKey: ['work-orders'],
    queryFn: () => fetchWorkOrders(),
  })

  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => fetchCampaigns(),
  })

  const { data: quotationsData } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => fetchQuotations(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Build summary sentence
  const summaryParts: string[] = []
  if (data?.active_campaigns) summaryParts.push(`${data.active_campaigns} campaña${data.active_campaigns > 1 ? 's' : ''} activa${data.active_campaigns > 1 ? 's' : ''}`)
  if (data?.pending_work_orders) summaryParts.push(`${data.pending_work_orders} orden${data.pending_work_orders > 1 ? 'es' : ''} pendiente${data.pending_work_orders > 1 ? 's' : ''}`)
  if (data?.active_assets) summaryParts.push(`${data.active_assets} activo${data.active_assets > 1 ? 's' : ''} disponible${data.active_assets > 1 ? 's' : ''}`)
  const summary = summaryParts.length > 0
    ? `Tienes ${summaryParts.join(', ')}.`
    : 'Todo al día. No hay actividad pendiente.'

  // Today's agenda items
  const agendaItems: { label: string; detail: string; to: string }[] = []
  if (data?.active_campaigns) agendaItems.push({ label: 'Campañas activas', detail: `${data.active_campaigns} en ejecución`, to: '/campanas' })
  if (data?.pending_work_orders) agendaItems.push({ label: 'Órdenes pendientes', detail: `${data.pending_work_orders} por gestionar`, to: '/ordenes' })
  if (data?.upcoming_reservations) agendaItems.push({ label: 'Reservas próximas', detail: `${data.upcoming_reservations} por iniciar`, to: '/reservas' })

  // Recent activity from existing queries
  interface ActivityItem { type: string; label: string; date: string; to: string }
  const activityItems: ActivityItem[] = []

  if (quotationsData?.data) {
    quotationsData.data.slice(0, 3).forEach((q) => {
      activityItems.push({ type: 'Cotización', label: `${q.number} — ${q.client.name}`, date: q.created_at, to: `/cotizaciones/${q.id}` })
    })
  }
  if (campaignsData?.data) {
    campaignsData.data.slice(0, 2).forEach((c) => {
      activityItems.push({ type: 'Campaña', label: c.name, date: c.created_at, to: `/campanas/${c.id}` })
    })
  }
  if (workOrdersData?.data) {
    workOrdersData.data.slice(0, 2).forEach((wo) => {
      activityItems.push({ type: 'Orden', label: `${wo.type} — ${wo.campaign.name}`, date: wo.created_at, to: `/ordenes/${wo.id}` })
    })
  }

  activityItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      {/* 1. Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Buenos días, Admin</h1>
            <p className="text-[13px] text-gray-500 mt-1">{summary}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/clientes/crear" className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors">
              <UserPlus className="w-3.5 h-3.5" />
              Cliente
            </Link>
            <Link to="/cotizaciones/crear" className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-3.5 py-2 rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Nueva cotización
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Ingresos reservados"
          value={`$${(data?.reserved_revenue ?? 0).toLocaleString()}`}
          detail={`${data?.total_reservations ?? 0} reservas`}
        />
        <KpiCard
          icon={<BarChart3 className="w-4 h-4" />}
          label="Tasa ocupación"
          value={`${data?.occupancy_rate ?? 0}%`}
          detail={`${data?.occupied_assets ?? 0} de ${(data?.active_assets ?? 0) + (data?.occupied_assets ?? 0)} activos`}
        />
        <KpiCard
          icon={<Megaphone className="w-4 h-4" />}
          label="Campañas activas"
          value={String(data?.active_campaigns ?? 0)}
          detail={`${data?.planning_campaigns ?? 0} planificándose`}
        />
        <KpiCard
          icon={<ClipboardList className="w-4 h-4" />}
          label="OTs pendientes"
          value={String(data?.pending_work_orders ?? 0)}
          detail={`${data?.completed_work_orders ?? 0} completadas`}
        />
      </div>

      {/* 3 + 4. Agenda + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Agenda */}
        <section className="bg-white rounded-xl border border-gray-200/80">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">Hoy</h2>
          </div>
          <div className="p-5">
            {agendaItems.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-5 h-5 text-gray-300 mx-auto mb-2" />
                <p className="text-[13px] text-gray-400">Nada pendiente para hoy</p>
              </div>
            ) : (
              <div className="space-y-2">
                {agendaItems.map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-gray-900">{item.label}</p>
                      <p className="text-[12px] text-gray-400">{item.detail}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Activity */}
        <section className="bg-white rounded-xl border border-gray-200/80">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">Actividad reciente</h2>
          </div>
          <div className="p-5">
            {activityItems.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="w-5 h-5 text-gray-300 mx-auto mb-2" />
                <p className="text-[13px] text-gray-400">Sin actividad reciente</p>
              </div>
            ) : (
              <div className="space-y-1">
                {activityItems.slice(0, 5).map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide w-16 shrink-0">{item.type}</span>
                    <span className="text-[13px] text-gray-700 truncate flex-1">{item.label}</span>
                    <span className="text-[11px] text-gray-400 shrink-0">{timeAgo(item.date)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 5 + 6. Inventory + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory */}
        <section className="bg-white rounded-xl border border-gray-200/80">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-900">Inventario</h2>
            <Link to="/assets" className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">Ver todos</Link>
          </div>
          <div className="p-5 space-y-3.5">
            <BarStat label="Disponibles" value={data?.active_assets ?? 0} total={data?.total_assets ?? 0} color="bg-emerald-500" />
            <BarStat label="Ocupados" value={data?.occupied_assets ?? 0} total={data?.total_assets ?? 0} color="bg-blue-500" />
            <BarStat label="Mantenimiento" value={data?.maintenance_assets ?? 0} total={data?.total_assets ?? 0} color="bg-amber-400" />
            <BarStat label="Borrador" value={data?.draft_assets ?? 0} total={data?.total_assets ?? 0} color="bg-gray-300" />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-white rounded-xl border border-gray-200/80">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">Accesos rápidos</h2>
          </div>
          <div className="p-3">
            <ActionLink to="/cotizaciones/crear" icon={<FileText className="w-4 h-4" />} label="Crear cotización" />
            <ActionLink to="/clientes/crear" icon={<UserPlus className="w-4 h-4" />} label="Registrar cliente" />
            <ActionLink to="/reservas/crear" icon={<Calendar className="w-4 h-4" />} label="Reservar activo" />
            <ActionLink to="/campanas/crear" icon={<Megaphone className="w-4 h-4" />} label="Crear campaña" />
            <ActionLink to="/ordenes/crear" icon={<ClipboardList className="w-4 h-4" />} label="Crear orden de trabajo" />
            <ActionLink to="/assets/create" icon={<Package className="w-4 h-4" />} label="Nuevo activo" />
          </div>
        </section>
      </div>
    </div>
  )
}

// Sub-components

function KpiCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
          {icon}
        </div>
        <span className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-[12px] text-gray-400 mt-0.5">{detail}</p>
    </div>
  )
}

function BarStat({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] text-gray-600">{label}</span>
        <span className="text-[13px] font-medium text-gray-900">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  )
}

function ActionLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-100 transition-colors">
        {icon}
      </div>
      <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
      <ArrowRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-400 ml-auto transition-colors" />
    </Link>
  )
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}
