import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchClients } from '@/lib/reservations'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

export function ClientsPage() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients-options'],
    queryFn: fetchClients,
  })

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Directorio de clientes y agencias"
        action={{ label: 'Nuevo cliente', to: '/clientes/crear' }}
      />

      {!clients || clients.length === 0 ? (
        <EmptyState
          title="Sin clientes"
          description="Registra tu primer cliente para comenzar a cotizar"
          actionLabel="Registrar cliente"
          actionTo="/clientes/crear"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{client.name}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      label={client.status === 'active' ? 'Activo' : client.status}
                      variant={client.status === 'active' ? 'success' : 'default'}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to="/cotizaciones/crear" className="text-[12px] text-gray-500 hover:text-gray-900 font-medium transition-colors">
                      Cotizar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
