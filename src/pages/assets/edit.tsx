import { useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'

const assetSchema = z.object({
  name: z.string().min(3),
  code: z.string().optional(),
  asset_type_id: z.string().uuid(),
  zone_id: z.string().optional(),
  address: z.string().optional(),
  width: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  has_illumination: z.boolean().default(false),
  monthly_rate_amount: z.coerce.number().min(0).optional(),
  monthly_rate_currency: z.string().default('USD'),
  status: z.string().optional(),
  notes: z.string().optional(),
})

type AssetForm = z.infer<typeof assetSchema>

export function AssetEditPage() {
  const { assetId } = useParams({ from: '/assets/$assetId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: async () => (await api.get(`/api/assets/${assetId}`)).data,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    values: asset ? {
      name: asset.name,
      code: asset.code ?? '',
      asset_type_id: asset.asset_type_id,
      zone_id: asset.zone_id ?? '',
      address: asset.address ?? '',
      width: asset.width ? Number(asset.width) : undefined,
      height: asset.height ? Number(asset.height) : undefined,
      has_illumination: asset.has_illumination,
      monthly_rate_amount: asset.monthly_rate_amount ? Number(asset.monthly_rate_amount) : undefined,
      monthly_rate_currency: asset.monthly_rate_currency ?? 'USD',
      status: asset.status,
      notes: asset.notes ?? '',
    } : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: AssetForm) => api.put(`/api/assets/${assetId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] })
      navigate({ to: '/assets' })
    },
  })

  if (isLoading) return <p className="text-gray-500">Cargando...</p>

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Activo</h2>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 bg-white p-6 rounded-lg border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input {...register('name')} className="w-full px-3 py-2 border rounded-md" />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input {...register('code')} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select {...register('status')} className="w-full px-3 py-2 border rounded-md">
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="occupied">Ocupado</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="out_of_service">Fuera de servicio</option>
              <option value="decommissioned">Dado de baja</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input {...register('address')} className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ancho (m)</label>
            <input {...register('width')} type="number" step="0.01" className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alto (m)</label>
            <input {...register('height')} type="number" step="0.01" className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa mensual</label>
            <input {...register('monthly_rate_amount')} type="number" step="0.01" className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <input {...register('monthly_rate_currency')} className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input {...register('has_illumination')} type="checkbox" className="rounded" />
          Tiene iluminación
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea {...register('notes')} className="w-full px-3 py-2 border rounded-md" rows={3} />
        </div>

        {mutation.error && <p className="text-red-600 text-sm">Error al actualizar.</p>}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={mutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button type="button" onClick={() => navigate({ to: '/assets' })} className="text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-100">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
