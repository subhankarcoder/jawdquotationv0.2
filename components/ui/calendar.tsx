"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// Import day picker CSS
import "react-day-picker/dist/style.css"

export type CalendarProps = React.ComponentPropsWithoutRef<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white rounded-lg shadow-sm border border-slate-100", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center text-slate-800 font-medium text-xs",
        caption_label: "text-xs font-semibold text-slate-800",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-slate-100 text-slate-500 rounded-md absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-slate-100 text-slate-500 rounded-md absolute right-1"
        ),
        weeks: "w-full border-collapse space-y-1",
        weekdays: "flex w-full justify-between",
        week: "flex w-full mt-2 justify-between",
        weekday: "text-slate-400 w-8 font-normal text-[10px] uppercase tracking-wider text-center py-1",
        day: "text-center text-xs p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal hover:bg-slate-100 hover:text-slate-900 rounded-md transition-all text-slate-800 flex items-center justify-center text-center"
        ),
        selected:
          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white rounded-md font-semibold",
        today: "bg-slate-100 text-slate-900 font-semibold rounded-md",
        outside: "text-slate-400/50 opacity-50",
        disabled: "text-slate-400 opacity-30 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className="h-4 w-4" />
          }
          return <ChevronRight className="h-4 w-4" />
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
