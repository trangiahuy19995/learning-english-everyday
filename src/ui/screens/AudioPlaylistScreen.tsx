import { Pause, Play, Repeat, SkipBack, SkipForward, VolumeX } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Phrase } from '@/domain/types'
import { cancelSpeech, hasVoice, speak, speechSupported } from '@/lib/speech'
import { useStore } from '@/store/createStore'
import { libraryStore } from '@/store/phraseStore'
import { activeSessionStore } from '@/store/sessionStore'
import { settingsStore, updateSettings } from '@/store/settingsStore'
import { Card, Chip, EmptyState, Toggle } from '../components/Primitives'
import { IpaText } from '../components/PhraseBits'
import { PageHeader } from '../layout/AppShell'
import { DECK_THEME, cx } from '../theme'

type Part = 'phrase' | 'meaning' | 'exEn' | 'exVi'
const PARTS: Part[] = ['phrase', 'meaning', 'exEn', 'exVi']
const RATES = [0.75, 1, 1.25]
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function AudioPlaylistScreen({ deckId }: { deckId?: string }) {
  const { decks, phrases } = useStore(libraryStore)
  const session = useStore(activeSessionStore)
  const settings = useStore(settingsStore)
  const [source, setSource] = useState<string>(deckId ?? (session ? 'session' : 'all'))
  const [playing, setPlaying] = useState(false)
  const [index, setIndex] = useState(0)
  const [part, setPart] = useState<Part | null>(null)
  const [loop, setLoop] = useState(false)
  const runRef = useRef(0)
  const viVoice = speechSupported && hasVoice('vi')

  const items: Phrase[] = useMemo(() => {
    if (source === 'session' && session) {
      const map = new Map(phrases.map((p) => [p.id, p]))
      return session.phraseIds.map((id) => map.get(id)).filter((p): p is Phrase => !!p)
    }
    if (source === 'all') return phrases
    return phrases.filter((p) => p.topic === source)
  }, [source, session, phrases])

  const stop = () => {
    runRef.current++
    cancelSpeech()
    setPlaying(false)
    setPart(null)
  }

  useEffect(() => stop, [])
  useEffect(() => {
    stop()
    setIndex(0)
  }, [source])

  const play = async (start: number) => {
    cancelSpeech()
    const run = ++runRef.current
    setPlaying(true)
    let i = start
    while (runRef.current === run) {
      if (i >= items.length) {
        if (!loop || !items.length) break
        i = 0
      }
      setIndex(i)
      const p = items[i]
      const ex = p.examples[0]
      const { speechRate: rate, playlistSkipVi: skipVi } = settingsStore.get()
      for (const pt of PARTS) {
        if (runRef.current !== run) return
        const isVi = pt === 'meaning' || pt === 'exVi'
        if (isVi && skipVi) continue
        const text = pt === 'phrase' ? p.phrase : pt === 'meaning' ? p.meaning_vi : pt === 'exEn' ? ex?.en : ex?.vi
        if (!text) continue
        setPart(pt)
        if (isVi && !viVoice) await wait(1800 / rate)
        else await speak(text, isVi ? 'vi' : 'en', rate)
        if (runRef.current !== run) return
        await wait(600)
      }
      await wait(1200)
      i++
    }
    if (runRef.current === run) {
      setPlaying(false)
      setPart(null)
    }
  }

  const jump = (to: number) => {
    const next = Math.max(0, Math.min(items.length - 1, to))
    setIndex(next)
    if (playing) play(next)
  }

  useEffect(() => {
    document.getElementById(`pl-${index}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [index])

  const current = items[index]

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Nghe thụ động" subtitle="Cụm từ → nghĩa tiếng Việt → câu ví dụ, phát liên tục." />

      {!speechSupported && (
        <Card className="mb-5 flex items-center gap-3 border-coral bg-coral-soft p-4">
          <VolumeX className="size-5 text-coral-dark" />
          <p className="text-sm font-bold">Trình duyệt này không hỗ trợ đọc văn bản (Web Speech API).</p>
        </Card>
      )}
      {speechSupported && !viVoice && !settings.playlistSkipVi && (
        <Card className="mb-5 border-sun bg-sun-soft p-4">
          <p className="text-sm font-bold text-ink-soft">
            Thiết bị chưa có giọng đọc tiếng Việt — phần nghĩa sẽ chỉ hiển thị chữ. Bạn có thể cài thêm giọng vi-VN trong cài đặt hệ điều hành.
          </p>
        </Card>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {session && (
          <Chip selected={source === 'session'} onClick={() => setSource('session')}>
            Phiên gần nhất
          </Chip>
        )}
        <Chip selected={source === 'all'} onClick={() => setSource('all')}>
          Tất cả
        </Chip>
        {decks.map((d) => {
          const t = DECK_THEME[d.color]
          return (
            <Chip key={d.id} selected={source === d.id} onClick={() => setSource(d.id)} selectedClass={cx(t.border, t.soft, t.text)}>
              <span className={cx('size-2.5 rounded-full', t.bg)} />
              {d.name}
            </Chip>
          )
        })}
      </div>

      {!items.length ? (
        <EmptyState icon={<VolumeX className="size-7" />} title="Chưa có cụm từ để phát">
          Chọn nguồn khác hoặc thêm cụm từ vào bộ từ.
        </EmptyState>
      ) : (
        <>
          <Card className="sticky top-3 z-10 overflow-hidden bg-sky p-0 text-white shadow-[0_6px_0_var(--color-sky-dark)]">
            <div className="p-6">
              <p className="text-xs font-extrabold tracking-wider text-white/75 uppercase">
                {index + 1}/{items.length}
              </p>
              <p className={cx('mt-1 text-2xl font-black md:text-3xl', part === 'phrase' && 'underline decoration-sun decoration-4 underline-offset-8')}>
                {current?.phrase}
              </p>
              <p className={cx('mt-2 text-lg font-bold text-white/90', part === 'meaning' && 'text-sun')}>{current?.meaning_vi}</p>
              {current?.examples[0] && (
                <div className="mt-3 text-sm leading-relaxed">
                  <p className={cx('font-semibold', part === 'exEn' ? 'text-sun' : 'text-white/85')}>{current.examples[0].en}</p>
                  <p className={cx(part === 'exVi' ? 'text-sun' : 'text-white/70')}>{current.examples[0].vi}</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 bg-sky-dark/40 px-6 py-4">
              <button type="button" aria-label="Trước" onClick={() => jump(index - 1)} className="rounded-xl p-2 hover:bg-white/15">
                <SkipBack className="size-6 fill-current" />
              </button>
              <button
                type="button"
                aria-label={playing ? 'Tạm dừng' : 'Phát'}
                disabled={!speechSupported}
                onClick={() => (playing ? stop() : play(index))}
                className="flex size-14 items-center justify-center rounded-2xl bg-white text-sky-dark shadow-[0_4px_0_rgba(0,0,0,0.15)] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
              >
                {playing ? <Pause className="size-7 fill-current" /> : <Play className="size-7 fill-current" />}
              </button>
              <button type="button" aria-label="Tiếp" onClick={() => jump(index + 1)} className="rounded-xl p-2 hover:bg-white/15">
                <SkipForward className="size-6 fill-current" />
              </button>
              <button
                type="button"
                aria-label="Lặp lại"
                aria-pressed={loop}
                onClick={() => setLoop((l) => !l)}
                className={cx('rounded-xl p-2', loop ? 'bg-white text-sky-dark' : 'hover:bg-white/15')}
              >
                <Repeat className="size-5" />
              </button>
              <div className="ml-auto flex gap-1 rounded-xl bg-white/15 p-1">
                {RATES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => updateSettings({ speechRate: r })}
                    className={cx('rounded-lg px-2.5 py-1 text-sm font-extrabold', settings.speechRate === r ? 'bg-white text-sky-dark' : 'text-white')}
                  >
                    {r}×
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="mt-4">
            <Toggle checked={settings.playlistSkipVi} onChange={(v) => updateSettings({ playlistSkipVi: v })} label="Bỏ qua phần tiếng Việt" />
          </div>

          <ol className="mt-5 flex flex-col gap-2">
            {items.map((p, i) => (
              <li key={p.id} id={`pl-${i}`}>
                <button
                  type="button"
                  onClick={() => jump(i)}
                  className={cx(
                    'flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left transition-colors',
                    i === index ? 'border-sky bg-sky-soft' : 'border-line bg-white hover:bg-canvas',
                  )}
                >
                  <span className={cx('w-6 text-sm font-black', i === index ? 'text-sky-dark' : 'text-ink-muted')}>{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-black">{p.phrase}</span>
                    <span className="block truncate text-sm">
                      <IpaText ipa={p.ipa} className="mr-2" />
                      <span className="font-semibold text-ink-soft">{p.meaning_vi}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}
