import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { createWorkOrder } from '@/lib/work-orders'
import { fetchCampaigns, fetchCampaign } from '@/lib/campaigns'

const workOrderSchema = z.object({
  campaign_id: z.string().min(1, 'Selecciona una campaña'),
  type: z.string().min(1, 'Selecciona el tipo'),
  scheduled_date: z.string().min(1, 'Fecha programada requerida'),
  assigned_to: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
})

type WorkOrderFormData = z.infer<typeof workOrderSchema>

export function WorkOrderCreatePage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])

  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => fetchCampaigns(),
  })

  const mutation = useMutation({
    mutationFn: createWorkOrder,
    onSuccess: (data) => {
      navigate({ to: '/ordenes/$workOrderId', params: { workOrderId: data.id } })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data as Record<string, unknown>
        setServerError(String(data.message ?? 'Error al crear OT.'))
      } else {
        setServerError('Error al crear OT.')
      }
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
  })

  const watchedCampaignId = watch('campaign_id')

  // Load campaign detail when selected
  const { data: campaignDetail } = useQuery({
    queryKey: ['campaign', watchedCampaignId],
    queryFn: () => fetchCampaign(watchedCampaignId),
    enabled: !!watchedCampaignId,
  })

  const activeCampaigns = (campaignsData?.data ?? []).filter(
    (c) => c.status === 'planning' || c.status === 'active'
  )

  const toggleAsset = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const onSubmit = (data: WorkOrderFormData) => {
    if (selectedAssets.length === 0) {
      setServerError('Selecciona al menos un activo de la campaña.')
      return
    }
    setServerError(null)
    mutation.mutate({
      campaign_id: data.campaign_id,
      type: data.type,
      scheduled_date: data.scheduled_date,
      assigned_to: data.assigned_to || undefined,
      description: data.description,
      notes: data.notes,
      campaign_asset_ids: selectedAssets,
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Orden de Trabajo</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="campaign_id" className="block text-sm font-medium text-gray-700 mb-1">Campaña</label>
              <select id="campaign_id" {...register('campaign_id')}
                onChange={(e) => { register('campaign_id').onChange(e); setSelectedAssets([]) }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {activeCampaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.client.name})</option>
                ))}
              </select>
              {errors.campaign_id && <p className="text-xs text-red-600 mt-1">{errors.campaign_id.message}</p>}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select id="type" {...register('type')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                <option value="instalacion">Instalación</option>
                <option value="retiro">Retiro</option>
                <option value="inspeccion">Inspección</option>
              </select>
              {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type.message}</p>}
            </div>

            <div>
              <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-1">Fecha Programada</label>
              <input id="scheduled_date" type="date" {...register('scheduled_date')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.scheduled_date && <p className="text-xs text-red-600 mt-1">{errors.scheduled_date.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <input id="description" type="text" {...register('description')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Instalar arte publicitario..." />
            </div>
          </div>
        </div>

        {/* Campaign assets selector */}
        {watchedCampaignId && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activos de la Campaña</h3>
            {!campaignDetail ? (
              <p className="text-sm text-gray-500">Cargando activos...</p>
            ) : campaignDetail.campaign_assets.length === 0 ? (
              <p className="text-sm text-gray-400">No hay activos en esta campaña.</p>
            ) : (
              <div className="space-y-2">
                {campaignDetail.campaign_assets.map((ca) => (
                  <label
                    key={ca.id}
                    className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedAssets.includes(ca.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(ca.id)}
                      onChange={() => toggleAsset(ca.id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{ca.asset.name}</span>
                      {ca.asset.code && <span className="text-xs text-gray-500 ml-2 font-mono">{ca.asset.code}</span>}
                    </div>
                    <span className="text-xs text-gray-500">{ca.starts_at} → {ca.ends_at}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Creando...' : 'Crear Orden de Trabajo'}
          </button>
          <button type="button" onClick={() => navigate({ to: '/ordenes' })}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
