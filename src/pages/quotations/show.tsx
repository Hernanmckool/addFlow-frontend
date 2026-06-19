import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { fetchQuotation, transitionQuotation, convertQuotation } from '@/lib/quotations'
import { useState } from 'react'

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

const TRANSITIONS: Record<string, { label: string; target: string; color: string }[]> = {
  draft: [
    { label: 'Marcar como Enviada', target: 'sent', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Rechazar', target: 'rejected', color: 'bg-red-600 hover:bg-red-700' },
  ],
  sent: [
    { label: 'Marcar como Aceptada', target: 'accepted', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Rechazar', target: 'rejected', color: 'bg-red-600 hover:bg-red-700' },
  ],
  accepted: [
    { label: 'Convertir a Reservas', target: '_convert', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Rechazar', target: 'rejected', color: 'bg-red-600 hover:bg-red-700' },
  ],
}

export function QuotationShowPage() {
  const { quotationId } = useParams({ strict: false }) as { quotationId: string }
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [convertSuccess, setConvertSuccess] = useState<string | null>(null)

  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', quotationId],
    queryFn: () => fetchQuotation(quotationId),
  })

  const transitionMutation = useMutation({
    mutationFn: (status: string) => transitionQuotation(quotationId, status),
    onSuccess: () => {
      setActionError(null)
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] })
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data as Record<string, unknown>
        setActionError(String(data.message ?? 'Error en la transición.'))
      }
    },
  })

  const convertMutation = useMutation({
    mutationFn: () => convertQuotation(quotationId),
    onSuccess: (data) => {
      setActionError(null)
      setConvertSuccess(`${data.message} (${data.reservations_created} reserva(s) creada(s))`)
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] })
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        const data = error.response.data as Record<string, unknown>
        setActionError(String(data.message ?? 'Error al convertir.'))
      }
    },
  })

  if (isLoading) return <p className="text-gray-500">Cargando cotización...</p>
  if (!quotation) return <p className="text-gray-500">Cotización no encontrada.</p>

  const availableTransitions = TRANSITIONS[quotation.status] ?? []

  const handleAction = (target: string) => {
    setActionError(null)
    setConvertSuccess(null)
    if (target === '_convert') {
      convertMutation.mutate()
    } else {
      transitionMutation.mutate(target)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cotización {quotation.number}</h2>
          <p className="text-sm text-gray-500">{quotation.client.name}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[quotation.status]}`}>
          {STATUS_LABELS[quotation.status] ?? quotation.status}
        </span>
      </div>

      {/* Actions */}
      {availableTransitions.length > 0 && (
        <div className="flex gap-2 mb-6">
          {availableTransitions.map((t) => (
            <button
              key={t.target}
              onClick={() => handleAction(t.target)}
              disabled={transitionMutation.isPending || convertMutation.isPending}
              className={`text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 ${t.color}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}

      {convertSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <p className="text-sm text-green-700">{convertSuccess}</p>
          <button
            onClick={() => navigate({ to: '/reservas' })}
            className="text-sm text-green-800 underline mt-1"
          >
            Ver Reservas
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Subtotal</p>
          <p className="text-xl font-bold">{quotation.currency} {Number(quotation.subtotal).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Descuento ({quotation.discount_percent}%)</p>
          <p className="text-xl font-bold text-red-600">-{quotation.currency} {Number(quotation.discount_amount).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-bold text-green-700">{quotation.currency} {Number(quotation.total).toLocaleString()}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Activos ({quotation.items.length})</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Activo</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Desde</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Hasta</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Tarifa/mes</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Meses</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Subtotal línea</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {quotation.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{item.asset.name}</div>
                  {item.asset.code && <div className="text-xs text-gray-500 font-mono">{item.asset.code}</div>}
                </td>
                <td className="px-4 py-3 text-gray-600">{item.starts_at}</td>
                <td className="px-4 py-3 text-gray-600">{item.ends_at}</td>
                <td className="px-4 py-3">${Number(item.unit_price).toLocaleString()}</td>
                <td className="px-4 py-3">{item.quantity_months}</td>
                <td className="px-4 py-3 text-right font-medium">${Number(item.line_total).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {quotation.notes && (
        <div className="mt-4 bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500 mb-1">Notas</p>
          <p className="text-sm text-gray-700">{quotation.notes}</p>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate({ to: '/cotizaciones' })}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
        >
          ← Volver a cotizaciones
        </button>
      </div>
    </div>
  )
}
