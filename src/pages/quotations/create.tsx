import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { createQuotation } from '@/lib/quotations'
import { fetchAssetOptions } from '@/lib/availability'
import { fetchClients } from '@/lib/reservations'

const itemSchema = z.object({
  asset_id: z.string().min(1, 'Selecciona un activo'),
  starts_at: z.string().min(1, 'Requerido'),
  ends_at: z.string().min(1, 'Requerido'),
  notes: z.string().optional(),
})

const quotationSchema = z.object({
  client_id: z.string().min(1, 'Selecciona un cliente'),
  valid_until: z.string().optional(),
  discount_percent: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Agrega al menos un activo'),
})

type QuotationFormData = z.infer<typeof quotationSchema>

export function QuotationCreatePage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: assets, isLoading: loadingAssets } = useQuery({
    queryKey: ['assets-options'],
    queryFn: fetchAssetOptions,
  })

  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ['clients-options'],
    queryFn: fetchClients,
  })

  const mutation = useMutation({
    mutationFn: createQuotation,
    onSuccess: (data) => {
      navigate({ to: '/cotizaciones/$quotationId', params: { quotationId: data.id } })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data as Record<string, unknown>
        setServerError(String(data.message ?? 'Error al crear cotización.'))
      } else {
        setServerError('Error al crear cotización.')
      }
    },
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: { items: [{ asset_id: '', starts_at: '', ends_at: '', notes: '' }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const onSubmit = (data: QuotationFormData) => {
    setServerError(null)
    mutation.mutate({
      client_id: data.client_id,
      valid_until: data.valid_until || undefined,
      discount_percent: data.discount_percent,
      notes: data.notes,
      items: data.items.map((item) => ({
        asset_id: item.asset_id,
        starts_at: item.starts_at,
        ends_at: item.ends_at,
        notes: item.notes,
      })),
    })
  }

  const activeAssets = assets?.filter((a) => a.status === 'active') ?? []

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Cotización</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
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
              <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700 mb-1">
                Válida hasta
              </label>
              <input
                id="valid_until"
                type="date"
                {...register('valid_until')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="discount_percent" className="block text-sm font-medium text-gray-700 mb-1">
                Descuento (%)
              </label>
              <input
                id="discount_percent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register('discount_percent')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              id="notes"
              rows={2}
              {...register('notes')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observaciones generales de la cotización..."
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activos</h3>
            <button
              type="button"
              onClick={() => append({ asset_id: '', starts_at: '', ends_at: '', notes: '' })}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Agregar activo
            </button>
          </div>

          {errors.items && !Array.isArray(errors.items) && (
            <p className="text-xs text-red-600 mb-3">{errors.items.message}</p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-md p-4 relative">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs"
                  >
                    Eliminar
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Activo</label>
                    {loadingAssets ? (
                      <p className="text-xs text-gray-400">Cargando...</p>
                    ) : (
                      <select
                        {...register(`items.${index}.asset_id`)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar...</option>
                        {activeAssets.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.code ? `[${a.code}] ` : ''}{a.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.items?.[index]?.asset_id && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.items[index]?.asset_id?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                    <input
                      type="date"
                      {...register(`items.${index}.starts_at`)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.items?.[index]?.starts_at && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.items[index]?.starts_at?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                    <input
                      type="date"
                      {...register(`items.${index}.ends_at`)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.items?.[index]?.ends_at && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.items[index]?.ends_at?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            {mutation.isPending ? 'Creando...' : 'Crear Cotización'}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/cotizaciones' })}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
