import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { createCampaign } from '@/lib/campaigns'
import { fetchClients, fetchReservations, type Reservation } from '@/lib/reservations'

const campaignSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  client_id: z.string().min(1, 'Selecciona un cliente'),
  starts_at: z.string().min(1, 'Fecha inicio requerida'),
  ends_at: z.string().min(1, 'Fecha fin requerida'),
  notes: z.string().optional(),
})

type CampaignFormData = z.infer<typeof campaignSchema>

export function CampaignCreatePage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedReservations, setSelectedReservations] = useState<string[]>([])

  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ['clients-options'],
    queryFn: fetchClients,
  })

  const { data: reservationsData, isLoading: loadingReservations } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => fetchReservations(),
  })

  const mutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: (data) => {
      navigate({ to: '/campanas/$campaignId', params: { campaignId: data.id } })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data as Record<string, unknown>
        setServerError(String(data.message ?? 'Error al crear campaña.'))
      } else {
        setServerError('Error al crear campaña.')
      }
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
  })

  const watchedClient = watch('client_id')

  // Filter reservations by selected client and status confirmed
  const clientReservations: Reservation[] = (reservationsData?.data ?? []).filter(
    (r) => r.status === 'confirmed' && r.client_id === watchedClient
  )

  const toggleReservation = (id: string) => {
    setSelectedReservations((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const onSubmit = (data: CampaignFormData) => {
    if (selectedReservations.length === 0) {
      setServerError('Selecciona al menos una reserva confirmada.')
      return
    }
    setServerError(null)
    mutation.mutate({
      name: data.name,
      client_id: data.client_id,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      notes: data.notes,
      reservation_ids: selectedReservations,
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Campaña</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Campaña Navidad 2026"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              {loadingClients ? (
                <p className="text-sm text-gray-500">Cargando...</p>
              ) : (
                <select
                  id="client_id"
                  {...register('client_id')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {clients?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
              {errors.client_id && <p className="text-xs text-red-600 mt-1">{errors.client_id.message}</p>}
            </div>

            <div>
              <label htmlFor="starts_at" className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input id="starts_at" type="date" {...register('starts_at')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.starts_at && <p className="text-xs text-red-600 mt-1">{errors.starts_at.message}</p>}
            </div>

            <div>
              <label htmlFor="ends_at" className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input id="ends_at" type="date" {...register('ends_at')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.ends_at && <p className="text-xs text-red-600 mt-1">{errors.ends_at.message}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea id="notes" rows={2} {...register('notes')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observaciones de la campaña..." />
          </div>
        </div>

        {/* Reservations selector */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reservas Confirmadas {watchedClient ? '' : '(selecciona un cliente primero)'}
          </h3>

          {loadingReservations ? (
            <p className="text-sm text-gray-500">Cargando reservas...</p>
          ) : !watchedClient ? (
            <p className="text-sm text-gray-400">Selecciona un cliente para ver sus reservas confirmadas.</p>
          ) : clientReservations.length === 0 ? (
            <p className="text-sm text-gray-400">No hay reservas confirmadas para este cliente.</p>
          ) : (
            <div className="space-y-2">
              {clientReservations.map((res) => (
                <label
                  key={res.id}
                  className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedReservations.includes(res.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedReservations.includes(res.id)}
                    onChange={() => toggleReservation(res.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-sm">{res.asset.name}</span>
                    {res.asset.code && <span className="text-xs text-gray-500 ml-2 font-mono">{res.asset.code}</span>}
                  </div>
                  <span className="text-xs text-gray-500">{res.starts_at} → {res.ends_at}</span>
                  {res.total_amount && (
                    <span className="text-xs font-medium">{res.currency} {Number(res.total_amount).toLocaleString()}</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Creando...' : 'Crear Campaña'}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/campanas' })}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
