import { useEffect } from 'react'
import { X } from 'lucide-react'

interface AppDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function AppDrawer({ open, onClose, title, children }: AppDrawerProps) {
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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#F3F4F6]">
          <h3 className="text-[16px] font-semibold text-[#0F172A]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-[8px] hover:bg-[#F3F4F6] transition-colors">
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
