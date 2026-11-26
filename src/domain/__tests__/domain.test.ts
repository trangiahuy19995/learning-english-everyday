import { describe, expect, it } from 'vitest'
import { createSamplePhrases, SAMPLE_DECKS } from '@/data/sampleData'
import { parseCsv } from '../csv'
import { addLocalDays, dayKey } from '../dates'
import { buildStageExercises, clozeHint, findHighlight, isClozeCorrect } from '../exercises'
import { applyImport, exportCsv, exportJson, parseCsvImport, parseJsonImport } from '../importExport'
import { planSession } from '../sessionBuilder'
import { estimateMinutes, splitStages, validateSessionSize } from '../sessionConfig'
import { MIN_EASE, newProgress, review } from '../srsEngine'
import { computeStreak } from '../stats'
import type { Phrase, SessionConfig } from '../types'

const NOW = new Date(2025, 5, 15, 10).getTime()

describe('sessionConfig', () => {
  it('validates bounds', () => {
    expect(validateSessionSize(4).ok).toBe(false)
    expect(validateSessionSize(5)).toEqual({ ok: true, value: 5 })
    expect(validateSessionSize('60')).toEqual({ ok: true, value: 60 })
    expect(validateSessionSize(61).ok).toBe(false)
    expect(validateSessionSize('').ok).toBe(false)
    expect(validateSessionSize('7.5').ok).toBe(false)
    expect(validateSessionSize('abc').ok).toBe(false)
  })
  it('estimates minutes', () => {
    expect(estimateMinutes(5)).toEqual({ min: 3, max: 5 })
    expect(estimateMinutes(30).min).toBe(15)
    expect(estimateMinutes(60).min).toBe(30)
    expect(estimateMinutes(60).max).toBeLessThanOrEqual(45)
  })
  it('splits stages', () => {
    expect(splitStages(Array(20).fill(0)).length).toBe(1)
    expect(splitStages(Array(21).fill(0)).map((s) => s.length)).toEqual([10, 10, 1])
    expect(splitStages(Array(60).fill(0)).length).toBe(6)
  })
})

describe('srsEngine', () => {
  it('grows intervals and resets on lapse', () => {
    let p = review(newProgress(), 4, NOW)
    expect(p.intervalDays).toBe(1)
    expect(p.status).toBe('learning')
    p = review(p, 4, NOW)
    expect(p.intervalDays).toBe(6)
    expect(p.status).toBe('review')
    p = review(p, 4, NOW)
    expect(p.intervalDays).toBe(15)
    p = review(p, 5, NOW)
    expect(p.status).toBe('mastered')
    const lapsed = review(p, 1, NOW)
    expect(lapsed.repetitions).toBe(0)
    expect(lapsed.nextReviewAt).toBe(NOW + 10 * 60 * 1000)
    expect(lapsed.lapses).toBe(1)
  })
  it('keeps ease above minimum', () => {
    let p = newProgress()
    for (let i = 0; i < 20; i++) p = review(p, 1, NOW)
    expect(p.easeFactor).toBe(MIN_EASE)
  })
})

