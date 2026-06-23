import { useQuery } from '@tanstack/react-query'
import { fetchReservations, type Reservation } from '@/lib/reservations'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' }> = {
  confirmed: { label: 'Confirmada', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'error' },
}

export function ReservationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => fetchReservations(),
  })

  const reservations: Reservation[] = data?.data ?? []
  const hasConfirmed = reservations.some((r) => r.status === 'confirmed')

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="Reservas"
        description="Reservas confirmadas de activos publicitarios"
        action={{ label: 'Nueva reserva', to: '/reservas/crear' }}
        secondaryAction={hasConfirmed ? { label: 'Crear campaña', to: '/campanas/crear' } : undefined}
      />

      {reservations.length === 0 ? (
        <EmptyState
          title="Sin reservas"
          description="Crea reservas directamente o convierte cotizaciones aceptadas"
          actionLabel="Nueva reserva"
          actionTo="/reservas/crear"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Activo</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Período</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Monto</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservations.map((res) => {
                const status = STATUS_MAP[res.status] ?? { label: res.status, variant: 'default' as const }
                return (
                  <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-gray-900">{res.asset.name}</span>
                      {res.asset.code && <span className="ml-2 text-[11px] text-gray-400 font-mono">{res.asset.code}</span>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{res.client.name}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-[12px]">{res.starts_at} → {res.ends_at}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {res.total_amount ? `${res.currency} ${Number(res.total_amount).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-5 py-3.5"><Badge label={status.label} variant={status.variant} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
