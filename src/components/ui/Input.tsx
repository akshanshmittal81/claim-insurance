import { forwardRef } from 'react'
import { cn } from '@/utils'

type NativeInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'>

interface InputProps extends NativeInputProps {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-ink-muted flex items-center">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-field',
              prefix && 'pl-10',
              suffix && 'pr-10',
              error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-ink-muted flex items-center">{suffix}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-400 flex items-center gap-1">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
