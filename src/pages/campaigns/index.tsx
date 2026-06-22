import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchCampaigns, type Campaign } from '@/lib/campaigns'

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planificación',
  active: 'Activa',
  finished: 'Finalizada',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  finished: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function CampaignsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => fetchCampaigns(),
  })

  const campaigns: Campaign[] = data?.data ?? []

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campañas</h2>
          <p className="text-sm text-gray-500 mt-1">Gestión de campañas publicitarias</p>
        </div>
        <Link
          to="/campanas/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Nueva Campaña
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No hay campañas</p>
          <p className="text-sm text-gray-400 mt-1">Crea una campaña a partir de reservas confirmadas</p>
          <Link to="/campanas/crear" className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
            Crear campaña
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Desde</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hasta</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Activos</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-700">{c.client.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.starts_at}</td>
                  <td className="px-4 py-3 text-gray-600">{c.ends_at}</td>
                  <td className="px-4 py-3 text-gray-600">{c.campaign_assets_count ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? 'bg-gray-100'}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/campanas/$campaignId"
                      params={{ campaignId: c.id }}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay campañas registradas.</p>
          )}
        </div>
      )}
    </div>
  )
}
