import { createRng, shuffle } from './random'
import { splitStages } from './sessionConfig'
import { isDue } from './srsEngine'
import type { FillOptions, Phrase, SessionConfig } from './types'

function inFilter(p: Phrase, config: SessionConfig): boolean {
  if (config.deckIds.length && !config.deckIds.includes(p.topic)) return false
  if (config.starredOnly && !p.starred) return false
  return true
}

const byOverdue = (a: Phrase, b: Phrase) => (a.progress.nextReviewAt ?? 0) - (b.progress.nextReviewAt ?? 0)

export function primaryPool(config: SessionConfig, phrases: Phrase[], now: number): Phrase[] {
  const filtered = phrases.filter((p) => inFilter(p, config))
  const due = filtered.filter((p) => isDue(p.progress, now)).sort(byOverdue)
  const fresh = filtered.filter((p) => p.progress.status === 'new')
  if (config.source === 'due') return due
  if (config.source === 'new') return fresh
  return [...due, ...fresh]
}

export interface SessionPlan {
  primary: Phrase[]
  fromDue: Phrase[]
  fromOtherNew: Phrase[]
  fromUpcoming: Phrase[]
  selected: Phrase[]
  shortBy: number
}

export function planSession(
  config: SessionConfig,
  phrases: Phrase[],
  now: number,
  fill: FillOptions = { fillDue: true, fillOtherNew: true },
): SessionPlan {
  const primary = primaryPool(config, phrases, now).slice(0, config.size)
  const used = new Set(primary.map((p) => p.id))
  let remaining = config.size - primary.length

  const take = (candidates: Phrase[]): Phrase[] => {
    const out: Phrase[] = []
    for (const p of candidates) {
      if (remaining <= 0) break
      if (used.has(p.id)) continue
      used.add(p.id)
      out.push(p)
      remaining--
    }
    return out
  }

  const fromDue = fill.fillDue ? take(phrases.filter((p) => isDue(p.progress, now)).sort(byOverdue)) : []
  const fromOtherNew = fill.fillOtherNew ? take(phrases.filter((p) => p.progress.status === 'new')) : []
  const fromUpcoming =
    fill.fillDue || fill.fillOtherNew
      ? take(
          phrases
            .filter((p) => p.progress.status !== 'new' && !isDue(p.progress, now))
            .sort(byOverdue),
        )
      : []

  const selected = [...primary, ...fromDue, ...fromOtherNew, ...fromUpcoming]
  return { primary, fromDue, fromOtherNew, fromUpcoming, selected, shortBy: config.size - selected.length }
}

export function buildStages(selected: Phrase[], seed: number): string[][] {
  const ids = shuffle(
    selected.map((p) => p.id),
    createRng(seed),
  )
  return splitStages(ids)
}
