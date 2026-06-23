import { Link } from '@tanstack/react-router'

interface PageHeaderProps {
  title: string
  description?: string
  action?: { label: string; to: string }
  secondaryAction?: { label: string; to: string }
}

export function PageHeader({ title, description, action, secondaryAction }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2">
          {secondaryAction && (
            <Link
              to={secondaryAction.to}
              className="border border-gray-200 text-gray-700 px-3.5 py-2 rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors"
            >
              {secondaryAction.label}
            </Link>
          )}
          {action && (
            <Link
              to={action.to}
              className="bg-gray-900 text-white px-3.5 py-2 rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors"
            >
              {action.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
