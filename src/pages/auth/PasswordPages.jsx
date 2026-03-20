import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Droplets, Mail, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../services/apiServices'
import { getError } from '../../utils/constants'
import { Spinner, ErrorAlert } from '../../components/common'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) { setError(getError(err)) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-red-600 font-bold text-xl mb-4">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            Bharat Blood Bank
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div className="card text-center shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Check Your Email</h3>
            <p className="text-gray-500 text-sm mb-6">
              We sent a password reset link to <strong>{email}</strong>.
              Link is valid for 15 minutes.
            </p>
            <Link to="/login" className="btn-primary w-full justify-center">Back to Login</Link>
          </div>
        ) : (
          <div className="card shadow-lg">
            <ErrorAlert message={error} onClose={() => setError('')} />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input pl-9" placeholder="you@example.com" required autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
              </button>
            </form>
            <p className="text-center mt-4 text-sm text-gray-500">
              <Link to="/login" className="text-red-600 hover:underline">← Back to Login</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function ResetPasswordPage() {
  const [form, setForm]       = useState({ token: new URLSearchParams(window.location.search).get('token') || '', newPassword: '' })
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await authAPI.resetPassword(form)
      setDone(true)
      toast.success('Password reset successful!')
    } catch (err) { setError(getError(err)) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your new password</p>
        </div>

        {done ? (
          <div className="card text-center shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Password Reset!</h3>
            <p className="text-gray-500 text-sm mb-6">You can now login with your new password.</p>
            <Link to="/login" className="btn-primary w-full justify-center">Go to Login</Link>
          </div>
        ) : (
          <div className="card shadow-lg">
            <ErrorAlert message={error} onClose={() => setError('')} />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Reset Token</label>
                <input value={form.token} onChange={e => setForm({...form, token: e.target.value})} className="input font-mono text-xs" placeholder="Paste token from email" required />
              </div>
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={e => setForm({...form, newPassword: e.target.value})}
                    className="input pr-10"
                    placeholder="Min 8 chars, A-Z, 0-9, special char"
                    required
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    {show ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Reset Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
