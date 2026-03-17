import * as React from "react"
import { cn } from "@/src/lib/utils"
import { motion } from "framer-motion"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asMotion?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asMotion = false, ...props }, ref) => {
    const Comp = asMotion ? motion.button : "button";
    return (
      <Comp
        ref={ref as any}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-amber-400 text-stone-900 hover:bg-amber-500 shadow-sm hover:shadow": variant === "default",
            "bg-red-500 text-stone-50 hover:bg-red-600 shadow-sm": variant === "destructive",
            "border border-stone-200 bg-white hover:bg-stone-50 hover:text-stone-900": variant === "outline",
            "bg-stone-100 text-stone-900 hover:bg-stone-200": variant === "secondary",
            "hover:bg-stone-100 hover:text-stone-900": variant === "ghost",
            "text-amber-600 underline-offset-4 hover:underline": variant === "link",
            "h-10 px-6 py-2": size === "default",
            "h-9 px-4": size === "sm",
            "h-12 px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
