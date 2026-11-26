import { parseCsv, serializeCsv } from './csv'
import { uid } from './random'
import { deriveStatus, newProgress } from './srsEngine'
import type { Deck, DeckColor, Example, Phrase, Progress, Synonym } from './types'

export const CSV_COLUMNS = ['phrase', 'ipa', 'meaning_vi', 'nuance_vi', 'topic', 'synonyms', 'examples'] as const
export const DECK_COLORS: DeckColor[] = ['green', 'blue', 'orange', 'purple', 'pink', 'teal']

export interface ExportBundle {
  app: 'cumtu'
  schemaVersion: 1
  exportedAt: string
  decks: Deck[]
  phrases: Phrase[]
}

export interface ImportDraft {
  phrase: string
  ipa: string
  meaning_vi: string
  nuance_vi?: string
  deckName: string
  deckId?: string
  id?: string
  synonyms: Synonym[]
  examples: Example[]
  starred?: boolean
  progress?: Progress
}

export interface ImportParseResult {
  drafts: ImportDraft[]
  errors: string[]
  decks: Deck[]
}

export function exportJson(decks: Deck[], phrases: Phrase[], includeProgress: boolean): string {
  const bundle: ExportBundle = {
    app: 'cumtu',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    decks,
    phrases: includeProgress ? phrases : phrases.map((p) => ({ ...p, starred: false, progress: newProgress() })),
  }
  return JSON.stringify(bundle, null, 2)
}

export function exportCsv(decks: Deck[], phrases: Phrase[]): string {
  const deckName = new Map(decks.map((d) => [d.id, d.name]))
  const rows: string[][] = [[...CSV_COLUMNS]]
  for (const p of phrases) {
    rows.push([
      p.phrase,
      p.ipa,
      p.meaning_vi,
      p.nuance_vi ?? '',
      deckName.get(p.topic) ?? '',
      p.synonyms.map((s) => (s.note_vi ? `${s.text}::${s.note_vi}` : s.text)).join(' ; '),
      p.examples.map((e) => [e.en, e.vi, e.highlight ?? ''].join(' || ')).join(' ;; '),
    ])
  }
  return '\uFEFF' + serializeCsv(rows)
}

function parseSynonyms(cell: string): Synonym[] {
  return cell
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [text, note] = s.split('::').map((x) => x.trim())
      return note ? { text, note_vi: note } : { text }
    })
}

function parseExamples(cell: string): Example[] {
  return cell
    .split(';;')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [en = '', vi = '', highlight = ''] = s.split('||').map((x) => x.trim())
      return highlight ? { en, vi, highlight } : { en, vi }
    })
    .filter((e) => e.en && e.vi)
}

