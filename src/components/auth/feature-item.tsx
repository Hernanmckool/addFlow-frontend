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
      <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#1F2937] flex items-center justify-center shrink-0">
        <Icon className="w-[18px] h-[18px] text-[#60A5FA]" />
      </div>
      <div className="pt-0.5">
        <p className="text-[14px] font-semibold text-white leading-tight">{title}</p>
        <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">{description}</p>
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