describe('sessionBuilder', () => {
  // Fixture: the original 4 decks (5 phrases each), so shortages are predictable.
  const original = new Set(['deck-giao-tiep', 'deck-cong-so', 'deck-du-lich', 'deck-ielts'])
  const phrases = createSamplePhrases()
    .filter((p) => original.has(p.topic))
    .filter((p, i, all) => all.filter((q) => q.topic === p.topic).indexOf(p) < 5)
  const base: SessionConfig = { size: 10, source: 'new', deckIds: ['deck-giao-tiep'], starredOnly: false }
  it('fills from other decks when short', () => {
    const plan = planSession(base, phrases, NOW)
    expect(plan.primary.length).toBe(5)
    expect(plan.fromOtherNew.length).toBe(5)
    expect(plan.selected.length).toBe(10)
  })
  it('respects disabled fill', () => {
    const plan = planSession(base, phrases, NOW, { fillDue: false, fillOtherNew: false })
    expect(plan.selected.length).toBe(5)
    expect(plan.shortBy).toBe(5)
  })
  it('prioritises due items', () => {
    const withDue: Phrase[] = phrases.map((p, i) =>
      i < 3 ? { ...p, progress: { ...review(newProgress(), 4, NOW - 5 * 86400000) } } : p,
    )
    const plan = planSession({ ...base, deckIds: [], source: 'mixed' }, withDue, NOW)
    expect(plan.selected.slice(0, 3).map((p) => p.id)).toEqual(withDue.slice(0, 3).map((p) => p.id))
  })
  it('reports shortage when library too small', () => {
    const plan = planSession({ ...base, size: 60, deckIds: [] }, phrases, NOW)
    expect(plan.selected.length).toBe(20)
    expect(plan.shortBy).toBe(40)
  })
})

describe('exercises', () => {
  it('normalises answers', () => {
    expect(isClozeCorrect('  Took a  Rain check. ', 'took a rain check')).toBe(true)
    expect(isClozeCorrect('take a rain check', 'took a rain check')).toBe(false)
    expect(clozeHint('hit it off')).toBe('h__ i_ o__')
  })
  it('finds highlights with fallback', () => {
    expect(findHighlight('She took a rain check.', 'took a rain check', 'take a rain check')).toBe('took a rain check')
    expect(findHighlight('Let us Break the ice.', undefined, 'break the ice')).toBe('Break the ice')
    expect(findHighlight('Nothing here', undefined, 'break the ice')).toBeNull()
  })
  it('builds two exercises per phrase', () => {
    const phrases = createSamplePhrases()
    const ex = buildStageExercises(phrases.slice(0, 10), phrases, 42)
    expect(ex.length).toBe(20)
    for (const e of ex) if (e.options) expect(e.options).toContain(e.answer)
  })
})

describe('csv & import/export', () => {
  it('parses quoted fields', () => {
    expect(parseCsv('a,b\n"x, y","he said ""hi""\nnext"')).toEqual([
      ['a', 'b'],
      ['x, y', 'he said "hi"\nnext'],
    ])
  })
  it('round-trips CSV', () => {
    const phrases = createSamplePhrases()
    const csv = exportCsv(SAMPLE_DECKS, phrases)
    const parsed = parseCsvImport(csv)
    expect(parsed.errors).toEqual([])
    expect(parsed.drafts.length).toBe(phrases.length)
    expect(parsed.drafts[0].examples[1].highlight).toBe('took a rain check')
    const merged = applyImport(SAMPLE_DECKS, phrases, parsed, 'merge')
    expect(merged.added).toBe(0)
    expect(merged.updated).toBe(phrases.length)
  })
  it('round-trips JSON and reports errors', () => {
    const phrases = createSamplePhrases()
    const json = exportJson(SAMPLE_DECKS, phrases, true)
    const parsed = parseJsonImport(json)
    expect(parsed.drafts.length).toBe(phrases.length)
    const replaced = applyImport([], [], parsed, 'replace')
    expect(replaced.decks.length).toBe(SAMPLE_DECKS.length)
    expect(parseJsonImport('{bad').errors.length).toBe(1)
    expect(parseCsvImport('phrase,meaning_vi\n,abc').errors[0]).toContain('Dòng 2')
  })
})

describe('stats', () => {
  it('computes streak', () => {
    const days = { [dayKey(addLocalDays(NOW, -1))]: 5, [dayKey(addLocalDays(NOW, -2))]: 3 }
    expect(computeStreak({ days }, NOW)).toEqual({ streak: 2, studiedToday: false })
    expect(computeStreak({ days: { ...days, [dayKey(NOW)]: 1 } }, NOW)).toEqual({ streak: 3, studiedToday: true })
    expect(computeStreak({ days: {} }, NOW).streak).toBe(0)
  })
})
