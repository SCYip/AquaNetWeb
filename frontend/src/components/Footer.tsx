import { Link } from 'react-router-dom'

/* ────────────────────────────────────────────────────────────────────────────
 * Footer — AquaNet 水眸 · Instrument Console
 *
 * A slim instrument strip on ink. Status line up top (live signal dot),
 * three columns of mono links + colophon, and a ruled baseline.
 * ──────────────────────────────────────────────────────────────────────────── */

export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink text-canvas mt-28">
      {/* Status strip */}
      <div className="border-b border-canvas/15">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="signal-dot" aria-hidden="true" />
            <span className="label" style={{ color: 'var(--canvas)' }}>
              系统在线 · SYSTEM ONLINE
            </span>
          </div>
          <span className="label-micro" style={{ color: 'rgba(250,250,247,0.55)' }}>
            深圳 · 惠州 小径湾 · SHENZHEN / HUIZHOU
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-14 grid grid-cols-12 gap-y-10 md:gap-x-10">
        <div className="col-span-12 md:col-span-6">
          <Link to="/" className="wordmark" style={{ color: 'var(--canvas)' }}>
            <span style={{ fontSize: '1.75rem' }}>AquaNet</span>
            <span className="zh" style={{ fontSize: '1.6rem' }}>水眸</span>
          </Link>
          <p className="article-body mt-5 max-w-md" style={{ color: 'rgba(250,250,247,0.72)' }}>
            <span className="zh">一台用开源浮标、公开地图、公众来信组成的公民观测站。看见身边的水。</span>
          </p>
        </div>

        <div className="col-span-6 md:col-span-3">
          <div className="label-micro mb-4" style={{ color: 'rgba(250,250,247,0.5)' }}>导航 · NAV</div>
          <div className="space-y-2.5">
            {[
              { to: '/',         label: '首页 · HOME' },
              { to: '/map',      label: '地图 · MAP' },
              { to: '/about',    label: '关于 · ABOUT' },
              { to: '/contact',  label: '联系 · CONTACT' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block label-mute hover:text-canvas transition-colors"
                style={{ color: 'rgba(250,250,247,0.7)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="col-span-6 md:col-span-3">
          <div className="label-micro mb-4" style={{ color: 'rgba(250,250,247,0.5)' }}>编辑部 · DESK</div>
          <a
            href="mailto:contact@aquanet-water.org"
            className="label-mute hover:text-canvas transition-colors block"
            style={{ color: 'rgba(250,250,247,0.7)' }}
          >
            CONTACT@AQUANET-WATER.ORG
          </a>
          <a
            href="https://aquanet-water.org"
            className="label-mute hover:text-canvas transition-colors block mt-2.5"
            style={{ color: 'rgba(250,250,247,0.7)' }}
          >
            AQUANET-WATER.ORG
          </a>
        </div>
      </div>

      {/* Baseline */}
      <div className="border-t border-canvas/15">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-y-2">
          <span className="label-micro" style={{ color: 'rgba(250,250,247,0.5)' }}>
            © {year} AQUANET 水眸 · OPEN SOURCE
          </span>
          <span className="label-micro" style={{ color: 'rgba(250,250,247,0.5)' }}>
            看见身边的水 · SEE YOUR WATER
          </span>
        </div>
      </div>
    </footer>
  )
}
