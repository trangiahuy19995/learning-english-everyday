export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

let voices: SpeechSynthesisVoice[] = []
function refreshVoices() {
  if (speechSupported) voices = window.speechSynthesis.getVoices()
}
if (speechSupported) {
  refreshVoices()
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices)
}

export function findVoice(lang: 'en' | 'vi'): SpeechSynthesisVoice | undefined {
  refreshVoices()
  const prefs = lang === 'en' ? ['en-US', 'en-GB', 'en'] : ['vi-VN', 'vi']
  for (const pref of prefs) {
    const v = voices.find((x) => x.lang.replace('_', '-').toLowerCase().startsWith(pref.toLowerCase()))
    if (v) return v
  }
  return undefined
}

export function hasVoice(lang: 'en' | 'vi'): boolean {
  return !!findVoice(lang)
}

export function speak(text: string, lang: 'en' | 'vi', rate = 1): Promise<void> {
  return new Promise((resolve) => {
    if (!speechSupported || !text) return resolve()
    const u = new SpeechSynthesisUtterance(text)
    const voice = findVoice(lang)
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? (lang === 'en' ? 'en-US' : 'vi-VN')
    u.rate = rate
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}

export function cancelSpeech() {
  if (speechSupported) window.speechSynthesis.cancel()
}
