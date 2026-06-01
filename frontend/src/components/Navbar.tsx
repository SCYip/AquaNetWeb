import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ────────────────────────────────────────────────────────────────────────────
 * Navbar — AquaNet 水眸 · Instrument Console
 *
 * A thin instrument strip. Wordmark left (kinetic hover via variable font),
 * mono nav labels center, sign-in right. Active route marked with a
 * signal-orange tick. All auth logic preserved verbatim.
 * ──────────────────────────────────────────────────────────────────────────── */

const NAV = [
  { to: '/',           label: '首页',  en: 'HOME' },
  { to: '/map',        label: '地图',  en: 'MAP' },
  { to: '/about',      label: '关于',  en: 'ABOUT' },
  { to: '/reports',    label: '来信',  en: 'LETTERS' },
  { to: '/dispatches', label: '手记',  en: 'FIELD' },
  { to: '/contact',    label: '联系',  en: 'CONTACT' },
] as const

export const Navbar = () => {
  const location = useLocation()
  const { isLoggedIn, user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-sm border-b border-ink">
      <div className="px-5 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Wordmark — kinetic on hover */}
          <Link to="/" className="wordmark" aria-label="AquaNet 水眸 — home">
            <span>AquaNet</span>
            <span className="zh">水眸</span>
          </Link>

          {/* Center nav — mono labels */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((link) => {
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group relative flex items-center gap-1.5 py-1"
                  aria-current={active ? 'page' : undefined}
                >
                  <span
                    className={`label transition-colors ${
                      active ? 'text-ink' : 'text-mute group-hover:text-ink'
                    }`}
                  >
                    {link.label}
                  </span>
                  <span
                    className={`block w-1 h-1 rounded-full transition-all ${
                      active ? 'bg-signal scale-100' : 'bg-transparent scale-0'
                    }`}
                    aria-hidden="true"
                  />
                </Link>
              )
            })}
          </nav>

          {/* Right cluster */}
          <div className="hidden md:flex items-center gap-5 pl-5 border-l border-line">
            {isLoggedIn ? (
              <>
                <Link
                  to="/devices"
                  className={`label transition-colors ${
                    isActive('/devices') ? 'text-ink' : 'text-mute hover:text-ink'
                  }`}
                >
                  我的设备
                </Link>
                <span className="label-mute normal-case tracking-normal text-ink">{user?.name}</span>
                <button
                  onClick={logout}
                  className="label-mute hover:text-ink transition-colors"
                  aria-label="退出"
                >
                  退出
                </button>
              </>
            ) : (
              <Link to="/login" className="btn py-2 px-4 text-[0.75rem]">
                登录 · LOG IN
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden label border border-ink rounded-md px-3 py-1.5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? '关闭' : '菜单'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-line bg-canvas px-5 py-4">
          {NAV.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-3 border-b border-line"
            >
              <span className={`text-lg ${isActive(link.to) ? 'text-ink' : 'text-mute'}`}>
                {link.label}
              </span>
              <span className="label-micro">{link.en}</span>
            </Link>
          ))}
          <div className="pt-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/devices"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-lg text-ink"
                >
                  我的设备
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setMobileOpen(false)
                  }}
                  className="label-mute"
                >
                  退出
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn w-full mt-1"
              >
                登录 · LOG IN
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
