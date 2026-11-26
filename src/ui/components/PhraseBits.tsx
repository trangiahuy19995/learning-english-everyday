import { Volume2 } from 'lucide-react'
import { useState } from 'react'
import { findHighlight, splitByHighlight } from '@/domain/exercises'
import { speak, speechSupported } from '@/lib/speech'
import { settingsStore } from '@/store/settingsStore'
import { cx } from '../theme'

export function IpaText({ ipa, className }: { ipa: string; className?: string }) {
  if (!ipa) return null
  return <span className={cx('font-ipa tracking-wide text-sky-dark', className)}>{ipa}</span>
}

export function HighlightedSentence({
  sentence,
  phrase,
  highlight,
  blank,
  className,
}: {
  sentence: string
  phrase: string
  highlight?: string
  blank?: boolean
  className?: string
}) {
  const parts = splitByHighlight(sentence, findHighlight(sentence, highlight, phrase))
  if (!parts) return <span className={className}>{sentence}</span>
  return (
    <span className={className}>
      {parts[0]}
      {blank ? (
        <span className="mx-0.5 inline-block min-w-24 border-b-[3px] border-dashed border-sky align-baseline text-transparent select-none">
          {parts[1]}
        </span>
      ) : (
        <mark className="rounded-md bg-sun-soft px-1 font-extrabold text-sun-dark">{parts[1]}</mark>
      )}
      {parts[2]}
    </span>
  )
}

export function SpeakButton({
  text,
  lang = 'en',
  size = 'md',
  label,
}: {
  text: string
  lang?: 'en' | 'vi'
  size?: 'sm' | 'md' | 'lg'
  label?: string
}) {
  const [playing, setPlaying] = useState(false)
  if (!speechSupported) return null
  const dims = size === 'lg' ? 'size-14' : size === 'md' ? 'size-11' : 'size-8'
  const icon = size === 'lg' ? 'size-7' : size === 'md' ? 'size-5' : 'size-4'
  return (
    <button
      type="button"
      aria-label={label ?? `Phát âm: ${text}`}
      title="Phát âm"
      onClick={async () => {
        window.speechSynthesis.cancel()
        setPlaying(true)
        await speak(text, lang, settingsStore.get().speechRate)
        setPlaying(false)
      }}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-2xl transition-[transform,box-shadow] active:translate-y-[2px]',
        size === 'sm'
          ? 'text-sky hover:bg-sky-soft'
          : 'bg-sky text-white shadow-[0_3px_0_var(--color-sky-dark)] active:shadow-none',
        playing && 'animate-pop',
        dims,
      )}
    >
      <Volume2 className={icon} />
    </button>
  )
}
