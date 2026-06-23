import { Link } from '@tanstack/react-router'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}

export function EmptyState({ title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-[14px] font-medium text-gray-700">{title}</p>
      <p className="text-[13px] text-gray-400 mt-1">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="inline-block mt-4 text-[13px] text-gray-900 font-medium hover:underline">
          {actionLabel} →
        </Link>
      )}
    </div>
  )
}
