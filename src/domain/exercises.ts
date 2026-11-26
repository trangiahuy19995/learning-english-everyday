import { createRng, shuffle } from './random'
import type { Exercise, Phrase } from './types'

export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,!?;:]+$/g, '')
    .trim()
}

export function isClozeCorrect(input: string, expected: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(expected)
}

/** Finds the substring to highlight in a sentence. */
export function findHighlight(sentence: string, highlight: string | undefined, phrase: string): string | null {
  if (highlight && sentence.includes(highlight)) return highlight
  const idx = sentence.toLowerCase().indexOf(phrase.toLowerCase())
  if (idx >= 0) return sentence.slice(idx, idx + phrase.length)
  return null
}

export function splitByHighlight(sentence: string, hl: string | null): [string, string, string] | null {
  if (!hl) return null
  const i = sentence.indexOf(hl)
  if (i < 0) return null
  return [sentence.slice(0, i), hl, sentence.slice(i + hl.length)]
}

export function clozeHint(answer: string): string {
  return answer
    .split(' ')
    .map((w) => (w.length ? w[0] + '_'.repeat(Math.max(0, w.length - 1)) : w))
    .join(' ')
}

function pickDistractors(values: string[], answer: string, count: number, rng: () => number): string[] {
  const seen = new Set([normalizeAnswer(answer)])
  const out: string[] = []
  for (const v of shuffle(values, rng)) {
    const k = normalizeAnswer(v)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(v)
    if (out.length >= count) break
  }
  return out
}

function meaningMcq(p: Phrase, pool: Phrase[], rng: () => number): Exercise {
  const sameTopic = pool.filter((o) => o.id !== p.id && o.topic === p.topic).map((o) => o.meaning_vi)
  const others = pool.filter((o) => o.id !== p.id && o.topic !== p.topic).map((o) => o.meaning_vi)
  let distractors = pickDistractors(sameTopic, p.meaning_vi, 3, rng)
  if (distractors.length < 3) {
    distractors = [...distractors, ...pickDistractors(others, p.meaning_vi, 3 - distractors.length, rng)]
  }
  return {
    id: `${p.id}:mcq-meaning`,
    phraseId: p.id,
    kind: 'mcq-meaning',
    options: shuffle([p.meaning_vi, ...distractors], rng),
    answer: p.meaning_vi,
  }
}

function synonymMcq(p: Phrase, pool: Phrase[], rng: () => number): Exercise | null {
  if (!p.synonyms.length) return null
  const answer = shuffle(p.synonyms, rng)[0].text
  const ownTexts = new Set([p.phrase, ...p.synonyms.map((s) => s.text)].map(normalizeAnswer))
  const candidates = pool
    .filter((o) => o.id !== p.id)
    .flatMap((o) => [o.phrase, ...o.synonyms.map((s) => s.text)])
    .filter((t) => !ownTexts.has(normalizeAnswer(t)))
  const distractors = pickDistractors(candidates, answer, 3, rng)
  if (distractors.length < 1) return null
  const ex = p.examples[0]
  return {
    id: `${p.id}:mcq-synonym`,
    phraseId: p.id,
    kind: 'mcq-synonym',
    options: shuffle([answer, ...distractors], rng),
    answer,
    sentenceEn: ex?.en,
    sentenceVi: ex?.vi,
    highlight: ex ? (findHighlight(ex.en, ex.highlight, p.phrase) ?? undefined) : undefined,
  }
}

function clozeExercise(p: Phrase, rng: () => number): Exercise | null {
  const candidates = shuffle(p.examples, rng)
  for (const ex of candidates) {
    const hl = findHighlight(ex.en, ex.highlight, p.phrase)
    if (hl) {
      return {
        id: `${p.id}:cloze`,
        phraseId: p.id,
        kind: 'cloze',
        answer: hl,
        sentenceEn: ex.en,
        sentenceVi: ex.vi,
        highlight: hl,
      }
    }
  }
  return null
}

/** Two exercises per phrase, shuffled within the stage. */
export function buildStageExercises(stage: Phrase[], pool: Phrase[], seed: number): Exercise[] {
  const rng = createRng(seed)
  const exercises: Exercise[] = []
  stage.forEach((p, i) => {
    const first = i % 2 === 1 ? (synonymMcq(p, pool, rng) ?? meaningMcq(p, pool, rng)) : meaningMcq(p, pool, rng)
    exercises.push(first)
    const second = clozeExercise(p, rng)
    if (second) exercises.push(second)
    else if (first.kind !== 'mcq-synonym') {
      const syn = synonymMcq(p, pool, rng)
      if (syn) exercises.push(syn)
    } else exercises.push(meaningMcq(p, pool, rng))
  })
  return shuffle(exercises, rng).filter((e) => e.kind === 'cloze' || (e.options?.length ?? 0) >= 2)
}
