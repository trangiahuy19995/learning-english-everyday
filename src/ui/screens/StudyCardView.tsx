import { ArrowLeft, ArrowRight, Eye, EyeOff, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ActiveSession, Deck, Phrase } from '@/domain/types'
import { phraseStore } from '@/store/phraseStore'
import { useStore } from '@/store/createStore'
import { sessionActions } from '@/store/sessionStore'
import { settingsStore, updateSettings } from '@/store/settingsStore'
import { Button, IconButton } from '../components/Button'
import { HighlightedSentence, IpaText, SpeakButton } from '../components/PhraseBits'
import { Badge, Card, Toggle } from '../components/Primitives'
import { DECK_THEME, cx } from '../theme'

function Concealed({ hidden, children, label }: { hidden: boolean; children: React.ReactNode; label: string }) {
  const [revealed, setRevealed] = useState(false)
  useEffect(() => setRevealed(false), [hidden, children])
  if (!hidden || revealed) return <>{children}</>
  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="relative inline-flex items-center gap-2 rounded-xl text-left"
      aria-label={`Hiện ${label}`}
    >
      <span className="blur-md select-none" aria-hidden>
        {children}
      </span>
      <span className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs font-extrabold tracking-wide text-ink-muted uppercase">
        <Eye className="size-4" /> Chạm để hiện
      </span>
    </button>
  )
}

export function StudyCardView({ session, stage, decks }: { session: ActiveSession; stage: Phrase[]; decks: Deck[] }) {
  const settings = useStore(settingsStore)
  const index = Math.min(session.cardIndex, stage.length - 1)
  const p = stage[index]
  const isLast = index >= stage.length - 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.key === 'ArrowRight') isLast ? sessionActions.startPractice() : sessionActions.setCard(index + 1)
      if (e.key === 'ArrowLeft' && index > 0) sessionActions.setCard(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, isLast])

  if (!p) return null
  const deck = decks.find((d) => d.id === p.topic)
  const theme = deck ? DECK_THEME[deck.color] : DECK_THEME.blue

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-extrabold tracking-wide text-ink-muted uppercase">
          Thẻ học {index + 1}/{stage.length}
        </p>
        <div className="flex flex-wrap gap-4">
          <Toggle checked={settings.hideMeaning} onChange={(v) => updateSettings({ hideMeaning: v })} label="Ẩn nghĩa" />
          <Toggle checked={settings.hideIpa} onChange={(v) => updateSettings({ hideIpa: v })} label="Ẩn IPA" />
        </div>
      </div>

      <Card key={p.id} className="animate-rise overflow-hidden shadow-[0_6px_0_var(--color-line)]">
        <div className={cx('h-2', theme.bg)} />
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {deck && <Badge className={cx(theme.soft, theme.text)}>{deck.name}</Badge>}
              {p.progress.status !== 'new' && <Badge className="bg-grape-soft text-grape-dark">Ôn tập</Badge>}
            </div>
            <IconButton
              label={p.starred ? 'Bỏ đánh dấu khó' : 'Đánh dấu từ khó'}
              active={p.starred}
              onClick={() => phraseStore.toggleStar(p.id)}
            >
              <Star className={cx('size-5', p.starred && 'fill-sun')} />
            </IconButton>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <SpeakButton text={p.phrase} size="lg" />
            <div className="min-w-0">
              <h1 className="text-3xl leading-tight font-black tracking-tight break-words md:text-[2.5rem]">{p.phrase}</h1>
              <div className="mt-1 text-lg">
                <Concealed hidden={settings.hideIpa} label="phiên âm">
                  <IpaText ipa={p.ipa} />
                </Concealed>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-grass-soft p-4">
            <p className="text-xs font-extrabold tracking-wider text-grass-dark uppercase">Nghĩa tiếng Việt</p>
            <div className="mt-1 text-xl font-extrabold text-ink">
              <Concealed hidden={settings.hideMeaning} label="nghĩa">
                {p.meaning_vi}
              </Concealed>
            </div>
            {p.nuance_vi && <p className="mt-2 text-sm font-semibold text-ink-soft">{p.nuance_vi}</p>}
          </div>

          {p.synonyms.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-extrabold tracking-wider text-ink-muted uppercase">Đồng nghĩa / tương đương</p>
              <ul className="mt-2 flex flex-col gap-2">
                {p.synonyms.map((s) => (
                  <li key={s.text} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="rounded-lg bg-sky-soft px-2 py-0.5 font-extrabold text-sky-dark">{s.text}</span>
                    {s.note_vi && <span className="text-sm font-semibold text-ink-soft">{s.note_vi}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.examples.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-extrabold tracking-wider text-ink-muted uppercase">Ví dụ</p>
              <ul className="mt-2 flex flex-col gap-3">
                {p.examples.map((ex, i) => (
                  <li key={i} className="rounded-2xl border-2 border-line p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 rounded-md bg-ink px-1.5 text-[10px] leading-5 font-black text-white">EN</span>
                      <HighlightedSentence
                        sentence={ex.en}
                        phrase={p.phrase}
                        highlight={ex.highlight}
                        className="flex-1 text-base leading-relaxed font-semibold"
                      />
                      <SpeakButton text={ex.en} size="sm" label="Phát âm câu ví dụ" />
                    </div>
                    <div className="mt-2 flex items-start gap-3">
                      <span className="mt-0.5 rounded-md bg-coral px-1.5 text-[10px] leading-5 font-black text-white">VI</span>
                      <span className="flex-1 leading-relaxed text-ink-soft">
                        <Concealed hidden={settings.hideMeaning} label="bản dịch">
                          {ex.vi}
                        </Concealed>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <Button
          variant="secondary"
          icon={<ArrowLeft className="size-5" />}
          disabled={index === 0}
          onClick={() => sessionActions.setCard(index - 1)}
        >
          <span className="hidden sm:inline">Trước</span>
        </Button>
        <div className="hidden gap-1.5 sm:flex" aria-hidden>
          {stage.map((s, i) => (
            <span key={s.id} className={cx('h-2 rounded-full transition-all', i === index ? 'w-6 bg-grass' : i < index ? 'w-2 bg-grass/50' : 'w-2 bg-line')} />
          ))}
        </div>
        {isLast ? (
          <Button onClick={() => sessionActions.startPractice()}>Bắt đầu luyện tập</Button>
        ) : (
          <Button onClick={() => sessionActions.setCard(index + 1)}>
            Tiếp <ArrowRight className="size-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
