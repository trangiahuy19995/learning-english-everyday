import { FolderPlus, MoreHorizontal, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DECK_COLORS } from '@/domain/importExport'
import { STATUS_LABELS } from '@/domain/stats'
import type { Deck, DeckColor, ProgressStatus } from '@/domain/types'
import { navigate } from '@/navigation'
import { useStore } from '@/store/createStore'
import { libraryStore, phraseStore } from '@/store/phraseStore'
import { Button } from '../components/Button'
import { ConfirmDialog, EmptyState, Modal } from '../components/Primitives'
import { toast } from '../components/Toast'
import { PageHeader } from '../layout/AppShell'
import { DECK_THEME, STATUS_THEME, cx } from '../theme'
import { ImportExportPanel } from './ImportExportPanel'

export function DeckFormModal({ open, deck, onClose }: { open: boolean; deck?: Deck; onClose: () => void }) {
  const [name, setName] = useState(deck?.name ?? '')
  const [description, setDescription] = useState(deck?.description ?? '')
  const [color, setColor] = useState<DeckColor>(deck?.color ?? 'green')
  const { decks } = useStore(libraryStore)
  const trimmed = name.trim()
  const duplicate = decks.some((d) => d.id !== deck?.id && d.name.toLowerCase() === trimmed.toLowerCase())
  const save = () => {
    if (!trimmed || duplicate) return
    if (deck) phraseStore.updateDeck(deck.id, { name: trimmed, description: description.trim() || undefined, color })
    else phraseStore.addDeck({ name: trimmed, description: description.trim() || undefined, color })
    toast(deck ? 'Đã cập nhật bộ từ' : 'Đã tạo bộ từ mới')
    onClose()
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={deck ? 'Sửa bộ từ' : 'Tạo bộ từ mới'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={save} disabled={!trimmed || duplicate}>
            Lưu
          </Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-extrabold text-ink">Tên chủ đề</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-2xl border-2 border-line px-4 font-bold outline-none focus:border-sky"
            placeholder="Ví dụ: Phỏng vấn xin việc"
          />
          {duplicate && <span className="text-sm font-bold text-coral-dark">Tên này đã tồn tại.</span>}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-extrabold text-ink">Mô tả (tuỳ chọn)</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-12 rounded-2xl border-2 border-line px-4 font-semibold outline-none focus:border-sky"
          />
        </label>
        <div>
          <span className="text-sm font-extrabold text-ink">Màu</span>
          <div className="mt-2 flex gap-2">
            {DECK_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={DECK_THEME[c].label}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className={cx('size-10 rounded-xl', DECK_THEME[c].bg, color === c && 'ring-4 ring-ink/20 ring-offset-2')}
              />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}

export function StatusBar({ counts, total }: { counts: Record<ProgressStatus, number>; total: number }) {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-line">
      {(Object.keys(counts) as ProgressStatus[]).map((s) =>
        counts[s] ? (
          <div key={s} title={`${STATUS_LABELS[s]}: ${counts[s]}`} className={STATUS_THEME[s].bg} style={{ width: `${(counts[s] / total) * 100}%` }} />
        ) : null,
      )}
    </div>
  )
}

export function DecksScreen() {
  const { decks, phrases } = useStore(libraryStore)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Deck | undefined>()
  const [deleting, setDeleting] = useState<Deck | undefined>()
  const [menu, setMenu] = useState<string | null>(null)
  const [restoreOpen, setRestoreOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Bộ từ vựng"
        subtitle={`${decks.length} chủ đề · ${phrases.length} cụm từ`}
        action={
          <Button icon={<FolderPlus className="size-5" />} onClick={() => { setEditing(undefined); setFormOpen(true) }}>
            Bộ từ mới
          </Button>
        }
      />

      {!decks.length ? (
        <EmptyState icon={<FolderPlus className="size-7" />} title="Chưa có bộ từ nào">
          Tạo bộ từ mới hoặc khôi phục dữ liệu mẫu để bắt đầu.
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((d) => {
            const list = phrases.filter((p) => p.topic === d.id)
            const counts = { new: 0, learning: 0, review: 0, mastered: 0 }
            for (const p of list) counts[p.progress.status]++
            const t = DECK_THEME[d.color]
            return (
              <div key={d.id} className="relative flex flex-col rounded-3xl border-2 border-line bg-white shadow-[0_4px_0_var(--color-line)]">
                <button type="button" onClick={() => navigate({ name: 'deck', deckId: d.id })} className="flex flex-1 flex-col gap-3 p-5 text-left">
                  <span className={cx('flex size-11 items-center justify-center rounded-2xl text-lg font-black text-white', t.bg)}>
                    {d.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    <span className="block text-lg font-black">{d.name}</span>
                    {d.description && <span className="mt-0.5 block text-sm font-semibold text-ink-soft">{d.description}</span>}
                  </span>
                  <span className="mt-auto flex flex-col gap-2 pt-2">
                    <span className="flex justify-between text-xs font-extrabold text-ink-muted">
                      <span>{list.length} cụm từ</span>
                      <span className="text-grass-dark">{counts.mastered} đã thuộc</span>
                    </span>
                    {list.length > 0 && <StatusBar counts={counts} total={list.length} />}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Tuỳ chọn"
                  onClick={() => setMenu(menu === d.id ? null : d.id)}
                  className="absolute top-4 right-4 rounded-xl p-2 text-ink-muted hover:bg-canvas"
                >
                  <MoreHorizontal className="size-5" />
                </button>
                {menu === d.id && (
                  <div className="absolute top-14 right-4 z-10 flex w-44 animate-rise flex-col rounded-2xl border-2 border-line bg-white p-1.5 shadow-lg">
                    <button
                      type="button"
                      onClick={() => { setEditing(d); setFormOpen(true); setMenu(null) }}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-canvas"
                    >
                      <Pencil className="size-4" /> Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeleting(d); setMenu(null) }}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-coral-dark hover:bg-coral-soft"
                    >
                      <Trash2 className="size-4" /> Xoá
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-10">
        <ImportExportPanel />
      </div>

      <div className="mt-6 flex justify-center">
        <Button variant="ghost" size="sm" icon={<RefreshCw className="size-4" />} onClick={() => setRestoreOpen(true)}>
          Khôi phục dữ liệu mẫu
        </Button>
      </div>

      {formOpen && <DeckFormModal open deck={editing} onClose={() => setFormOpen(false)} />}
      <ConfirmDialog
        open={!!deleting}
        title={`Xoá "${deleting?.name}"?`}
        message={`Bộ từ và ${phrases.filter((p) => p.topic === deleting?.id).length} cụm từ bên trong sẽ bị xoá vĩnh viễn.`}
        confirmLabel="Xoá"
        danger
        onCancel={() => setDeleting(undefined)}
        onConfirm={() => {
          if (deleting) phraseStore.deleteDeck(deleting.id)
          setDeleting(undefined)
          toast('Đã xoá bộ từ')
        }}
      />
      <ConfirmDialog
        open={restoreOpen}
        title="Khôi phục dữ liệu mẫu?"
        message="Các bộ từ và cụm từ mẫu bị thiếu sẽ được thêm lại. Dữ liệu hiện có của bạn được giữ nguyên."
        confirmLabel="Khôi phục"
        onCancel={() => setRestoreOpen(false)}
        onConfirm={() => {
          phraseStore.restoreSamples()
          setRestoreOpen(false)
          toast('Đã khôi phục dữ liệu mẫu')
        }}
      />
    </div>
  )
}
