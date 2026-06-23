interface BadgeProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple'
}

const variants: Record<string, string> = {
  default: 'bg-gray-100 text-gray-600',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  purple: 'bg-purple-50 text-purple-700',
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}
