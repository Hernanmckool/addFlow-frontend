interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

export function AdFlowLogo({ variant = 'dark', size = 'md' }: LogoProps) {
  const sizes = { sm: 24, md: 32, lg: 40 }
  const s = sizes[size]
  const textColor = variant === 'light' ? '#ffffff' : '#111827'

  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rounded square with gradient */}
      <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
      {/* Flow arrow / billboard abstraction */}
      <path
        d="M12 28V14a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H16"
        stroke={textColor === '#ffffff' ? '#ffffff' : '#ffffff'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M16 22l-4 6h20"
        stroke="#60a5fa"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="14" r="2" fill="#60a5fa" />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e293b" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function AdFlowWordmark({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  const color = variant === 'light' ? 'text-white' : 'text-gray-900'
  return (
    <span className={`font-semibold text-[17px] tracking-tight ${color}`}>
      Ad<span className="text-blue-400">Flow</span>
    </span>
  )
}
