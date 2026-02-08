// App.jsx
import { useEffect, useState } from 'react'
import Home from './Home'
import Dashboard from './Dashboard'
import ChatBot from './ChatBot'
import LifetimeImpact from './LifetimeImpact'
import logoLight from '@ill/gamechanger_logo1.png'
import logoDark from '@ill/gamechanger_logo2.png'
import CareerBreakSim from './CareerBreakSim'

const PAGES = { HOME: 'home', DASHBOARD: 'dashboard', CHATBOT: 'chatbot', LIFETIME: 'lifetime', SIMULATOR: 'simulator' }

export default function App() {
  const [page, setPage] = useState(PAGES.HOME)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userName] = useState('User')

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('gc-theme')
      if (saved === 'light' || saved === 'dark') return saved
      return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem('gc-theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  const navigate = (p) => {
    setPage(p)
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gc-bg text-gc-text font-sans relative transition-colors">
      {/* ===== TOP NAV ===== */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-gc-border/30 bg-gc-bg/85 backdrop-blur sticky top-0 z-40 transition-colors">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="flex flex-col gap-[5px] focus:outline-none focus:ring-2 focus:ring-gc-accent rounded p-1"
        >
          <span className="block w-6 h-[3px] bg-gc-text rounded-full" />
          <span className="block w-6 h-[3px] bg-gc-text rounded-full" />
          <span className="block w-6 h-[3px] bg-gc-text rounded-full" />
        </button>

        <button
          onClick={() => navigate(PAGES.HOME)}
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gc-accent rounded px-1"
          aria-label="Go to home"
        >
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="GameChanger logo"
            className="h-8 w-auto"
          />
          <span className="text-xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-gc-purple via-gc-accent to-gc-warn bg-clip-text text-transparent">
              GameChanger
            </span>
          </span>
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle
            theme={theme}
            onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          />

          {page === PAGES.HOME ? (
            <button
              onClick={() => navigate(PAGES.DASHBOARD)}
              className="text-xs border border-gc-border/50 px-3 py-1.5 rounded hover:bg-gc-primary hover:text-white hover:border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-gc-accent"
            >
              Log In
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gc-accentSoft/35 border border-gc-border/30 flex items-center justify-center text-sm font-semibold text-gc-text">
              {userName[0]}
            </div>
          )}
        </div>
      </header>

      {/* ===== SIDE MENU ===== */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="fixed top-0 left-0 w-64 h-full bg-gc-surface border-r border-gc-border/20 z-50 flex flex-col py-6 px-5 shadow-gc transition-colors">
            <div className="flex items-center justify-between mb-8">
              <div className="w-10 h-10 rounded-full bg-gc-bg border border-gc-border/20 overflow-hidden flex items-center justify-center">
                <img
                  src={theme === "dark" ? logoDark : logoLight}
                  alt="GameChanger logo"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <ThemeToggle
                theme={theme}
                onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                compact
              />
            </div>

            <button
              onClick={() => navigate(PAGES.HOME)}
              className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gc-bg/50 text-left text-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
              Home
            </button>
            <button
              onClick={() => navigate(PAGES.DASHBOARD)}
              className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gc-bg/50 text-left text-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Dashboard
            </button>
            <button
              onClick={() => navigate(PAGES.LIFETIME)}
              className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gc-bg/50 text-left text-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Lifetime Impact
            </button>
            <button
              onClick={() => navigate(PAGES.SIMULATOR)}
              className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gc-bg/50 text-left text-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Break Simulator
            </button>
            <button
              onClick={() => navigate(PAGES.CHATBOT)}
              className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gc-bg/50 text-left text-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              AI Coach
            </button>

            <div className="mt-auto">
              <button
                onClick={() => navigate(PAGES.HOME)}
                className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gc-bg/50 text-left text-sm text-gc-mutedText transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </div>
          </nav>
        </>
      )}

      {/* ===== PAGE CONTENT ===== */}
      {page === PAGES.HOME && <Home theme={theme} onGetStarted={() => navigate(PAGES.DASHBOARD)} />}
      {page === PAGES.DASHBOARD && (
        <Dashboard
          userName={userName}
          onOpenChatBot={() => navigate(PAGES.CHATBOT)}
          onOpenLifetime={() => navigate(PAGES.LIFETIME)}
          onOpenSimulator={() => navigate(PAGES.SIMULATOR)}
          theme={theme}
        />
      )}
      {page === PAGES.LIFETIME && <LifetimeImpact theme={theme} />}
      {page === PAGES.SIMULATOR && <CareerBreakSim theme={theme} />}
      {page === PAGES.CHATBOT && <ChatBot theme={theme} />}
    </div>
  )
}

function ThemeToggle({ theme, onToggle, compact = false }) {
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onToggle}
      className={`${compact ? 'w-9 h-9' : 'w-10 h-10'} rounded-full border border-gc-border/30 bg-gc-bg/60 hover:bg-gc-bgMuted/60 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gc-accent`}
    >
      {isDark ? (
        // Sun
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414m0-13.314L6.05 6.464m10.9 10.9l1.414 1.414" />
        </svg>
      ) : (
        // Moon
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  )
}