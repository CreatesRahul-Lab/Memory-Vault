import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Navbar */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="topbar-logo">
            Memory<span>OS</span>
          </div>
          <div className="landing-nav-links">
            <Link href="/login" className="btn btn-secondary landing-btn">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary landing-btn">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-badge">Your second brain, always organized</div>
          <h1 className="landing-title">
            Save anything.<br />
            Find everything.<br />
            <span>Forget nothing.</span>
          </h1>
          <p className="landing-subtitle">
            Save articles, videos, tweets, and anything you find on the web.
            Organize with AI-powered tags, search your entire library instantly,
            and never lose track of what matters.
          </p>
          <div className="landing-cta">
            <Link href="/register" className="btn btn-primary landing-btn-lg">
              Start Saving for Free
            </Link>
            <Link href="/login" className="btn btn-secondary landing-btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="landing-features-inner">
          <h2 className="landing-section-title">Everything you need to remember</h2>
          <div className="landing-features-grid">
            {[
              {
                icon: "\uD83D\uDCDA",
                title: "Save Anything",
                desc: "Pages, videos, tweets, PDFs, screenshots — capture any content from the web with one click.",
              },
              {
                icon: "\uD83E\uDDE0",
                title: "AI-Powered",
                desc: "Auto-generated summaries, smart tags, and key points extracted from your saved content.",
              },
              {
                icon: "\uD83D\uDD0D",
                title: "Instant Search",
                desc: "Full-text search across your entire library. Filter by type, tags, collections, or favorites.",
              },
              {
                icon: "\uD83D\uDCE6",
                title: "Collections",
                desc: "Organize content into collections. Share them publicly with a single link.",
              },
              {
                icon: "\uD83D\uDC65",
                title: "Team Spaces",
                desc: "Collaborate with your team. Share collections and build a shared knowledge base.",
              },
              {
                icon: "\uD83D\uDD14",
                title: "Reminders & Review",
                desc: "Set reminders and use spaced repetition to revisit important content before you forget.",
              },
            ].map((f, i) => (
              <div className="landing-feature-card" key={i}>
                <div className="landing-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-steps">
        <div className="landing-steps-inner">
          <h2 className="landing-section-title">Get started in minutes</h2>
          <div className="landing-steps-grid">
            {[
              { step: "1", title: "Create an account", desc: "Sign up for free in seconds. No credit card required." },
              { step: "2", title: "Install the extension", desc: "Add the Chrome extension to save pages with one click." },
              { step: "3", title: "Save & organize", desc: "Start saving content. AI handles the tagging and summaries." },
            ].map((s, i) => (
              <div className="landing-step-card" key={i}>
                <div className="landing-step-number">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-bottom-cta">
        <div className="landing-bottom-cta-inner">
          <h2>Ready to build your second brain?</h2>
          <p>Join Memory OS and never lose track of the content that matters.</p>
          <Link href="/register" className="btn btn-primary landing-btn-lg">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="topbar-logo">
            Memory<span>OS</span>
          </div>
          <p>Open source. Free forever. Your data stays yours.</p>
        </div>
      </footer>
    </div>
  );
}
