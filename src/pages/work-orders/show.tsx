import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { fetchWorkOrder, transitionWorkOrder } from '@/lib/work-orders'
import { EvidenceGallery } from '@/components/evidences/evidence-gallery'
import { EvidenceUpload } from '@/components/evidences/evidence-upload'
import { useState } from 'react'

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

const TRANSITIONS: Record<string, { label: string; target: string; color: string }[]> = {
  pending: [
    { label: 'Marcar Asignada', target: 'assigned', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Cancelar', target: 'cancelled', color: 'bg-red-600 hover:bg-red-700' },
  ],
  assigned: [
    { label: 'Iniciar', target: 'in_progress', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { label: 'Cancelar', target: 'cancelled', color: 'bg-red-600 hover:bg-red-700' },
  ],
  in_progress: [
    { label: 'Completar', target: 'completed', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Cancelar', target: 'cancelled', color: 'bg-red-600 hover:bg-red-700' },
  ],
}

export function WorkOrderShowPage() {
  const { workOrderId } = useParams({ strict: false }) as { workOrderId: string }
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: workOrder, isLoading } = useQuery({
    queryKey: ['work-order', workOrderId],
    queryFn: () => fetchWorkOrder(workOrderId),
  })

  const transitionMutation = useMutation({
    mutationFn: (status: string) => transitionWorkOrder(workOrderId, status),
    onSuccess: () => {
      setActionError(null)
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] })
      queryClient.invalidateQueries({ queryKey: ['work-orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data as Record<string, unknown>
        setActionError(String(data.message ?? 'Error en la transición.'))
      }
    },
  })

  if (isLoading) return <p className="text-gray-500">Cargando OT...</p>
  if (!workOrder) return <p className="text-gray-500">Orden no encontrada.</p>

  const availableTransitions = TRANSITIONS[workOrder.status] ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {TYPE_LABELS[workOrder.type] ?? workOrder.type}
          </h2>
          <p className="text-sm text-gray-500">
            Campaña: {workOrder.campaign.name} · Programada: {workOrder.scheduled_date}
          </p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[workOrder.status]}`}>
          {STATUS_LABELS[workOrder.status] ?? workOrder.status}
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

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Asignado a</p>
          <p className="font-medium">{workOrder.assigned_to?.name ?? 'Sin asignar'}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Completada</p>
          <p className="font-medium">{workOrder.completed_date ?? '—'}</p>
        </div>
      </div>

      {workOrder.description && (
        <div className="bg-white rounded-lg border p-4 mb-4">
          <p className="text-sm text-gray-500 mb-1">Descripción</p>
          <p className="text-sm text-gray-700">{workOrder.description}</p>
        </div>
      )}

      {/* Assets */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">
            Activos ({workOrder.work_order_assets.length})
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
            {workOrder.work_order_assets.map((woa) => (
              <tr key={woa.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{woa.campaign_asset.asset.name}</div>
                  {woa.campaign_asset.asset.code && (
                    <div className="text-xs text-gray-500 font-mono">{woa.campaign_asset.asset.code}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{woa.campaign_asset.starts_at}</td>
                <td className="px-4 py-3 text-gray-600">{woa.campaign_asset.ends_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Evidences */}
      {(workOrder.status === 'in_progress' || workOrder.status === 'completed') && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidencias</h3>
          <EvidenceUpload
            workOrderId={workOrder.id}
            campaignAssets={workOrder.work_order_assets.map((woa) => ({
              id: woa.campaign_asset.id,
              asset: woa.campaign_asset.asset,
            }))}
          />
          <div className="mt-4">
            <EvidenceGallery workOrderId={workOrder.id} />
          </div>
        </div>
      )}

      <div className="mt-6">
        <button onClick={() => navigate({ to: '/ordenes' })}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
          ← Volver a órdenes
        </button>
      </div>
    </div>
  )
}
