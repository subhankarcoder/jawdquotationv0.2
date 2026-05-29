import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-slate-400/60 selection:bg-blue-600 selection:text-white flex min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-none transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-slate-300 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:shadow-xs",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
