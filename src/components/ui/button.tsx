
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/90 text-primary-foreground hover:bg-primary hover:shadow-sm active:scale-[0.98]",
        destructive:
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive hover:shadow-sm active:scale-[0.98]",
        outline:
          "border border-input bg-background hover:bg-accent/50 hover:text-accent-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary active:scale-[0.98]",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        solar: "bg-gradient-to-r from-yellow-400/90 to-amber-500/90 hover:from-yellow-400 hover:to-amber-500 hover:shadow-sm text-white active:scale-[0.98]",
        solarOutline: "border border-amber-200 text-amber-700 hover:bg-amber-50/70 active:scale-[0.98] dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-800/50"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
