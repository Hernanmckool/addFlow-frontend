import { type InputHTMLAttributes, forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: LucideIcon
  error?: string
  rightElement?: React.ReactNode
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, icon: Icon, error, rightElement, className = '', id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-[13px] font-medium text-[#374151] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
          )}
          <input
            ref={ref}
            id={id}
            className={`
              w-full h-[52px] bg-white border rounded-[12px]
              text-[15px] text-[#111827] placeholder:text-[#9CA3AF]
              focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]
              transition-all
              ${Icon ? 'pl-12' : 'pl-4'}
              ${rightElement ? 'pr-12' : 'pr-4'}
              ${error ? 'border-[#EF4444]' : 'border-[#E5E7EB]'}
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[12px] text-[#EF4444] mt-1.5">{error}</p>
        )}
      </div>
    )
  }
)

AppInput.displayName = 'AppInput'
