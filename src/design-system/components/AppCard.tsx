type CardVariant = 'default' | 'interactive' | 'metric' | 'outlined'

interface AppCardProps {
  variant?: CardVariant
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-[#E5E7EB]/80 rounded-[16px]',
  interactive: 'bg-white border border-[#E5E7EB]/80 rounded-[16px] hover:border-[#D1D5DB] hover:shadow-sm transition-all cursor-pointer',
  metric: 'bg-white border border-[#E5E7EB]/80 rounded-[16px]',
  outlined: 'bg-transparent border border-dashed border-[#E5E7EB] rounded-[16px]',
}

export function AppCard({ variant = 'default', children, className = '', onClick }: AppCardProps) {
  return (
    <div className={`${variantStyles[variant]} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}
