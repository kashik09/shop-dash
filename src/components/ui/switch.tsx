import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "h-7 w-12 rounded-full border border-border/70 bg-muted/60 shadow-sm transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer peer-checked:bg-primary peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full peer-checked:after:translate-x-full after:absolute after:start-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:border after:border-white/60 after:bg-white after:shadow after:transition-all after:content-['']",
            className
          )}
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
