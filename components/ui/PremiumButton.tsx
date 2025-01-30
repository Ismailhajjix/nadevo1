"use client"

import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export function PremiumButton({ 
  children, 
  className,
  disabled,
  ...props 
}: PremiumButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "relative overflow-hidden px-4 py-2 rounded-lg font-medium",
        "transition-all duration-300 ease-out",
        "transform hover:scale-105 active:scale-95",
        "bg-primary text-white hover:bg-primary-hover",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0",
        "before:translate-x-[-200%] hover:before:translate-x-[200%]",
        "before:transition-transform before:duration-700",
        "before:pointer-events-none",
        "shadow-lg hover:shadow-xl",
        "border border-white/10",
        "backdrop-blur-sm",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
} 