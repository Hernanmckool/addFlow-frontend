import { useEffect } from 'react'
import { X } from 'lucide-react'

interface AppModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function AppModal({ open, onClose, title, children }: AppModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[16px] shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold text-[#0F172A]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-[8px] hover:bg-[#F3F4F6] transition-colors">
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
