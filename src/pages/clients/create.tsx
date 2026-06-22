import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import api, { getCsrfCookie } from '@/lib/api'

const clientSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  type: z.string().min(1, 'Tipo es requerido'),
  industry: z.string().optional(),
  payment_terms: z.string().optional(),
  contact_name: z.string().min(1, 'Nombre de contacto requerido'),
  contact_email: z.string().email('Email inválido'),
  contact_phone: z.string().optional(),
  contact_position: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

export function ClientCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      await getCsrfCookie()
      const response = await api.post('/api/clients', {
        name: data.name,
        legal_name: data.legal_name,
        tax_id: data.tax_id,
        type: data.type,
        industry: data.industry,
        payment_terms: data.payment_terms,
        contact: {
          name: data.contact_name,
          email: data.contact_email,
          phone: data.contact_phone,
          position: data.contact_position,
          is_primary: true,
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients-options'] })
      navigate({ to: '/clientes' })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data as Record<string, unknown>
        setServerError(String(data.message ?? 'Error al crear cliente.'))
      } else {
        setServerError('Error al crear cliente.')
      }
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { type: 'direct' },
  })

  const onSubmit = (data: ClientFormData) => {
    setServerError(null)
    mutation.mutate(data)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Cliente</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Datos del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input id="name" type="text" {...register('name')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="legal_name" className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
              <input id="legal_name" type="text" {...register('legal_name')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-1">RIF/NIT</label>
              <input id="tax_id" type="text" {...register('tax_id')} placeholder="J-12345678-9"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select id="type" {...register('type')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="direct">Directo</option>
                <option value="agency">Agencia</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industria</label>
              <input id="industry" type="text" {...register('industry')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="payment_terms" className="block text-sm font-medium text-gray-700 mb-1">Plazo de pago</label>
              <input id="payment_terms" type="text" {...register('payment_terms')} placeholder="30"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Contacto Principal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input id="contact_name" type="text" {...register('contact_name')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.contact_name && <p className="text-xs text-red-600 mt-1">{errors.contact_name.message}</p>}
            </div>
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input id="contact_email" type="email" {...register('contact_email')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.contact_email && <p className="text-xs text-red-600 mt-1">{errors.contact_email.message}</p>}
            </div>
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input id="contact_phone" type="text" {...register('contact_phone')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="contact_position" className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <input id="contact_position" type="text" {...register('contact_position')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Creando...' : 'Crear Cliente'}
          </button>
          <button type="button" onClick={() => navigate({ to: '/clientes' })}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
