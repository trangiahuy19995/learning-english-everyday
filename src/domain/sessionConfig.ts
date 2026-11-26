import type { SessionConfig } from './types'

export const SESSION_MIN = 5
export const SESSION_MAX = 60
export const SESSION_PRESETS = [5, 10, 15, 20, 30, 60] as const
export const STAGE_SIZE = 10
export const STAGE_THRESHOLD = 20

export const DEFAULT_CONFIG: SessionConfig = {
  size: 10,
  source: 'mixed',
  deckIds: [],
  starredOnly: false,
}

export type SizeValidation = { ok: true; value: number } | { ok: false; error: string }

export function validateSessionSize(raw: string | number): SizeValidation {
  const str = String(raw).trim()
  if (str === '' || !/^-?\d+$/.test(str)) {
    return { ok: false, error: 'Vui lòng nhập một số nguyên từ 5 đến 60.' }
  }
  const n = Number(str)
  if (n < SESSION_MIN) return { ok: false, error: `Tối thiểu ${SESSION_MIN} cụm từ cho mỗi phiên.` }
  if (n > SESSION_MAX) return { ok: false, error: `Tối đa ${SESSION_MAX} cụm từ cho mỗi phiên.` }
  return { ok: true, value: n }
}

export function clampSize(n: number): number {
  return Math.min(SESSION_MAX, Math.max(SESSION_MIN, Math.round(n)))
}

export function estimateMinutes(n: number): { min: number; max: number } {
  return { min: Math.max(3, Math.round(n * 0.5)), max: Math.round(n * 0.7 + 1.5) }
}

export function splitStages<T>(items: T[]): T[][] {
  if (items.length <= STAGE_THRESHOLD) return items.length ? [items] : []
  const stages: T[][] = []
  for (let i = 0; i < items.length; i += STAGE_SIZE) stages.push(items.slice(i, i + STAGE_SIZE))
  return stages
}
