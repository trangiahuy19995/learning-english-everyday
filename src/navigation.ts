import { createStore, useStore } from './store/createStore'

export type Route =
  | { name: 'home' }
  | { name: 'setup'; source?: 'new' | 'due' | 'mixed' }
  | { name: 'session' }
  | { name: 'playlist'; deckId?: string }
  | { name: 'decks' }
  | { name: 'deck'; deckId: string }
  | { name: 'phrase'; deckId: string; phraseId?: string }
  | { name: 'stats' }

const KEY = 'cumtu:route'

function initialRoute(): Route {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Route
  } catch {
    // ignore
  }
  return { name: 'home' }
}

export const routeStore = createStore<Route>(initialRoute(), (r) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(r))
  } catch {
    // ignore
  }
})

export function navigate(route: Route) {
  routeStore.set(route)
  window.scrollTo({ top: 0 })
}

export const useRoute = () => useStore(routeStore)
