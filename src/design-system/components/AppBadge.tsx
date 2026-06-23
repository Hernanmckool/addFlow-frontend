type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'

interface AppBadgeProps {
  label: string
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#22C55E]/10 text-[#16A34A]',
  warning: 'bg-[#F59E0B]/10 text-[#D97706]',
  danger: 'bg-[#EF4444]/10 text-[#DC2626]',
  info: 'bg-[#2563EB]/10 text-[#2563EB]',
  neutral: 'bg-[#F3F4F6] text-[#64748B]',
  purple: 'bg-[#8B5CF6]/10 text-[#7C3AED]',
}

export function AppBadge({ label, variant = 'neutral' }: AppBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-[8px] text-[11px] font-semibold ${variantStyles[variant]}`}>
      {label}
    </span>
  )
}
