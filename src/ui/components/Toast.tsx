import { CheckCircle2, Info } from 'lucide-react'
import { createStore, useStore } from '@/store/createStore'

type ToastItem = { id: number; text: string; tone: 'success' | 'info' }
const toastStore = createStore<ToastItem[]>([])
let counter = 0

export function toast(text: string, tone: ToastItem['tone'] = 'success') {
  const id = ++counter
  toastStore.set((t) => [...t, { id, text, tone }])
  setTimeout(() => toastStore.set((t) => t.filter((x) => x.id !== id)), 3200)
}

export function ToastViewport() {
  const items = useStore(toastStore)
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className="flex animate-rise items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-lg"
        >
          {t.tone === 'success' ? <CheckCircle2 className="size-5 text-grass" /> : <Info className="size-5 text-sky" />}
          {t.text}
        </div>
      ))}
    </div>
  )
}
