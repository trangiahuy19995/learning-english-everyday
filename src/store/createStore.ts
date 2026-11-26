import { useSyncExternalStore } from 'react'

export interface Store<T> {
  get: () => T
  set: (next: T | ((prev: T) => T)) => void
  subscribe: (fn: () => void) => () => void
}

export function createStore<T>(initial: T, onChange?: (value: T) => void): Store<T> {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    get: () => state,
    set: (next) => {
      state = typeof next === 'function' ? (next as (p: T) => T)(state) : next
      onChange?.(state)
      listeners.forEach((l) => l())
    },
    subscribe: (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
  }
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
