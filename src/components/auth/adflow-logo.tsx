interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * AdFlow official logo isotipo.
 * "A" in navy with 3 horizontal flow lines in blue gradient.
 */
export function AdFlowLogo({ variant = 'dark', size = 'md' }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const s = sizes[size]
  const navyColor = variant === 'light' ? '#e2e8f0' : '#0f172a'
  const blue1 = '#1e40af'
  const blue2 = '#3b82f6'
  const blue3 = '#93c5fd'

  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* A - left leg */}
      <path d="M6 42L19 6H24L13 42H6Z" fill={navyColor} />
      {/* A - right leg */}
      <path d="M21 6L36 42H29L21 6Z" fill={navyColor} />
      {/* A - crossbar */}
      <path d="M13 30H31" stroke={navyColor} strokeWidth="4" strokeLinecap="round" />
      {/* Flow lines - stacked right */}
      <rect x="29" y="8" width="14" height="5" rx="2.5" fill={blue1} />
      <rect x="27" y="16" width="17" height="5" rx="2.5" fill={blue2} />
      <rect x="25" y="24" width="14" height="5" rx="2.5" fill={blue3} />
    </svg>
  )
}

export function AdFlowWordmark({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  const adColor = variant === 'light' ? 'text-white' : 'text-[#0f172a]'
  return (
    <span className="font-bold text-[24px] tracking-tight">
      <span className={adColor}>Ad</span><span className="text-[#3b82f6]">Flow</span>
    </span>
  )
}
