import Link from 'next/link';

export default function OnboardingPage() {
  return (
    <main className="page-wrap" style={{ padding: '2rem 0 3rem' }}>
      <section className="card">
        <h1>Onboarding</h1>
        <p>
          V1 onboarding flow is GitHub OAuth + GitHub App install + initial repository/service
          mapping. Use demo navigation below while OAuth secrets are being configured.
        </p>
        <div className="cta-row" style={{ marginTop: '1rem' }}>
          <a className="btn btn-primary" href={process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL ?? '#'}>
            Connect GitHub OAuth
          </a>
          <Link className="btn btn-secondary" href="/app">
            Continue in demo mode
          </Link>
        </div>
      </section>
    </main>
  );
}
