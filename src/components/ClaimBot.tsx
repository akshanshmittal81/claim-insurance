import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are ClaimBot, a helpful assistant for ClaimTitans — an AI-powered vehicle insurance claim platform.

About ClaimTitans:
- Users can file vehicle damage claims by uploading photos/videos or using live camera
- AI automatically detects damage and estimates repair costs
- Claims are processed in real-time with blockchain verification
- Users login with their vehicle number (e.g. UP15ER2915)
- Supported evidence: JPG/PNG images (max 6, 10MB each), WebM videos
- Voice input supported for damage description (Chrome browser)
- GPS location can be attached to claims
- Fake/AI-generated images are auto-detected and rejected

You help users with:
- How to file a claim step by step
- What evidence to upload
- Claim status and processing questions
- Technical issues with camera/upload
- Understanding AI damage assessment
- General insurance claim queries

Keep responses concise, friendly, and helpful. Use bullet points for steps. If unsure, say so honestly.`

export default function ClaimBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm ClaimBot 👋 I can help you file a claim, understand your coverage, or troubleshoot any issues. What do you need help with?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL
const response = await fetch(`${baseUrl}/claimbot`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: newMessages.map(m => ({ role: m.role, content: m.content }))
  })
})

      const data = await response.json()
const reply = data.content?.[0]?.text || data[0]?.text || "Sorry, try again."
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops! Something went wrong. Please check your connection and try again."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const quickQuestions = [
    "How do I file a claim?",
    "What photos should I upload?",
    "How long does processing take?",
  ]

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
              boxShadow: '0 4px 24px rgba(37,99,235,0.4)',
            }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[370px] rounded-2xl overflow-hidden flex flex-col"
            style={{
              height: '540px',
              background: 'rgba(255,255,255,0.97)',
              border: '1.5px solid #BFDBFE',
              boxShadow: '0 8px 40px rgba(37,99,235,0.15)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">ClaimBot</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                  <p className="text-blue-100 text-xs">AI Assistant • Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/20">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#BFDBFE transparent' }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: msg.role === 'assistant'
                        ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)'
                        : 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                      border: msg.role === 'assistant' ? '1px solid #BFDBFE' : 'none'
                    }}>
                    {msg.role === 'assistant'
                      ? <Bot className="w-3.5 h-3.5 text-blue-500" />
                      : <User className="w-3.5 h-3.5 text-white" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className="max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: msg.role === 'assistant'
                        ? 'linear-gradient(135deg, #F0F7FF, #EFF6FF)'
                        : 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                      color: msg.role === 'assistant' ? '#1E293B' : 'white',
                      border: msg.role === 'assistant' ? '1px solid #DBEAFE' : 'none',
                      borderRadius: msg.role === 'assistant' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE' }}>
                    <Bot className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl flex items-center gap-1"
                    style={{ background: '#F0F7FF', border: '1px solid #DBEAFE', borderRadius: '4px 16px 16px 16px' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions (only at start) */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                {quickQuestions.map((q) => (
                  <button key={q} onClick={() => { setInput(q); inputRef.current?.focus() }}
                    className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-[1.02]"
                    style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontWeight: 600 }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid #DBEAFE', background: 'rgba(255,255,255,0.9)' }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: '#F0F7FF', border: '1.5px solid #BFDBFE' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question..."
                  className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: input.trim() && !isLoading
                      ? 'linear-gradient(135deg, #2563EB, #0EA5E9)'
                      : '#E2E8F0',
                    opacity: input.trim() && !isLoading ? 1 : 0.6,
                  }}
                >
                  {isLoading
                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                    : <Send className="w-4 h-4 text-white" />}
                </button>
              </div>
              <p className="text-center text-xs text-slate-300 mt-1.5">Powered by ClaimTitans AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
