export type TranscriptLanguage = 'en' | 'ms'

interface LanguageOption {
  code: TranscriptLanguage
  label: string
  speechLang: string
  whisperLang: string
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', speechLang: 'en-US', whisperLang: 'en' },
  { code: 'ms', label: 'Bahasa Malaysia', speechLang: 'ms-MY', whisperLang: 'ms' },
]

export function speechLangFor(code: TranscriptLanguage): string {
  return LANGUAGE_OPTIONS.find(o => o.code === code)?.speechLang ?? 'en-US'
}

export function whisperLangFor(code: TranscriptLanguage): string {
  return LANGUAGE_OPTIONS.find(o => o.code === code)?.whisperLang ?? 'en'
}
