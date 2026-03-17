import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50 ag-press',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-orange-500 to-orange-600 text-white ag-glow-btn',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white shadow hover:shadow-red-500/30',
        outline:
          'border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm',
        secondary:
          'bg-white/8 text-white/80 hover:bg-white/12 hover:text-white',
        ghost:
          'text-white/70 hover:text-white hover:bg-white/8',
        link:
          'text-orange-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm:      'h-8 px-3 text-xs rounded-lg',
        lg:      'h-12 px-6 text-base rounded-xl',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
