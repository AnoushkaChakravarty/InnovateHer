// Home.jsx
import aboutIllustration from '@ill/HOMEPAGE_ABOUT_illustration.png'

export default function Home({ onGetStarted }) {
  return (
    <div>
      {/* Hero */}
      <div className="w-full relative overflow-hidden">
        <div className="w-full h-56 md:h-72 bg-gradient-to-br from-gc-bgMuted via-gc-surface to-gc-surface2" />
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gc-accent/20 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-gc-primary/20 blur-2xl" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-5xl mx-auto w-full px-6 pb-8">
            <p className="text-sm md:text-base text-gc-mutedText">
              Negotiation coaching • Salary transparency • Career break planning
            </p>
            <h2 className="mt-2 text-2xl md:text-4xl font-semibold tracking-tight">
              Close the gap with data—and a coach that has your back.
            </h2>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">Mission</h2>
        <p className="text-sm text-gc-mutedText max-w-xl mx-auto mb-6">
          Turn pay equity insights into real negotiation power—without the guesswork.
        </p>
        <button
          onClick={onGetStarted}
          className="bg-gc-primary text-white px-8 py-3 text-sm font-semibold rounded-lg hover:bg-gc-primary2 transition-colors focus:outline-none focus:ring-2 focus:ring-gc-accent focus:ring-offset-2 focus:ring-offset-gc-bg"
        >
          Get Started
        </button>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 pb-16 flex flex-col md:flex-row gap-10">
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-gc-text/90">
            Women are paid 84 cents for every dollar earned by men. For women of
            color, the gap is even wider. GameChanger uses real salary data from
            Snowflake, negotiation research from MongoDB, and career break
            simulations powered by Capital One's Nessie API to help you
            understand your true market value — and fight for it.
          </p>
          <p className="text-sm leading-relaxed text-gc-text/90 mt-4">
            Whether you're a new grad negotiating your first offer, a mid-career
            professional planning parental leave, or re-entering the workforce
            after a break, GameChanger gives you the data and coaching you need
            to close the gap. No more guessing. No more leaving money on the
            table.
          </p>
        </div>

        {/* Illustration (replaces the blank placeholder box) */}
        <div className="w-full md:w-72 shrink-0">
          <div className="w-full h-48 rounded-2xl bg-gc-bgMuted/40 border border-gc-border/25 shadow-gc overflow-hidden flex items-center justify-center">
            <img
              src={aboutIllustration}
              alt="GameChanger mission illustration"
              className="w-full h-full object-contain p-2"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  )
}