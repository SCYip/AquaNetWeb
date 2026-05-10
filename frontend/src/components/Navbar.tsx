import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const location = useLocation()
  const { isLoggedIn, user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/about', label: '关于' },
    { to: '/map', label: '实时地图' },
    { to: '/reports', label: '公众来信' },
    { to: '/dispatches', label: '团队手记' },
    { to: '/contact', label: '联系' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-ocean-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-sea-500 flex items-center justify-center shadow-md group-hover:bg-sea-400 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12h4l2-4 2 8 2-4h0"/>
              </svg>
            </div>
            <span className="font-heading text-xl font-bold tracking-wide text-white">
              AquaNet<span className="text-sea-400"> 水眸</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-ocean-800 text-sea-400'
                    : 'text-ocean-200 hover:text-white hover:bg-ocean-800'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn && (
              <Link
                to="/devices"
                className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isActive('/devices')
                    ? 'bg-ocean-800 text-sea-400'
                    : 'text-ocean-200 hover:text-white hover:bg-ocean-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                我的设备
              </Link>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-ocean-700">
                <span className="text-sm text-sea-300 font-medium">{user?.name}</span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-ocean-300 hover:text-white hover:bg-ocean-800 transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-5 py-2 bg-sea-600 hover:bg-sea-500 text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
              >
                登录
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-ocean-200 hover:text-white hover:bg-ocean-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-ocean-800 bg-ocean-900">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-ocean-800 text-sea-400'
                    : 'text-ocean-200 hover:text-white hover:bg-ocean-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                to="/devices"
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/devices')
                    ? 'bg-ocean-800 text-sea-400'
                    : 'text-ocean-200 hover:text-white hover:bg-ocean-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                我的设备
              </Link>
            )}
            {isLoggedIn ? (
              <button
                onClick={() => { logout(); setMobileOpen(false) }}
                className="w-full text-left block px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:text-red-200 hover:bg-ocean-800 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-4 py-3 mt-2 bg-sea-600 hover:bg-sea-500 text-white text-sm font-semibold rounded-full transition-colors"
              >
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
