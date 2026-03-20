import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Droplets, Menu, X, LogOut, User, ChevronDown } from 'lucide-react'
import { logout, selectUser, isLoggedIn } from '../../store/slices/authSlice'

const roleHome = { ADMIN: '/admin', BLOOD_BANK: '/bank', DOCTOR: '/doctor' }

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const user      = useSelector(selectUser)
  const loggedIn  = useSelector(isLoggedIn)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
    setOpen(false)
    setDropdown(false)
  }

  const navLinks = [
    { to: '/',                   label: 'Home' },
    { to: '/find-blood',         label: 'Find Blood' },
    { to: '/banks',              label: 'Blood Banks' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-red-600 text-xl">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:block">Bharat Blood Bank</span>
            <span className="sm:hidden">BBB</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(l.to)
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setDropdown(!dropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 leading-none">{user?.name?.split(' ')[0]}</p>
                    <p className="text-xs text-gray-400">{user?.role?.replace('_', ' ')}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {dropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                    <Link
                      to={roleHome[user?.role] || '/'}
                      onClick={() => setDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" /> Dashboard
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Register</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 animate-slide-up">
          <div className="pt-3 space-y-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive(l.to) ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <hr className="border-gray-100 my-2" />
            {loggedIn ? (
              <>
                <Link
                  to={roleHome[user?.role] || '/'}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
