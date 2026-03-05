"use client"

import { useState, useRef, useEffect } from "react"
import {
  MessageCircle,
  X,
  Send,
  Brain,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I'm your Second Brain assistant. Ask me anything about your notes and I'll help you find connections and insights.",
  },
]

const SAMPLE_RESPONSES = [
  "Based on your notes, mental models and the Zettelkasten method share a focus on interconnected thinking. Your note on 'Building Mental Models' discusses frameworks for reasoning, while 'The Zettelkasten Method' emphasizes linking atomic ideas. Together, they suggest a powerful approach to structured learning.",
  "Looking through your knowledge base, I found several notes related to that topic. Your engineering notes on React Server Components and Edge Computing both discuss performance optimization strategies, while your design systems note connects to the UI patterns used in modern web development.",
  "That's a great question! Your notes on spaced repetition and journaling both relate to building consistent learning habits. The key insight from your collection is that consistency matters more than intensity for long-term knowledge retention.",
]

export function RagChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const handleSend = () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const response =
        SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)]
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-200",
          "size-12 bg-primary text-primary-foreground hover:bg-primary/90",
          "hover:scale-105 active:scale-95"
        )}
      >
        {open ? (
          <X className="size-5" />
        ) : (
          <MessageCircle className="size-5" />
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className={cn(
            "fixed bottom-20 right-6 z-50 flex w-[380px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl",
            "animate-in slide-in-from-bottom-4 fade-in-0 duration-200"
          )}
          style={{ height: "500px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary">
              <Brain className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-card-foreground">
                Personal RAG
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Ask your Second Brain
              </p>
            </div>
            <Sparkles className="size-4 text-muted-foreground" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-xl bg-secondary px-3.5 py-3 text-secondary-foreground">
                    <div className="size-1.5 animate-pulse rounded-full bg-muted-foreground" />
                    <div className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                    <div className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask your second brain..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
              <Button
                type="submit"
                size="icon-sm"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
              >
                <Send className="size-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
