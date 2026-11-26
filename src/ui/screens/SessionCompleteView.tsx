import { Flame, Headphones, Home, RotateCcw, Trophy } from 'lucide-react'
import { computeStreak } from '@/domain/stats'
import type { ActiveSession } from '@/domain/types'
import { navigate } from '@/navigation'
import { useStore } from '@/store/createStore'
import { activityStore, sessionActions } from '@/store/sessionStore'
import { Button } from '../components/Button'
import { Card } from '../components/Primitives'

export function SessionCompleteView({ session }: { session: ActiveSession }) {
  const activity = useStore(activityStore)
  const { streak } = computeStreak(activity, Date.now())
  const accuracy = session.totalCount ? Math.round((session.correctCount / session.totalCount) * 100) : 100
  const minutes = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000))

  const leave = (route: Parameters<typeof navigate>[0]) => {
    sessionActions.finish()
    navigate(route)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <div className="relative">
        <div className="flex size-28 animate-pop items-center justify-center rounded-[2rem] bg-sun text-white shadow-[0_6px_0_var(--color-sun-dark)]">
          <Trophy className="size-14" />
        </div>
        <span className="absolute -top-2 -left-4 size-5 rounded-full bg-grass" />
        <span className="absolute -right-5 bottom-2 size-4 rounded-full bg-sky" />
        <span className="absolute -top-4 right-0 size-3 rounded-full bg-coral" />
      </div>
      <div>
        <h1 className="text-3xl font-black md:text-4xl">Hoàn thành phiên học!</h1>
        <p className="mt-2 font-semibold text-ink-soft">Lịch ôn tập đã được cập nhật cho {session.phraseIds.length} cụm từ.</p>
      </div>
      <div className="grid w-full max-w-lg grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-2xl font-black text-grass-dark">{session.phraseIds.length}</p>
          <p className="text-xs font-extrabold tracking-wide text-ink-muted uppercase">Cụm từ</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-black text-sky-dark">{accuracy}%</p>
          <p className="text-xs font-extrabold tracking-wide text-ink-muted uppercase">Chính xác</p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center justify-center gap-1 text-2xl font-black text-sun-dark">
            <Flame className="size-5" />
            {streak}
          </p>
          <p className="text-xs font-extrabold tracking-wide text-ink-muted uppercase">Ngày liên tiếp</p>
        </Card>
      </div>
      <p className="text-sm font-semibold text-ink-muted">Thời gian học: khoảng {minutes} phút</p>
      <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
        <Button variant="blue" block icon={<Headphones className="size-5" />} onClick={() => navigate({ name: 'playlist' })}>
          Nghe lại phiên
        </Button>
        <Button variant="secondary" block icon={<RotateCcw className="size-5" />} onClick={() => leave({ name: 'setup' })}>
          Phiên mới
        </Button>
        <Button block icon={<Home className="size-5" />} onClick={() => leave({ name: 'home' })}>
          Trang chủ
        </Button>
      </div>
    </div>
  )
}
