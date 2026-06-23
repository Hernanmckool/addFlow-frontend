import { Link } from '@tanstack/react-router'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}

export function EmptyState({ title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="bg-white border border-dashed border-[#E5E7EB] rounded-[16px] py-16 px-8 text-center">
      <div className="w-11 h-11 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
        <Inbox className="w-5 h-5 text-[#9CA3AF]" />
      </div>
      <p className="text-[14px] font-medium text-[#374151]">{title}</p>
      <p className="text-[13px] text-[#9CA3AF] mt-1">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="inline-block mt-5 text-[13px] text-[#0F172A] font-semibold hover:underline">
          {actionLabel} →
        </Link>
      )}
    </div>
  )
}
