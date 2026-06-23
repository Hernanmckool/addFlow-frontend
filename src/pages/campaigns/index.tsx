import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchCampaigns, type Campaign } from '@/lib/campaigns'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' }> = {
  planning: { label: 'Planificación', variant: 'warning' },
  active: { label: 'Activa', variant: 'success' },
  finished: { label: 'Finalizada', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'error' },
}

export function CampaignsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => fetchCampaigns(),
  })

  const campaigns: Campaign[] = data?.data ?? []

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="Campañas"
        description="Campañas publicitarias activas y planificadas"
        action={{ label: 'Nueva campaña', to: '/campanas/crear' }}
      />

      {campaigns.length === 0 ? (
        <EmptyState
          title="Sin campañas"
          description="Crea una campaña a partir de reservas confirmadas"
          actionLabel="Crear campaña"
          actionTo="/campanas/crear"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Período</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Activos</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.map((c) => {
                const status = STATUS_MAP[c.status] ?? { label: c.status, variant: 'default' as const }
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{c.name}</td>
                    <td className="px-5 py-3.5 text-gray-600">{c.client.name}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-[12px]">{c.starts_at} → {c.ends_at}</td>
                    <td className="px-5 py-3.5 text-gray-600">{c.campaign_assets_count ?? 0}</td>
                    <td className="px-5 py-3.5"><Badge label={status.label} variant={status.variant} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to="/campanas/$campaignId" params={{ campaignId: c.id }} className="text-[12px] text-gray-500 hover:text-gray-900 font-medium transition-colors">
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