export function parseCsvImport(text: string): ImportParseResult {
  const rows = parseCsv(text)
  const errors: string[] = []
  const drafts: ImportDraft[] = []
  if (!rows.length) return { drafts, errors: ['Tệp CSV trống.'], decks: [] }
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const col = (name: string) => header.indexOf(name)
  for (const required of ['phrase', 'meaning_vi']) {
    if (col(required) < 0) return { drafts, errors: [`Thiếu cột bắt buộc "${required}".`], decks: [] }
  }
  rows.slice(1).forEach((r, i) => {
    const get = (name: string) => (col(name) >= 0 ? (r[col(name)] ?? '').trim() : '')
    const line = i + 2
    const phrase = get('phrase')
    const meaning = get('meaning_vi')
    if (!phrase) return errors.push(`Dòng ${line}: thiếu phrase.`)
    if (!meaning) return errors.push(`Dòng ${line}: thiếu meaning_vi.`)
    drafts.push({
      phrase,
      ipa: get('ipa'),
      meaning_vi: meaning,
      nuance_vi: get('nuance_vi') || undefined,
      deckName: get('topic') || 'Đã nhập',
      synonyms: parseSynonyms(get('synonyms')),
      examples: parseExamples(get('examples')),
    })
  })
  return { drafts, errors, decks: [] }
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function sanitizeProgress(v: unknown): Progress | undefined {
  if (!isObj(v)) return undefined
  const base = newProgress()
  const p: Progress = {
    easeFactor: typeof v.easeFactor === 'number' ? v.easeFactor : base.easeFactor,
    intervalDays: typeof v.intervalDays === 'number' ? v.intervalDays : 0,
    repetitions: typeof v.repetitions === 'number' ? v.repetitions : 0,
    nextReviewAt: typeof v.nextReviewAt === 'number' ? v.nextReviewAt : null,
    lastReviewedAt: typeof v.lastReviewedAt === 'number' ? v.lastReviewedAt : null,
    lapses: typeof v.lapses === 'number' ? v.lapses : 0,
    status: 'new',
  }
  p.status = deriveStatus(p)
  return p
}

export function parseJsonImport(text: string): ImportParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { drafts: [], errors: ['Tệp JSON không hợp lệ.'], decks: [] }
  }
  const rawPhrases = Array.isArray(data) ? data : isObj(data) && Array.isArray(data.phrases) ? data.phrases : null
  if (!rawPhrases) return { drafts: [], errors: ['Không tìm thấy danh sách "phrases".'], decks: [] }
  const decks: Deck[] = []
  if (isObj(data) && Array.isArray(data.decks)) {
    for (const d of data.decks) {
      if (isObj(d) && typeof d.id === 'string' && typeof d.name === 'string') {
        decks.push({
          id: d.id,
          name: d.name,
          color: DECK_COLORS.includes(d.color as DeckColor) ? (d.color as DeckColor) : 'blue',
          description: typeof d.description === 'string' ? d.description : undefined,
          createdAt: typeof d.createdAt === 'number' ? d.createdAt : Date.now(),
        })
      }
    }
  }
  const deckNameById = new Map(decks.map((d) => [d.id, d.name]))
  const errors: string[] = []
  const drafts: ImportDraft[] = []
  rawPhrases.forEach((raw: unknown, i: number) => {
    if (!isObj(raw)) return errors.push(`Mục ${i + 1}: không hợp lệ.`)
    const phrase = typeof raw.phrase === 'string' ? raw.phrase.trim() : ''
    const meaning = typeof raw.meaning_vi === 'string' ? raw.meaning_vi.trim() : ''
    if (!phrase) return errors.push(`Mục ${i + 1}: thiếu phrase.`)
    if (!meaning) return errors.push(`Mục ${i + 1}: thiếu meaning_vi.`)
    const topic = typeof raw.topic === 'string' ? raw.topic : ''
    drafts.push({
      id: typeof raw.id === 'string' ? raw.id : undefined,
      phrase,
      ipa: typeof raw.ipa === 'string' ? raw.ipa : '',
      meaning_vi: meaning,
      nuance_vi: typeof raw.nuance_vi === 'string' && raw.nuance_vi ? raw.nuance_vi : undefined,
      deckId: deckNameById.has(topic) ? topic : undefined,
      deckName: deckNameById.get(topic) ?? (topic || 'Đã nhập'),
      synonyms: Array.isArray(raw.synonyms)
        ? raw.synonyms
            .map((s: unknown) =>
              typeof s === 'string'
                ? { text: s }
                : isObj(s) && typeof s.text === 'string'
                  ? { text: s.text, note_vi: typeof s.note_vi === 'string' ? s.note_vi : undefined }
                  : null,
            )
            .filter((s): s is Synonym => !!s)
        : [],
      examples: Array.isArray(raw.examples)
        ? raw.examples
            .filter((e: unknown): e is Record<string, unknown> => isObj(e) && typeof e.en === 'string' && typeof e.vi === 'string')
            .map((e) => ({
              en: e.en as string,
              vi: e.vi as string,
              highlight: typeof e.highlight === 'string' && e.highlight ? e.highlight : undefined,
            }))
        : [],
      starred: raw.starred === true,
      progress: sanitizeProgress(raw.progress),
    })
  })
  return { drafts, errors, decks }
}

export interface MergeResult {
  decks: Deck[]
  phrases: Phrase[]
  added: number
  updated: number
}

/** Merge drafts into existing data. mode=replace discards existing data. */
export function applyImport(
  existingDecks: Deck[],
  existingPhrases: Phrase[],
  parsed: ImportParseResult,
  mode: 'merge' | 'replace',
  now = Date.now(),
): MergeResult {
  const decks = mode === 'replace' ? [] : existingDecks.slice()
  const phrases = mode === 'replace' ? [] : existingPhrases.slice()
  for (const d of parsed.decks) {
    if (!decks.some((x) => x.id === d.id)) decks.push(d)
  }
  const deckIdFor = (draft: ImportDraft): string => {
    if (draft.deckId && decks.some((d) => d.id === draft.deckId)) return draft.deckId
    const found = decks.find((d) => d.name.toLowerCase() === draft.deckName.toLowerCase())
    if (found) return found.id
    const created: Deck = {
      id: uid('deck'),
      name: draft.deckName,
      color: DECK_COLORS[decks.length % DECK_COLORS.length],
      createdAt: now,
    }
    decks.push(created)
    return created.id
  }
  let added = 0
  let updated = 0
  for (const draft of parsed.drafts) {
    const topic = deckIdFor(draft)
    const idx = phrases.findIndex(
      (p) =>
        (draft.id && p.id === draft.id) ||
        (p.topic === topic && p.phrase.toLowerCase() === draft.phrase.toLowerCase()),
    )
    const content = {
      phrase: draft.phrase,
      ipa: draft.ipa,
      meaning_vi: draft.meaning_vi,
      nuance_vi: draft.nuance_vi,
      synonyms: draft.synonyms,
      examples: draft.examples,
      topic,
    }
    if (idx >= 0) {
      phrases[idx] = {
        ...phrases[idx],
        ...content,
        progress: draft.progress ?? phrases[idx].progress,
        updatedAt: now,
      }
      updated++
    } else {
      phrases.push({
        id: draft.id && !phrases.some((p) => p.id === draft.id) ? draft.id : uid('ph'),
        ...content,
        starred: draft.starred ?? false,
        progress: draft.progress ?? newProgress(),
        createdAt: now,
        updatedAt: now,
      })
      added++
    }
  }
  return { decks, phrases, added, updated }
}
