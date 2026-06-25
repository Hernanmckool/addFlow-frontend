import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
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
import { LoadingState } from '@/design-system/components/LoadingState'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'

interface ClientContact {
  id: string
  name: string
  position: string | null
  email: string | null
  phone: string | null
  is_primary: boolean
  is_active: boolean
}

interface Client {
  id: string
  name: string
  legal_name: string | null
  tax_id: string | null
  type: string
  status: string
  industry: string | null
  payment_terms: string | null
  contacts: ClientContact[] | null
}

const clientEditSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  type: z.string().min(1, 'Tipo es requerido'),
  status: z.string().min(1, 'Estado es requerido'),
  industry: z.string().optional(),
  payment_terms: z.string().optional(),
  contact_name: z.string().min(2, 'Mínimo 2 caracteres'),
  contact_email: z.string().email('Email inválido').or(z.literal('')),
  contact_phone: z.string().optional(),
  contact_position: z.string().optional(),
})

type ClientEditForm = z.infer<typeof clientEditSchema>

const TYPE_OPTIONS = [
  { value: 'direct', label: 'Directo' },
  { value: 'agency', label: 'Agencia' },
  { value: 'other', label: 'Otro' },
]

const STATUS_OPTIONS = [
  { value: 'prospect', label: 'Prospecto' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'deactivated', label: 'Desactivado' },
]

const PAYMENT_TERMS_OPTIONS = [
  { value: 'cash', label: 'Contado' },
  { value: '15days', label: '15 días' },
  { value: '30days', label: '30 días' },
  { value: '60days', label: '60 días' },
]

const KNOWN_PAYMENT_TERMS = new Set(PAYMENT_TERMS_OPTIONS.map((o) => o.value))

const STATUS_META: Record<string, { label: string; badge: BadgeVariant }> = {
  prospect: { label: 'Prospecto', badge: 'info' },
  active: { label: 'Activo', badge: 'success' },
  inactive: { label: 'Inactivo', badge: 'neutral' },
  deactivated: { label: 'Desactivado', badge: 'danger' },
}

const TYPE_LABEL: Record<string, string> = {
  direct: 'Directo',
  agency: 'Agencia',
  other: 'Otro',
}

function getStatusMeta(status: string): { label: string; badge: BadgeVariant } {
  return STATUS_META[status] ?? { label: status, badge: 'neutral' }
}

function getPrimaryContact(client: Client): ClientContact | null {
  const contacts = client.contacts ?? []
  return contacts.find((c) => c.is_primary) ?? contacts[0] ?? null
}

export function ClientEditPage() {
  const { clientId } = useParams({ from: '/clientes/$clientId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: client, isLoading } = useQuery<Client>({
    queryKey: ['client', clientId],
    queryFn: async () => (await api.get(`/api/clients/${clientId}`)).data,
  })

  const primary = client ? getPrimaryContact(client) : null

  const mutation = useMutation({
    mutationFn: async (data: ClientEditForm) => {
      await getCsrfCookie()
      // 1) Update company data (the client endpoint does not handle contacts).
      await api.put(`/api/clients/${clientId}`, {
        name: data.name,
        legal_name: data.legal_name || undefined,
        tax_id: data.tax_id || undefined,
        type: data.type,
        status: data.status,
        industry: data.industry || undefined,
        // Only send a valid enum value; omitting preserves an existing value.
        ...(data.payment_terms ? { payment_terms: data.payment_terms } : {}),
      })
      // 2) Update the primary contact through its existing endpoint.
      if (primary) {
        await api.put(`/api/clients/${clientId}/contacts/${primary.id}`, {
          name: data.contact_name,
          email: data.contact_email || undefined,
          phone: data.contact_phone || undefined,
          position: data.contact_position || undefined,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['clients-options'] })
      queryClient.invalidateQueries({ queryKey: ['client', clientId] })
      navigate({ to: '/clientes/$clientId', params: { clientId } })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data as Record<string, unknown>
        setServerError(String(data.message ?? 'Error al actualizar el cliente.'))
      } else {
        setServerError('Error al actualizar el cliente.')
      }
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClientEditForm>({
    resolver: zodResolver(clientEditSchema),
    values: client
      ? {
          name: client.name,
          legal_name: client.legal_name ?? '',
          tax_id: client.tax_id ?? '',
          type: client.type,
          status: client.status,
          industry: client.industry ?? '',
          // Legacy / non-enum values are blanked so the select stays consistent.
          payment_terms:
            client.payment_terms && KNOWN_PAYMENT_TERMS.has(client.payment_terms)
              ? client.payment_terms
              : '',
          contact_name: primary?.name ?? '',
          contact_email: primary?.email ?? '',
          contact_phone: primary?.phone ?? '',
          contact_position: primary?.position ?? '',
        }
      : undefined,
  })

  const onSubmit = (data: ClientEditForm) => {
    setServerError(null)
    mutation.mutate(data)
  }

  if (isLoading || !client) return <LoadingState />

  // Live preview values
  const watched = watch()
  const previewName = (watched.name ?? '').trim()
  const previewType = TYPE_LABEL[watched.type] ?? 'Directo'
  const previewStatus = getStatusMeta(watched.status ?? client.status)
  const previewContact = (watched.contact_name ?? '').trim()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Header — Design System PageHeader with form actions */}
      <PageHeader
        title="Editar cliente"
        description="Actualiza la información comercial y de contacto del cliente."
        actions={
          <>
            <AppButton
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: '/clientes/$clientId', params: { clientId } })}
            >
              Cancelar
            </AppButton>
            <AppButton type="submit" variant="primary" loading={mutation.isPending}>
              Guardar cambios
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
              <AppInput label="Nombre" error={errors.name?.message} {...register('name')} />
              <AppInput
                label="Razón social"
                error={errors.legal_name?.message}
                {...register('legal_name')}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AppSelect
                  label="Tipo"
                  options={TYPE_OPTIONS}
                  error={errors.type?.message}
                  {...register('type')}
                />
                <AppSelect
                  label="Estado"
                  options={STATUS_OPTIONS}
                  error={errors.status?.message}
                  {...register('status')}
                />
              </div>
            </div>
          </SectionCard>

          {/* CARD 2 — Contacto principal */}
          <SectionCard title="Contacto principal">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AppInput
                  label="Nombre"
                  error={errors.contact_name?.message}
                  {...register('contact_name')}
                />
                <AppInput
                  label="Cargo"
                  error={errors.contact_position?.message}
                  {...register('contact_position')}
                />
              </div>
              <AppInput
                label="Email"
                type="email"
                error={errors.contact_email?.message}
                {...register('contact_email')}
              />
              <AppInput
                label="Teléfono"
                error={errors.contact_phone?.message}
                {...register('contact_phone')}
              />
            </div>
          </SectionCard>

          {/* CARD 3 — Información comercial */}
          <SectionCard title="Información comercial">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AppInput
                  label="Industria"
                  error={errors.industry?.message}
                  {...register('industry')}
                />
                <AppSelect
                  label="Plazo de pago"
                  placeholder="Sin definir"
                  options={PAYMENT_TERMS_OPTIONS}
                  error={errors.payment_terms?.message}
                  {...register('payment_terms')}
                />
              </div>
              <AppInput
                label="RIF / NIT"
                placeholder="J-12345678-9"
                error={errors.tax_id?.message}
                {...register('tax_id')}
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
                        {previewName || 'Empresa'}
                      </h3>
                      <p className="mt-0.5 text-[12px] text-[#64748B]">{previewType}</p>
                    </div>
                  </div>
                  <AppBadge label={previewStatus.label} variant={previewStatus.badge} />
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
