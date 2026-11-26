import { DEFAULT_CONFIG } from '@/domain/sessionConfig'
import type { SessionConfig } from '@/domain/types'
import { createStore } from './createStore'
import { KEYS, load, save } from './storage'

export interface Settings {
  lastConfig: SessionConfig
  hideMeaning: boolean
  hideIpa: boolean
  speechRate: number
  playlistSkipVi: boolean
}

const defaults: Settings = {
  lastConfig: DEFAULT_CONFIG,
  hideMeaning: false,
  hideIpa: false,
  speechRate: 1,
  playlistSkipVi: false,
}

export const settingsStore = createStore<Settings>({ ...defaults, ...load<Partial<Settings>>(KEYS.settings, {}) }, (s) =>
  save(KEYS.settings, s),
)

export function updateSettings(patch: Partial<Settings>) {
  settingsStore.set((s) => ({ ...s, ...patch }))
}
