import { ArrowRight, CalendarClock, Flame, Headphones, Play, Sparkles, Trophy, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { computeStreak, countByStatus, countDue } from '@/domain/stats'
import { navigate } from '@/navigation'
import { useStore } from '@/store/createStore'
import { libraryStore } from '@/store/phraseStore'
import { activeSessionStore, activityStore, sessionActions, sessionProgress } from '@/store/sessionStore'
import { Button } from '../components/Button'
import { Card, ConfirmDialog, ProgressBar, SectionTitle } from '../components/Primitives'
import { DECK_THEME, cx } from '../theme'

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Chào buổi sáng'
  if (h < 14) return 'Chào buổi trưa'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

export function HomeScreen() {
  const { decks, phrases } = useStore(libraryStore)
  const session = useStore(activeSessionStore)
  const activity = useStore(activityStore)
  const [confirmAbandon, setConfirmAbandon] = useState(false)
  const now = Date.now()
  const due = countDue(phrases, now)
  const counts = countByStatus(phrases)
  const { streak, studiedToday } = computeStreak(activity, now)
  const deckCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of phrases) m.set(p.topic, (m.get(p.topic) ?? 0) + 1)
    return m
  }, [phrases])

  const resumable = session && session.phase !== 'complete'
  const progress = session ? sessionProgress(session) : null

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-grass px-6 py-8 text-white md:px-10 md:py-10">
        <div className="pointer-events-none absolute -top-10 -right-8 size-44 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-24 -bottom-16 size-36 rounded-full bg-sun/90" />
        <div className="pointer-events-none absolute right-6 bottom-6 hidden rotate-6 rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_5px_0_rgba(0,0,0,0.12)] sm:block">
          <p className="text-lg font-black">break the ice</p>
          <p className="font-ipa text-sm text-sky-dark">/breɪk ðə aɪs/</p>
          <p className="text-sm font-bold text-ink-soft">phá vỡ sự ngại ngùng</p>
        </div>
        <div className="relative max-w-md">
          <p className="font-extrabold tracking-wide text-white/80 uppercase">{greeting()}!</p>
          <h1 className="mt-2 text-3xl leading-tight font-black md:text-4xl">Học tiếng Anh theo cụm từ, nhớ lâu như người bản xứ.</h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="secondary"
              className="!border-white text-grass-dark"
              icon={<Play className="size-5 fill-current" />}
              onClick={() => navigate({ name: 'setup' })}
            >
              Bắt đầu học
            </Button>
          </div>
        </div>
      </section>

      {resumable && progress && (
        <Card className="flex animate-rise flex-col gap-4 border-sun bg-sun-soft p-5 sm:flex-row sm:items-center">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sun text-white">
            <Sparkles className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black">Bạn đang học dở một phiên</p>
            <p className="text-sm font-semibold text-ink-soft">
              Chặng {session.stageIndex + 1}/{session.stages.length} ·{' '}
              {session.phase === 'study'
                ? `thẻ ${session.cardIndex + 1}/${session.stages[session.stageIndex].length}`
                : session.phase === 'practice'
                  ? `bài tập ${session.exerciseIndex + 1}/${session.exercises.length}`
                  : 'tóm tắt chặng'}{' '}
              · đã học {progress.learned}/{progress.total}
            </p>
            <ProgressBar value={progress.learned / progress.total} className="mt-2 h-2.5" color="bg-sun" />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="md" icon={<X className="size-4" />} onClick={() => setConfirmAbandon(true)}>
              Bỏ phiên
            </Button>
            <Button variant="orange" onClick={() => navigate({ name: 'session' })}>
              Tiếp tục
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <div className={cx('flex size-12 items-center justify-center rounded-2xl', streak ? 'bg-sun text-white' : 'bg-line text-ink-muted')}>
            <Flame className="size-6" />
          </div>
          <div>
            <p className="text-2xl font-black">{streak} ngày</p>
            <p className="text-sm font-semibold text-ink-soft">{studiedToday ? 'Chuỗi học liên tiếp' : 'Học hôm nay để giữ chuỗi!'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-grape text-white">
            <CalendarClock className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-black">{due} cụm</p>
            <p className="text-sm font-semibold text-ink-soft">Đến hạn ôn hôm nay</p>
          </div>
          {due > 0 && (
            <button
              type="button"
              onClick={() => navigate({ name: 'setup', source: 'due' })}
              className="rounded-xl px-2 py-1 text-sm font-extrabold text-grape-dark hover:bg-grape-soft"
            >
              Ôn ngay
            </button>
          )}
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-grass text-white">
            <Trophy className="size-6" />
          </div>
          <div>
            <p className="text-2xl font-black">
              {counts.mastered}
              <span className="text-base text-ink-muted">/{phrases.length}</span>
            </p>
            <p className="text-sm font-semibold text-ink-soft">Cụm từ đã thuộc</p>
          </div>
        </Card>
      </div>

      <section>
        <SectionTitle
          action={
            <button type="button" onClick={() => navigate({ name: 'decks' })} className="text-sm font-extrabold text-sky-dark hover:underline">
              Quản lý bộ từ
            </button>
          }
        >
          Chủ đề của bạn
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {decks.map((d) => {
            const t = DECK_THEME[d.color]
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => navigate({ name: 'deck', deckId: d.id })}
                className="group flex flex-col gap-3 rounded-3xl border-2 border-line bg-white p-5 text-left shadow-[0_4px_0_var(--color-line)] transition-transform hover:-translate-y-0.5"
              >
                <span className={cx('h-2 w-10 rounded-full', t.bg)} />
                <span className="text-lg font-black">{d.name}</span>
                <span className="flex items-center justify-between text-sm font-bold text-ink-muted">
                  {deckCounts.get(d.id) ?? 0} cụm từ
                  <ArrowRight className={cx('size-4 transition-transform group-hover:translate-x-1', t.text)} />
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <Card className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-sky text-white">
          <Headphones className="size-6" />
        </div>
        <div className="flex-1">
          <p className="font-black">Nghe thụ động</p>
          <p className="text-sm font-semibold text-ink-soft">Phát lần lượt cụm từ, nghĩa và câu ví dụ khi bạn di chuyển hoặc thư giãn.</p>
        </div>
        <Button variant="blue" onClick={() => navigate({ name: 'playlist' })}>
          Mở danh sách phát
        </Button>
      </Card>

      <ConfirmDialog
        open={confirmAbandon}
        title="Bỏ phiên đang học?"
        message="Các chặng đã hoàn thành vẫn được lưu vào lịch ôn tập. Tiến độ của chặng hiện tại sẽ mất."
        confirmLabel="Bỏ phiên"
        danger
        onCancel={() => setConfirmAbandon(false)}
        onConfirm={() => {
          sessionActions.abandon()
          setConfirmAbandon(false)
        }}
      />
    </div>
  )
}
