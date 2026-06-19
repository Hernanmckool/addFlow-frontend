import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { createReservation, fetchClients, type Reservation } from '@/lib/reservations'
import { fetchAssetOptions, checkAvailability, type AvailabilityResult } from '@/lib/availability'

const reservationSchema = z
  .object({
    asset_id: z.string().min(1, 'Selecciona un activo'),
    client_id: z.string().min(1, 'Selecciona un cliente'),
    starts_at: z.string().min(1, 'Fecha inicio es requerida'),
    ends_at: z.string().min(1, 'Fecha fin es requerida'),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => data.ends_at >= data.starts_at, {
    message: 'La fecha fin debe ser igual o posterior a la fecha inicio',
    path: ['ends_at'],
  })

type ReservationFormData = z.infer<typeof reservationSchema>

export function ReservationCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null)
  const [created, setCreated] = useState<Reservation | null>(null)

  const { data: assets, isLoading: loadingAssets } = useQuery({
    queryKey: ['assets-options'],
    queryFn: fetchAssetOptions,
  })

  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ['clients-options'],
    queryFn: fetchClients,
  })

  const checkMutation = useMutation({
    mutationFn: (data: { assetId: string; startDate: string; endDate: string }) =>
      checkAvailability(data.assetId, data.startDate, data.endDate),
    onSuccess: (data) => setAvailability(data),
  })

  const createMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: (data) => {
      setCreated(data)
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
  })

  const watchedAsset = watch('asset_id')
  const watchedStart = watch('starts_at')
  const watchedEnd = watch('ends_at')

  const handleCheckAvailability = () => {
    if (watchedAsset && watchedStart && watchedEnd && watchedEnd >= watchedStart) {
      setAvailability(null)
      checkMutation.mutate({ assetId: watchedAsset, startDate: watchedStart, endDate: watchedEnd })
    }
  }

  const onSubmit = (data: ReservationFormData) => {
    createMutation.mutate({
      asset_id: data.asset_id,
      client_id: data.client_id,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      notes: data.notes,
    })
  }

  if (created) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reserva Creada</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-lg font-semibold text-green-800">Confirmada</span>
          </div>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Activo:</dt>
              <dd className="font-medium">{created.asset.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Cliente:</dt>
              <dd className="font-medium">{created.client.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Desde:</dt>
              <dd className="font-medium">{created.starts_at}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Hasta:</dt>
              <dd className="font-medium">{created.ends_at}</dd>
            </div>
            {created.total_amount && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Monto total:</dt>
                <dd className="font-medium">{created.currency} {Number(created.total_amount).toLocaleString()}</dd>
              </div>
            )}
          </dl>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => { setCreated(null); setAvailability(null) }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Nueva Reserva
            </button>
            <button
              onClick={() => navigate({ to: '/reservas' })}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
            >
              Ver Reservas
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Reserva</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-lg border p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                {loadingClients ? (
                  <p className="text-sm text-gray-500">Cargando clientes...</p>
                ) : (
                  <select
                    id="client_id"
                    {...register('client_id')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clients?.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.client_id && (
                  <p className="text-xs text-red-600 mt-1">{errors.client_id.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="asset_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Activo
                </label>
                {loadingAssets ? (
                  <p className="text-sm text-gray-500">Cargando activos...</p>
                ) : (
                  <select
                    id="asset_id"
                    {...register('asset_id')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar activo...</option>
                    {assets
                      ?.filter((a) => a.status === 'active')
                      .map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.code ? `[${asset.code}] ` : ''}{asset.name}
                        </option>
                      ))}
                  </select>
                )}
                {errors.asset_id && (
                  <p className="text-xs text-red-600 mt-1">{errors.asset_id.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="starts_at" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  id="starts_at"
                  type="date"
                  {...register('starts_at')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.starts_at && (
                  <p className="text-xs text-red-600 mt-1">{errors.starts_at.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ends_at" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  id="ends_at"
                  type="date"
                  {...register('ends_at')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.ends_at && (
                  <p className="text-xs text-red-600 mt-1">{errors.ends_at.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                id="notes"
                rows={3}
                {...register('notes')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Campaña, referencia, observaciones..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={!watchedAsset || !watchedStart || !watchedEnd || checkMutation.isPending}
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkMutation.isPending ? 'Verificando...' : 'Verificar Disponibilidad'}
              </button>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Creando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>

          {createMutation.isError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-700">
                {(() => {
                  const error = createMutation.error
                  if (error instanceof AxiosError && error.response) {
                    const data = error.response.data as Record<string, unknown>
                    if (data.message) return String(data.message)
                  }
                  return 'Error al crear la reserva.'
                })()}
              </p>
            </div>
          )}
        </div>

        {/* Availability sidebar */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Disponibilidad</h3>

          {checkMutation.isPending && (
            <p className="text-sm text-gray-500">Verificando...</p>
          )}

          {availability && !checkMutation.isPending && (
            <div className="space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  availability.available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${availability.available ? 'bg-green-500' : 'bg-red-500'}`} />
                {availability.available ? 'Disponible' : 'No Disponible'}
              </div>

              {availability.conflicts.length > 0 && (
                <div className="text-xs space-y-1">
                  <p className="font-medium text-gray-600">Conflictos:</p>
                  {availability.conflicts.map((c) => (
                    <p key={c.id} className="text-gray-500">
                      {c.starts_at} → {c.ends_at} ({c.type})
                    </p>
                  ))}
                </div>
              )}

              {availability.reason && (
                <p className="text-xs text-gray-500">{availability.reason}</p>
              )}
            </div>
          )}

          {!availability && !checkMutation.isPending && (
            <p className="text-xs text-gray-400">
              Selecciona activo y fechas, luego haz clic en "Verificar Disponibilidad".
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
