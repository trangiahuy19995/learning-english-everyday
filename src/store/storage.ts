const PREFIX = 'cumtu:v1:'

export const KEYS = {
  decks: 'decks',
  phrases: 'phrases',
  activeSession: 'activeSession',
  history: 'history',
  activity: 'activity',
  settings: 'settings',
  seedVersion: 'seedVersion',
} as const

export type StorageKey = (typeof KEYS)[keyof typeof KEYS]

export const storageErrors: string[] = []

export function load<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    storageErrors.push(key)
    return fallback
  }
}

export function has(key: StorageKey): boolean {
  try {
    return localStorage.getItem(PREFIX + key) != null
  } catch {
    return false
  }
}

export function save(key: StorageKey, value: unknown): void {
  try {
    if (value === null || value === undefined) localStorage.removeItem(PREFIX + key)
    else localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Quota or private mode: keep running in-memory.
  }
}
