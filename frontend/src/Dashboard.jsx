// Dashboard.jsx — Hub page matching Figma "Dashboard" screen
import dashboardIllustration from '@ill/DASHBOARD_illustration.png'

export default function Dashboard({ userName, onOpenChatBot, onOpenLifetime, onOpenSimulator }) {
  return (
    <div>
      {/* Dashboard Header */}
      <div className="border-b border-gc-border/20 px-6 py-4 bg-gc-bg/60 backdrop-blur transition-colors">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>

      {/* Hero Banner */}
      <div className="w-full">
        <div className="relative w-full h-44 overflow-hidden border-b border-gc-border/20 bg-gradient-to-r from-gc-bgMuted via-gc-surface to-gc-surface2 transition-colors">
          <div className="absolute inset-0">
            <div className="absolute -top-28 -right-28 w-72 h-72 rounded-full bg-gc-accent/25 blur-2xl" />
            <div className="absolute -bottom-28 -left-28 w-72 h-72 rounded-full bg-gc-primary/25 blur-2xl" />
          </div>
          <div className="absolute inset-0 max-w-4xl mx-auto px-6 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-wider text-gc-mutedText">
              Your next move, powered by data
            </p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight">
              Build your negotiation plan in minutes.
            </h3>
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h3 className="text-xl font-medium mb-2">Hello, {userName}!</h3>
        <p className="text-sm text-gc-mutedText mb-8">
          Pick a tool below to explore pay equity insights, get coaching, and plan for life transitions.
        </p>

        {/* Illustration Hub */}
        <div className="rounded-3xl border border-gc-border/20 bg-gc-surface/30 shadow-gc overflow-hidden">
          <div className="p-6 md:p-10">
            {/* Mobile: stack buttons */}
            <div className="grid gap-3 md:hidden">
              <FeatureButton
                title="See The Gap"
                description="Understand the pay gap for your role—and how it compounds over time."
                onClick={onOpenLifetime}
                accent
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                }
              />
              <FeatureButton
                title="Negotiation Coach"
                description="Chat with Ace for research-backed negotiation strategies."
                onClick={onOpenChatBot}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                }
              />
              <FeatureButton
                title="Career Break Simulator"
                description="Estimate the long-term impact of stepping away—and how negotiation protects you."
                onClick={onOpenSimulator}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                }
              />
            </div>

            {/* Desktop: buttons around the illustration */}
            <div className="relative mt-6 md:mt-0 h-[420px] md:h-[560px]">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  src={dashboardIllustration}
                  alt="Dashboard illustration"
                  className="max-h-[360px] md:max-h-[470px] w-auto drop-shadow"
                  loading="lazy"
                />
              </div>

              <div className="hidden md:block absolute left-8 top-20">
                <FeatureButton
                  title="See The Gap"
                  description="Lifetime impact + market benchmark"
                  onClick={onOpenLifetime}
                  accent
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  }
                />
              </div>

              <div className="hidden md:block absolute right-8 top-20">
                <FeatureButton
                  title="Negotiation Coach"
                  description="Chat with Ace"
                  onClick={onOpenChatBot}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  }
                />
              </div>

              <div className="hidden md:block absolute left-1/2 bottom-10 -translate-x-1/2">
                <FeatureButton
                  title="Career Break Simulator"
                  description="Plan for time away"
                  onClick={onOpenSimulator}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureButton({ title, description, icon, onClick, accent = false }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full md:w-64 text-left rounded-2xl border px-4 py-3 transition-all hover:shadow-gc focus:outline-none focus:ring-2 focus:ring-gc-accent focus:ring-offset-2 focus:ring-offset-gc-bg ${
        accent
          ? 'bg-gradient-to-br from-gc-accent/12 via-gc-bgMuted/50 to-gc-warn/12 border-gc-accent/30'
          : 'bg-gc-bg/70 border-gc-border/20 hover:border-gc-primary/40'
      }`}
    >
      <div className={`flex items-start gap-3 ${accent ? 'text-gc-accent' : 'text-gc-primary'}`}>
        <div className="mt-0.5">{icon}</div>
        <div>
          <h4 className="font-semibold text-sm leading-tight">{title}</h4>
          <p className="text-xs text-gc-mutedText leading-relaxed mt-0.5">{description}</p>
        </div>
      </div>
    </button>
  )
}