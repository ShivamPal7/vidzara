"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { FeatureCardsGrid } from "@/components/dashboard/new/feature-cards-grid"
import { PromptInput } from "@/components/dashboard/new/prompt-input"
import { ChatMessages, type MessageData } from "@/components/dashboard/new/chat-messages"
import { getUsageData, type UsageData } from "@/actions/usage"
import { createChatSession, getChatMessages } from "@/actions/chat"
import { getConnectedChannel } from "@/actions/growth-analytics"
import { useSidebar } from "@/components/ui/sidebar"
import { toast } from "sonner"

function NewPageContent() {
  const { state, isMobile } = useSidebar()
  const searchParams = useSearchParams()
  const urlSessionId = searchParams.get("sessionId")

  const [usage, setUsage] = useState<UsageData>({ used: 0, limit: 3, remaining: 3 })
  const [selectedTool, setSelectedTool] = useState("")
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [channelName, setChannelName] = useState<string | null>(null)

  const isInChatMode = messages.length > 0 || isGenerating

  // The fixed input bar needs to start AFTER the sidebar on desktop.
  // --sidebar-width is set by SidebarProvider and is available via CSS cascade.
  // On mobile, sidebar is a drawer (Sheet) — so left starts at 0.
  const fixedLeft = !isMobile && state === "expanded"
    ? "var(--sidebar-width)"
    : "0px"

  useEffect(() => {
    getUsageData().then(setUsage).catch(console.error)
    getConnectedChannel()
      .then((res) => { if (res.success && res.data) setChannelName(res.data.channelTitle) })
      .catch(console.error)
  }, [])

  // Load chat messages when sessionId query param changes
  useEffect(() => {
    if (urlSessionId) {
      setSessionId(urlSessionId)
      getChatMessages(urlSessionId)
        .then((res) => {
          if (res.success && res.data) {
            const mapped: MessageData[] = res.data.map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
              isDeepThinking: msg.isDeepThinking,
              deepThinkingLog: msg.deepThinkingLog,
              createdAt: new Date(msg.createdAt),
            }))
            setMessages(mapped)
          } else {
            toast.error(res.error || "Failed to load chat history.")
          }
        })
        .catch((err) => {
          console.error(err)
          toast.error("Failed to load chat history.")
        })
    } else {
      setSessionId(null)
      setMessages([])
    }
  }, [urlSessionId])

  const handleSelect = (toolId: string, initialPrompt?: string) => {
    setSelectedTool(toolId)
    if (initialPrompt) setPrompt(initialPrompt)
  }

  const handleSendMessage = useCallback(async (
    text: string,
    isDeepThinking: boolean,
    attachments: Array<{ name: string; type: string; dataUrl: string }>
  ) => {
    if (!text.trim() || isGenerating) return

    // Tool redirect
    if (selectedTool) {
      const paths: Record<string, string> = {
        "script-writer": "/dashboard/create/script-writer",
        "video-seo": "/dashboard/create/video-seo",
        "topic-generator": "/dashboard/analyze/topic-generator",
        "thumbnail-concepts": "/dashboard/create/thumbnail",
        "script-shortener": "/dashboard/optimize/script-shortener",
        "hook-generator": "/dashboard/optimize/hook-detector",
      }
      const path = paths[selectedTool] ?? `/dashboard/create/${selectedTool}`
      window.location.href = `${path}?prompt=${encodeURIComponent(text)}`
      return
    }

    // Ensure a session exists
    let activeSessionId = sessionId
    if (!activeSessionId) {
      const res = await createChatSession(text.slice(0, 40) + (text.length > 40 ? "…" : ""))
      if (res.success && res.data) {
        activeSessionId = res.data.id
        setSessionId(activeSessionId)
      } else {
        toast.error("Couldn't start a coaching session. Try again.")
        return
      }
    }

    setMessages((prev) => [...prev, { role: "user", content: text, attachments, createdAt: new Date() }])
    setIsGenerating(true)
    setStreamingText("")
    setPrompt("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, prompt: text, isDeepThinking, attachments }),
      })
      if (!response.ok) throw new Error("Coach couldn't respond. Please try again.")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Stream not available.")

      const decoder = new TextDecoder()
      let done = false
      let accumulated = ""

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          accumulated += decoder.decode(value, { stream: !done })
          setStreamingText(accumulated)
        }
      }

      let cleanContent = accumulated
      let deepThinkingLog: string | null = null
      if (isDeepThinking) {
        const match = accumulated.match(/<reasoning>([\s\S]*?)<\/reasoning>/)
        if (match) {
          deepThinkingLog = match[1].trim()
          cleanContent = accumulated.replace(/<reasoning>[\s\S]*?<\/reasoning>/g, "").trim()
        }
      }

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: cleanContent,
        isDeepThinking,
        deepThinkingLog,
        createdAt: new Date(),
      }])
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Try again.")
    } finally {
      setIsGenerating(false)
      setStreamingText("")
    }
  }, [sessionId, isGenerating, selectedTool])

  return (
    <div className="relative w-full min-h-full">
      {/* ── Scrollable content area ── */}
      {/* padding-bottom reserves space so content doesn't hide behind the fixed input bar */}
      <div className="max-w-3xl mx-auto px-2 sm:px-4 pb-44">
        <AnimatePresence mode="wait">
          {!isInChatMode ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center gap-10 py-8"
              style={{ minHeight: "calc(100svh - 220px)" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-center space-y-2"
              >
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  {channelName
                    ? `Hey, let's grow ${channelName} 🚀`
                    : "How can I help you today?"}
                </h1>
                {channelName && (
                  <p className="text-sm text-muted-foreground">
                    Your YouTube Coach is ready — ask anything about growth, content, or strategy.
                  </p>
                )}
              </motion.div>

              <FeatureCardsGrid onSelect={handleSelect} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="pt-6"
            >
              <ChatMessages
                messages={messages}
                isGenerating={isGenerating}
                streamingText={streamingText}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Fixed floating input bar ──
           Uses `position: fixed` so it never scrolls regardless of page height.
           `left` is dynamically set from the sidebar state so it clears the sidebar panel. */}
      <div
        className="fixed bottom-0 right-0 z-30 transition-[left] duration-200 ease-linear"
        style={{ left: fixedLeft }}
      >
        {/* Gradient fade above the bar so messages don't hard-cut */}
        <div className="pointer-events-none absolute inset-x-0 -top-12 h-12 bg-gradient-to-t from-background to-transparent" />
        <div className="max-w-3xl mx-auto px-2 sm:px-4 pb-4 pt-1">
          <PromptInput
            usage={usage}
            value={prompt}
            onChange={setPrompt}
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
            onSend={handleSendMessage}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  )
}

export default function NewPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-pulse">
        <div className="h-10 w-10 rounded-full bg-primary/10 mb-4 animate-bounce" />
        <h2 className="text-lg font-medium text-muted-foreground">Loading coaching session...</h2>
      </div>
    }>
      <NewPageContent />
    </Suspense>
  )
}
