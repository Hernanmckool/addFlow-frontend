import type { LucideIcon } from 'lucide-react'

interface AppMetricCardProps {
  icon?: LucideIcon
  label: string
  value: string
  detail?: string
}

export function AppMetricCard({ icon: Icon, label, value, detail }: AppMetricCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB]/80 rounded-[16px] p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && (
          <div className="w-7 h-7 bg-[#F3F4F6] rounded-[8px] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#64748B]" />
          </div>
        )}
        <span className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-[24px] font-bold text-[#0F172A]">{value}</p>
      {detail && <p className="text-[12px] text-[#9CA3AF] mt-0.5">{detail}</p>}
    </div>
  )
}
