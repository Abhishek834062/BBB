import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Droplets, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../services/apiServices'
import { setCredentials } from '../../store/slices/authSlice'
import { Spinner, ErrorAlert } from '../../components/common'

const ROLE_HOME = { ADMIN: '/admin', BLOOD_BANK: '/bank', DOCTOR: '/doctor' }

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      const { token, role, name, email, userId } = res.data.data
      dispatch(setCredentials({ token, user: { role, name, email, userId } }))
      toast.success(`Welcome back, ${name.split(' ')[0]}!`)
      const from = location.state?.from?.pathname || ROLE_HOME[role] || '/'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-red-600 font-bold text-2xl mb-2">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            Bharat Blood Bank
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Login to your account</p>
        </div>

        <div className="card shadow-lg">
          <ErrorAlert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input"
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-red-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
              {loading ? <Spinner size="sm" /> : <><LogIn className="h-4 w-4" /> Login</>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              New to Bharat Blood Bank?{' '}
              <Link to="/register" className="text-red-600 font-semibold hover:underline">Register here</Link>
            </p>
          </div>
        </div>

        {/* Admin hint */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800 text-center">
          <strong>Note:</strong> Blood Banks and Doctors must wait for Admin approval before login.
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
