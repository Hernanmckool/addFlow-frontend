import { type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

interface PageHeaderProps {
  title: string
  description?: string
  action?: { label: string; to: string }
  secondaryAction?: { label: string; to: string }
  /** Custom action node(s) rendered on the right. Takes precedence over link actions. */
  actions?: ReactNode
}

export function PageHeader({ title, description, action, secondaryAction, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">{title}</h1>
        {description && <p className="text-[14px] text-[#64748B] mt-1">{description}</p>}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : (
        (action || secondaryAction) && (
        <div className="flex items-center gap-2">
          {secondaryAction && (
            <Link
              to={secondaryAction.to}
              className="inline-flex items-center h-[40px] px-4 bg-white border border-[#E5E7EB] rounded-[12px] text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              {secondaryAction.label}
            </Link>
          )}
          {action && (
            <Link
              to={action.to}
              className="inline-flex items-center h-[40px] px-4 bg-[#111827] rounded-[12px] text-[13px] font-medium text-white hover:bg-[#1F2937] transition-colors"
            >
              {action.label}
            </Link>
          )}
        </div>
        )
      )}
    </div>
  )
}
