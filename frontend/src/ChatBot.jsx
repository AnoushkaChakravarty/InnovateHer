// ChatBot.jsx — Split-screen: Job Profile (left) + AI Negotiation Coach (right)
// Matches Figma "Chat Bot" screen
import React, { useState, useRef, useEffect, useCallback } from 'react'
import aceAvatar from '@ill/Ace_profilepicture.png'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'


ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
)

function cssRgb(varName, alpha = 1) {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    if (!v) return undefined
    return `rgb(${v} / ${alpha})`
  } catch {
    return undefined
  }
}

const ENDPOINTS = {
  gapCheck: '/api/gap-check',
  simulate: '/api/simulate',
  chat: '/api/chat',
}

const ROLES = [
  'Software Engineer',
  'Data Analyst',
  'Data Scientist',
  'Product Manager',
  'UX Designer',
  'Marketing Manager',
  'Financial Analyst',
  'Project Manager',
  'DevOps Engineer',
  'Machine Learning Engineer',
]

export default function ChatBot() {
  // ===== JOB PROFILE STATE =====
  const [salary, setSalary] = useState('')
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [otherInfo, setOtherInfo] = useState('')
  const [showGraph, setShowGraph] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const [gapResult, setGapResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  // ===== CHAT STATE =====
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)

  // ===== SIMULATOR STATE =====
  const [simResult, setSimResult] = useState(null)

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ===== START CHAT =====
  async function handleStartChat() {
    if (!salary || !role) return
    setChatStarted(true)
    setAnalyzing(true)

    // Run gap check
    try {
      const res = await fetch(ENDPOINTS.gapCheck, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          location,
          current_salary: parseFloat(salary) || 0,
        }),
      })
      const data = await res.json()
      setGapResult(data)

      // Opening message from coach based on gap check
      const verdictMsg = data.verdict === 'UNDERPAID'
        ? `Based on market data, you're leaving $${data.gap_amount?.toLocaleString()} on the table. The market average for ${role} is $${data.market_average?.toLocaleString()}. Let's work on getting you what you deserve.`
        : `Good news — your salary of $${parseFloat(salary).toLocaleString()} is competitive for ${role} (market average: $${data.market_average?.toLocaleString()}). Let's make sure you're maximizing your total compensation.`

      setMessages([
        { from: 'coach', text: verdictMsg },
        { from: 'coach', text: "What would you like to negotiate? Tell me about your situation — salary, equity, benefits, or something else?" },
      ])
    } catch {
      setGapResult({
        verdict: 'UNDERPAID',
        gap_amount: 12000,
        market_average: 97000,
        message: 'Unable to reach server.',
      })
      setMessages([
        { from: 'coach', text: "Hi! I'm your AI negotiation coach. What would you like help with — salary, equity, benefits, or your specific situation?" },
      ])
    }

    // Run simulation if graph toggle is on
    if (showGraph) {
      runSimulation(6)
    }

    setAnalyzing(false)
    setTimeout(() => chatInputRef.current?.focus(), 100)
  }

  // ===== SEND CHAT =====
  async function sendChat() {
    const text = chatInput.trim()
    if (!text || chatLoading) return

    setMessages((prev) => [...prev, { from: 'user', text }])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await fetch(ENDPOINTS.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            role,
            salary: parseFloat(salary) || '',
            location,
            market_average: gapResult?.market_average || '',
            gap_amount: gapResult?.gap_amount || '',
            verdict: gapResult?.verdict || '',
            history: messages.slice(-6),
          },
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { from: 'coach', text: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: 'coach',
          text: "I'm having trouble connecting. Key tip: Never reveal your current salary first. Ask 'What's the budgeted range for this role?' (Source: Harvard Business Review)",
        },
      ])
    }
    setChatLoading(false)
    chatInputRef.current?.focus()
  }

  // ===== SIMULATE =====
  const runSimulation = useCallback(async (m) => {
    try {
      const res = await fetch(ENDPOINTS.simulate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months: m, monthly_spend: 2000 }),
      })
      const data = await res.json()
      setSimResult(data)
    } catch {
      const chart = []
      let bal = 25000
      chart.push(bal)
      for (let i = 0; i < m; i++) {
        bal = Math.max(0, bal - 2000)
        chart.push(bal)
      }
      setSimResult({
        lost: 25000 - chart[chart.length - 1],
        chart_data: chart,
        message: `A ${m}-month break costs you $${(m * 2000).toLocaleString()} in savings.`,
      })
    }
  }, [])

  // ===== CHART =====
  const tickColor = cssRgb('--gc-text-muted', 1) || '#6b7280'
  const gridColor = cssRgb('--gc-border', 0.2) || 'rgba(229, 231, 235, 1)'
  const warnColor = cssRgb('--gc-warn', 1) || '#ef4444'
  const warnFill = cssRgb('--gc-warn', 0.12) || 'rgba(239, 68, 68, 0.08)'

  const chartData = simResult?.chart_data
    ? {
        labels: simResult.chart_data.map((_, i) => (i === 0 ? 'Start' : `Mo ${i}`)),
        datasets: [{
          label: 'Savings ($)',
          data: simResult.chart_data,
          borderColor: warnColor,
          backgroundColor: warnFill,
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: warnColor,
        }],
      }
    : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => `$${(v / 1000).toFixed(0)}k`, color: tickColor },
        grid: { color: gridColor },
      },
      x: {
        ticks: { color: tickColor },
        grid: { display: false },
      },
    },
  }

  const isUnderpaid = gapResult?.verdict === 'UNDERPAID'

  return (
    <div className="flex flex-1 bg-gc-bg transition-colors" style={{ height: 'calc(100vh - 65px)' }}>
      {/* ===== LEFT: JOB PROFILE ===== */}
      <div className="w-[45%] max-w-[500px] border-r border-gc-border/20 flex flex-col overflow-y-auto transition-colors">
        {/* Card */}
        <div className="m-5 rounded-3xl bg-gc-surface border border-gc-border/20 flex flex-col flex-1 overflow-hidden shadow-gc transition-colors">
          {/* Card Header */}
          <div className="bg-gc-bgMuted/40 rounded-t-3xl px-6 py-4 border-b border-gc-border/20 transition-colors">
            <h2 className="text-lg font-semibold">Job Profile</h2>
          </div>

          {/* Card Body */}
          <div className="px-6 py-5 flex flex-col flex-1">
            {/* Salary */}
            <label htmlFor="salary" className="text-xs text-gc-mutedText mb-1">Salary</label>
            <input
              id="salary"
              type="number"
              placeholder="85000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              disabled={chatStarted}
              aria-label="Enter your salary"
              className="border-b border-gc-border/50 bg-transparent pb-2 mb-5 text-sm focus:outline-none focus:border-gc-primary placeholder:text-gc-mutedText/70 disabled:text-gc-mutedText"
            />

            {/* Role */}
            <label htmlFor="role" className="text-xs text-gc-mutedText mb-1">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={chatStarted}
              aria-label="Select your role"
              className="border-b border-gc-border/50 bg-transparent pb-2 mb-5 text-sm focus:outline-none focus:border-gc-primary appearance-none disabled:text-gc-mutedText"
            >
              <option value="">Select a role...</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Location */}
            <label htmlFor="location" className="text-xs text-gc-mutedText mb-1">Location</label>
            <input
              id="location"
              type="text"
              placeholder="New York City, NY, US"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={chatStarted}
              aria-label="Enter your location"
              className="border-b border-gc-border/50 bg-transparent pb-2 mb-5 text-sm focus:outline-none focus:border-gc-primary placeholder:text-gc-mutedText/70 disabled:text-gc-mutedText"
            />

            {/* Other Information */}
            <label htmlFor="other" className="text-xs text-gc-mutedText mb-1">Other Information</label>
            <input
              id="other"
              type="text"
              placeholder="Years of experience, certifications..."
              value={otherInfo}
              onChange={(e) => setOtherInfo(e.target.value)}
              disabled={chatStarted}
              aria-label="Enter other information"
              className="border-b border-gc-border/50 bg-transparent pb-2 mb-6 text-sm focus:outline-none focus:border-gc-primary placeholder:text-gc-mutedText/70 disabled:text-gc-mutedText"
            />

            {/* Gender Breakdown Graph Toggle */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm">Display Gender Breakdown Graph</span>
              <button
                type="button"
                role="switch"
                aria-checked={showGraph}
                onClick={() => !chatStarted && setShowGraph(!showGraph)}
                disabled={chatStarted}
                className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gc-accent focus:ring-offset-2 focus:ring-offset-gc-bg ${
                  showGraph ? 'bg-gc-primary' : 'bg-gc-border/30'
                } ${chatStarted ? 'opacity-50' : ''}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-gc-bg shadow transition-transform ${
                    showGraph ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Start Chat Button */}
            {!chatStarted ? (
              <button
                onClick={handleStartChat}
                disabled={!salary || !role || analyzing}
                className="bg-gc-primary hover:bg-gc-primary2 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 px-6 rounded-lg self-start transition-colors focus:outline-none focus:ring-2 focus:ring-gc-accent focus:ring-offset-2 focus:ring-offset-gc-bg"
              >
                {analyzing ? 'Analyzing...' : 'Start Chat'}
              </button>
            ) : (
              <p className="text-xs text-gc-mutedText">
                Complete your Job Profile to begin chatting.
              </p>
            )}

            {/* Verdict (shown after Start Chat) */}
            {gapResult && chatStarted && (
              <div className={`mt-5 rounded-xl p-4 border transition-colors ${
                isUnderpaid ? 'bg-gc-warn/10 border-gc-warn/30' : 'bg-gc-primary/10 border-gc-primary/30'
              }`}>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${
                  isUnderpaid ? 'bg-gc-warn/15 text-gc-warn' : 'bg-gc-primary/15 text-gc-primary'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isUnderpaid ? 'bg-gc-warn' : 'bg-gc-primary'}`} aria-hidden="true" />
                  {gapResult.verdict}
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gc-mutedText">Market Average</span>
                    <span className="font-semibold">${gapResult.market_average?.toLocaleString()}</span>
                  </div>
                  {gapResult.gap_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gc-mutedText">Gap</span>
                      <span className="font-semibold text-gc-warn">${gapResult.gap_amount?.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Simulator Chart (if toggled on) */}
            {showGraph && simResult && chartData && chatStarted && (
              <div className="mt-5 rounded-xl border border-gc-border/20 bg-gc-bg p-4 transition-colors">
                <p className="text-xs text-gc-mutedText mb-2 font-semibold">Career Break Cost</p>
                <div className="h-40">
                  <ErrorBoundary>
                    <Line data={chartData} options={chartOptions} />
                  </ErrorBoundary>
                </div>
                <p className="text-xs text-gc-warn font-semibold mt-2 text-center">
                  Total cost: ${simResult.lost?.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== RIGHT: AI NEGOTIATION COACH ===== */}
      <div className="flex-1 flex flex-col border-l border-gc-border/20 transition-colors">
        {/* Coach Header */}
        <div className="border-b border-gc-border/20 px-5 py-3 flex items-center gap-3 bg-gc-bg/60 backdrop-blur transition-colors">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gc-bgMuted/50 border border-gc-border/20">
            <img src={aceAvatar} alt="Ace profile" className="w-full h-full object-cover" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Ace</div>
            <div className="text-xs text-gc-mutedText">AI Negotiation Coach</div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {!chatStarted && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gc-mutedText text-sm">
                Complete your Job Profile to begin chatting.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
      
                {msg.from === 'coach' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gc-bgMuted/50 border border-gc-border/20 shrink-0 mr-2 mt-1">
                    <img src={aceAvatar} alt="Ace" className="w-full h-full object-cover" />
                  </div>
                )}
              
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-gc-primary text-white rounded-br-sm'
                    : 'bg-gc-surface text-gc-text border border-gc-border/15 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-gc-bgMuted/50 border border-gc-border/20 flex items-center justify-center text-[10px] font-bold text-gc-primary shrink-0 mr-2 mt-1">
                <img src={aceAvatar} alt="Ace" className="w-full h-full object-cover" />
              </div>
              <div className="bg-gc-surface border border-gc-border/15 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gc-mutedText">
                <span className="animate-pulse">Researching...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="border-t border-gc-border/20 p-4 shrink-0 bg-gc-bg/70 backdrop-blur transition-colors">
          <div className="flex items-center gap-2">
            <label htmlFor="chat-input" className="sr-only">Type your message</label>
            <input
              ref={chatInputRef}
              id="chat-input"
              type="text"
              placeholder={chatStarted ? "Ask about salary, equity, benefits..." : "Start chat to begin"}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendChat()
                }
              }}
              disabled={!chatStarted}
              aria-label="Type your negotiation question"
              className="flex-1 bg-gc-bg border border-gc-border/30 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gc-accent focus:border-transparent placeholder:text-gc-mutedText/70 disabled:bg-gc-bgMuted/30 transition-colors"
            />
            <button
              onClick={sendChat}
              disabled={chatLoading || !chatInput.trim() || !chatStarted}
              aria-label="Send message"
              className="w-9 h-9 rounded-full bg-gc-bg border border-gc-border/30 flex items-center justify-center hover:bg-gc-bgMuted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gc-accent"
            >
              <svg className="w-4 h-4 text-gc-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-xs text-gc-mutedText text-center py-4">Chart unavailable</div>
    }
    return this.props.children
  }
}