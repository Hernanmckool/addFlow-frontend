import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchReservations, type Reservation } from '@/lib/reservations'

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function ReservationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => fetchReservations(),
  })

  const reservations: Reservation[] = data?.data ?? []
  const hasConfirmed = reservations.some((r) => r.status === 'confirmed')

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
          <p className="text-sm text-gray-500 mt-1">Reservas confirmadas de activos</p>
        </div>
        <div className="flex gap-2">
          {hasConfirmed && (
            <Link
              to="/campanas/crear"
              className="border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
            >
              Crear Campaña
            </Link>
          )}
          <Link
            to="/reservas/crear"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Nueva Reserva
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-600 font-medium">No hay reservas</p>
          <p className="text-sm text-gray-400 mt-1">Crea reservas directamente o convierte cotizaciones aceptadas</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Activo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Desde</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hasta</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Monto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{res.asset.name}</div>
                    {res.asset.code && (
                      <div className="text-xs text-gray-500 font-mono">{res.asset.code}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{res.client.name}</td>
                  <td className="px-4 py-3 text-gray-600">{res.starts_at}</td>
                  <td className="px-4 py-3 text-gray-600">{res.ends_at}</td>
                  <td className="px-4 py-3">
                    {res.total_amount
                      ? `${res.currency} ${Number(res.total_amount).toLocaleString()}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[res.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {STATUS_LABELS[res.status] ?? res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reservations.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay reservas registradas.</p>
          )}
        </div>
      )}
    </div>
  )
}
