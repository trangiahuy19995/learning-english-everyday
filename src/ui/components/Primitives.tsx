import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cx } from '../theme'
import { Button } from './Button'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-3xl border-2 border-line bg-white', className)}>{children}</div>
}

export function ProgressBar({ value, className, color = 'bg-grass' }: { value: number; className?: string; color?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div
      className={cx('h-4 w-full overflow-hidden rounded-full bg-line', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cx('relative h-full rounded-full transition-[width] duration-500', color)} style={{ width: `${pct}%` }}>
        <div className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/35" />
      </div>
    </div>
  )
}

export function Chip({
  selected,
  onClick,
  children,
  className,
  selectedClass = 'border-sky bg-sky-soft text-sky-dark',
}: {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
  selectedClass?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cx(
        'inline-flex h-10 items-center gap-1.5 rounded-2xl border-2 px-4 text-sm font-bold transition-colors',
        selected ? selectedClass : 'border-line bg-white text-ink-soft hover:border-ink-muted/40',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold', className)}>
      {children}
    </span>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-bold text-ink-soft select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx('relative h-7 w-12 rounded-full transition-colors', checked ? 'bg-grass' : 'bg-line')}
      >
        <span
          className={cx(
            'absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
      {label}
    </label>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full animate-rise overflow-auto rounded-t-3xl bg-white p-6 sm:max-w-md sm:rounded-3xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-black">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-xl p-1 text-ink-muted hover:bg-canvas">
            <X className="size-5" />
          </button>
        </div>
        <div className="text-ink-soft">{children}</div>
        {footer && <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Huỷ
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  )
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-line px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-soft text-sky">{icon}</div>
      <p className="text-lg font-black">{title}</p>
      {children && <div className="max-w-sm text-ink-soft">{children}</div>}
    </div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-black">{children}</h2>
      {action}
    </div>
  )
}
