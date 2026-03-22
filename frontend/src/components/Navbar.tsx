import { Link, useLocation } from 'react-router-dom'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const location = useLocation()
  const { isLoggedIn, user, logout } = useAuth()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left Side */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center cursor-pointer">
              <img 
                src="/aquanet-logo.png" 
                alt="AquaNet Logo" 
                className="h-10 w-auto mr-2"
              />
              <span className="font-bold text-xl tracking-wider text-cyan-400">AquaNet</span>
            </Link>
          </div>

          {/* Desktop Navigation - Right Side */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
            <Link
              to="/"
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${
                isActive('/') ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${
                isActive('/about') ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              About
            </Link>
            <Link
              to="/map"
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${
                isActive('/map') ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Live Map
            </Link>
            
            {isLoggedIn && (
              <Link
                to="/devices"
                className={`hover:text-cyan-400 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isActive('/devices') ? 'text-cyan-400 font-semibold' : ''
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                My Devices
              </Link>
            )}

            <Link
              to="/contact"
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${
                isActive('/contact') ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Contact
            </Link>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4 ml-4 border-l border-blue-700 pl-4">
                <span className="text-sm text-cyan-300">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="ml-4 border-l border-blue-700 pl-4">
                <Link
                  to="/login"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap"
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center flex-shrink-0">
            {isLoggedIn && (
              <span className="mr-4 text-sm text-cyan-400">{user?.name}</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-blue-800">
        <div className="px-4 py-3 space-y-2">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md hover:bg-blue-800 transition-colors ${
              isActive('/') ? 'bg-blue-800 text-cyan-400' : ''
            }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`block px-3 py-2 rounded-md hover:bg-blue-800 transition-colors ${
              isActive('/about') ? 'bg-blue-800 text-cyan-400' : ''
            }`}
          >
            About
          </Link>
          <Link
            to="/map"
            className={`block px-3 py-2 rounded-md hover:bg-blue-800 transition-colors ${
              isActive('/map') ? 'bg-blue-800 text-cyan-400' : ''
            }`}
          >
            Live Map
          </Link>
          
          {isLoggedIn && (
            <Link
              to="/devices"
              className={`block px-3 py-2 rounded-md hover:bg-blue-800 transition-colors ${
                isActive('/devices') ? 'bg-blue-800 text-cyan-400' : ''
              }`}
            >
              My Devices
            </Link>
          )}
          
          <Link
            to="/contact"
            className={`block px-3 py-2 rounded-md hover:bg-blue-800 transition-colors ${
              isActive('/contact') ? 'bg-blue-800 text-cyan-400' : ''
            }`}
          >
            Contact
          </Link>
          
          {isLoggedIn ? (
            <button
              onClick={logout}
              className="block w-full text-left px-3 py-2 rounded-md hover:bg-blue-800 transition-colors text-red-300 hover:text-red-200"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-center"
            >
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
