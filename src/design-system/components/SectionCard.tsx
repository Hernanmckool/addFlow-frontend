import { Link } from '@tanstack/react-router'

interface SectionCardProps {
  title: string
  action?: { label: string; to: string }
  children: React.ReactNode
}

export function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB]/80 rounded-[16px] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-[#0F172A]">{title}</h2>
        {action && (
          <Link to={action.to} className="text-[12px] text-[#64748B] hover:text-[#374151] transition-colors">
            {action.label}
          </Link>
        )}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}
