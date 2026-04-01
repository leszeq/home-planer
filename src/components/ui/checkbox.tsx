'use client'

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void
  }

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    const defaultRef = React.useRef<HTMLInputElement>(null)
    const combinedRef = (ref as React.MutableRefObject<HTMLInputElement>) || defaultRef

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
    }

    return (
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          ref={combinedRef}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-background cursor-pointer transition-colors checked:bg-primary checked:border-primary",
            className
          )}
          onChange={handleChange}
          {...props}
        />
        <Check className="absolute w-3 h-3 text-primary-foreground opacity-0 pointer-events-none peer-checked:opacity-100 transition-opacity" />
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
