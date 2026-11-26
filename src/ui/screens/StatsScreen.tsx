import { CalendarClock, CheckCircle2, Flame, Layers, Target, Trophy } from 'lucide-react'
import { averageAccuracy, computeStreak, countByStatus, countDue, lastNDays, STATUS_LABELS } from '@/domain/stats'
import type { ProgressStatus } from '@/domain/types'
import { navigate } from '@/navigation'
import { useStore } from '@/store/createStore'
import { libraryStore } from '@/store/phraseStore'
import { activeSessionStore, activityStore, historyStore, sessionProgress } from '@/store/sessionStore'
import { Button } from '../components/Button'
import { Badge, Card, EmptyState, ProgressBar, SectionTitle } from '../components/Primitives'
import { PageHeader } from '../layout/AppShell'
import { STATUS_THEME, cx } from '../theme'
import { StatusBar } from './DecksScreen'

const fmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
const dayFmt = new Intl.DateTimeFormat('vi-VN', { weekday: 'narrow' })

export function StatsScreen() {
  const { phrases } = useStore(libraryStore)
  const activity = useStore(activityStore)
  const history = useStore(historyStore)
  const session = useStore(activeSessionStore)
  const now = Date.now()
  const counts = countByStatus(phrases)
  const { streak } = computeStreak(activity, now)
  const days = lastNDays(activity, now, 14)
  const maxDay = Math.max(1, ...days.map((d) => d.count))
  const avg = averageAccuracy(history)
  const progress = session && session.phase !== 'complete' ? sessionProgress(session) : null

  const tiles = [
    { label: 'Chuỗi ngày học', value: `${streak}`, icon: Flame, color: 'bg-sun' },
    { label: 'Đã thuộc', value: `${counts.mastered}`, icon: Trophy, color: 'bg-grass' },
    { label: 'Đến hạn hôm nay', value: `${countDue(phrases, now)}`, icon: CalendarClock, color: 'bg-grape' },
    { label: 'Độ chính xác TB', value: avg == null ? '–' : `${Math.round(avg * 100)}%`, icon: Target, color: 'bg-sky' },
  ]

  return (
    <div>
      <PageHeader title="Thống kê" subtitle="Theo dõi tiến độ và thói quen học của bạn." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-5">
            <div className={cx('mb-3 flex size-11 items-center justify-center rounded-2xl text-white', t.color)}>
              <t.icon className="size-6" />
            </div>
            <p className="text-3xl font-black">{t.value}</p>
            <p className="text-sm font-bold text-ink-soft">{t.label}</p>
          </Card>
        ))}
      </div>

      {progress && session && (
        <Card className="mt-6 flex flex-col gap-3 border-sun bg-sun-soft p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="font-black">Phiên hiện tại: đã học {progress.learned}/{progress.total} cụm từ</p>
            <ProgressBar value={progress.learned / progress.total} className="mt-2 h-3" color="bg-sun" />
          </div>
          <Button variant="orange" onClick={() => navigate({ name: 'session' })}>
            Tiếp tục
          </Button>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5 md:p-6">
          <SectionTitle>Kho từ vựng</SectionTitle>
          <p className="mb-3 text-sm font-semibold text-ink-soft">{phrases.length} cụm từ</p>
          {phrases.length > 0 && <StatusBar counts={counts} total={phrases.length} />}
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {(Object.keys(counts) as ProgressStatus[]).map((s) => (
              <li key={s} className="flex items-center gap-2.5">
                <span className={cx('size-3 rounded-full', STATUS_THEME[s].bg)} />
                <span className="flex-1 text-sm font-bold text-ink-soft">{STATUS_LABELS[s]}</span>
                <span className="font-black">{counts[s]}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 md:p-6">
          <SectionTitle>14 ngày gần đây</SectionTitle>
          <div className="flex h-36 items-end gap-1.5" role="img" aria-label="Biểu đồ số cụm từ ôn mỗi ngày">
            {days.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div
                    title={`${d.key}: ${d.count} cụm`}
                    className={cx('w-full rounded-lg', d.count ? 'bg-grass' : 'bg-line')}
                    style={{ height: `${d.count ? Math.max(10, (d.count / maxDay) * 100) : 6}%` }}
                  />
                </div>
                <span className="text-[10px] font-extrabold text-ink-muted">{dayFmt.format(d.date)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <SectionTitle>Lịch sử phiên học</SectionTitle>
        {!history.length ? (
          <EmptyState icon={<Layers className="size-7" />} title="Chưa có phiên nào">
            Hoàn thành một chặng học để xem lịch sử tại đây.
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border-2 border-line bg-white px-4 py-3">
                <span className="w-32 text-sm font-bold text-ink-soft">{fmt.format(h.finishedAt)}</span>
                <span className="font-black">{h.reviewedCount}/{h.size} cụm</span>
                <span className="text-sm font-bold text-ink-soft">
                  {h.stagesCompleted}/{h.totalStages} chặng
                </span>
                <span className="text-sm font-bold text-sky-dark">{Math.round(h.accuracy * 100)}% đúng</span>
                <span className="ml-auto">
                  {h.completed ? (
                    <Badge className="bg-grass-soft text-grass-dark">
                      <CheckCircle2 className="size-3.5" /> Hoàn thành
                    </Badge>
                  ) : (
                    <Badge className="bg-sun-soft text-sun-dark">Dừng giữa chừng</Badge>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
