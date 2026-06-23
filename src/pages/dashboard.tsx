import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  DollarSign,
  BarChart3,
  Megaphone,
  ClipboardList,
  UserPlus,
  FileText,
  Calendar,
  ArrowRight,
  Package,
  Camera,
} from 'lucide-react'
import api from '@/lib/api'
import { fetchQuotations } from '@/lib/quotations'
import { PageHeader } from '@/design-system/components/PageHeader'
import { AppMetricCard } from '@/design-system/components/AppMetricCard'
import { SectionCard } from '@/design-system/components/SectionCard'
import { EmptyState } from '@/design-system/components/EmptyState'
import { LoadingState } from '@/design-system/components/LoadingState'

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

  const { data: quotationsData } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => fetchQuotations(),
  })

  if (isLoading) return <LoadingState />

  // Dynamic summary
  const parts: string[] = []
  if (data?.active_assets) parts.push(`${data.active_assets} activo${data.active_assets > 1 ? 's' : ''} disponible${data.active_assets > 1 ? 's' : ''}`)
  if (data?.active_campaigns) parts.push(`${data.active_campaigns} campaña${data.active_campaigns > 1 ? 's' : ''} activa${data.active_campaigns > 1 ? 's' : ''}`)
  if (data?.pending_work_orders) parts.push(`${data.pending_work_orders} orden${data.pending_work_orders > 1 ? 'es' : ''} pendiente${data.pending_work_orders > 1 ? 's' : ''}`)
  const summary = parts.length > 0 ? `Tienes ${parts.join(', ')}.` : 'Todo al día. Sin actividad pendiente.'

  const hasCommercialData = (quotationsData?.data?.length ?? 0) > 0 || (data?.total_reservations ?? 0) > 0
  const hasOperationData = (data?.pending_work_orders ?? 0) > 0 || (data?.completed_work_orders ?? 0) > 0

  return (
    <div>
      {/* 1. Page Header */}
      <PageHeader
        title="Dashboard"
        description="Resumen operativo de AdFlow"
        action={{ label: 'Nueva cotización', to: '/cotizaciones/crear' }}
        secondaryAction={{ label: 'Nuevo cliente', to: '/clientes/crear' }}
      />

      {/* 2. Executive Summary */}
      <div className="bg-[#F8FAFC] border border-[#E5E7EB]/60 rounded-[12px] px-5 py-3.5 mb-8">
        <p className="text-[14px] text-[#374151]">{summary}</p>
      </div>

      {/* 3. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <AppMetricCard
          icon={DollarSign}
          label="Ingresos reservados"
          value={`$${(data?.reserved_revenue ?? 0).toLocaleString()}`}
          detail={`${data?.total_reservations ?? 0} reservas confirmadas`}
        />
        <AppMetricCard
          icon={BarChart3}
          label="Tasa ocupación"
          value={`${data?.occupancy_rate ?? 0}%`}
          detail={`${data?.occupied_assets ?? 0} de ${(data?.active_assets ?? 0) + (data?.occupied_assets ?? 0)} activos`}
        />
        <AppMetricCard
          icon={Megaphone}
          label="Campañas activas"
          value={String(data?.active_campaigns ?? 0)}
          detail={`${data?.planning_campaigns ?? 0} en planificación`}
        />
        <AppMetricCard
          icon={ClipboardList}
          label="OTs pendientes"
          value={String(data?.pending_work_orders ?? 0)}
          detail={`${data?.completed_work_orders ?? 0} completadas`}
        />
      </div>

      {/* 4. Inventory + 5. Commercial Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Inventory */}
        <SectionCard title="Inventario de activos" action={{ label: 'Ver todos', to: '/assets' }}>
          <div className="space-y-4">
            <ProgressRow label="Disponibles" value={data?.active_assets ?? 0} total={data?.total_assets ?? 0} color="bg-[#22C55E]" />
            <ProgressRow label="Ocupados" value={data?.occupied_assets ?? 0} total={data?.total_assets ?? 0} color="bg-[#2563EB]" />
            <ProgressRow label="Mantenimiento" value={data?.maintenance_assets ?? 0} total={data?.total_assets ?? 0} color="bg-[#F59E0B]" />
            <ProgressRow label="Borrador" value={data?.draft_assets ?? 0} total={data?.total_assets ?? 0} color="bg-[#D1D5DB]" />
          </div>
        </SectionCard>

        {/* Commercial flow */}
        <SectionCard title="Flujo comercial" action={{ label: 'Cotizaciones', to: '/cotizaciones' }}>
          {!hasCommercialData ? (
            <EmptyState
              title="Sin actividad comercial"
              description="Crea tu primera cotización para iniciar"
              actionLabel="Crear cotización"
              actionTo="/cotizaciones/crear"
            />
          ) : (
            <div className="space-y-3">
              <FlowItem label="Cotizaciones" value={quotationsData?.data?.length ?? 0} to="/cotizaciones" />
              <FlowItem label="Reservas confirmadas" value={data?.total_reservations ?? 0} to="/reservas" />
              <FlowItem label="Campañas" value={data?.total_campaigns ?? 0} to="/campanas" />
            </div>
          )}
        </SectionCard>
      </div>

      {/* 6. Operation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SectionCard title="Operación" action={{ label: 'Ver OTs', to: '/ordenes' }}>
          {!hasOperationData ? (
            <EmptyState
              title="Sin actividad operativa"
              description="Las órdenes de trabajo aparecerán aquí"
              actionLabel="Crear OT"
              actionTo="/ordenes/crear"
            />
          ) : (
            <div className="space-y-3">
              <FlowItem label="OTs pendientes" value={data?.pending_work_orders ?? 0} to="/ordenes" />
              <FlowItem label="OTs completadas" value={data?.completed_work_orders ?? 0} to="/ordenes" />
              <FlowItem label="Evidencias cargadas" value={data?.total_evidences ?? 0} to="/ordenes" />
            </div>
          )}
        </SectionCard>

        {/* 7. Quick Actions */}
        <SectionCard title="Acciones rápidas">
          <div className="space-y-1">
            <QuickAction to="/clientes/crear" icon={UserPlus} label="Registrar cliente" />
            <QuickAction to="/cotizaciones/crear" icon={FileText} label="Crear cotización" />
            <QuickAction to="/reservas/crear" icon={Calendar} label="Reservar activo" />
            <QuickAction to="/campanas/crear" icon={Megaphone} label="Crear campaña" />
            <QuickAction to="/ordenes/crear" icon={ClipboardList} label="Crear orden de trabajo" />
            <QuickAction to="/assets/create" icon={Package} label="Nuevo activo" />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

// --- Sub-components ---

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-[#374151]">{label}</span>
        <span className="text-[13px] font-semibold text-[#0F172A]">{value}</span>
      </div>
      <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  )
}

function FlowItem({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between px-3.5 py-3 rounded-[12px] border border-[#F3F4F6] hover:border-[#E5E7EB] hover:bg-[#F9FAFB] transition-all group"
    >
      <span className="text-[13px] text-[#374151] group-hover:text-[#0F172A] transition-colors">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-semibold text-[#0F172A]">{value}</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors" />
      </div>
    </Link>
  )
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: typeof Camera; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-[#F9FAFB] transition-colors group"
    >
      <div className="w-8 h-8 bg-[#F3F4F6] rounded-[8px] flex items-center justify-center group-hover:bg-[#E5E7EB] transition-colors">
        <Icon className="w-4 h-4 text-[#64748B]" />
      </div>
      <span className="text-[13px] font-medium text-[#374151] group-hover:text-[#0F172A] transition-colors">{label}</span>
      <ArrowRight className="w-3.5 h-3.5 text-[#E5E7EB] group-hover:text-[#9CA3AF] ml-auto transition-colors" />
    </Link>
  )
}
