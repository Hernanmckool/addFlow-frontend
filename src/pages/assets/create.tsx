import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ruler } from 'lucide-react'
import api from '@/lib/api'
import { PageHeader } from '@/design-system/components/PageHeader'
import { AppCard } from '@/design-system/components/AppCard'
import { SectionCard } from '@/design-system/components/SectionCard'
import { AppInput } from '@/design-system/components/AppInput'
import { AppSelect } from '@/design-system/components/AppSelect'
import { AppTextarea } from '@/design-system/components/AppTextarea'
import { AppButton } from '@/design-system/components/AppButton'
import { AppBadge } from '@/design-system/components/AppBadge'
import { AssetTypeIllustration } from '@/components/assets/AssetTypeIllustration'
import { type Asset, formatDimensions, formatRate } from '@/components/assets/assetMeta'

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: { has_illumination: false, monthly_rate_currency: 'USD' },
  })

  // Derive type / zone / currency options from existing inventory (no new endpoint).
  const { data: assetsData } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => (await api.get('/api/assets?per_page=100')).data,
  })
  const assets: Asset[] = assetsData?.data ?? []

  const typeOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of assets) if (a.asset_type) map.set(a.asset_type.id, a.asset_type.name)
    return Array.from(map, ([value, label]) => ({ value, label }))
  }, [assets])

  const zoneOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of assets) if (a.zone) map.set(a.zone.id, a.zone.name)
    return Array.from(map, ([value, label]) => ({ value, label }))
  }, [assets])

  const currencyOptions = useMemo(() => {
    const set = new Set<string>(['USD'])
    for (const a of assets) if (a.monthly_rate_currency) set.add(a.monthly_rate_currency)
    return Array.from(set, (c) => ({ value: c, label: c }))
  }, [assets])

  const mutation = useMutation({
    mutationFn: (data: AssetForm) => api.post('/api/assets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      navigate({ to: '/assets' })
    },
  })

  // Live preview values
  const watched = watch()
  const previewTypeName = typeOptions.find((o) => o.value === watched.asset_type_id)?.label
  const previewRate = formatRate(watched.monthly_rate_amount ?? null, watched.monthly_rate_currency ?? null)
  const previewDimensions = formatDimensions(watched.width ?? null, watched.height ?? null)
  const previewName = (watched.name ?? '').trim()

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      {/* Header — Design System PageHeader with form actions */}
      <PageHeader
        title="Nuevo activo"
        description="Registrar un nuevo espacio publicitario para comercialización."
        actions={
          <>
            <AppButton type="button" variant="ghost" onClick={() => navigate({ to: '/assets' })}>
              Cancelar
            </AppButton>
            <AppButton type="submit" variant="primary" loading={mutation.isPending}>
              Guardar activo
            </AppButton>
          </>
        }
      />

      {mutation.isError && (
        <div className="mb-6 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
          No se pudo crear el activo. Revisa los datos e inténtalo de nuevo.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: form cards */}
        <div className="flex flex-col gap-6">
          {/* CARD 1 — Información General */}
          <SectionCard title="Información general">
            <div className="space-y-4">
              <AppInput
                label="Nombre"
                placeholder="Ej. Valla Av. Libertador Norte"
                error={errors.name?.message}
                {...register('name')}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AppInput label="Código" placeholder="VN-001" error={errors.code?.message} {...register('code')} />
                <AppSelect
                  label="Tipo"
                  placeholder="Seleccionar tipo"
                  options={typeOptions}
                  error={errors.asset_type_id?.message}
                  {...register('asset_type_id')}
                />
              </div>
              {typeOptions.length === 0 && (
                <p className="text-[12px] text-[#94A3B8]">
                  Aún no hay tipos de activo en el inventario para seleccionar.
                </p>
              )}
            </div>
          </SectionCard>

          {/* CARD 2 — Ubicación */}
          <SectionCard title="Ubicación">
            <div className="space-y-4">
              <AppInput
                label="Dirección"
                placeholder="Ej. Av. Libertador con Calle 3"
                error={errors.address?.message}
                {...register('address')}
              />
              <AppSelect
                label="Zona"
                placeholder="Sin zona asignada"
                options={zoneOptions}
                error={errors.zone_id?.message}
                {...register('zone_id')}
              />
            </div>
          </SectionCard>

          {/* CARD 3 — Características */}
          <SectionCard title="Características">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AppInput
                  label="Ancho (m)"
                  type="number"
                  step="0.01"
                  placeholder="8"
                  error={errors.width?.message}
                  {...register('width')}
                />
                <AppInput
                  label="Alto (m)"
                  type="number"
                  step="0.01"
                  placeholder="4"
                  error={errors.height?.message}
                  {...register('height')}
                />
              </div>

              {/* Iluminación — premium switch (boolean, schema unchanged) */}
              <label className="flex cursor-pointer items-center justify-between rounded-[12px] border border-[#E5E7EB] px-4 py-3">
                <span className="text-[14px] font-medium text-[#374151]">Iluminación</span>
                <span className="relative inline-flex">
                  <input type="checkbox" className="peer sr-only" {...register('has_illumination')} />
                  <span className="block h-6 w-11 rounded-full bg-[#E5E7EB] transition-colors peer-checked:bg-[#2563EB]" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </span>
              </label>

              {/* Estado — fijo en Borrador al crear (el backend siempre crea borradores) */}
              <div className="flex items-center justify-between rounded-[12px] bg-[#F8FAFC] px-4 py-3">
                <div>
                  <p className="text-[14px] font-medium text-[#374151]">Estado</p>
                  <p className="text-[12px] text-[#94A3B8]">Los activos nuevos se crean como borrador.</p>
                </div>
                <AppBadge label="Borrador" variant="neutral" />
              </div>
            </div>
          </SectionCard>

          {/* CARD 4 — Información Comercial */}
          <SectionCard title="Información comercial">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AppInput
                label="Tarifa mensual"
                type="number"
                step="0.01"
                placeholder="1200"
                error={errors.monthly_rate_amount?.message}
                {...register('monthly_rate_amount')}
              />
              <AppSelect
                label="Moneda"
                options={currencyOptions}
                error={errors.monthly_rate_currency?.message}
                {...register('monthly_rate_currency')}
              />
            </div>
          </SectionCard>
        </div>

        {/* Right column: live preview (sticky) */}
        <div className="flex flex-col gap-6">
          <div className="lg:sticky lg:top-6">
            <SectionCard title="Vista previa">
              <AppCard variant="default" className="overflow-hidden">
                <div className="relative aspect-[16/10]">
                  <AssetTypeIllustration
                    type={previewTypeName}
                    className="absolute inset-0 h-full w-full"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
                  <div className="absolute left-3 top-3">
                    <AppBadge label="Borrador" variant="neutral" />
                  </div>
                  {previewTypeName && (
                    <span className="absolute right-3 top-3 inline-flex items-center rounded-[8px] bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#374151] backdrop-blur-sm">
                      {previewTypeName}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="truncate text-[15px] font-semibold text-[#0F172A]">
                    {previewName || 'Nuevo activo'}
                  </h3>
                  <p className="mt-1 text-[12px] text-[#64748B]">
                    {previewTypeName ?? 'Tipo sin definir'}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[17px] font-bold leading-none text-[#0F172A]">
                        {previewRate ?? 'Sin tarifa'}
                      </p>
                      {previewRate && <p className="mt-1 text-[11px] text-[#94A3B8]">por mes</p>}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {previewDimensions ? (
                        <span className="inline-flex items-center gap-1">
                          <Ruler className="h-3.5 w-3.5 text-[#94A3B8]" />
                          {previewDimensions}
                        </span>
                      ) : (
                        'Sin dimensiones'
                      )}
                    </div>
                  </div>
                </div>
              </AppCard>
              <p className="mt-3 text-[12px] text-[#94A3B8]">
                Así se verá tu activo en el listado.
              </p>
            </SectionCard>
          </div>
        </div>

        {/* CARD 5 — Notas (ancho completo) */}
        <div className="lg:col-span-2">
          <SectionCard title="Notas">
            <AppTextarea
              rows={6}
              placeholder="Información adicional sobre el activo: referencias de ubicación, condiciones, observaciones de mantenimiento, etc."
              error={errors.notes?.message}
              {...register('notes')}
            />
          </SectionCard>
        </div>
      </div>
    </form>
  )
}
