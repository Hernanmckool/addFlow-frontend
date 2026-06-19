import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  checkAvailability,
  fetchAssetOptions,
  type AvailabilityResult,
} from '@/lib/availability'

const availabilitySchema = z
  .object({
    asset_id: z.string().min(1, 'Selecciona un activo'),
    start_date: z.string().min(1, 'Fecha inicio es requerida'),
    end_date: z.string().min(1, 'Fecha fin es requerida'),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'La fecha fin debe ser igual o posterior a la fecha inicio',
    path: ['end_date'],
  })

type AvailabilityFormData = z.infer<typeof availabilitySchema>

const TYPE_LABELS: Record<string, string> = {
  reserved: 'Reservado',
  occupied: 'Ocupado',
  maintenance: 'Mantenimiento',
  blocked: 'Bloqueado',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  occupied: 'Ocupado',
  maintenance: 'Mantenimiento',
  out_of_service: 'Fuera de servicio',
  decommissioned: 'Dado de baja',
}

export function AvailabilityPage() {
  const [result, setResult] = useState<AvailabilityResult | null>(null)

  const { data: assets, isLoading: loadingAssets } = useQuery({
    queryKey: ['assets-options'],
    queryFn: fetchAssetOptions,
  })

  const mutation = useMutation({
    mutationFn: (data: AvailabilityFormData) =>
      checkAvailability(data.asset_id, data.start_date, data.end_date),
    onSuccess: (data) => setResult(data),
    onError: () => setResult(null),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
  })

  const onSubmit = (data: AvailabilityFormData) => {
    setResult(null)
    mutation.mutate(data)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Consultar Disponibilidad
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-lg border p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="asset_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Activo
              </label>
              {loadingAssets ? (
                <p className="text-sm text-gray-500">Cargando activos...</p>
              ) : (
                <select
                  id="asset_id"
                  {...register('asset_id')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar activo...</option>
                  {assets?.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.code ? `[${asset.code}] ` : ''}
                      {asset.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.asset_id && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.asset_id.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="start_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha Inicio
              </label>
              <input
                id="start_date"
                type="date"
                {...register('start_date')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.start_date && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="end_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha Fin
              </label>
              <input
                id="end_date"
                type="date"
                {...register('end_date')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.end_date && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.end_date.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Consultando...' : 'Consultar Disponibilidad'}
            </button>
          </form>
        </div>

        {/* Resultado */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resultado
          </h3>

          {mutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">Consultando disponibilidad...</p>
            </div>
          )}

          {mutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-700">
                {(() => {
                  const error = mutation.error
                  if (error instanceof AxiosError && error.response) {
                    const data = error.response.data as Record<string, unknown>
                    if (error.response.status === 422 && data.errors) {
                      const errors = data.errors as Record<string, string[]>
                      return Object.values(errors).flat().join('. ')
                    }
                    if (data.message) {
                      return `Error ${error.response.status}: ${data.message}`
                    }
                  }
                  return 'Error al consultar disponibilidad. Verifica los datos e intenta nuevamente.'
                })()}
              </p>
            </div>
          )}

          {result && !mutation.isPending && (
            <div className="space-y-4">
              {/* Badge disponibilidad */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  result.available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    result.available ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {result.available ? 'Disponible' : 'No Disponible'}
              </div>

              {/* Info del activo */}
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium text-gray-600">
                    Estado del activo:{' '}
                  </span>
                  <span className="text-gray-900">
                    {STATUS_LABELS[result.asset_status] ?? result.asset_status}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-gray-600">
                    Rango consultado:{' '}
                  </span>
                  <span className="text-gray-900">
                    {result.checked_range.start_date} →{' '}
                    {result.checked_range.end_date}
                  </span>
                </p>
                {result.reason && (
                  <p>
                    <span className="font-medium text-gray-600">Razón: </span>
                    <span className="text-gray-900">{result.reason}</span>
                  </p>
                )}
              </div>

              {/* Conflictos */}
              {result.conflicts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Conflictos ({result.conflicts.length})
                  </h4>
                  <div className="space-y-2">
                    {result.conflicts.map((conflict) => (
                      <div
                        key={conflict.id}
                        className="bg-gray-50 border rounded-md p-3 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {TYPE_LABELS[conflict.type] ?? conflict.type}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {conflict.starts_at} → {conflict.ends_at}
                          </span>
                        </div>
                        {conflict.notes && (
                          <p className="text-gray-600 mt-1">{conflict.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && !mutation.isPending && !mutation.isError && (
            <p className="text-gray-400 text-sm py-8 text-center">
              Selecciona un activo y rango de fechas para consultar.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
