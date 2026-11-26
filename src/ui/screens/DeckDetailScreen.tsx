import { ArrowLeft, Headphones, Pencil, Plus, RotateCcw, Search, Star, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatRelativeDays } from '@/domain/dates'
import { STATUS_LABELS } from '@/domain/stats'
import type { Phrase, ProgressStatus } from '@/domain/types'
import { navigate } from '@/navigation'
import { useStore } from '@/store/createStore'
import { libraryStore, phraseStore } from '@/store/phraseStore'
import { Button, IconButton } from '../components/Button'
import { Badge, Chip, ConfirmDialog, EmptyState } from '../components/Primitives'
import { IpaText } from '../components/PhraseBits'
import { toast } from '../components/Toast'
import { DECK_THEME, STATUS_THEME, cx } from '../theme'

export function DeckDetailScreen({ deckId }: { deckId: string }) {
  const { decks, phrases } = useStore(libraryStore)
  const deck = decks.find((d) => d.id === deckId)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ProgressStatus | 'all' | 'starred'>('all')
  const [deleting, setDeleting] = useState<Phrase | undefined>()
  const now = Date.now()

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return phrases
      .filter((p) => p.topic === deckId)
      .filter((p) => (status === 'all' ? true : status === 'starred' ? p.starred : p.progress.status === status))
      .filter((p) => !q || p.phrase.toLowerCase().includes(q) || p.meaning_vi.toLowerCase().includes(q))
  }, [phrases, deckId, status, query])

  if (!deck) {
    return (
      <EmptyState icon={<Search className="size-7" />} title="Không tìm thấy bộ từ">
        <Button variant="secondary" className="mt-3" onClick={() => navigate({ name: 'decks' })}>
          Về danh sách bộ từ
        </Button>
      </EmptyState>
    )
  }
  const t = DECK_THEME[deck.color]
  const total = phrases.filter((p) => p.topic === deckId).length

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate({ name: 'decks' })}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Bộ từ
      </button>
      <div className={cx('mb-6 flex flex-wrap items-center gap-4 rounded-3xl p-6', t.soft)}>
        <span className={cx('flex size-14 items-center justify-center rounded-2xl text-2xl font-black text-white', t.bg)}>
          {deck.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-black">{deck.name}</h1>
          <p className="font-semibold text-ink-soft">{deck.description ?? `${total} cụm từ`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<Headphones className="size-5" />} onClick={() => navigate({ name: 'playlist', deckId })}>
            Nghe
          </Button>
          <Button icon={<Plus className="size-5" />} onClick={() => navigate({ name: 'phrase', deckId })}>
            Thêm cụm từ
          </Button>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm cụm từ hoặc nghĩa…"
            aria-label="Tìm kiếm"
            className="h-12 w-full rounded-2xl border-2 border-line bg-white pr-4 pl-12 font-semibold outline-none focus:border-sky"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'new', 'learning', 'review', 'mastered', 'starred'] as const).map((s) => (
            <Chip key={s} selected={status === s} onClick={() => setStatus(s)} className="h-9 px-3">
              {s === 'all' ? 'Tất cả' : s === 'starred' ? 'Từ khó' : STATUS_LABELS[s]}
            </Chip>
          ))}
        </div>
      </div>

      {!list.length ? (
        <EmptyState icon={<Plus className="size-7" />} title={total ? 'Không có kết quả phù hợp' : 'Bộ từ đang trống'}>
          {total ? 'Thử từ khoá hoặc bộ lọc khác.' : 'Thêm cụm từ đầu tiên hoặc nhập từ tệp CSV/JSON.'}
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 rounded-2xl border-2 border-line bg-white p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-black">{p.phrase}</span>
                  <Badge className={cx(STATUS_THEME[p.progress.status].soft, STATUS_THEME[p.progress.status].text)}>
                    {STATUS_LABELS[p.progress.status]}
                  </Badge>
                  {p.progress.status !== 'new' && (
                    <span className="text-xs font-bold text-ink-muted">{formatRelativeDays(p.progress.nextReviewAt, now)}</span>
                  )}
                </div>
                <p className="mt-0.5 text-sm">
                  <IpaText ipa={p.ipa} className="mr-2" />
                  <span className="font-semibold text-ink-soft">{p.meaning_vi}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <IconButton label={p.starred ? 'Bỏ đánh dấu khó' : 'Đánh dấu khó'} active={p.starred} onClick={() => phraseStore.toggleStar(p.id)}>
                  <Star className={cx('size-5', p.starred && 'fill-sun')} />
                </IconButton>
                <IconButton label="Sửa" onClick={() => navigate({ name: 'phrase', deckId, phraseId: p.id })}>
                  <Pencil className="size-5" />
                </IconButton>
                <IconButton
                  label="Đặt lại tiến độ"
                  disabled={p.progress.status === 'new'}
                  onClick={() => {
                    phraseStore.resetProgress(p.id)
                    toast('Đã đặt lại tiến độ')
                  }}
                >
                  <RotateCcw className="size-5" />
                </IconButton>
                <IconButton label="Xoá" onClick={() => setDeleting(p)} className="hover:!text-coral">
                  <Trash2 className="size-5" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Xoá cụm từ?"
        message={`"${deleting?.phrase}" và tiến độ học sẽ bị xoá.`}
        confirmLabel="Xoá"
        danger
        onCancel={() => setDeleting(undefined)}
        onConfirm={() => {
          if (deleting) phraseStore.deletePhrase(deleting.id)
          setDeleting(undefined)
          toast('Đã xoá cụm từ')
        }}
      />
    </div>
  )
}
