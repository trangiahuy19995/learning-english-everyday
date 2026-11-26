import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../theme'

type Variant = 'primary' | 'secondary' | 'blue' | 'orange' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-grass text-white shadow-[0_4px_0_var(--color-grass-dark)] hover:brightness-105',
  blue: 'bg-sky text-white shadow-[0_4px_0_var(--color-sky-dark)] hover:brightness-105',
  orange: 'bg-sun text-white shadow-[0_4px_0_var(--color-sun-dark)] hover:brightness-105',
  danger: 'bg-coral text-white shadow-[0_4px_0_var(--color-coral-dark)] hover:brightness-105',
  secondary: 'bg-white text-ink border-2 border-line shadow-[0_4px_0_var(--color-line)] hover:bg-canvas',
  ghost: 'bg-transparent text-ink-soft hover:bg-line/60 shadow-none',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-xl gap-1.5',
  md: 'h-12 px-5 text-base rounded-2xl gap-2',
  lg: 'h-14 px-7 text-lg rounded-2xl gap-2.5',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  block?: boolean
}

export function Button({ variant = 'primary', size = 'md', icon, block, className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        'inline-flex items-center justify-center font-extrabold tracking-wide select-none transition-[transform,box-shadow,filter,background-color] duration-100',
        'active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function IconButton({
  label,
  className,
  children,
  active,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cx(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 transition-colors disabled:opacity-40',
        active ? 'border-sun bg-sun-soft text-sun-dark' : 'border-line bg-white text-ink-soft hover:bg-canvas hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}
