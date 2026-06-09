import { Youtube, Zap, Clock } from "lucide-react"
import type { ChipOption } from "@/components/dashboard/shared/chip-popover"

// ────────────────────────────────────────────────────────────────
// Video format options
// ────────────────────────────────────────────────────────────────

export const FORMAT_OPTIONS: ChipOption[] = [
  { value: "long",  label: "Long",  icon: Youtube },
  { value: "short", label: "Short", icon: Zap },
]

// ────────────────────────────────────────────────────────────────
// Duration options — keyed by format
// ────────────────────────────────────────────────────────────────

export const LONG_DURATION_OPTIONS: ChipOption[] = [
  { value: "5",  label: "5 mins",  icon: Clock },
  { value: "10", label: "10 mins", icon: Clock },
  { value: "15", label: "15 mins", icon: Clock },
  { value: "20", label: "20 mins", icon: Clock },
  { value: "30", label: "30 mins", icon: Clock },
]

export const SHORT_DURATION_OPTIONS: ChipOption[] = [
  { value: "0.25", label: "15 secs", icon: Clock },
  { value: "0.5",  label: "30 secs", icon: Clock },
  { value: "1",    label: "1 min",   icon: Clock },
  { value: "2",    label: "2 mins",  icon: Clock },
  { value: "3",    label: "3 mins",  icon: Clock },
]

// ────────────────────────────────────────────────────────────────
// Language options  — using emoji flags for visual flair
// ────────────────────────────────────────────────────────────────

export const LANGUAGE_OPTIONS: ChipOption[] = [
  { value: "english",    label: "English",    emoji: "🇺🇸" },
  { value: "hinglish",   label: "Hinglish",   emoji: "🇮🇳" },
  { value: "hindi",      label: "Hindi",      emoji: "🇮🇳" },
  { value: "spanish",    label: "Spanish",    emoji: "🇪🇸" },
  { value: "portuguese", label: "Portuguese", emoji: "🇧🇷" },
  { value: "french",     label: "French",     emoji: "🇫🇷" },
  { value: "german",     label: "German",     emoji: "🇩🇪" },
  { value: "japanese",   label: "Japanese",   emoji: "🇯🇵" },
  { value: "korean",     label: "Korean",     emoji: "🇰🇷" },
  { value: "arabic",     label: "Arabic",     emoji: "🇸🇦" },
]

// ────────────────────────────────────────────────────────────────
// Default state
// ────────────────────────────────────────────────────────────────

export interface ScriptWriterState {
  prompt: string
  format: string
  duration: string
  tone: string
  language: string
}

export const DEFAULT_SCRIPT_WRITER_STATE: ScriptWriterState = {
  prompt: "",
  format: "short",
  duration: "1",
  tone: "",
  language: "english",
}
