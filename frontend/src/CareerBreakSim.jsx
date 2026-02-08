// CareerBreakSim.jsx — Career Break Cost Simulator
// Connects to /api/simulate (Nessie API via bank_sim.py)
import React, { useState, useRef, useEffect } from 'react'
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

export default function CareerBreakSim({ theme }) {
  const [months, setMonths] = useState(6)
  const [savings, setSavings] = useState(25000)
  const [monthlySpend, setMonthlySpend] = useState(3000)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const resultRef = useRef(null)

  async function runSim() {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months, monthly_spend: monthlySpend, savings }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setError('Could not connect to the server. Please try again.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (result) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [result])

  const tickColor = cssRgb('--gc-text-muted', 1) || '#6b7280'
  const gridColor = cssRgb('--gc-border', 0.2) || 'rgba(243, 244, 246, 1)'
  const warnColor = cssRgb('--gc-warn', 1) || '#ef4444'
  const warnFill = cssRgb('--gc-warn', 0.12) || 'rgba(239, 68, 68, 0.08)'

  const chartData = result?.chart_data
    ? {
        labels: result.chart_data.map((_, i) => (i === 0 ? 'Start' : `Mo ${i}`)),
        datasets: [
          {
            label: 'Savings Balance ($)',
            data: result.chart_data,
            borderColor: warnColor,
            backgroundColor: warnFill,
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: warnColor,
            borderWidth: 2.5,
          },
        ],
      }
    : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `Balance: $${ctx.parsed.y?.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `$${(v / 1000).toFixed(0)}k`,
          color: tickColor,
        },
        grid: { color: gridColor },
      },
      x: {
        ticks: { color: tickColor },
        grid: { display: false },
      },
    },
  }

  const compoundLoss = result ? Math.round(result.lost * 3.3) : 0
  const startingBalance = result?.chart_data?.[0] || 25000
  const finalBalance = result?.chart_data?.[result.chart_data.length - 1] || 0
  const depletionPct = startingBalance > 0 ? Math.round((result?.lost / startingBalance) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-gc-text transition-colors">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Career Break Simulator</h2>
        <p className="text-gc-mutedText text-sm leading-relaxed max-w-2xl">
          See the real financial cost of stepping away from work. Powered by the
          Capital One Nessie API — real banking transactions show how your savings
          drain month by month.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-gc-surface border border-gc-border/20 rounded-2xl p-6 mb-8 shadow-gc transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {/* Savings */}
          <div>
            <label htmlFor="sim-savings" className="text-xs text-gc-mutedText mb-1 block">
              Current Savings ($)
            </label>
            <input
              id="sim-savings"
              type="number"
              value={savings}
              onChange={(e) => setSavings(Math.max(0, Number(e.target.value)))}
              className="w-full border border-gc-border/30 bg-gc-bg rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gc-accent focus:border-transparent transition-colors placeholder:text-gc-mutedText/70"
              placeholder="25000"
            />
          </div>

          {/* Monthly Spend */}
          <div>
            <label htmlFor="sim-spend" className="text-xs text-gc-mutedText mb-1 block">
              Monthly Expenses ($)
            </label>
            <input
              id="sim-spend"
              type="number"
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(Math.max(0, Number(e.target.value)))}
              className="w-full border border-gc-border/30 bg-gc-bg rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gc-accent focus:border-transparent transition-colors placeholder:text-gc-mutedText/70"
              placeholder="3000"
            />
          </div>

          {/* Months Slider */}
          <div>
            <label htmlFor="sim-months" className="text-xs text-gc-mutedText mb-1 block">
              Break Duration
            </label>
            <div className="flex items-center gap-3">
              <input
                id="sim-months"
                type="range"
                min={1}
                max={24}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="flex-1 accent-gc-primary"
              />
              <span className="text-sm font-semibold w-20 text-right">
                {months} month{months !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={runSim}
          disabled={loading}
          className="bg-gc-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-gc-primary2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gc-accent focus:ring-offset-2 focus:ring-offset-gc-bg"
        >
          {loading ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>

      {error && (
        <div className="bg-gc-warn/10 border border-gc-warn/30 rounded-xl p-4 mb-8 text-sm text-gc-warn">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div ref={resultRef}>
          {/* Headline */}
          <div className="bg-gradient-to-br from-gc-warn via-gc-accent to-gc-purple text-white rounded-2xl p-8 mb-8 text-center shadow-gc">
            <p className="text-sm text-white/70 mb-2 uppercase tracking-wide">
              Total Financial Impact
            </p>
            <p className="text-5xl font-bold mb-1">
              ${(result.lost + compoundLoss).toLocaleString()}
            </p>
            <p className="text-white/80 text-sm">
              ${result.lost?.toLocaleString()} cash + ${compoundLoss.toLocaleString()} future compound interest
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl border bg-gc-bg border-gc-border/20 p-4 transition-colors">
              <p className="text-xs text-gc-mutedText mb-1">Starting Balance</p>
              <p className="text-lg font-bold">${startingBalance.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-gc-warn/10 border-gc-warn/30 p-4 transition-colors">
              <p className="text-xs text-gc-mutedText mb-1">Cash Lost</p>
              <p className="text-lg font-bold text-gc-warn">${result.lost?.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-gc-primary/10 border-gc-primary/30 p-4 transition-colors">
              <p className="text-xs text-gc-mutedText mb-1">Remaining</p>
              <p className="text-lg font-bold">${finalBalance.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-gc-purple/10 border-gc-purple/30 p-4 transition-colors">
              <p className="text-xs text-gc-mutedText mb-1">Savings Depleted</p>
              <p className="text-lg font-bold">{depletionPct}%</p>
            </div>
          </div>

          {/* Chart */}
          {chartData && (
            <div className="bg-gc-bg border border-gc-border/20 rounded-2xl p-6 mb-8 shadow-gc transition-colors">
              <h3 className="text-sm font-semibold mb-1">Savings Depletion Over Time</h3>
              <p className="text-xs text-gc-mutedText mb-4">
                Watch your safety net shrink month by month during a career break.
              </p>
              <div className="h-72">
                <ErrorBoundary>
                  <Line data={chartData} options={chartOptions} />
                </ErrorBoundary>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="bg-gc-surface border border-gc-border/20 rounded-2xl p-6 text-center shadow-gc transition-colors">
            <p className="text-sm text-gc-text mb-2">{result.message}</p>
            <p className="text-xs text-gc-mutedText/80">
              This is why negotiating your salary now matters — every extra dollar
              is a buffer for life's transitions.
            </p>
          </div>
        </div>
      )}
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
      return <div className="text-xs text-gc-mutedText text-center py-8">Chart unavailable</div>
    }
    return this.props.children
  }
}