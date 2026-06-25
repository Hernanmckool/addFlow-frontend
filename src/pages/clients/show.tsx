import { type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Building2, Mail, Phone } from 'lucide-react'
import api from '@/lib/api'
import { PageHeader } from '@/design-system/components/PageHeader'
import { AppCard } from '@/design-system/components/AppCard'
import { SectionCard } from '@/design-system/components/SectionCard'
import { AppBadge } from '@/design-system/components/AppBadge'
import { AppButton } from '@/design-system/components/AppButton'
import { AppAvatar } from '@/design-system/components/AppAvatar'
import { EmptyState } from '@/design-system/components/EmptyState'
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
  website: string | null
  payment_terms: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
  contacts: ClientContact[] | null
}

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

const PAYMENT_TERMS_LABEL: Record<string, string> = {
  cash: 'Contado',
  '15days': '15 días',
  '30days': '30 días',
  '60days': '60 días',
}

function getStatusMeta(status: string): { label: string; badge: BadgeVariant } {
  return STATUS_META[status] ?? { label: status, badge: 'neutral' }
}

function getTypeLabel(type: string): string {
  return TYPE_LABEL[type] ?? type
}

function getPaymentTermsLabel(value: string | null): string | null {
  if (!value) return null
  return PAYMENT_TERMS_LABEL[value] ?? value
}

function formatDate(value?: string | null): string {
  if (!value) return 'No disponible'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'No disponible'
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getPrimaryContact(client: Client): ClientContact | null {
  const contacts = client.contacts ?? []
  return contacts.find((c) => c.is_primary) ?? contacts[0] ?? null
}

export function ClientShowPage() {
  const { clientId } = useParams({ from: '/clientes/$clientId' })
  const navigate = useNavigate()

  const { data: client, isLoading } = useQuery<Client>({
    queryKey: ['client', clientId],
    queryFn: async () => (await api.get(`/api/clients/${clientId}`)).data,
  })

  if (isLoading) return <LoadingState />

  if (!client) {
    return (
      <div>
        <PageHeader
          title="Cliente no encontrado"
          secondaryAction={{ label: '← Clientes', to: '/clientes' }}
        />
        <EmptyState
          title="No encontramos este cliente"
          description="Es posible que haya sido eliminado o que el enlace sea incorrecto."
          actionLabel="Volver al listado"
          actionTo="/clientes"
        />
      </div>
    )
  }

  const status = getStatusMeta(client.status)
  const typeLabel = getTypeLabel(client.type)
  const primary = getPrimaryContact(client)
  const contacts = client.contacts ?? []
  const otherContacts = contacts.filter((c) => primary && c.id !== primary.id)
  const paymentTerms = getPaymentTermsLabel(client.payment_terms)

  return (
    <div>
      <PageHeader
        title={client.name}
        description={`${typeLabel} · ${status.label}`}
        actions={
          <>
            <AppButton type="button" variant="secondary" onClick={() => navigate({ to: '/clientes' })}>
              Volver a Clientes
            </AppButton>
            <AppButton type="button" variant="primary" disabled title="Disponible próximamente">
              Editar
            </AppButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: Hero + Información general + Historial */}
        <div className="flex flex-col gap-6">
          {/* 1. Hero / resumen */}
          <AppCard variant="default" className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[#F3F4F6]">
                  <Building2 className="h-6 w-6 text-[#64748B]" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-[20px] font-bold tracking-tight text-[#0F172A]">
                    {client.name}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-[#64748B]">{typeLabel}</p>
                </div>
              </div>
              <AppBadge label={status.label} variant={status.badge} />
            </div>

            <div className="mt-5 space-y-2 border-t border-[#F3F4F6] pt-4">
              <p className="text-[12px] font-medium uppercase tracking-wide text-[#94A3B8]">
                Contacto principal
              </p>
              {primary ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[14px] font-medium text-[#0F172A]">
                    <AppAvatar name={primary.name} size="sm" />
                    <span className="truncate">{primary.name}</span>
                    {primary.position && (
                      <span className="text-[12px] font-normal text-[#94A3B8]">· {primary.position}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#64748B]">
                    <Mail className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                    <span className="truncate">{primary.email ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#64748B]">
                    <Phone className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                    <span className="truncate">{primary.phone ?? '—'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-[#94A3B8]">Sin contacto principal</p>
              )}
            </div>
          </AppCard>

          {/* 2. Información general */}
          <SectionCard title="Información general">
            <div>
              <InfoRow label="Nombre">{client.name}</InfoRow>
              <InfoRow label="Razón social">{client.legal_name ?? 'No disponible'}</InfoRow>
              <InfoRow label="RIF / NIT">
                <span className="font-mono">{client.tax_id ?? 'No disponible'}</span>
              </InfoRow>
              <InfoRow label="Tipo">{typeLabel}</InfoRow>
              <InfoRow label="Estado">
                <AppBadge label={status.label} variant={status.badge} />
              </InfoRow>
              <InfoRow label="Industria">{client.industry ?? 'No disponible'}</InfoRow>
              <InfoRow label="Plazo de pago">{paymentTerms ?? 'No disponible'}</InfoRow>
              <InfoRow label="Fecha de creación">{formatDate(client.created_at)}</InfoRow>
            </div>
          </SectionCard>

          {/* 6. Historial */}
          <SectionCard title="Historial">
            <p className="text-[13px] text-[#94A3B8]">Historial disponible próximamente</p>
          </SectionCard>
        </div>

        {/* Right column: Contactos + Cotizaciones + Reservas */}
        <div className="flex flex-col gap-6">
          {/* 3. Contactos */}
          <SectionCard title="Contactos">
            {contacts.length === 0 ? (
              <EmptyState
                title="Sin contactos registrados"
                description="Los contactos de este cliente aparecerán aquí."
              />
            ) : (
              <div>
                {primary && <ContactRow contact={primary} isPrimary />}
                {otherContacts.map((c) => (
                  <ContactRow key={c.id} contact={c} />
                ))}
              </div>
            )}
          </SectionCard>

          {/* 4. Cotizaciones */}
          <SectionCard title="Cotizaciones">
            <EmptyState
              title="Sin cotizaciones disponibles"
              description="Las cotizaciones asociadas a este cliente aparecerán aquí."
            />
          </SectionCard>

          {/* 5. Reservas */}
          <SectionCard title="Reservas">
            <EmptyState
              title="Sin reservas disponibles"
              description="Las reservas asociadas a este cliente aparecerán aquí."
            />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

function ContactRow({ contact, isPrimary }: { contact: ClientContact; isPrimary?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <AppAvatar name={contact.name} size="md" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-[#0F172A]">{contact.name}</p>
          <p className="truncate text-[12px] text-[#64748B]">
            {contact.position ?? contact.email ?? '—'}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        {isPrimary && <AppBadge label="Principal" variant="info" />}
        {contact.phone && <p className="mt-1 text-[12px] text-[#64748B]">{contact.phone}</p>}
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] py-2.5 last:border-0">
      <span className="text-[13px] text-[#64748B]">{label}</span>
      <span className="text-right text-[13px] font-medium text-[#0F172A]">{children}</span>
    </div>
  )
}
