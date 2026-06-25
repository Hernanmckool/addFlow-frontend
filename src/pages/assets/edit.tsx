import { useMemo } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
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
import { LoadingState } from '@/design-system/components/LoadingState'
import { AssetTypeIllustration } from '@/components/assets/AssetTypeIllustration'
import {
  type Asset,
  STATUS_FILTER_OPTIONS,
  formatDimensions,
  formatRate,
  getStatusMeta,
  resolveAssetKind,
} from '@/components/assets/assetMeta'

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

  // Derive type / zone / currency options from existing inventory (no new endpoint).
  const { data: assetsData } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => (await api.get('/api/assets?per_page=100')).data,
  })
  const assets: Asset[] = assetsData?.data ?? []

  const typeOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of assets) if (a.asset_type) map.set(a.asset_type.id, a.asset_type.name)
    if (asset?.asset_type) map.set(asset.asset_type.id, asset.asset_type.name)
    return Array.from(map, ([value, label]) => ({ value, label }))
  }, [assets, asset])

  const zoneOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of assets) if (a.zone) map.set(a.zone.id, a.zone.name)
    if (asset?.zone) map.set(asset.zone.id, asset.zone.name)
    return Array.from(map, ([value, label]) => ({ value, label }))
  }, [assets, asset])

  const currencyOptions = useMemo(() => {
    const set = new Set<string>(['USD'])
    for (const a of assets) if (a.monthly_rate_currency) set.add(a.monthly_rate_currency)
    if (asset?.monthly_rate_currency) set.add(asset.monthly_rate_currency)
    return Array.from(set, (c) => ({ value: c, label: c }))
  }, [assets, asset])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    values: asset
      ? {
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
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: AssetForm) => api.put(`/api/assets/${assetId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] })
      navigate({ to: '/assets' })
    },
  })

  if (isLoading || !asset) return <LoadingState />

  // Live preview values
  const watched = watch()
  const previewTypeName =
    typeOptions.find((o) => o.value === watched.asset_type_id)?.label ?? asset.asset_type?.name
  const previewStatus = getStatusMeta(watched.status ?? asset.status)
  const previewKind = resolveAssetKind(previewTypeName)
  const previewRate = formatRate(watched.monthly_rate_amount ?? null, watched.monthly_rate_currency ?? null)
  const previewDimensions = formatDimensions(watched.width ?? null, watched.height ?? null)
  const previewName = (watched.name ?? '').trim()

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      {/* Header — Design System PageHeader with form actions */}
      <PageHeader
        title="Editar activo"
        description="Actualiza la información comercial y operativa del activo publicitario."
        actions={
          <>
            <AppButton type="button" variant="ghost" onClick={() => navigate({ to: '/assets' })}>
              Cancelar
            </AppButton>
            <AppButton type="submit" variant="primary" loading={mutation.isPending}>
              Guardar cambios
            </AppButton>
          </>
        }
      />

      {mutation.isError && (
        <div className="mb-6 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]">
          No se pudo actualizar el activo. Revisa los datos e inténtalo de nuevo.
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

              {/* Estado — editable en la pantalla de edición */}
              <AppSelect label="Estado" options={STATUS_FILTER_OPTIONS} error={errors.status?.message} {...register('status')} />
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
                    kind={previewKind}
                    className="absolute inset-0 h-full w-full"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
                  <div className="absolute left-3 top-3">
                    <AppBadge label={previewStatus.label} variant={previewStatus.badge} />
                  </div>
                  {previewTypeName && (
                    <span className="absolute right-3 top-3 inline-flex items-center rounded-[8px] bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#374151] backdrop-blur-sm">
                      {previewTypeName}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="truncate text-[15px] font-semibold text-[#0F172A]">
                    {previewName || 'Activo sin nombre'}
                  </h3>
                  <p className="mt-1 text-[12px] text-[#64748B]">{previewTypeName ?? 'Tipo sin definir'}</p>
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
              <p className="mt-3 text-[12px] text-[#94A3B8]">Así se verá tu activo en el listado.</p>
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
