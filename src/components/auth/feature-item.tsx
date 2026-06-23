import { MapPin, CalendarCheck, Megaphone, Camera } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface FeatureItemProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
        <Icon className="w-[18px] h-[18px] text-blue-400" />
      </div>
      <div className="pt-0.5">
        <p className="text-[15px] font-semibold text-white">{title}</p>
        <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">{description}</p>
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
