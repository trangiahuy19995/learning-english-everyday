import { CheckCircle2, Lightbulb, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { clozeHint, isClozeCorrect, normalizeAnswer } from '@/domain/exercises'
import type { ActiveSession, Exercise, Phrase } from '@/domain/types'
import { sessionActions } from '@/store/sessionStore'
import { Button } from '../components/Button'
import { HighlightedSentence, IpaText, SpeakButton } from '../components/PhraseBits'
import { cx } from '../theme'

type Feedback = null | { correct: boolean; final: boolean }

export function PracticeView({ session, byId }: { session: ActiveSession; byId: Map<string, Phrase> }) {
  const ex = session.exercises[session.exerciseIndex]
  if (!ex || !byId.get(ex.phraseId)) {
    // Nothing to practise in this stage.
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="font-bold text-ink-soft">Không có bài luyện tập cho chặng này.</p>
        <Button onClick={() => sessionActions.nextExercise()}>Tiếp tục</Button>
      </div>
    )
  }
  return (
    <ExerciseView
      key={ex.id}
      exercise={ex}
      phrase={byId.get(ex.phraseId)!}
      index={session.exerciseIndex}
      total={session.exercises.length}
      alreadyAnswered={!!session.results[ex.id]}
    />
  )
}

function ExerciseView({
  exercise: ex,
  phrase,
  index,
  total,
  alreadyAnswered,
}: {
  exercise: Exercise
  phrase: Phrase
  index: number
  total: number
  alreadyAnswered: boolean
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>(alreadyAnswered ? { correct: true, final: true } : null)
  const [showHint, setShowHint] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const isCloze = ex.kind === 'cloze'
  const done = feedback?.final ?? false

  useEffect(() => {
    if (isCloze) inputRef.current?.focus()
  }, [isCloze])

  const submit = (value: string) => {
    if (done || !value.trim()) return
    const correct = isCloze ? isClozeCorrect(value, ex.answer) : normalizeAnswer(value) === normalizeAnswer(ex.answer)
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    if (correct) {
      sessionActions.recordResult(ex.id, nextAttempts === 1, value)
      setFeedback({ correct: true, final: true })
    } else if (nextAttempts >= 2) {
      sessionActions.recordResult(ex.id, false, value)
      setFeedback({ correct: false, final: true })
    } else {
      setFeedback({ correct: false, final: false })
      setShakeKey((k) => k + 1)
    }
  }

  const reveal = () => {
    sessionActions.recordResult(ex.id, false, '')
    setFeedback({ correct: false, final: true })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && done) {
        e.preventDefault()
        sessionActions.nextExercise()
        return
      }
      if (!isCloze && !done && ex.options && /^[1-4]$/.test(e.key)) {
        const opt = ex.options[Number(e.key) - 1]
        if (opt) {
          setSelected(opt)
          submit(opt)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const prompt =
    ex.kind === 'mcq-meaning'
      ? 'Chọn nghĩa tiếng Việt đúng'
      : ex.kind === 'mcq-synonym'
        ? 'Chọn cụm đồng nghĩa phù hợp với ngữ cảnh'
        : 'Điền cụm từ thích hợp vào chỗ trống'

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-sm font-extrabold tracking-wide text-ink-muted uppercase">
        Luyện tập {index + 1}/{total}
      </p>
      <h2 className="mt-2 text-2xl font-black md:text-3xl">{prompt}</h2>

      <div key={shakeKey} className={cx('mt-6 flex-1', shakeKey > 0 && 'animate-shake')}>
        {ex.kind === 'mcq-meaning' && (
          <div className="flex items-center gap-4 rounded-3xl border-2 border-line bg-white p-5">
            <SpeakButton text={phrase.phrase} />
            <div>
              <p className="text-2xl font-black">{phrase.phrase}</p>
              <IpaText ipa={phrase.ipa} />
            </div>
          </div>
        )}

        {ex.kind === 'mcq-synonym' && (
          <div className="rounded-3xl border-2 border-line bg-white p-5">
            {ex.sentenceEn ? (
              <p className="text-lg leading-relaxed font-semibold">
                <HighlightedSentence sentence={ex.sentenceEn} phrase={phrase.phrase} highlight={ex.highlight} />
              </p>
            ) : (
              <p className="text-2xl font-black">{phrase.phrase}</p>
            )}
            <p className="mt-2 text-sm font-semibold text-ink-soft">Cụm được tô sáng có thể thay bằng cụm nào?</p>
          </div>
        )}

        {isCloze && (
          <div className="rounded-3xl border-2 border-line bg-white p-5">
            <p className="text-lg leading-loose font-semibold">
              <HighlightedSentence sentence={ex.sentenceEn ?? ''} phrase={phrase.phrase} highlight={ex.highlight} blank={!done} />
            </p>
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-sun-soft p-3 text-ink-soft">
              <span className="mt-0.5 rounded-md bg-coral px-1.5 text-[10px] leading-5 font-black text-white">VI</span>
              <span className="font-semibold">{ex.sentenceVi}</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-ink-muted">
              Gợi ý nghĩa: <span className="text-ink-soft">{phrase.meaning_vi}</span>
            </p>
          </div>
        )}

        {ex.options && !isCloze && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {ex.options.map((opt, i) => {
              const isAnswer = normalizeAnswer(opt) === normalizeAnswer(ex.answer)
              const isPicked = selected === opt
              const state = done ? (isAnswer ? 'right' : isPicked ? 'wrong' : 'idle') : isPicked && feedback && !feedback.correct ? 'wrong' : 'idle'
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={done || (state === 'wrong' && !done)}
                  onClick={() => {
                    setSelected(opt)
                    submit(opt)
                  }}
                  className={cx(
                    'flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-bold transition-[transform,box-shadow] active:translate-y-[3px] active:shadow-none',
                    state === 'right' && 'animate-pop border-grass bg-grass-soft text-grass-dark shadow-[0_4px_0_var(--color-grass)]',
                    state === 'wrong' && 'border-coral bg-coral-soft text-coral-dark shadow-[0_4px_0_var(--color-coral)]',
                    state === 'idle' && 'border-line bg-white shadow-[0_4px_0_var(--color-line)] hover:bg-canvas',
                    done && state === 'idle' && 'opacity-60',
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-current/25 text-xs font-black">
                    {i + 1}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {isCloze && (
          <form
            className="mt-5 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (!done) submit(input)
            }}
          >
            <input
              ref={inputRef}
              value={input}
              disabled={done}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập cụm từ tiếng Anh…"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Câu trả lời"
              className={cx(
                'h-14 w-full rounded-2xl border-2 bg-white px-4 text-lg font-bold outline-none focus:border-sky',
                feedback && !feedback.correct ? 'border-coral' : feedback?.correct ? 'border-grass' : 'border-line',
              )}
            />
            {!done && (
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={!input.trim()}>
                  Kiểm tra
                </Button>
                <Button variant="ghost" icon={<Lightbulb className="size-4" />} onClick={() => setShowHint(true)}>
                  Gợi ý
                </Button>
                <Button variant="ghost" onClick={reveal}>
                  Xem đáp án
                </Button>
                {showHint && <span className="font-ipa text-lg tracking-widest text-sky-dark">{clozeHint(ex.answer)}</span>}
              </div>
            )}
          </form>
        )}

        {feedback && !feedback.final && (
          <p className="mt-4 font-bold text-coral-dark" role="status">
            Chưa đúng, thử lại một lần nữa nhé!
          </p>
        )}
      </div>

      {done && (
        <div
          className={cx(
            'sticky bottom-0 -mx-4 mt-6 animate-rise border-t-2 px-4 py-5 md:-mx-6 md:rounded-3xl md:border-2 md:px-6',
            feedback?.correct ? 'border-grass/40 bg-grass-soft' : 'border-coral/40 bg-coral-soft',
          )}
          role="status"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-start gap-3">
              {feedback?.correct ? (
                <CheckCircle2 className="size-8 shrink-0 text-grass" />
              ) : (
                <XCircle className="size-8 shrink-0 text-coral" />
              )}
              <div>
                <p className={cx('text-xl font-black', feedback?.correct ? 'text-grass-dark' : 'text-coral-dark')}>
                  {feedback?.correct ? (attempts > 1 ? 'Đúng rồi!' : 'Tuyệt vời!') : 'Đáp án đúng:'}
                </p>
                <p className="font-bold text-ink">
                  {isCloze ? ex.answer : !feedback?.correct ? ex.answer : `${phrase.phrase} — ${phrase.meaning_vi}`}
                </p>
              </div>
            </div>
            <Button variant={feedback?.correct ? 'primary' : 'danger'} onClick={() => sessionActions.nextExercise()} autoFocus>
              Tiếp tục
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
