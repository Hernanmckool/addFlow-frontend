import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchClients } from '@/lib/reservations'

export function ClientsPage() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients-options'],
    queryFn: fetchClients,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
        <Link
          to="/clientes/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          Nuevo Cliente
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clients?.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {client.status === 'active' ? 'Activo' : client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/cotizaciones/crear"
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Cotizar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!clients || clients.length === 0) && (
            <p className="text-center text-gray-500 py-8">No hay clientes registrados.</p>
          )}
        </div>
      )}
    </div>
  )
}
