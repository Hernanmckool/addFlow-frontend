import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchEvidences, deleteEvidence } from '@/lib/evidences'

const TYPE_LABELS: Record<string, string> = {
  before: 'Antes',
  after: 'Después',
  proof: 'Comprobante',
}

const TYPE_COLORS: Record<string, string> = {
  before: 'bg-yellow-100 text-yellow-700',
  after: 'bg-green-100 text-green-700',
  proof: 'bg-blue-100 text-blue-700',
}

interface EvidenceGalleryProps {
  workOrderId: string
}

export function EvidenceGallery({ workOrderId }: EvidenceGalleryProps) {
  const queryClient = useQueryClient()

  const { data: evidences, isLoading } = useQuery({
    queryKey: ['evidences', workOrderId],
    queryFn: () => fetchEvidences(workOrderId),
  })

  const deleteMutation = useMutation({
    mutationFn: (evidenceId: string) => deleteEvidence(workOrderId, evidenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidences', workOrderId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  if (isLoading) return <p className="text-sm text-gray-500">Cargando evidencias...</p>

  if (!evidences || evidences.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        No hay evidencias cargadas para esta OT.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {evidences.map((ev) => (
        <div key={ev.id} className="bg-white rounded-lg border overflow-hidden">
          {ev.url ? (
            <a href={ev.url} target="_blank" rel="noopener noreferrer">
              <img
                src={ev.url}
                alt={ev.file_name}
                className="w-full h-40 object-cover hover:opacity-90 transition-opacity"
              />
            </a>
          ) : (
            <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
              <p className="text-sm text-gray-400">{ev.file_name}</p>
            </div>
          )}
          <div className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[ev.type] ?? 'bg-gray-100'}`}>
                {TYPE_LABELS[ev.type] ?? ev.type}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(ev.created_at).toLocaleDateString()}
              </span>
            </div>
            {ev.campaign_asset && (
              <p className="text-xs text-gray-500">{ev.campaign_asset.asset.name}</p>
            )}
            {ev.notes && <p className="text-xs text-gray-600">{ev.notes}</p>}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400">{ev.uploaded_by.name}</span>
              <button
                onClick={() => { if (confirm('¿Eliminar esta evidencia?')) deleteMutation.mutate(ev.id) }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
