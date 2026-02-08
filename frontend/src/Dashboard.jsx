// Dashboard.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
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

// Hardcoded endpoints per spec
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

export default function Dashboard() {
  // ===== LEFT SIDEBAR STATE =====
  const [role, setRole] = useState('')
  const [city, setCity] = useState('')
  const [salary, setSalary] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [gapResult, setGapResult] = useState(null)

  // ===== RIGHT PANEL STATE =====
  const [activeTab, setActiveTab] = useState('coach')

  // ===== COACH STATE =====
  const [messages, setMessages] = useState([
    {
      from: 'coach',
      text: "Hi! I'm your negotiation coach. Tell me about your situation \u2014 are you negotiating salary, equity, or benefits? I'll pull research-backed tips to help you advocate for what you're worth.",
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)

  // ===== SIMULATOR STATE =====
  const [months, setMonths] = useState(6)
  const [simResult, setSimResult] = useState(null)
  const [simLoading, setSimLoading] = useState(false)
  const [chartError, setChartError] = useState(false)

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ===== API: Gap Check =====
  async function analyzeOffer() {
    if (!role || !salary) return
    setAnalyzing(true)
    setGapResult(null)
    try {
      const res = await fetch(ENDPOINTS.gapCheck, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          location: city,
          current_salary: parseFloat(salary) || 0,
        }),
      })
      const data = await res.json()
      setGapResult(data)
    } catch {
      setGapResult({
        verdict: 'UNDERPAID',
        gap_amount: 12000,
        market_average: 97000,
        message: 'Unable to reach server. Based on typical data, most candidates leave money on the table.',
      })
    }
    setAnalyzing(false)
  }

  // ===== API: Chat =====
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
        body: JSON.stringify({ message: text, context: { role: role || 'general' } }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { from: 'coach', text: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: 'coach',
          text: "I'm having trouble connecting, but here's a key tip: Never reveal your current salary first. Ask 'What's the budgeted range for this role?' (Source: Harvard Business Review)",
        },
      ])
    }
    setChatLoading(false)
    chatInputRef.current?.focus()
  }

  // ===== API: Simulate =====
  const runSimulation = useCallback(async (m) => {
    setSimLoading(true)
    setChartError(false)
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
    setSimLoading(false)
  }, [])

  useEffect(() => {
    runSimulation(months)
  }, [months, runSimulation])

  // ===== CHART CONFIG =====
  const chartData = simResult?.chart_data
    ? {
        labels: simResult.chart_data.map((_, i) => (i === 0 ? 'Start' : `Mo ${i}`)),
        datasets: [
          {
            label: 'Savings ($)',
            data: simResult.chart_data,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#ef4444',
          },
        ],
      }
    : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `$${ctx.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9ca3af',
          callback: (v) => `$${(v / 1000).toFixed(0)}k`,
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { display: false },
      },
    },
  }

  // ===== VERDICT HELPERS =====
  const isUnderpaid = gapResult?.verdict === 'UNDERPAID'

  return (
    <div className="flex flex-col h-screen">
      {/* ===== HEADER ===== */}
      <header className="bg-purple-900/80 border-b border-purple-700/50 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-sm">
            EG
          </div>
          <h1 className="text-lg font-bold tracking-tight">The Equity Gap</h1>
        </div>
        <span className="text-purple-300 text-xs hidden sm:block">
          InnovateHer 2026 &middot; Finance Forward
        </span>
      </header>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ===== LEFT SIDEBAR (30%) ===== */}
        <aside className="w-[30%] min-w-[280px] max-w-[380px] bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
          <div className="p-5 flex flex-col flex-1">
            <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-5">
              Your Offer Details
            </h2>

            {/* Role */}
            <label htmlFor="role-select" className="text-xs text-gray-400 mb-1">
              Job Role
            </label>
            <select
              id="role-select"
              aria-label="Select your job role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a role...</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* City */}
            <label htmlFor="city-input" className="text-xs text-gray-400 mb-1">
              City
            </label>
            <input
              id="city-input"
              type="text"
              aria-label="Enter your city"
              placeholder="e.g. New York City, NY"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
            />

            {/* Salary */}
            <label htmlFor="salary-input" className="text-xs text-gray-400 mb-1">
              Current / Offered Salary ($)
            </label>
            <input
              id="salary-input"
              type="number"
              aria-label="Enter your current or offered salary"
              placeholder="85000"
              min="0"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
            />

            {/* Analyze Button */}
            <button
              onClick={analyzeOffer}
              disabled={analyzing || !role || !salary}
              aria-label="Analyze your offer against market data"
              className="bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Offer'}
            </button>

            {/* ===== VERDICT CARD ===== */}
            {gapResult && (
              <div
                className={`mt-6 rounded-xl p-5 border ${
                  isUnderpaid
                    ? 'bg-red-950/50 border-red-800/50'
                    : 'bg-emerald-950/50 border-emerald-800/50'
                }`}
                role="status"
                aria-live="polite"
              >
                {/* Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${
                    isUnderpaid
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isUnderpaid ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    aria-hidden="true"
                  />
                  {gapResult.verdict}
                </div>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Market Average</span>
                    <span className="font-semibold text-white">
                      ${gapResult.market_average?.toLocaleString()}
                    </span>
                  </div>
                  {gapResult.gap_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">You&apos;re Missing</span>
                      <span className="font-semibold text-red-400">
                        ${gapResult.gap_amount?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-gray-300 leading-relaxed">
                  {gapResult.message}
                </p>
              </div>
            )}

            {/* Mission */}
            <div className="mt-auto pt-6">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Every woman deserves to know her market value. The Equity Gap combines real
                salary data with AI coaching to close the pay gap &mdash; one negotiation at a
                time.
              </p>
            </div>
          </div>
        </aside>

        {/* ===== RIGHT MAIN PANEL (70%) ===== */}
        <main className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
          {/* Tab Bar */}
          <div
            className="flex border-b border-gray-800 shrink-0"
            role="tablist"
            aria-label="Main features"
          >
            <button
              role="tab"
              id="tab-coach"
              aria-selected={activeTab === 'coach'}
              aria-controls="panel-coach"
              onClick={() => setActiveTab('coach')}
              className={`px-6 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ${
                activeTab === 'coach'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Negotiation Coach
            </button>
            <button
              role="tab"
              id="tab-simulator"
              aria-selected={activeTab === 'simulator'}
              aria-controls="panel-simulator"
              onClick={() => setActiveTab('simulator')}
              className={`px-6 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ${
                activeTab === 'simulator'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Break Cost Simulator
            </button>
          </div>

          {/* ===== COACH TAB ===== */}
          {activeTab === 'coach' && (
            <div
              id="panel-coach"
              role="tabpanel"
              aria-labelledby="tab-coach"
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.from === 'coach' && (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mr-2 mt-1">
                        EG
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.from === 'user'
                          ? 'bg-purple-700 text-white rounded-br-sm'
                          : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mr-2 mt-1">
                      EG
                    </div>
                    <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-400">
                      <span className="animate-pulse">Researching...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-800 p-4 shrink-0">
                <div className="flex gap-3">
                  <label htmlFor="chat-input" className="sr-only">
                    Type your negotiation question
                  </label>
                  <input
                    ref={chatInputRef}
                    id="chat-input"
                    type="text"
                    placeholder="Ask about salary, equity, benefits, or your situation..."
                    aria-label="Type your negotiation question"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendChat()
                      }
                    }}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                  />
                  <button
                    onClick={sendChat}
                    disabled={chatLoading || !chatInput.trim()}
                    aria-label="Send message"
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-950"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== SIMULATOR TAB ===== */}
          {activeTab === 'simulator' && (
            <div
              id="panel-simulator"
              role="tabpanel"
              aria-labelledby="tab-simulator"
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="max-w-3xl mx-auto space-y-8">
                {/* Intro */}
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Career Break Cost Calculator
                  </h3>
                  <p className="text-sm text-gray-400">
                    See the real financial impact of stepping away &mdash; and why
                    negotiating a higher salary NOW matters more than you think.
                  </p>
                </div>

                {/* Months Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="months-slider" className="text-sm text-gray-300">
                      Break Duration
                    </label>
                    <span className="text-sm font-semibold text-purple-400">
                      {months} month{months !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <input
                    id="months-slider"
                    type="range"
                    min="1"
                    max="24"
                    value={months}
                    onChange={(e) => setMonths(parseInt(e.target.value))}
                    aria-label={`Break duration: ${months} months`}
                    aria-valuemin={1}
                    aria-valuemax={24}
                    aria-valuenow={months}
                    className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 month</span>
                    <span>24 months</span>
                  </div>
                </div>

                {/* Big Cost Stat */}
                {simResult && (
                  <div
                    className="bg-red-950/40 border border-red-800/40 rounded-xl p-6 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="text-xs text-red-400 uppercase tracking-wider font-semibold mb-2">
                      Total Savings Lost
                    </p>
                    <p className="text-4xl font-bold text-red-400">
                      ${simResult.lost?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-3">{simResult.message}</p>
                  </div>
                )}

                {/* Chart */}
                {simLoading ? (
                  <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                    <span className="animate-pulse">Calculating...</span>
                  </div>
                ) : chartData && !chartError ? (
                  <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <p className="text-xs text-gray-400 mb-3 font-medium">
                      Savings Depletion Over Time
                    </p>
                    <div className="h-64">
                      <ErrorBoundary onError={() => setChartError(true)}>
                        <Line data={chartData} options={chartOptions} />
                      </ErrorBoundary>
                    </div>
                  </div>
                ) : null}

                {/* Fallback data table (always accessible) */}
                {simResult?.chart_data && (
                  <details className="text-sm">
                    <summary className="text-gray-500 cursor-pointer hover:text-gray-300 focus:outline-none focus:text-purple-400">
                      View raw data
                    </summary>
                    <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {simResult.chart_data.map((val, i) => (
                        <div key={i} className="bg-gray-900 rounded px-3 py-2 text-xs">
                          <span className="text-gray-500">
                            {i === 0 ? 'Start' : `Mo ${i}`}:
                          </span>{' '}
                          <span className="text-white font-medium">
                            ${val.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Call to Action */}
                <div className="bg-purple-900/30 border border-purple-800/30 rounded-xl p-5">
                  <p className="text-sm text-purple-200 leading-relaxed">
                    <strong>The takeaway:</strong> Every $1,000 you negotiate now protects you
                    during life transitions &mdash; parental leave, career pivots, or further
                    education. Use the Coach tab to practice your negotiation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/**
 * Minimal error boundary to prevent chart crashes from breaking the UI.
 * Falls back silently so the raw data table remains visible.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch() {
    this.props.onError?.()
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500 text-sm">
          Chart unavailable — see raw data below.
        </div>
      )
    }
    return this.props.children
  }
}
