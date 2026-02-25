import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="hero">
      <section className="hero-card page-wrap">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-kicker">OpenAPI Integrity at Merge Time</span>
            <h1>ContractGuard blocks API breaks before they hit production.</h1>
            <p>
              Connect your GitHub repos, map service contracts, and enforce API stability
              policies with PR checks, waiver workflows, and clear incident-proof audit trails.
            </p>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/onboarding">
                Start with GitHub
              </Link>
              <Link className="btn btn-secondary" href="/app">
                Open demo workspace
              </Link>
            </div>
          </div>

          <aside className="metrics-pane">
            <h2>Why teams adopt ContractGuard</h2>
            <ul className="metrics-list">
              <li>
                <strong>Removed endpoints caught pre-merge</strong>
                <span>Endpoint and method removals are marked blocking by default.</span>
              </li>
              <li>
                <strong>Policy-driven conclusions</strong>
                <span>Org defaults, service overrides, and time-bound waivers.</span>
              </li>
              <li>
                <strong>Checks + PR comment + alerts</strong>
                <span>Single updatable PR report, in-app feed, and email notifications.</span>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
