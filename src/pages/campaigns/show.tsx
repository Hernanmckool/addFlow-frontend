import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { fetchCampaign, transitionCampaign } from '@/lib/campaigns'
import { useState } from 'react'

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

const TRANSITIONS: Record<string, { label: string; target: string; color: string }[]> = {
  planning: [
    { label: 'Activar Campaña', target: 'active', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Cancelar', target: 'cancelled', color: 'bg-red-600 hover:bg-red-700' },
  ],
  active: [
    { label: 'Finalizar', target: 'finished', color: 'bg-gray-600 hover:bg-gray-700' },
    { label: 'Cancelar', target: 'cancelled', color: 'bg-red-600 hover:bg-red-700' },
  ],
}

export function CampaignShowPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string }
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => fetchCampaign(campaignId),
  })

  const transitionMutation = useMutation({
    mutationFn: (status: string) => transitionCampaign(campaignId, status),
    onSuccess: () => {
      setActionError(null)
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data as Record<string, unknown>
        setActionError(String(data.message ?? 'Error en la transición.'))
      }
    },
  })

  if (isLoading) return <p className="text-gray-500">Cargando campaña...</p>
  if (!campaign) return <p className="text-gray-500">Campaña no encontrada.</p>

  const availableTransitions = TRANSITIONS[campaign.status] ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
          <p className="text-sm text-gray-500">{campaign.client.name} · {campaign.starts_at} → {campaign.ends_at}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[campaign.status]}`}>
          {STATUS_LABELS[campaign.status] ?? campaign.status}
        </span>
      </div>

      {availableTransitions.length > 0 && (
        <div className="flex gap-2 mb-6">
          {availableTransitions.map((t) => (
            <button
              key={t.target}
              onClick={() => { setActionError(null); transitionMutation.mutate(t.target) }}
              disabled={transitionMutation.isPending}
              className={`text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 ${t.color}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}

      {/* Quick actions */}
      {(campaign.status === 'planning' || campaign.status === 'active') && (
        <div className="mb-6">
          <Link
            to="/ordenes/crear"
            className="inline-flex items-center gap-1 border border-indigo-600 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50"
          >
            + Crear Orden de Trabajo
          </Link>
        </div>
      )}

      {/* Campaign Assets */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">
            Activos de la Campaña ({campaign.campaign_assets.length})
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Activo</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Desde</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Hasta</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {campaign.campaign_assets.map((ca) => (
              <tr key={ca.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{ca.asset.name}</div>
                  {ca.asset.code && <div className="text-xs text-gray-500 font-mono">{ca.asset.code}</div>}
                </td>
                <td className="px-4 py-3 text-gray-600">{ca.starts_at}</td>
                <td className="px-4 py-3 text-gray-600">{ca.ends_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {campaign.notes && (
        <div className="mt-4 bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500 mb-1">Notas</p>
          <p className="text-sm text-gray-700">{campaign.notes}</p>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate({ to: '/campanas' })}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
        >
          ← Volver a campañas
        </button>
      </div>
    </div>
  )
}
