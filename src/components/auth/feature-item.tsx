import { MapPin, CalendarCheck, Megaphone, Camera } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface FeatureItemProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <div>
        <p className="text-[14px] font-medium text-white">{title}</p>
        <p className="text-[13px] text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

export const features = [
  { icon: MapPin, title: 'Inventario en tiempo real', description: 'Gestiona tus activos y su disponibilidad.' },
  { icon: CalendarCheck, title: 'Reservas sin conflictos', description: 'Planifica y reserva sin superposiciones.' },
  { icon: Megaphone, title: 'Campañas centralizadas', description: 'Organiza y monitorea todas tus campañas.' },
  { icon: Camera, title: 'Evidencias desde campo', description: 'Registra y valida instalaciones al instante.' },
] as const
