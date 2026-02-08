// LifetimeImpact.jsx — "See The Gap Before It Starts"
// Gender-disaggregated salary analysis + 30-year compound inequality visualization
import React, { useState, useEffect, useRef } from 'react'
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

export default function LifetimeImpact({ theme }) {
  const [role, setRole] = useState('')
  const [years, setYears] = useState(30)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const resultRef = useRef(null)

  async function analyze() {
    if (!role) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/lifetime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, years }),
      })
      const data = await res.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Unable to analyze this role.')
      }
    } catch {
      setError('Could not connect to the server. Please try again.')
    }
    setLoading(false)
  }

  // Scroll to results
  useEffect(() => {
    if (result) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [result])

  // Theme-aware chart colors
  const tickColor = cssRgb('--gc-text-muted', 1) || '#6b7280'
  const gridColor = cssRgb('--gc-border', 0.2) || 'rgba(243, 244, 246, 1)'
  const menColor = cssRgb('--gc-primary', 1) || '#3b82f6'
  const menFill = cssRgb('--gc-primary', 0.08) || 'rgba(59, 130, 246, 0.05)'
  const womenColor = cssRgb('--gc-accent', 1) || '#f43f5e'
  const womenFill = cssRgb('--gc-accent', 0.08) || 'rgba(244, 63, 94, 0.05)'

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 text-gc-text transition-colors">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">See The Gap Before It Starts</h2>
        <p className="text-gc-mutedText text-sm leading-relaxed max-w-2xl">
          Glassdoor shows you averages. We show you the <strong>gender-disaggregated truth</strong> from
          24,000+ salary records — and how a small gap today compounds into a massive loss over your career.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-gc-surface border border-gc-border/20 rounded-2xl p-6 mb-8 shadow-gc transition-colors">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="lt-role" className="text-xs text-gc-mutedText mb-1 block">Job Role</label>
            <select
              id="lt-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gc-border/30 bg-gc-bg rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gc-accent focus:border-transparent transition-colors"
            >
              <option value="">Select a role...</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <label htmlFor="lt-years" className="text-xs text-gc-mutedText mb-1 block">Career Years</label>
            <select
              id="lt-years"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full border border-gc-border/30 bg-gc-bg rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gc-accent focus:border-transparent transition-colors"
            >
              <option value={10}>10 years</option>
              <option value={20}>20 years</option>
              <option value={30}>30 years</option>
              <option value={40}>40 years</option>
            </select>
          </div>

          <button
            onClick={analyze}
            disabled={!role || loading}
            className="bg-gc-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-gc-primary2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gc-accent focus:ring-offset-2 focus:ring-offset-gc-bg"
          >
            {loading ? 'Analyzing...' : 'Show My Impact'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-gc-warn/10 border border-gc-warn/30 rounded-xl p-4 mb-8 text-sm text-gc-warn">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div ref={resultRef}>
          {/* Headline Stat */}
          <div className="bg-gradient-to-br from-gc-primary2 via-gc-primary to-gc-accent text-white rounded-2xl p-8 mb-8 text-center shadow-gc">
            <p className="text-sm text-white/70 mb-2 uppercase tracking-wide">
              {years}-Year Compound Cost of the Gender Pay Gap
            </p>
            <AnimatedCounter value={result.total_compound_loss} className="text-5xl font-bold mb-3" />
            <p className="text-white/70 text-sm">
              for <span className="text-white font-semibold">{result.role}</span> roles
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Men's Average"
              value={`$${result.male_avg?.toLocaleString()}`}
              sub={`${result.male_count?.toLocaleString()} records`}
              color="blue"
            />
            <StatCard
              label="Women's Average"
              value={`$${result.female_avg?.toLocaleString()}`}
              sub={`${result.female_count?.toLocaleString()} records`}
              color="rose"
            />
            <StatCard
              label="Annual Gap"
              value={`$${result.gap?.toLocaleString()}`}
              sub={`${result.gap_percent}% lower`}
              color="amber"
            />
            <StatCard
              label="Lost Retirement"
              value={`$${result.total_lost_retirement?.toLocaleString()}`}
              sub="lost 401(k) match"
              color="purple"
            />
          </div>

          {/* Two-Line Diverging Chart */}
          <div className="bg-gc-bg border border-gc-border/20 rounded-2xl p-6 mb-8 shadow-gc transition-colors">
            <h3 className="text-sm font-semibold mb-1">Salary Trajectories: Men vs Women</h3>
            <p className="text-xs text-gc-mutedText mb-4">
              Same role. Same starting year. 3% annual raises. Watch the gap compound.
            </p>
            <div className="h-72 md:h-96">
              <ErrorBoundary>
                <Line
                  data={{
                    labels: result.year_labels?.filter((_, i) => i % (years <= 10 ? 1 : years <= 20 ? 2 : 3) === 0 || i === result.year_labels.length - 1),
                    datasets: [
                      {
                        label: "Men's Salary",
                        data: result.male_trajectory?.filter((_, i) => i % (years <= 10 ? 1 : years <= 20 ? 2 : 3) === 0 || i === result.male_trajectory.length - 1),
                        borderColor: menColor,
                        backgroundColor: menFill,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 2,
                        borderWidth: 2.5,
                      },
                      {
                        label: "Women's Salary",
                        data: result.female_trajectory?.filter((_, i) => i % (years <= 10 ? 1 : years <= 20 ? 2 : 3) === 0 || i === result.female_trajectory.length - 1),
                        borderColor: womenColor,
                        backgroundColor: womenFill,
                        fill: '-1',
                        tension: 0.3,
                        pointRadius: 2,
                        borderWidth: 2.5,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { intersect: false, mode: 'index' },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 20, font: { size: 12 } },
                      },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y?.toLocaleString()}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        ticks: {
                          callback: (v) => `$${(v / 1000).toFixed(0)}k`,
                          color: tickColor,
                        },
                        grid: { color: gridColor },
                      },
                      x: {
                        ticks: { color: tickColor, maxRotation: 45 },
                        grid: { display: false },
                      },
                    },
                  }}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-gc-surface border border-gc-border/20 rounded-2xl p-6 mb-8 shadow-gc transition-colors">
            <h3 className="text-sm font-semibold mb-4">Where the Money Goes</h3>
            <div className="space-y-3">
              <BreakdownBar
                label="Lost Take-Home Pay"
                value={result.total_lost_salary}
                total={result.total_compound_loss}
                color="bg-gc-accent"
              />
              <BreakdownBar
                label="Lost Investment Growth"
                value={result.total_lost_investment}
                total={result.total_compound_loss}
                color="bg-gc-warn"
              />
              <BreakdownBar
                label="Lost 401(k) Employer Match"
                value={result.total_lost_retirement}
                total={result.total_compound_loss}
                color="bg-gc-purple"
              />
            </div>
            <div className="mt-4 pt-4 border-t border-gc-border/20 flex justify-between items-center">
              <span className="text-sm font-semibold">Total Compound Loss</span>
              <span className="text-lg font-bold">${result.total_compound_loss?.toLocaleString()}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-6">
            <p className="text-gc-mutedText text-sm mb-3">
              This gap is real — but it's not inevitable. Data is your negotiation superpower.
            </p>
            <p className="text-xs text-gc-mutedText/80">
              Based on {(result.male_count + result.female_count)?.toLocaleString()} salary records
              from 10 credible sources including BLS, PayScale, Glassdoor, and AAUW.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}


// ============================================
// SUB-COMPONENTS
// ============================================

function AnimatedCounter({ value, className }) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!value) return
    const duration = 1500
    const start = performance.now()
    const from = 0

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(from + (value - from) * eased))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value])

  return <div className={className}>${display?.toLocaleString()}</div>
}


function StatCard({ label, value, sub, color }) {
  const colorMap = {
    blue: 'bg-gc-primary/10 border-gc-primary/30',
    rose: 'bg-gc-accent/10 border-gc-accent/30',
    amber: 'bg-gc-warn/10 border-gc-warn/30',
    purple: 'bg-gc-purple/10 border-gc-purple/30',
  }
  return (
    <div className={`rounded-xl border p-4 transition-colors ${colorMap[color] || 'bg-gc-bgMuted/40 border-gc-border/20'}`}>
      <p className="text-xs text-gc-mutedText mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-gc-mutedText/80 mt-0.5">{sub}</p>
    </div>
  )
}


function BreakdownBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gc-mutedText">{label}</span>
        <span className="font-semibold">${value?.toLocaleString()} <span className="text-gc-mutedText/80 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-gc-border/20 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
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
      return <div className="text-xs text-gc-mutedText text-center py-8">Chart unavailable</div>
    }
    return this.props.children
  }
}