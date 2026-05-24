import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/',           label: '首页'  },
  { to: '/map',        label: '地图'  },
  { to: '/about',      label: '关于'  },
  { to: '/reports',    label: '来信'  },
  { to: '/dispatches', label: '手记'  },
  { to: '/contact',    label: '联系'  },
] as const

export const Navbar = () => {
  const location = useLocation()
  const { isLoggedIn, user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <header className="sticky top-0 z-50 bg-canvas border-b border-line">
      <div className="px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark — the only bilingual moment */}
          <Link to="/" className="font-display text-2xl text-ink leading-none">
            AquaNet <span className="italic">水眸</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV.map(link => {
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[0.95rem] transition-colors ${
                    active ? 'text-ink' : 'text-mute hover:text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center gap-5 pl-6 ml-2 border-l border-line">
            {isLoggedIn ? (
              <>
                <Link to="/devices" className={`text-[0.95rem] transition-colors ${isActive('/devices') ? 'text-ink' : 'text-mute hover:text-ink'}`}>
                  我的设备
                </Link>
                <span className="text-ink text-[0.95rem]">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-mute hover:text-ink transition-colors text-sm"
                  aria-label="退出"
                >
                  退出
                </button>
              </>
            ) : (
              <Link to="/login" className="btn py-2 px-5 text-sm">
                登录
              </Link>
            )}
          </div>

          <button
            className="md:hidden border border-ink px-3 py-1.5 text-sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? '关闭' : '菜单'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-line bg-canvas px-6 py-5 space-y-1">
          {NAV.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block py-3 border-b border-line text-lg ${isActive(link.to) ? 'text-ink' : 'text-mute'}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4">
            {isLoggedIn ? (
              <>
                <Link to="/devices" onClick={() => setMobileOpen(false)} className="block py-3 text-lg text-ink">
                  我的设备
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false) }} className="text-mute text-sm">
                  退出
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn w-full">
                登录
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
