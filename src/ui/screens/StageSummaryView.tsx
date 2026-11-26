import { Coffee, Target } from 'lucide-react'
import { formatRelativeDays } from '@/domain/dates'
import { RATING_LABELS, RATINGS, review } from '@/domain/srsEngine'
import type { ActiveSession, Phrase, Rating } from '@/domain/types'
import { sessionActions } from '@/store/sessionStore'
import { Button } from '../components/Button'
import { Card } from '../components/Primitives'
import { IpaText } from '../components/PhraseBits'
import { cx } from '../theme'

const RATING_STYLE: Record<Rating, string> = {
  1: 'border-coral bg-coral text-white',
  3: 'border-sun bg-sun text-white',
  4: 'border-grass bg-grass text-white',
  5: 'border-sky bg-sky text-white',
}

export function StageSummaryView({ session, stage }: { session: ActiveSession; stage: Phrase[] }) {
  const correct = session.exercises.filter((e) => session.results[e.id]?.correctFirstTry).length
  const total = session.exercises.length
  const accuracy = total ? Math.round((correct / total) * 100) : 100
  const isLastStage = session.stageIndex >= session.stages.length - 1
  const now = Date.now()
  const multiStage = session.stages.length > 1

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-sm font-extrabold tracking-wide text-ink-muted uppercase">
          {multiStage ? `Hoàn thành chặng ${session.stageIndex + 1}/${session.stages.length}` : 'Tóm tắt'}
        </p>
        <h1 className="mt-1 text-3xl font-black">{accuracy >= 80 ? 'Làm tốt lắm!' : accuracy >= 50 ? 'Khá ổn rồi!' : 'Cố lên, ôn thêm nhé!'}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col items-center gap-1 border-grass bg-grass-soft p-4">
          <Target className="size-6 text-grass" />
          <p className="text-3xl font-black text-grass-dark">{accuracy}%</p>
          <p className="text-xs font-extrabold tracking-wide text-ink-soft uppercase">Đúng lần đầu</p>
        </Card>
        <Card className="flex flex-col items-center gap-1 border-sky bg-sky-soft p-4">
          <p className="text-3xl font-black text-sky-dark">{stage.length}</p>
          <p className="text-xs font-extrabold tracking-wide text-ink-soft uppercase">Cụm từ đã học</p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-black">Bạn nhớ các cụm này đến đâu?</h2>
        <p className="text-sm font-semibold text-ink-soft">Đã chọn sẵn theo kết quả luyện tập — chỉnh lại nếu cần. Lịch ôn sẽ được cập nhật theo đánh giá.</p>
        <ul className="mt-4 flex flex-col gap-3">
          {stage.map((p) => {
            const rating = session.ratings[p.id] ?? 4
            const next = review(p.progress, rating, now)
            return (
              <li key={p.id} className="flex flex-col gap-3 rounded-2xl border-2 border-line bg-white p-4 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-black">{p.phrase}</p>
                  <p className="text-sm">
                    <IpaText ipa={p.ipa} className="mr-2" />
                    <span className="font-semibold text-ink-soft">{p.meaning_vi}</span>
                  </p>
                  <p className="mt-1 text-xs font-extrabold text-grape-dark">Ôn lại: {formatRelativeDays(next.nextReviewAt, now)}</p>
                </div>
                <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label={`Mức độ nhớ: ${p.phrase}`}>
                  {RATINGS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={rating === r}
                      onClick={() => sessionActions.setRating(p.id, r)}
                      className={cx(
                        'h-10 rounded-xl border-2 px-3 text-sm font-extrabold transition-colors',
                        rating === r ? RATING_STYLE[r] : 'border-line bg-white text-ink-soft hover:bg-canvas',
                      )}
                    >
                      {RATING_LABELS[r]}
                    </button>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {!isLastStage && (
        <Card className="flex items-center gap-3 border-sun bg-sun-soft p-4">
          <Coffee className="size-6 shrink-0 text-sun-dark" />
          <p className="text-sm font-bold text-ink-soft">
            Nghỉ mắt một chút trước chặng tiếp theo nhé. Tiến độ đã được lưu, bạn có thể thoát và quay lại bất cứ lúc nào.
          </p>
        </Card>
      )}

      <div className="flex justify-end">
        <Button size="lg" onClick={() => sessionActions.confirmStage()}>
          {isLastStage ? 'Hoàn thành phiên' : `Lưu & sang chặng ${session.stageIndex + 2}`}
        </Button>
      </div>
    </div>
  )
}
