import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { Building2, Mail, Phone, User } from 'lucide-react'
import api, { getCsrfCookie } from '@/lib/api'
import { PageHeader } from '@/design-system/components/PageHeader'
import { AppCard } from '@/design-system/components/AppCard'
import { SectionCard } from '@/design-system/components/SectionCard'
import { AppInput } from '@/design-system/components/AppInput'
import { AppSelect } from '@/design-system/components/AppSelect'
import { AppButton } from '@/design-system/components/AppButton'
import { AppBadge } from '@/design-system/components/AppBadge'

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

const TYPE_OPTIONS = [
  { value: 'direct', label: 'Directo' },
  { value: 'agency', label: 'Agencia' },
  { value: 'other', label: 'Otro' },
]

const TYPE_LABEL: Record<string, string> = {
  direct: 'Directo',
  agency: 'Agencia',
  other: 'Otro',
}

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
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { type: 'direct' },
  })

  const onSubmit = (data: ClientFormData) => {
    setServerError(null)
    mutation.mutate(data)
  }

  // Live preview values
  const watched = watch()
  const previewName = (watched.name ?? '').trim()
  const previewType = TYPE_LABEL[watched.type] ?? 'Directo'
  const previewContact = (watched.contact_name ?? '').trim()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Header — Design System PageHeader with form actions */}
      <PageHeader
        title="Nuevo cliente"
        description="Registra una empresa y su contacto principal."
        actions={
          <>
            <AppButton type="button" variant="ghost" onClick={() => navigate({ to: '/clientes' })}>
              Cancelar
            </AppButton>
            <AppButton type="submit" variant="primary" loading={mutation.isPending}>
              Guardar cliente
            </AppButton>
          </>
        }
      />

      {serverError && (
        <div className="mb-6 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: form cards */}
        <div className="flex flex-col gap-6">
          {/* CARD 1 — Empresa */}
          <SectionCard title="Empresa">
            <div className="space-y-4">
              <AppInput
                label="Nombre"
                placeholder="Ej. Banesco"
                error={errors.name?.message}
                {...register('name')}
              />
              <AppInput
                label="Razón social"
                placeholder="Ej. Banesco Banco Universal C.A."
                error={errors.legal_name?.message}
                {...register('legal_name')}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AppInput
                  label="RIF / NIT"
                  placeholder="J-12345678-9"
                  error={errors.tax_id?.message}
                  {...register('tax_id')}
                />
                <AppSelect
                  label="Tipo"
                  options={TYPE_OPTIONS}
                  error={errors.type?.message}
                  {...register('type')}
                />
              </div>

              {/* Estado inicial — fijo en Prospecto al crear (default del backend) */}
              <div className="flex items-center justify-between rounded-[12px] bg-[#F8FAFC] px-4 py-3">
                <div>
                  <p className="text-[14px] font-medium text-[#374151]">Estado inicial</p>
                  <p className="text-[12px] text-[#94A3B8]">Los clientes nuevos se crean como prospecto.</p>
                </div>
                <AppBadge label="Prospecto" variant="info" />
              </div>
            </div>
          </SectionCard>

          {/* CARD 2 — Contacto principal */}
          <SectionCard title="Contacto principal">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AppInput
                  label="Nombre"
                  placeholder="Ej. Carlos Rodríguez"
                  error={errors.contact_name?.message}
                  {...register('contact_name')}
                />
                <AppInput
                  label="Cargo"
                  placeholder="Ej. Director de Publicidad"
                  error={errors.contact_position?.message}
                  {...register('contact_position')}
                />
              </div>
              <AppInput
                label="Email"
                type="email"
                placeholder="contacto@empresa.com"
                error={errors.contact_email?.message}
                {...register('contact_email')}
              />
              <AppInput
                label="Teléfono"
                placeholder="+58 414-1234567"
                error={errors.contact_phone?.message}
                {...register('contact_phone')}
              />
            </div>
          </SectionCard>

          {/* CARD 3 — Información comercial */}
          <SectionCard title="Información comercial">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AppInput
                label="Industria"
                placeholder="Ej. Banca y Finanzas"
                error={errors.industry?.message}
                {...register('industry')}
              />
              <AppInput
                label="Plazo de pago (días)"
                placeholder="30"
                error={errors.payment_terms?.message}
                {...register('payment_terms')}
              />
            </div>
          </SectionCard>
        </div>

        {/* Right column: live preview (sticky) */}
        <div className="flex flex-col gap-6">
          <div className="lg:sticky lg:top-6">
            <SectionCard title="Vista previa">
              <AppCard variant="default" className="flex flex-col p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6]">
                      <Building2 className="h-5 w-5 text-[#64748B]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-[15px] font-semibold text-[#0F172A]">
                        {previewName || 'Nueva empresa'}
                      </h3>
                      <p className="mt-0.5 text-[12px] text-[#64748B]">{previewType}</p>
                    </div>
                  </div>
                  <AppBadge label="Prospecto" variant="info" />
                </div>

                {/* Contact */}
                <div className="mt-4 space-y-2 border-t border-[#F3F4F6] pt-4">
                  <div className="flex items-center gap-2 text-[13px] text-[#374151]">
                    <User className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                    <span className="truncate">{previewContact || 'Sin contacto principal'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#64748B]">
                    <Mail className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                    <span className="truncate">{watched.contact_email?.trim() || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#64748B]">
                    <Phone className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                    <span className="truncate">{watched.contact_phone?.trim() || '—'}</span>
                  </div>
                </div>
              </AppCard>
              <p className="mt-3 text-[12px] text-[#94A3B8]">Así se verá tu cliente en el listado.</p>
            </SectionCard>
          </div>
        </div>
      </div>
    </form>
  )
}
