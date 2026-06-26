import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { Plus, Trash2 } from 'lucide-react'
import { createQuotation } from '@/lib/quotations'
import { fetchAssetOptions } from '@/lib/availability'
import { fetchClients } from '@/lib/reservations'
import { PageHeader } from '@/design-system/components/PageHeader'
import { AppCard } from '@/design-system/components/AppCard'
import { SectionCard } from '@/design-system/components/SectionCard'
import { AppInput } from '@/design-system/components/AppInput'
import { AppSelect } from '@/design-system/components/AppSelect'
import { AppTextarea } from '@/design-system/components/AppTextarea'
import { AppButton } from '@/design-system/components/AppButton'
import { AppBadge } from '@/design-system/components/AppBadge'
import { EmptyState } from '@/design-system/components/EmptyState'
import { LoadingState } from '@/design-system/components/LoadingState'

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

const CURRENCY = 'USD'

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
    watch,
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

  if (loadingClients || loadingAssets) return <LoadingState />

  const activeAssets = assets?.filter((a) => a.status === 'active') ?? []
  const clientOptions = (clients ?? []).map((c) => ({ value: c.id, label: c.name }))
  const assetOptions = activeAssets.map((a) => ({
    value: a.id,
    label: a.code ? `[${a.code}] ${a.name}` : a.name,
  }))

  // Live values for summary / preview (display only — totals are computed server-side).
  const watched = watch()
  const selectedClient = clientOptions.find((c) => c.value === watched.client_id)
  const itemsCount = watched.items?.filter((i) => i.asset_id).length ?? 0
  const discountPercent = Number(watched.discount_percent) || 0

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title="Nueva cotización"
        description="Prepara una propuesta comercial para un cliente."
        actions={
          <>
            <AppButton type="button" variant="ghost" onClick={() => navigate({ to: '/cotizaciones' })}>
              Cancelar
            </AppButton>
            <AppButton type="submit" variant="primary" loading={mutation.isPending}>
              Guardar cotización
            </AppButton>
          </>
        }
      />

      {serverError && (
        <div className="mb-6 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* CARD 1 — Información comercial */}
          <SectionCard title="Información comercial">
            <div className="space-y-4">
              <AppSelect
                label="Cliente"
                placeholder="Seleccionar cliente"
                options={clientOptions}
                error={errors.client_id?.message}
                {...register('client_id')}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AppInput
                  label="Válida hasta"
                  type="date"
                  error={errors.valid_until?.message}
                  {...register('valid_until')}
                />
                <AppInput
                  label="Descuento (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0"
                  error={errors.discount_percent?.message}
                  {...register('discount_percent')}
                />
              </div>
              <AppTextarea
                label="Notas"
                rows={4}
                placeholder="Observaciones generales de la cotización..."
                error={errors.notes?.message}
                {...register('notes')}
              />
            </div>
          </SectionCard>

          {/* CARD 2 — Activos cotizados */}
          <SectionCard title="Activos cotizados">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-[#64748B]">
                  Agrega los activos que forman parte de la propuesta.
                </p>
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={() => append({ asset_id: '', starts_at: '', ends_at: '', notes: '' })}
                >
                  <Plus className="h-4 w-4" />
                  Agregar activo
                </AppButton>
              </div>

              {errors.items && !Array.isArray(errors.items) && (
                <p className="text-[12px] text-[#DC2626]">{errors.items.message}</p>
              )}

              {activeAssets.length === 0 ? (
                <EmptyState
                  title="No hay activos disponibles"
                  description="Necesitas activos en estado disponible para agregarlos a la cotización."
                  actionLabel="Ir a activos"
                  actionTo="/assets"
                />
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <AppCard key={field.id} variant="default" className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-[#64748B]">
                          Activo {index + 1}
                        </span>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#94A3B8] transition-colors hover:text-[#DC2626]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Quitar
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <AppSelect
                          label="Activo"
                          placeholder="Seleccionar activo"
                          options={assetOptions}
                          error={errors.items?.[index]?.asset_id?.message}
                          {...register(`items.${index}.asset_id`)}
                        />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <AppInput
                            label="Desde"
                            type="date"
                            error={errors.items?.[index]?.starts_at?.message}
                            {...register(`items.${index}.starts_at`)}
                          />
                          <AppInput
                            label="Hasta"
                            type="date"
                            error={errors.items?.[index]?.ends_at?.message}
                            {...register(`items.${index}.ends_at`)}
                          />
                        </div>
                      </div>
                    </AppCard>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right column: summary + preview (sticky) */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 lg:sticky lg:top-6">
            {/* CARD 3 — Resumen */}
            <SectionCard title="Resumen">
              <div>
                <SummaryRow label="Cliente">{selectedClient?.label ?? 'Sin seleccionar'}</SummaryRow>
                <SummaryRow label="Activos">{itemsCount}</SummaryRow>
                <SummaryRow label="Subtotal">
                  <span className="text-[#94A3B8]">Se calcula al guardar</span>
                </SummaryRow>
                <SummaryRow label="Descuento">{discountPercent}%</SummaryRow>
                <SummaryRow label="Total">
                  <span className="text-[#94A3B8]">Se calcula al guardar</span>
                </SummaryRow>
                <SummaryRow label="Estado">
                  <AppBadge label="Borrador" variant="neutral" />
                </SummaryRow>
                <SummaryRow label="Moneda">{CURRENCY}</SummaryRow>
              </div>
            </SectionCard>

            {/* CARD 4 — Vista previa */}
            <SectionCard title="Vista previa">
              <AppCard variant="default" className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[12px] text-[#94A3B8]">Se asignará al guardar</p>
                    <h3 className="mt-0.5 truncate text-[15px] font-semibold text-[#0F172A]">
                      {selectedClient?.label ?? 'Cliente sin seleccionar'}
                    </h3>
                  </div>
                  <AppBadge label="Borrador" variant="neutral" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-2 border-t border-[#F3F4F6] pt-4">
                  <div>
                    <p className="text-[18px] font-bold leading-none text-[#0F172A]">
                      {CURRENCY} <span className="text-[#94A3B8]">—</span>
                    </p>
                    <p className="mt-1 text-[11px] text-[#94A3B8]">Total al guardar</p>
                  </div>
                  <p className="text-[12px] text-[#64748B]">
                    {itemsCount} {itemsCount === 1 ? 'activo' : 'activos'}
                  </p>
                </div>
              </AppCard>
              <p className="mt-3 text-[12px] text-[#94A3B8]">
                Los montos finales se calculan al guardar la cotización.
              </p>
            </SectionCard>
          </div>
        </div>
      </div>
    </form>
  )
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] py-2.5 last:border-0">
      <span className="text-[13px] text-[#64748B]">{label}</span>
      <span className="text-right text-[13px] font-medium text-[#0F172A]">{children}</span>
    </div>
  )
}
