import { type SelectHTMLAttributes, forwardRef } from 'react'

interface AppSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-[13px] font-medium text-[#374151] mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`
            w-full h-[52px] px-4 bg-white border rounded-[12px]
            text-[15px] text-[#111827]
            focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]
            transition-all appearance-none
            ${error ? 'border-[#EF4444]' : 'border-[#E5E7EB]'}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && (
          <p className="text-[12px] text-[#EF4444] mt-1.5">{error}</p>
        )}
      </div>
    )
  }
)

AppSelect.displayName = 'AppSelect'
