import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { uploadEvidences } from '@/lib/evidences'

const TYPE_LABELS: Record<string, string> = {
  before: 'Antes',
  after: 'Después',
  proof: 'Comprobante',
}

interface EvidenceUploadProps {
  workOrderId: string
  campaignAssets: { id: string; asset: { name: string; code: string | null } }[]
}

export function EvidenceUpload({ workOrderId, campaignAssets }: EvidenceUploadProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [type, setType] = useState<string>('before')
  const [campaignAssetId, setCampaignAssetId] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => uploadEvidences(workOrderId, selectedFiles, type, campaignAssetId || undefined, notes || undefined),
    onSuccess: () => {
      setSelectedFiles([])
      setNotes('')
      setError(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      queryClient.invalidateQueries({ queryKey: ['evidences', workOrderId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err) => {
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data as Record<string, unknown>
        setError(String(data.message ?? 'Error al subir evidencias.'))
      } else {
        setError('Error al subir evidencias.')
      }
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length === 0) {
      setError('Selecciona al menos una foto.')
      return
    }
    setError(null)
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Subir Evidencia</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          >
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Activo (opcional)</label>
          <select
            value={campaignAssetId}
            onChange={(e) => setCampaignAssetId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {campaignAssets.map((ca) => (
              <option key={ca.id} value={ca.id}>
                {ca.asset.code ? `[${ca.asset.code}] ` : ''}{ca.asset.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fotos</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>

      <div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas (opcional)"
          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>

      {selectedFiles.length > 0 && (
        <p className="text-xs text-gray-500">{selectedFiles.length} archivo(s) seleccionado(s)</p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={mutation.isPending || selectedFiles.length === 0}
        className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {mutation.isPending ? 'Subiendo...' : 'Subir Evidencia'}
      </button>
    </form>
  )
}
