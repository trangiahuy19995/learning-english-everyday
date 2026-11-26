import { Download, FileJson, FileSpreadsheet, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  applyImport,
  exportCsv,
  exportJson,
  parseCsvImport,
  parseJsonImport,
  type ImportParseResult,
} from '@/domain/importExport'
import { useStore } from '@/store/createStore'
import { libraryStore, phraseStore } from '@/store/phraseStore'
import { Button } from '../components/Button'
import { Card, Chip, Modal, Toggle } from '../components/Primitives'
import { toast } from '../components/Toast'

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function ImportExportPanel() {
  const { decks, phrases } = useStore(libraryStore)
  const [scope, setScope] = useState<string>('all')
  const [withProgress, setWithProgress] = useState(true)
  const [parsed, setParsed] = useState<ImportParseResult | null>(null)
  const [fileName, setFileName] = useState('')
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')
  const fileRef = useRef<HTMLInputElement>(null)

  const scoped = scope === 'all' ? phrases : phrases.filter((p) => p.topic === scope)
  const scopedDecks = scope === 'all' ? decks : decks.filter((d) => d.id === scope)
  const stamp = new Date().toISOString().slice(0, 10)

  const onFile = async (file: File) => {
    const text = await file.text()
    const isJson = file.name.toLowerCase().endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[')
    setFileName(file.name)
    setParsed(isJson ? parseJsonImport(text) : parseCsvImport(text))
    setMode('merge')
  }

  const confirmImport = () => {
    if (!parsed) return
    const res = applyImport(decks, phrases, parsed, mode)
    phraseStore.replaceAll({ decks: res.decks, phrases: res.phrases })
    toast(`Đã nhập: ${res.added} mới, ${res.updated} cập nhật`)
    setParsed(null)
  }

  return (
    <Card className="p-5 md:p-6">
      <h2 className="text-lg font-black">Nhập / xuất dữ liệu</h2>
      <p className="text-sm font-semibold text-ink-soft">Sao lưu hoặc chuyển dữ liệu sang thiết bị khác bằng JSON hay CSV.</p>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm font-extrabold">Xuất</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip selected={scope === 'all'} onClick={() => setScope('all')} className="h-9 px-3">
              Tất cả
            </Chip>
            {decks.map((d) => (
              <Chip key={d.id} selected={scope === d.id} onClick={() => setScope(d.id)} className="h-9 px-3">
                {d.name}
              </Chip>
            ))}
          </div>
          <div className="mt-3">
            <Toggle checked={withProgress} onChange={setWithProgress} label="Kèm tiến độ học (JSON)" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<FileJson className="size-4" />}
              disabled={!scoped.length}
              onClick={() => download(`cumtu-${stamp}.json`, exportJson(scopedDecks, scoped, withProgress), 'application/json')}
            >
              <Download className="size-4" /> JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<FileSpreadsheet className="size-4" />}
              disabled={!scoped.length}
              onClick={() => download(`cumtu-${stamp}.csv`, exportCsv(decks, scoped), 'text/csv;charset=utf-8')}
            >
              <Download className="size-4" /> CSV
            </Button>
          </div>
        </div>
        <div>
          <p className="text-sm font-extrabold">Nhập</p>
          <p className="mt-1 text-xs leading-relaxed font-semibold text-ink-muted">
            CSV cột: phrase, ipa, meaning_vi, nuance_vi, topic, synonyms (<code>text::ghi chú ; …</code>), examples (
            <code>en || vi || highlight ;; …</code>).
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv,application/json,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
              e.target.value = ''
            }}
          />
          <Button className="mt-3" variant="blue" size="sm" icon={<Upload className="size-4" />} onClick={() => fileRef.current?.click()}>
            Chọn tệp .json / .csv
          </Button>
        </div>
      </div>

      <Modal
        open={!!parsed}
        onClose={() => setParsed(null)}
        title="Xem trước dữ liệu nhập"
        footer={
          <>
            <Button variant="secondary" onClick={() => setParsed(null)}>
              Huỷ
            </Button>
            <Button variant={mode === 'replace' ? 'danger' : 'primary'} disabled={!parsed?.drafts.length} onClick={confirmImport}>
              {mode === 'replace' ? 'Thay thế toàn bộ' : 'Nhập'}
            </Button>
          </>
        }
      >
        {parsed && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold">{fileName}</p>
            <div className="flex gap-3">
              <div className="flex-1 rounded-2xl bg-grass-soft p-3 text-center">
                <p className="text-2xl font-black text-grass-dark">{parsed.drafts.length}</p>
                <p className="text-xs font-extrabold text-ink-soft uppercase">Hợp lệ</p>
              </div>
              <div className="flex-1 rounded-2xl bg-coral-soft p-3 text-center">
                <p className="text-2xl font-black text-coral-dark">{parsed.errors.length}</p>
                <p className="text-xs font-extrabold text-ink-soft uppercase">Lỗi</p>
              </div>
            </div>
            {parsed.errors.length > 0 && (
              <ul className="max-h-32 overflow-auto rounded-2xl bg-canvas p-3 text-sm font-semibold text-coral-dark">
                {parsed.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-2">
              <label className="flex items-start gap-2 text-sm font-semibold">
                <input type="radio" checked={mode === 'merge'} onChange={() => setMode('merge')} className="mt-1 accent-grass" />
                <span>
                  <b>Gộp</b> — cụm trùng (cùng id hoặc cùng cụm trong một chủ đề) được cập nhật nội dung, giữ tiến độ.
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm font-semibold">
                <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} className="mt-1 accent-coral" />
                <span>
                  <b>Thay thế toàn bộ</b> — xoá toàn bộ bộ từ hiện có và thay bằng dữ liệu nhập.
                </span>
              </label>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  )
}
