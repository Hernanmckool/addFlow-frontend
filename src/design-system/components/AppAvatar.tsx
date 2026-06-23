interface AppAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-[12px]',
  lg: 'w-10 h-10 text-[14px]',
}

export function AppAvatar({ name, size = 'md' }: AppAvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`${sizes[size]} rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0`}>
      <span className="font-semibold text-[#64748B]">{initials}</span>
    </div>
  )
}
