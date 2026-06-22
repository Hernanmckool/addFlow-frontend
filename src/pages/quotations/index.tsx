import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchQuotations, type Quotation } from '@/lib/quotations'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  expired: 'Vencida',
  converted: 'Convertida',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-purple-100 text-purple-700',
}

export function QuotationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => fetchQuotations(),
  })

  const quotations: Quotation[] = data?.data ?? []

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cotizaciones</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona propuestas comerciales</p>
        </div>
        <Link
          to="/cotizaciones/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Nueva Cotización
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quotations.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No hay cotizaciones</p>
          <p className="text-sm text-gray-400 mt-1">Crea tu primera cotización para comenzar</p>
          <Link to="/cotizaciones/crear" className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
            Crear cotización
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Número</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Items</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{q.number}</td>
                  <td className="px-4 py-3 text-gray-700">{q.client.name}</td>
                  <td className="px-4 py-3 text-gray-600">{q.items_count ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">
                    {q.currency} {Number(q.total).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[q.status] ?? 'bg-gray-100'}`}>
                      {STATUS_LABELS[q.status] ?? q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(q.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/cotizaciones/$quotationId"
                      params={{ quotationId: q.id }}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {quotations.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay cotizaciones registradas.</p>
          )}
        </div>
      )}
    </div>
  )
}
