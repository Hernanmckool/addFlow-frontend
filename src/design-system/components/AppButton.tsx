import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#111827] text-white hover:bg-[#1F2937]',
  secondary: 'bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#F9FAFB]',
  ghost: 'bg-transparent text-[#64748B] hover:bg-[#F3F4F6] hover:text-[#111827]',
  danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626]',
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ variant = 'primary', loading, fullWidth, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          h-[52px] px-6 rounded-[12px]
          text-[15px] font-semibold
          transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

AppButton.displayName = 'AppButton'
