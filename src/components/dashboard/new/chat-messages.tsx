"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IconBrain, IconChevronDown, IconChevronUp } from "@tabler/icons-react"
import { Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MessageData {
  role: "user" | "assistant"
  content: string
  isDeepThinking?: boolean
  deepThinkingLog?: string | null
  createdAt?: Date
  attachments?: Array<{ name: string; type: string; dataUrl: string }>
}

interface ChatMessagesProps {
  messages: MessageData[]
  isGenerating: boolean
  streamingText: string
}

export function ChatMessages({ messages, isGenerating, streamingText }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingText])

  return (
    <div className="flex flex-col gap-0">
      {messages.map((msg, i) =>
        msg.role === "user" ? (
          <UserBubble key={i} message={msg} />
        ) : (
          <AssistantMessage key={i} message={msg} />
        )
      )}

      {isGenerating && <StreamingMessage text={streamingText} />}

      <div ref={bottomRef} className="h-4" />
    </div>
  )
}

/* ── User bubble — right-aligned pill, no avatar ── */
function UserBubble({ message }: { message: MessageData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-end gap-2 mb-6"
    >
      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-end max-w-[85%]">
          {message.attachments.map((att, idx) =>
            att.type.startsWith("image/") ? (
              <div key={idx} className="size-20 rounded-xl overflow-hidden border border-border/40">
                <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted text-xs text-muted-foreground max-w-[160px]">
                <span>📄</span>
                <span className="truncate">{att.name}</span>
              </div>
            )
          )}
        </div>
      )}
      {/* Message pill */}
      <div className="max-w-[85%] sm:max-w-[75%] bg-muted text-foreground rounded-3xl rounded-br-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
        {message.content}
      </div>
    </motion.div>
  )
}

/* ── Assistant message — left-aligned plain text, no bubble ── */
function AssistantMessage({ message }: { message: MessageData }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8 group"
    >
      {/* Deep thinking accordion */}
      {message.deepThinkingLog && (
        <ReasoningAccordion log={message.deepThinkingLog} />
      )}

      {/* Message body — no background, just clean text */}
      <div className="text-sm sm:text-[15px] leading-[1.75] text-foreground">
        <FormattedText text={message.content} />
      </div>

      {/* Action buttons — visible on hover on desktop, always visible on mobile */}
      <div className="flex items-center gap-0.5 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
        <ActionButton
          icon={copied ? Check : Copy}
          label={copied ? "Copied!" : "Copy"}
          onClick={handleCopy}
          active={copied}
        />
        <ActionButton icon={ThumbsUp} label="Good response" onClick={() => {}} />
        <ActionButton icon={ThumbsDown} label="Bad response" onClick={() => {}} />
      </div>
    </motion.div>
  )
}

/* ── Live streaming message ── */
function StreamingMessage({ text }: { text: string }) {
  const hasOpenReasoning = text.includes("<reasoning>") && !text.includes("</reasoning>")
  const hasClosedReasoning = text.includes("<reasoning>") && text.includes("</reasoning>")

  let liveReasoning = ""
  let displayText = text

  if (hasOpenReasoning) {
    liveReasoning = text.replace("<reasoning>", "").trim()
    displayText = ""
  } else if (hasClosedReasoning) {
    const match = text.match(/<reasoning>([\s\S]*?)<\/reasoning>/)
    if (match) {
      liveReasoning = match[1].trim()
      displayText = text.replace(/<reasoning>[\s\S]*?<\/reasoning>/g, "").trim()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Live reasoning box */}
      {(hasOpenReasoning || (hasClosedReasoning && liveReasoning)) && (
        <div className="mb-4 rounded-xl border border-primary/15 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-primary/70 mb-1.5">
            <IconBrain className="size-3.5" style={{ animation: "spin 3s linear infinite" }} />
            Thinking deeply…
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {liveReasoning}
          </p>
        </div>
      )}

      {/* Streaming text or waiting dots */}
      <div className="text-sm sm:text-[15px] leading-[1.75] text-foreground">
        {displayText ? (
          <>
            <FormattedText text={displayText} />
            <span className="inline-block w-[2px] h-4 bg-foreground/60 ml-0.5 animate-pulse rounded-full align-middle" />
          </>
        ) : !hasOpenReasoning ? (
          <div className="flex items-center gap-1.5 h-6">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

/* ── Collapsible reasoning accordion ── */
function ReasoningAccordion({ log }: { log: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-4 rounded-xl border border-primary/15 bg-primary/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-[11px] font-semibold text-primary/70 hover:bg-primary/10 transition-colors"
      >
        <span className="flex items-center gap-2">
          <IconBrain className="size-3.5" />
          Coach's reasoning
        </span>
        {open ? <IconChevronUp className="size-3" /> : <IconChevronDown className="size-3" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-primary/10 text-[11px] text-muted-foreground/70 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
              {log}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Small icon action button ── */
function ActionButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "p-1.5 rounded-lg transition-colors duration-150",
        active
          ? "text-primary"
          : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/60"
      )}
    >
      <Icon className="size-3.5" />
    </button>
  )
}

/* ── Markdown-ish text formatter ── */
function FormattedText({ text }: { text: string }) {
  if (!text) return null

  const paragraphs = text.split(/\n\n+/)

  return (
    <div className="space-y-3">
      {paragraphs.map((block, i) => {
        // Headings
        if (block.startsWith("### ")) return (
          <h4 key={i} className="font-semibold text-foreground text-sm mt-2">
            {inlineFormat(block.slice(4))}
          </h4>
        )
        if (block.startsWith("## ")) return (
          <h3 key={i} className="font-bold text-foreground mt-2">
            {inlineFormat(block.slice(3))}
          </h3>
        )
        if (block.startsWith("# ")) return (
          <h2 key={i} className="text-lg font-bold text-foreground mt-2">
            {inlineFormat(block.slice(2))}
          </h2>
        )

        const lines = block.split("\n")
        const isListBlock = lines.every((l) => /^[-*•]\s/.test(l) || /^\d+\.\s/.test(l))

        if (isListBlock) return (
          <ul key={i} className="space-y-1.5 pl-1">
            {lines.map((line, j) => (
              <li key={j} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="text-muted-foreground/70 mt-0.5 shrink-0 text-xs">•</span>
                <span>{inlineFormat(line.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, ""))}</span>
              </li>
            ))}
          </ul>
        )

        // Multi-line non-list block — preserve single newlines
        if (block.includes("\n")) return (
          <div key={i} className="space-y-1">
            {lines.map((line, j) => (
              <p key={j} className="text-sm leading-relaxed">{inlineFormat(line)}</p>
            ))}
          </div>
        )

        return (
          <p key={i} className="text-sm leading-relaxed">
            {inlineFormat(block)}
          </p>
        )
      })}
    </div>
  )
}

function inlineFormat(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
    ) : p
  )
}
