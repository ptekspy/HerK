import type { DashboardAttentionItem } from './dashboard-types';

interface DashboardAttentionNeededProps {
  attention: DashboardAttentionItem[];
}

export function DashboardAttentionNeeded({ attention }: DashboardAttentionNeededProps) {
  return (
    <section className="card dashboard-attention">
      <h3>Attention needed</h3>
      {attention.length === 0 ? (
        <p>No urgent issues detected.</p>
      ) : (
        <div className="dashboard-attention-list">
          {attention.map((item) => (
            <article key={item.key} className={`dashboard-attention-item dashboard-attention-${item.level}`}>
              <div>
                <h4>{item.title}</h4>
                <p>{item.message}</p>
              </div>
              {item.href ? (
                <a className="btn btn-secondary" href={item.href}>
                  Open
                </a>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
