import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'

const assetSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  code: z.string().optional(),
  asset_type_id: z.string().uuid('Seleccione un tipo'),
  zone_id: z.string().uuid().optional().or(z.literal('')),
  address: z.string().optional(),
  width: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  has_illumination: z.boolean().default(false),
  monthly_rate_amount: z.coerce.number().min(0).optional(),
  monthly_rate_currency: z.string().default('USD'),
  notes: z.string().optional(),
})

type AssetForm = z.infer<typeof assetSchema>

export function AssetCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: { has_illumination: false, monthly_rate_currency: 'USD' },
  })

  const mutation = useMutation({
    mutationFn: (data: AssetForm) => api.post('/api/assets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      navigate({ to: '/assets' })
    },
  })

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Activo</h2>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 bg-white p-6 rounded-lg border">
        <Field label="Nombre *" error={errors.name?.message}>
          <input {...register('name')} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Código" error={errors.code?.message}>
            <input {...register('code')} className="input" placeholder="VN-001" />
          </Field>
          <Field label="Tipo de activo *" error={errors.asset_type_id?.message}>
            <select {...register('asset_type_id')} className="input">
              <option value="">Seleccionar...</option>
            </select>
          </Field>
        </div>

        <Field label="Dirección" error={errors.address?.message}>
          <input {...register('address')} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ancho (m)" error={errors.width?.message}>
            <input {...register('width')} type="number" step="0.01" className="input" />
          </Field>
          <Field label="Alto (m)" error={errors.height?.message}>
            <input {...register('height')} type="number" step="0.01" className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tarifa mensual" error={errors.monthly_rate_amount?.message}>
            <input {...register('monthly_rate_amount')} type="number" step="0.01" className="input" />
          </Field>
          <Field label="Moneda">
            <input {...register('monthly_rate_currency')} className="input" />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input {...register('has_illumination')} type="checkbox" className="rounded" />
          Tiene iluminación
        </label>

        <Field label="Notas">
          <textarea {...register('notes')} className="input" rows={3} />
        </Field>

        {mutation.error && (
          <p className="text-red-600 text-sm">Error al crear el activo.</p>
        )}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={mutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Creando...' : 'Crear Activo'}
          </button>
          <button type="button" onClick={() => navigate({ to: '/assets' })} className="text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-100">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}
