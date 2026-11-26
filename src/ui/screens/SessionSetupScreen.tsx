import { AlertTriangle, Clock, Layers, Minus, Plus, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { planSession, primaryPool } from '@/domain/sessionBuilder'
import {
  SESSION_MAX,
  SESSION_MIN,
  SESSION_PRESETS,
  STAGE_SIZE,
  STAGE_THRESHOLD,
  estimateMinutes,
  splitStages,
  validateSessionSize,
} from '@/domain/sessionConfig'
import type { SessionConfig, SessionSource } from '@/domain/types'
import { navigate } from '@/navigation'
import { useStore } from '@/store/createStore'
import { libraryStore } from '@/store/phraseStore'
import { activeSessionStore, sessionActions } from '@/store/sessionStore'
import { settingsStore, updateSettings } from '@/store/settingsStore'
import { Button } from '../components/Button'
import { Card, Chip, ConfirmDialog, Toggle } from '../components/Primitives'
import { PageHeader } from '../layout/AppShell'
import { DECK_THEME, cx } from '../theme'

const SOURCES: { key: SessionSource; label: string; hint: string }[] = [
  { key: 'new', label: 'Từ mới', hint: 'Cụm chưa học' },
  { key: 'due', label: 'Ôn tập đến hạn', hint: 'Theo lịch SRS' },
  { key: 'mixed', label: 'Kết hợp', hint: 'Ôn trước, mới sau' },
]

export function SessionSetupScreen({ initialSource }: { initialSource?: SessionSource }) {
  const { decks, phrases } = useStore(libraryStore)
  const active = useStore(activeSessionStore)
  const last = settingsStore.get().lastConfig
  const [sizeText, setSizeText] = useState(String(last.size))
  const [source, setSource] = useState<SessionSource>(initialSource ?? last.source)
  const [deckIds, setDeckIds] = useState<string[]>(last.deckIds.filter((id) => decks.some((d) => d.id === id)))
  const [starredOnly, setStarredOnly] = useState(last.starredOnly)
  const [fillDue, setFillDue] = useState(true)
  const [fillOtherNew, setFillOtherNew] = useState(true)
  const [confirmReplace, setConfirmReplace] = useState(false)

  const validation = validateSessionSize(sizeText)
  const size = validation.ok ? validation.value : Math.min(SESSION_MAX, Math.max(SESSION_MIN, Number(sizeText) || SESSION_MIN))
  const now = useMemo(() => Date.now(), [])
  const config: SessionConfig = { size, source, deckIds, starredOnly }

  const sourceCounts = useMemo(() => {
    const base = { deckIds, starredOnly, size: 999 }
    return Object.fromEntries(
      SOURCES.map((s) => [s.key, primaryPool({ ...base, source: s.key }, phrases, now).length]),
    ) as Record<SessionSource, number>
  }, [deckIds, starredOnly, phrases, now])

  const plan = useMemo(
    () => planSession(config, phrases, now, { fillDue, fillOtherNew }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size, source, deckIds, starredOnly, phrases, now, fillDue, fillOtherNew],
  )
  const primaryCount = plan.primary.length
  const insufficient = primaryCount < size
  const finalCount = plan.selected.length
  const est = estimateMinutes(finalCount || size)
  const stages = splitStages(Array.from({ length: finalCount }))
  const canStart = validation.ok && finalCount > 0

  const setSize = (n: number) => setSizeText(String(Math.min(SESSION_MAX, Math.max(SESSION_MIN, n))))
  const toggleDeck = (id: string) => setDeckIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const start = () => {
    if (!canStart) return
    updateSettings({ lastConfig: config })
    sessionActions.start(config, plan.selected)
    navigate({ name: 'session' })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Thiết lập phiên học" subtitle="Chọn số lượng cụm từ, nguồn từ và chủ đề bạn muốn học hôm nay." />

      <div className="flex flex-col gap-5">
        <Card className="p-5 md:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-black">Số cụm từ mỗi phiên</h2>
            <span className="text-sm font-bold text-ink-muted">
              Từ {SESSION_MIN} đến {SESSION_MAX}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SESSION_PRESETS.map((n) => (
              <Chip
                key={n}
                selected={validation.ok && validation.value === n}
                selectedClass="border-grass bg-grass-soft text-grass-dark"
                onClick={() => setSize(n)}
                className="min-w-14 justify-center"
              >
                {n}
              </Chip>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Giảm"
                onClick={() => setSize(size - 1)}
                disabled={validation.ok && size <= SESSION_MIN}
                className="flex size-12 items-center justify-center rounded-2xl border-2 border-line bg-white text-ink-soft hover:bg-canvas disabled:opacity-40"
              >
                <Minus className="size-5" strokeWidth={3} />
              </button>
              <input
                inputMode="numeric"
                aria-label="Số cụm từ"
                aria-invalid={!validation.ok}
                aria-describedby="size-error"
                value={sizeText}
                onChange={(e) => setSizeText(e.target.value.replace(/[^\d-]/g, '').slice(0, 4))}
                className={cx(
                  'h-12 w-20 rounded-2xl border-2 text-center text-2xl font-black outline-none focus:border-sky',
                  validation.ok ? 'border-line' : 'border-coral bg-coral-soft text-coral-dark',
                )}
              />
              <button
                type="button"
                aria-label="Tăng"
                onClick={() => setSize(size + 1)}
                disabled={validation.ok && size >= SESSION_MAX}
                className="flex size-12 items-center justify-center rounded-2xl border-2 border-line bg-white text-ink-soft hover:bg-canvas disabled:opacity-40"
              >
                <Plus className="size-5" strokeWidth={3} />
              </button>
            </div>
            <input
              type="range"
              min={SESSION_MIN}
              max={SESSION_MAX}
              value={size}
              aria-label="Thanh chọn số cụm từ"
              onChange={(e) => setSize(Number(e.target.value))}
              className="h-3 flex-1 cursor-pointer accent-grass"
            />
          </div>
          <p id="size-error" className={cx('mt-3 text-sm font-bold', validation.ok ? 'hidden' : 'text-coral-dark')} role="alert">
            {!validation.ok && validation.error}
          </p>
        </Card>

        <Card className="p-5 md:p-6">
          <h2 className="text-lg font-black">Nguồn từ</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {SOURCES.map((s) => (
              <button
                key={s.key}
                type="button"
                aria-pressed={source === s.key}
                onClick={() => setSource(s.key)}
                className={cx(
                  'flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-colors',
                  source === s.key
                    ? 'border-sky bg-sky-soft shadow-[0_4px_0_var(--color-sky)]'
                    : 'border-line bg-white shadow-[0_4px_0_var(--color-line)] hover:bg-canvas',
                )}
              >
                <span className="font-black">{s.label}</span>
                <span className="text-sm font-semibold text-ink-soft">{s.hint}</span>
                <span className={cx('mt-2 text-xs font-extrabold', source === s.key ? 'text-sky-dark' : 'text-ink-muted')}>
                  {sourceCounts[s.key]} cụm có sẵn
                </span>
              </button>
            ))}
          </div>

          <h2 className="mt-7 text-lg font-black">Chủ đề</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip selected={deckIds.length === 0} onClick={() => setDeckIds([])}>
              Tất cả
            </Chip>
            {decks.map((d) => {
              const t = DECK_THEME[d.color]
              return (
                <Chip
                  key={d.id}
                  selected={deckIds.includes(d.id)}
                  onClick={() => toggleDeck(d.id)}
                  selectedClass={cx(t.border, t.soft, t.text)}
                >
                  <span className={cx('size-2.5 rounded-full', t.bg)} />
                  {d.name}
                </Chip>
              )
            })}
          </div>
          <div className="mt-5 flex items-center gap-2">
            <Toggle checked={starredOnly} onChange={setStarredOnly} label="Chỉ cụm đã đánh dấu khó" />
            <Star className="size-4 fill-sun text-sun" />
          </div>
        </Card>

        {validation.ok && insufficient && (
          <Card className="border-sun bg-sun-soft p-5" >
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-sun-dark" />
              <div className="flex-1">
                <p className="font-black">
                  Bộ lọc hiện có {primaryCount}/{size} cụm từ
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-soft">Bạn có thể tự động bổ sung để đủ số lượng mong muốn:</p>
                <div className="mt-3 flex flex-col gap-2.5">
                  <Toggle checked={fillDue} onChange={setFillDue} label={`Bổ sung cụm đến hạn ôn tập từ mọi chủ đề (+${plan.fromDue.length})`} />
                  <Toggle checked={fillOtherNew} onChange={setFillOtherNew} label={`Bổ sung cụm mới từ chủ đề khác (+${plan.fromOtherNew.length})`} />
                  {plan.fromUpcoming.length > 0 && (
                    <p className="text-sm font-semibold text-ink-soft">+{plan.fromUpcoming.length} cụm đang học sắp đến hạn được thêm để lấp đầy.</p>
                  )}
                </div>
                {plan.shortBy > 0 && (
                  <p className="mt-3 text-sm font-bold text-sun-dark">
                    {finalCount === 0
                      ? 'Không có cụm từ nào phù hợp. Hãy bật tuỳ chọn bổ sung hoặc thêm cụm từ mới.'
                      : `Chỉ tìm được ${finalCount} cụm — phiên sẽ gồm ${finalCount} cụm từ.`}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        <Card className="sticky bottom-24 flex flex-col gap-4 p-5 shadow-[0_6px_0_var(--color-line)] sm:flex-row sm:items-center md:bottom-6">
          <div className="flex flex-1 flex-wrap gap-x-6 gap-y-2">
            <span className="flex items-center gap-2 font-black">
              <Layers className="size-5 text-grass" />
              {validation.ok ? finalCount : '–'} cụm từ
              {stages.length > 1 && (
                <span className="font-bold text-ink-soft">
                  · {stages.length} chặng × {STAGE_SIZE}
                </span>
              )}
            </span>
            <span className="flex items-center gap-2 font-bold text-ink-soft">
              <Clock className="size-5 text-sky" />≈ {est.min}–{est.max} phút
            </span>
          </div>
          <Button
            size="lg"
            disabled={!canStart}
            onClick={() => (active && active.phase !== 'complete' ? setConfirmReplace(true) : start())}
          >
            Bắt đầu
          </Button>
        </Card>
        {size > STAGE_THRESHOLD && validation.ok && (
          <p className="-mt-2 text-center text-sm font-semibold text-ink-muted">
            Phiên trên {STAGE_THRESHOLD} cụm được chia thành các chặng {STAGE_SIZE} cụm, có màn nghỉ giữa các chặng.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmReplace}
        title="Bắt đầu phiên mới?"
        message="Bạn đang có một phiên học dở. Bắt đầu phiên mới sẽ bỏ phiên đó (các chặng đã xong vẫn được lưu)."
        confirmLabel="Bắt đầu phiên mới"
        onCancel={() => setConfirmReplace(false)}
        onConfirm={() => {
          setConfirmReplace(false)
          start()
        }}
      />
    </div>
  )
}
