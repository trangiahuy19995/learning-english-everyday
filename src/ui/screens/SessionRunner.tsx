import { X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { cancelSpeech } from '@/lib/speech'
import { navigate } from '@/navigation'
import { useStore } from '@/store/createStore'
import { libraryStore } from '@/store/phraseStore'
import { activeSessionStore, reconcileSession, sessionProgress } from '@/store/sessionStore'
import { toast } from '../components/Toast'
import { ProgressBar } from '../components/Primitives'
import { PracticeView } from './PracticeView'
import { SessionCompleteView } from './SessionCompleteView'
import { StageSummaryView } from './StageSummaryView'
import { StudyCardView } from './StudyCardView'
import type { Phrase } from '@/domain/types'

export function SessionRunner() {
  const session = useStore(activeSessionStore)
  const { phrases, decks } = useStore(libraryStore)

  useEffect(() => {
    if (!reconcileSession()) navigate({ name: 'home' })
    return () => cancelSpeech()
  }, [])

  const byId = useMemo(() => new Map(phrases.map((p) => [p.id, p])), [phrases])
  if (!session) return null

  const stage = (session.stages[session.stageIndex] ?? []).map((id) => byId.get(id)).filter((p): p is Phrase => !!p)
  const { learned, total } = sessionProgress(session)
  const exit = () => {
    cancelSpeech()
    if (session.phase !== 'complete') toast('Đã lưu tiến độ. Bạn có thể học tiếp bất cứ lúc nào.')
    navigate({ name: 'home' })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b-2 border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={exit}
            aria-label="Thoát và lưu"
            title="Thoát và lưu"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-line/60 hover:text-ink"
          >
            <X className="size-6" strokeWidth={3} />
          </button>
          <div className="flex-1">
            <ProgressBar value={total ? learned / total : 0} />
          </div>
          <div className="shrink-0 text-right leading-tight">
            <p className="text-sm font-black">
              {learned}/{total}
            </p>
            {session.stages.length > 1 && (
              <p className="text-[11px] font-extrabold tracking-wide text-ink-muted uppercase">
                Chặng {Math.min(session.stageIndex + 1, session.stages.length)}/{session.stages.length}
              </p>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 md:px-6 md:py-8">
        {session.phase === 'study' && <StudyCardView session={session} stage={stage} decks={decks} />}
        {session.phase === 'practice' && <PracticeView session={session} byId={byId} />}
        {session.phase === 'stageSummary' && <StageSummaryView session={session} stage={stage} />}
        {session.phase === 'complete' && <SessionCompleteView session={session} />}
      </div>
    </div>
  )
}
