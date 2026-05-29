import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-slate-400/60 selection:bg-blue-600 selection:text-white flex h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs shadow-none transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-slate-300 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:shadow-xs",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
