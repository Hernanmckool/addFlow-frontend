interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * AdFlow isotipo - "A" con líneas de flujo en azul.
 * Logo oficial: A en navy oscuro con tres líneas de flujo en azules progresivos.
 */
export function AdFlowLogo({ variant = 'dark', size = 'md' }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 44 }
  const s = sizes[size]
  const navyColor = variant === 'light' ? '#c8d6e5' : '#0f172a'
  const blue1 = '#1e40af'
  const blue2 = '#3b82f6'
  const blue3 = '#93c5fd'

  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* "A" left leg */}
      <path d="M8 40L20 8H24L14 40H8Z" fill={navyColor} />
      {/* "A" right leg */}
      <path d="M22 8L36 40H30L22 8Z" fill={navyColor} />
      {/* "A" crossbar */}
      <path d="M14 28H30" stroke={navyColor} strokeWidth="3.5" strokeLinecap="round" />
      {/* Flow lines */}
      <rect x="28" y="10" width="14" height="4" rx="2" fill={blue1} />
      <rect x="26" y="17" width="16" height="4" rx="2" fill={blue2} />
      <rect x="24" y="24" width="14" height="4" rx="2" fill={blue3} />
    </svg>
  )
}

export function AdFlowWordmark({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  const adColor = variant === 'light' ? 'text-white' : 'text-[#0f172a]'
  return (
    <span className="font-semibold text-[18px] tracking-tight">
      <span className={adColor}>Ad</span><span className="text-blue-500">Flow</span>
    </span>
  )
}
