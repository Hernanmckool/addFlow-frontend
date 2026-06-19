import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import api from '@/lib/api'

interface Asset {
  id: string
  name: string
  code: string | null
  status: string
  monthly_rate_amount: string | null
  monthly_rate_currency: string | null
  asset_type: { id: string; name: string } | null
  zone: { id: string; name: string } | null
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  occupied: 'Ocupado',
  maintenance: 'Mantenimiento',
  out_of_service: 'Fuera de servicio',
  decommissioned: 'Dado de baja',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  occupied: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  out_of_service: 'bg-red-100 text-red-700',
  decommissioned: 'bg-gray-200 text-gray-500',
}

export function AssetsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => (await api.get('/api/assets?per_page=50')).data,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/assets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
  })

  const assets: Asset[] = data?.data ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Activos Publicitarios</h2>
        <Link to="/assets/create" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          Nuevo Activo
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Zona</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tarifa</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{asset.code ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">{asset.name}</td>
                  <td className="px-4 py-3 text-gray-600">{asset.asset_type?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{asset.zone?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    {asset.monthly_rate_amount
                      ? `${asset.monthly_rate_currency} ${Number(asset.monthly_rate_amount).toLocaleString()}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[asset.status]}`}>
                      {STATUS_LABELS[asset.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      to="/assets/$assetId/edit"
                      params={{ assetId: asset.id }}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Editar
                    </Link>
                    {asset.status === 'draft' && (
                      <button
                        onClick={() => { if (confirm('¿Eliminar este activo?')) deleteMutation.mutate(asset.id) }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assets.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay activos registrados.</p>
          )}
        </div>
      )}
    </div>
  )
}
