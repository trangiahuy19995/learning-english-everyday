import type { DeckColor, ProgressStatus } from '@/domain/types'

export const DECK_THEME: Record<DeckColor, { bg: string; soft: string; text: string; border: string; label: string }> = {
  green: { bg: 'bg-grass', soft: 'bg-grass-soft', text: 'text-grass-dark', border: 'border-grass', label: 'Xanh lá' },
  blue: { bg: 'bg-sky', soft: 'bg-sky-soft', text: 'text-sky-dark', border: 'border-sky', label: 'Xanh dương' },
  orange: { bg: 'bg-sun', soft: 'bg-sun-soft', text: 'text-sun-dark', border: 'border-sun', label: 'Cam' },
  purple: { bg: 'bg-grape', soft: 'bg-grape-soft', text: 'text-grape-dark', border: 'border-grape', label: 'Tím' },
  pink: { bg: 'bg-rose', soft: 'bg-rose-soft', text: 'text-rose-dark', border: 'border-rose', label: 'Hồng' },
  teal: { bg: 'bg-teal', soft: 'bg-teal-soft', text: 'text-teal-dark', border: 'border-teal', label: 'Ngọc' },
}

export const STATUS_THEME: Record<ProgressStatus, { bg: string; soft: string; text: string }> = {
  new: { bg: 'bg-sky', soft: 'bg-sky-soft', text: 'text-sky-dark' },
  learning: { bg: 'bg-sun', soft: 'bg-sun-soft', text: 'text-sun-dark' },
  review: { bg: 'bg-grape', soft: 'bg-grape-soft', text: 'text-grape-dark' },
  mastered: { bg: 'bg-grass', soft: 'bg-grass-soft', text: 'text-grass-dark' },
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}
