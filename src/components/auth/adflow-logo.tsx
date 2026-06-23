interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

export function AdFlowLogo({ variant = 'dark', size = 'md' }: LogoProps) {
  const sizes = { sm: 32, md: 40, lg: 48 }
  const s = sizes[size]
  // Colors from brand palette
  const darkNavy = '#0B1020'
  const navy = '#111827'
  const blue = '#2563EB'
  const lightBlue = '#60A5FA'
  const aColor = variant === 'light' ? '#E2E8F0' : darkNavy

  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* A - left leg */}
      <path d="M7 42L19.5 6H24L13 42H7Z" fill={aColor} />
      {/* A - right leg */}
      <path d="M21.5 6L35 42H29L21.5 6Z" fill={aColor} />
      {/* A - crossbar */}
      <path d="M13 30H30" stroke={aColor} strokeWidth="4" strokeLinecap="round" />
      {/* Flow lines */}
      <rect x="28" y="8" width="15" height="5" rx="2.5" fill={navy} />
      <rect x="26" y="17" width="18" height="5" rx="2.5" fill={blue} />
      <rect x="24" y="26" width="15" height="5" rx="2.5" fill={lightBlue} />
    </svg>
  )
}

export function AdFlowWordmark({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  const adColor = variant === 'light' ? 'text-white' : 'text-[#111827]'
  return (
    <span className="font-bold text-[22px] tracking-tight">
      <span className={adColor}>Ad</span><span className="text-[#2563EB]">Flow</span>
    </span>
  )
}
