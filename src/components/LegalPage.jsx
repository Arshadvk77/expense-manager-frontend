import { useState, useEffect } from 'react';
import { SiteNav, SiteFooter } from '../components/SiteChrome.jsx';

/* Shared legal-document layout: sticky table of contents + prose column.
   Pass `title`, `updated`, and `sections: [{ id, h, body: [paragraphs] }]`. */
export default function LegalPage({ kind, title, updated, intro, sections }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sections.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [sections]);

  const jump = id => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  };

  return (
    <div className="lp">
      <SiteNav active={kind} />

      <header className="lp-page-hero" style={{ paddingBottom: 24 }}>
        <div className="lp-wrap" style={{ maxWidth: 860 }}>
          <div className="lp-kicker">Legal</div>
          <h1 className="lp-page-h1" style={{ textAlign: 'left' }}>{title}</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 12 }}>Last updated {updated} · This is an illustrative template, not legal advice.</p>
          {intro && <p className="lp-lead" style={{ marginTop: 16, maxWidth: 680 }}>{intro}</p>}
        </div>
      </header>

      <section className="lp-section" style={{ paddingTop: 16 }}>
        <div className="lp-wrap lp-legal-grid">
          <aside className="lp-toc">
            <div className="lp-toc-label">On this page</div>
            {sections.map((s, i) => (
              <button key={s.id} className={active === s.id ? 'on' : ''} onClick={() => jump(s.id)}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>{s.h}
              </button>
            ))}
          </aside>

          <div className="lp-prose">
            {sections.map((s, i) => (
              <section id={s.id} key={s.id} className="lp-prose-sec">
                <h2><span className="num">{String(i + 1).padStart(2, '0')}</span>{s.h}</h2>
                {s.body.map((p, j) =>
                  Array.isArray(p)
                    ? <ul key={j}>{p.map((li, k) => <li key={k}>{li}</li>)}</ul>
                    : <p key={j}>{p}</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
