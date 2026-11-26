import { ArrowLeft, Plus, Trash2, Wand2 } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import type { Example, Synonym } from '@/domain/types'
import { navigate } from '@/navigation'
import { useStore } from '@/store/createStore'
import { libraryStore, phraseStore } from '@/store/phraseStore'
import { Button } from '../components/Button'
import { Card } from '../components/Primitives'
import { toast } from '../components/Toast'
import { cx } from '../theme'

const inputCls = 'h-12 w-full rounded-2xl border-2 border-line bg-white px-4 font-semibold outline-none focus:border-sky'

function Field({ label, required, error, children, hint }: { label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-extrabold">
        {label}
        {required && <span className="text-coral"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="text-xs font-semibold text-ink-muted">{hint}</span>}
      {error && <span className="text-sm font-bold text-coral-dark">{error}</span>}
    </label>
  )
}

export function PhraseEditor({ deckId, phraseId }: { deckId: string; phraseId?: string }) {
  const { decks, phrases } = useStore(libraryStore)
  const existing = phrases.find((p) => p.id === phraseId)
  const [phrase, setPhrase] = useState(existing?.phrase ?? '')
  const [ipa, setIpa] = useState(existing?.ipa ?? '')
  const [meaning, setMeaning] = useState(existing?.meaning_vi ?? '')
  const [nuance, setNuance] = useState(existing?.nuance_vi ?? '')
  const [topic, setTopic] = useState(existing?.topic ?? deckId)
  const [synonyms, setSynonyms] = useState<Synonym[]>(existing?.synonyms ?? [])
  const [examples, setExamples] = useState<Example[]>(existing?.examples ?? [{ en: '', vi: '' }])
  const [submitted, setSubmitted] = useState(false)
  const enRefs = useRef<(HTMLTextAreaElement | null)[]>([])

  const duplicate = phrases.some(
    (p) => p.id !== phraseId && p.topic === topic && p.phrase.trim().toLowerCase() === phrase.trim().toLowerCase(),
  )
  const exampleErrors = examples.map((e) => {
    if (!e.en.trim() || !e.vi.trim()) return 'Cần cả câu tiếng Anh và bản dịch.'
    if (e.highlight && !e.en.includes(e.highlight)) return 'Phần tô sáng phải nằm nguyên văn trong câu tiếng Anh.'
    return ''
  })
  const errors = {
    phrase: !phrase.trim() ? 'Vui lòng nhập cụm từ.' : duplicate ? 'Cụm từ này đã có trong bộ từ.' : '',
    meaning: !meaning.trim() ? 'Vui lòng nhập nghĩa tiếng Việt.' : '',
    examples: examples.length === 0 ? 'Cần ít nhất một câu ví dụ.' : '',
  }
  const valid = !errors.phrase && !errors.meaning && !errors.examples && exampleErrors.every((e) => !e)

  const back = () => navigate({ name: 'deck', deckId: topic })

  const save = () => {
    setSubmitted(true)
    if (!valid) return
    const data = {
      phrase: phrase.trim(),
      ipa: ipa.trim(),
      meaning_vi: meaning.trim(),
      nuance_vi: nuance.trim() || undefined,
      topic,
      synonyms: synonyms.filter((s) => s.text.trim()).map((s) => ({ text: s.text.trim(), note_vi: s.note_vi?.trim() || undefined })),
      examples: examples.map((e) => ({ en: e.en.trim(), vi: e.vi.trim(), highlight: e.highlight?.trim() || undefined })),
    }
    if (existing) phraseStore.updatePhrase(existing.id, data)
    else phraseStore.addPhrase(data)
    toast(existing ? 'Đã lưu thay đổi' : 'Đã thêm cụm từ')
    back()
  }

  const setEx = (i: number, patch: Partial<Example>) => setExamples((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const setSyn = (i: number, patch: Partial<Synonym>) => setSynonyms((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  const show = (msg: string) => (submitted ? msg || undefined : undefined)

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={back} className="mb-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Quay lại
      </button>
      <h1 className="mb-6 text-3xl font-black">{existing ? 'Sửa cụm từ' : 'Thêm cụm từ mới'}</h1>

      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <Card className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
          <Field label="Cụm từ tiếng Anh" required error={show(errors.phrase)}>
            <input value={phrase} onChange={(e) => setPhrase(e.target.value)} className={inputCls} placeholder="take a rain check" />
          </Field>
          <Field label="Phiên âm IPA" hint="Ví dụ: /teɪk ə ˈreɪn tʃek/">
            <input value={ipa} onChange={(e) => setIpa(e.target.value)} className={cx(inputCls, 'font-ipa')} placeholder="/…/" />
          </Field>
          <Field label="Nghĩa tiếng Việt" required error={show(errors.meaning)}>
            <input value={meaning} onChange={(e) => setMeaning(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Chủ đề" required>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className={inputCls}>
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Sắc thái / ngữ cảnh sử dụng" hint="Trang trọng, thân mật, công sở…">
              <input value={nuance} onChange={(e) => setNuance(e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">Từ đồng nghĩa</h2>
            <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => setSynonyms((s) => [...s, { text: '' }])}>
              Thêm
            </Button>
          </div>
          {!synonyms.length && <p className="text-sm font-semibold text-ink-muted">Chưa có từ đồng nghĩa.</p>}
          <div className="flex flex-col gap-3">
            {synonyms.map((s, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row">
                <input value={s.text} onChange={(e) => setSyn(i, { text: e.target.value })} placeholder="Cụm đồng nghĩa" aria-label="Cụm đồng nghĩa" className={cx(inputCls, 'sm:w-2/5')} />
                <input value={s.note_vi ?? ''} onChange={(e) => setSyn(i, { note_vi: e.target.value })} placeholder="Ghi chú khác biệt (tuỳ chọn)" aria-label="Ghi chú" className={cx(inputCls, 'flex-1')} />
                <button type="button" aria-label="Xoá" onClick={() => setSynonyms((xs) => xs.filter((_, j) => j !== i))} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-ink-muted hover:bg-coral-soft hover:text-coral">
                  <Trash2 className="size-5" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">
              Câu ví dụ song ngữ <span className="text-coral">*</span>
            </h2>
            <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => setExamples((s) => [...s, { en: '', vi: '' }])}>
              Thêm
            </Button>
          </div>
          {submitted && errors.examples && <p className="mb-2 text-sm font-bold text-coral-dark">{errors.examples}</p>}
          <div className="flex flex-col gap-4">
            {examples.map((ex, i) => (
              <div key={i} className="rounded-2xl border-2 border-line p-4">
                <div className="flex flex-col gap-3">
                  <textarea
                    ref={(el) => {
                      enRefs.current[i] = el
                    }}
                    value={ex.en}
                    onChange={(e) => setEx(i, { en: e.target.value })}
                    rows={2}
                    placeholder="Câu tiếng Anh"
                    aria-label="Câu tiếng Anh"
                    className="w-full resize-y rounded-2xl border-2 border-line px-4 py-3 font-semibold outline-none focus:border-sky"
                  />
                  <textarea
                    value={ex.vi}
                    onChange={(e) => setEx(i, { vi: e.target.value })}
                    rows={2}
                    placeholder="Bản dịch tiếng Việt"
                    aria-label="Bản dịch tiếng Việt"
                    className="w-full resize-y rounded-2xl border-2 border-line px-4 py-3 font-semibold outline-none focus:border-sky"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      value={ex.highlight ?? ''}
                      onChange={(e) => setEx(i, { highlight: e.target.value })}
                      placeholder="Phần cụm từ trong câu (vd: took a rain check)"
                      aria-label="Phần tô sáng"
                      className={cx(inputCls, 'flex-1')}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Wand2 className="size-4" />}
                      onClick={() => {
                        const el = enRefs.current[i]
                        if (!el) return
                        const sel = el.value.slice(el.selectionStart, el.selectionEnd).trim()
                        if (sel) setEx(i, { highlight: sel })
                        else toast('Bôi đen cụm từ trong câu tiếng Anh trước', 'info')
                      }}
                    >
                      Lấy phần đang chọn
                    </Button>
                    <button type="button" aria-label="Xoá ví dụ" onClick={() => setExamples((xs) => xs.filter((_, j) => j !== i))} className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-coral-soft hover:text-coral">
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                  {submitted && exampleErrors[i] && <p className="text-sm font-bold text-coral-dark">{exampleErrors[i]}</p>}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs font-semibold text-ink-muted">Phần tô sáng dùng cho bài tập điền từ. Để trống nếu cụm từ xuất hiện nguyên dạng trong câu.</p>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={back}>
            Huỷ
          </Button>
          <Button type="submit">{existing ? 'Lưu thay đổi' : 'Thêm cụm từ'}</Button>
        </div>
      </form>
    </div>
  )
}
