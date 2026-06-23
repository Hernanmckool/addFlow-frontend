import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-[13px] font-medium text-[#374151] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-3 bg-white border rounded-[12px]
            text-[15px] text-[#111827] placeholder:text-[#9CA3AF]
            focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]
            transition-all resize-none
            ${error ? 'border-[#EF4444]' : 'border-[#E5E7EB]'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-[#EF4444] mt-1.5">{error}</p>
        )}
      </div>
    )
  }
)

AppTextarea.displayName = 'AppTextarea'
