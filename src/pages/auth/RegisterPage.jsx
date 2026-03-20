

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Droplets, Building2, Stethoscope, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../services/apiServices'
import { INDIAN_STATES } from '../../utils/constants'
import { Spinner } from '../../components/common'

// Field wrapper with error display
function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="label">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// Client-side validators
function validateBank(f) {
  const e = {}
  if (!f.bankName.trim())      e.bankName      = 'Bank name is required'
  if (!f.licenseNumber.trim()) e.licenseNumber  = 'License number is required'
  if (!f.address.trim())       e.address        = 'Address is required'
  if (!f.city.trim())          e.city           = 'City is required'
  if (!f.state)                e.state          = 'Please select a state'
  if (!f.contactEmail.trim())  e.contactEmail   = 'Contact email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contactEmail))
                               e.contactEmail   = 'Invalid email format'
  if (!f.contactPhone.trim())  e.contactPhone   = 'Phone number is required'
  else if (!/^[6-9]\d{9}$/.test(f.contactPhone))
                               e.contactPhone   = 'Must be 10 digits starting with 6, 7, 8 or 9'
  if (!f.loginEmail.trim())    e.loginEmail     = 'Login email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.loginEmail))
                               e.loginEmail     = 'Invalid email format'
  if (!f.password)             e.password       = 'Password is required'
  else {
    if (f.password.length < 8)                  e.password = 'Minimum 8 characters'
    else if (!/[a-z]/.test(f.password))         e.password = 'Add a lowercase letter (a-z)'
    else if (!/[A-Z]/.test(f.password))         e.password = 'Add an uppercase letter (A-Z)'
    else if (!/\d/.test(f.password))            e.password = 'Add a number (0-9)'
    else if (!/[@#$%^&+=!]/.test(f.password))  e.password = 'Add a special character: @#$%^&+=!'
  }
  return e
}

function validateDoctor(f) {
  const e = {}
  if (!f.doctorName.trim())                e.doctorName                = 'Doctor name is required'
  if (!f.medicalRegistrationNumber.trim()) e.medicalRegistrationNumber = 'MCI number is required'
  if (!f.hospitalName.trim())              e.hospitalName              = 'Hospital name is required'
  if (!f.hospitalAddress.trim())           e.hospitalAddress           = 'Hospital address is required'
  if (!f.city.trim())                      e.city                      = 'City is required'
  if (!f.state)                            e.state                     = 'Please select a state'
  if (!f.phone.trim())                     e.phone                     = 'Phone number is required'
  else if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone                     = 'Must be 10 digits starting with 6, 7, 8 or 9'
  if (!f.loginEmail.trim())               e.loginEmail                = 'Login email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.loginEmail))
                                           e.loginEmail                = 'Invalid email format'
  if (!f.password)                         e.password                  = 'Password is required'
  else {
    if (f.password.length < 8)                  e.password = 'Minimum 8 characters'
    else if (!/[a-z]/.test(f.password))         e.password = 'Add a lowercase letter (a-z)'
    else if (!/[A-Z]/.test(f.password))         e.password = 'Add an uppercase letter (A-Z)'
    else if (!/\d/.test(f.password))            e.password = 'Add a number (0-9)'
    else if (!/[@#$%^&+=!]/.test(f.password))  e.password = 'Add a special character: @#$%^&+=!'
  }
  return e
}

export default function RegisterPage() {
  const [step,        setStep]        = useState(1)
  const [role,        setRole]        = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success,     setSuccess]     = useState(false)
  const [showPw,      setShowPw]      = useState(false)

  const [bankForm, setBankForm] = useState({
    bankName: '', licenseNumber: '', address: '', city: '', state: '',
    pincode: '', contactEmail: '', contactPhone: '', loginEmail: '', password: ''
  })
  const [doctorForm, setDoctorForm] = useState({
    doctorName: '', specialization: '', medicalRegistrationNumber: '',
    hospitalName: '', hospitalAddress: '', city: '', state: '', pincode: '',
    loginEmail: '', password: '', phone: ''
  })

  const clearFieldError = (key) => setFieldErrors(p => ({ ...p, [key]: '' }))

  const handleError = (err) => {
    const res = err?.response?.data
    // Field-level backend errors (validation failed)
    if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
      setFieldErrors(res.data)
      setError('Please fix the highlighted fields and try again.')
    } else {
      setError(res?.message || err?.message || 'Something went wrong. Please try again.')
    }
    toast.error('Registration failed')
  }

  const handleBankSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = validateBank(bankForm)
    if (Object.keys(errs).length) { setFieldErrors(errs); toast.error('Please fix the errors'); return }
    setFieldErrors({})
    setLoading(true)
    try {
      await authAPI.registerBank(bankForm)
      setSuccess(true)
    } catch (err) { handleError(err) }
    finally { setLoading(false) }
  }

  const handleDoctorSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = validateDoctor(doctorForm)
    if (Object.keys(errs).length) { setFieldErrors(errs); toast.error('Please fix the errors'); return }
    setFieldErrors({})
    setLoading(true)
    try {
      await authAPI.registerDoctor(doctorForm)
      setSuccess(true)
    } catch (err) { handleError(err) }
    finally { setLoading(false) }
  }

  // Password checklist
  const pw = role === 'BLOOD_BANK' ? bankForm.password : doctorForm.password
  const pwChecks = [
    { ok: pw.length >= 8,                label: '8+ characters' },
    { ok: /[A-Z]/.test(pw),             label: 'Uppercase (A-Z)' },
    { ok: /[a-z]/.test(pw),             label: 'Lowercase (a-z)' },
    { ok: /\d/.test(pw),                label: 'Number (0-9)' },
    { ok: /[@#$%^&+=!]/.test(pw),       label: 'Special char (@#$%^&+=!)' },
  ]

  // ── Success ─────────────────────────────────────────────────────────────
  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Registration Submitted!</h2>
        <p className="text-gray-500 mb-6">
          Your registration is under review. Our admin team will verify your details and
          send login credentials to your email within <strong>1–2 business days</strong>.
        </p>
        <div className="space-y-3">
          <Link to="/login" className="btn-primary w-full justify-center block py-3">Go to Login</Link>
          <Link to="/"      className="btn-secondary w-full justify-center block py-3">Back to Home</Link>
        </div>
      </div>
    </div>
  )

  // ── Role picker ──────────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-red-600 font-bold text-2xl mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            Bharat Blood Bank
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-500 text-sm mt-1">Choose your role to get started</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { key: 'BLOOD_BANK', Icon: Building2,   title: 'Blood Bank', desc: 'Register your blood bank to manage donors, inventory and requests' },
            { key: 'DOCTOR',     Icon: Stethoscope, title: 'Doctor',     desc: 'Register as a verified doctor to request blood from banks' },
          ].map(({ key, Icon, title, desc }) => (
            <button key={key} onClick={() => { setRole(key); setStep(2) }}
              className="card hover:shadow-md hover:border-red-200 border-2 border-gray-100 text-left transition-all group"
            >
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                <Icon className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
        <p className="text-center mt-6 text-sm text-gray-500">
          Already registered? <Link to="/login" className="text-red-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )

  // ── Registration forms ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto animate-fade-in">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setStep(1); setFieldErrors({}); setError('') }}
            className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
            {role === 'BLOOD_BANK' ? <Building2 className="h-5 w-5 text-white" /> : <Stethoscope className="h-5 w-5 text-white" />}
          </div>
          <div>
            <h1 className="font-bold text-gray-900">{role === 'BLOOD_BANK' ? 'Blood Bank' : 'Doctor'} Registration</h1>
            <p className="text-xs text-gray-400">Fields marked * are required</p>
          </div>
        </div>

        <div className="card shadow-sm">
          {/* Global error banner */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── BLOOD BANK FORM ── */}
          {role === 'BLOOD_BANK' && (
            <form onSubmit={handleBankSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Field label="Blood Bank Name" error={fieldErrors.bankName} required className="sm:col-span-2">
                  <input value={bankForm.bankName}
                    onChange={e => { setBankForm({ ...bankForm, bankName: e.target.value }); clearFieldError('bankName') }}
                    className={`input ${fieldErrors.bankName ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder="e.g. Lucknow Red Cross Blood Bank" />
                </Field>

                <Field label="License Number" error={fieldErrors.licenseNumber} required>
                  <input value={bankForm.licenseNumber}
                    onChange={e => { setBankForm({ ...bankForm, licenseNumber: e.target.value }); clearFieldError('licenseNumber') }}
                    className={`input ${fieldErrors.licenseNumber ? 'border-red-400' : ''}`}
                    placeholder="e.g. UP-BB-2024-001" />
                </Field>

                <Field label="Contact Phone" error={fieldErrors.contactPhone} required>
                  <input type="tel" value={bankForm.contactPhone} maxLength={10}
                    onChange={e => { setBankForm({ ...bankForm, contactPhone: e.target.value.replace(/\D/g,'') }); clearFieldError('contactPhone') }}
                    className={`input ${fieldErrors.contactPhone ? 'border-red-400' : ''}`}
                    placeholder="10-digit number" />
                </Field>

                <Field label="Address" error={fieldErrors.address} required className="sm:col-span-2">
                  <input value={bankForm.address}
                    onChange={e => { setBankForm({ ...bankForm, address: e.target.value }); clearFieldError('address') }}
                    className={`input ${fieldErrors.address ? 'border-red-400' : ''}`}
                    placeholder="Street, Area, Locality" />
                </Field>

                <Field label="State" error={fieldErrors.state} required>
                  <select value={bankForm.state}
                    onChange={e => { setBankForm({ ...bankForm, state: e.target.value }); clearFieldError('state') }}
                    className={`input ${fieldErrors.state ? 'border-red-400' : ''}`}>
                    <option value="">— Select State —</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="City" error={fieldErrors.city} required>
                  <input value={bankForm.city}
                    onChange={e => { setBankForm({ ...bankForm, city: e.target.value }); clearFieldError('city') }}
                    className={`input ${fieldErrors.city ? 'border-red-400' : ''}`}
                    placeholder="City" />
                </Field>

                <Field label="Pincode" error={fieldErrors.pincode}>
                  <input value={bankForm.pincode} maxLength={6}
                    onChange={e => setBankForm({ ...bankForm, pincode: e.target.value.replace(/\D/g,'') })}
                    className="input" placeholder="6-digit pincode (optional)" />
                </Field>

                <Field label="Contact Email" error={fieldErrors.contactEmail} required>
                  <input type="email" value={bankForm.contactEmail}
                    onChange={e => { setBankForm({ ...bankForm, contactEmail: e.target.value }); clearFieldError('contactEmail') }}
                    className={`input ${fieldErrors.contactEmail ? 'border-red-400' : ''}`}
                    placeholder="contact@bank.org" />
                </Field>

                <div className="sm:col-span-2 pt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 border-b border-gray-100">
                    Login Credentials
                  </p>
                </div>

                <Field label="Login Email" error={fieldErrors.loginEmail} required>
                  <input type="email" value={bankForm.loginEmail}
                    onChange={e => { setBankForm({ ...bankForm, loginEmail: e.target.value }); clearFieldError('loginEmail') }}
                    className={`input ${fieldErrors.loginEmail ? 'border-red-400' : ''}`}
                    placeholder="login@bank.org" />
                </Field>

                <Field label="Password" error={fieldErrors.password} required>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={bankForm.password}
                      onChange={e => { setBankForm({ ...bankForm, password: e.target.value }); clearFieldError('password') }}
                      className={`input pr-10 ${fieldErrors.password ? 'border-red-400' : ''}`}
                      placeholder="Create strong password" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </div>

              {/* Password checklist */}
              {bankForm.password && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3 flex flex-wrap gap-x-4 gap-y-1">
                  {pwChecks.map(({ ok, label }) => (
                    <span key={label} className={`text-xs flex items-center gap-1 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-xs ${ok ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                        {ok ? '✓' : ''}
                      </span>
                      {label}
                    </span>
                  ))}
                </div>
              )}

              <button type="submit" className="btn-primary w-full justify-center py-3 mt-5" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Submit Registration'}
              </button>
            </form>
          )}

          {/* ── DOCTOR FORM ── */}
          {role === 'DOCTOR' && (
            <form onSubmit={handleDoctorSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Field label="Full Name" error={fieldErrors.doctorName} required>
                  <input value={doctorForm.doctorName}
                    onChange={e => { setDoctorForm({ ...doctorForm, doctorName: e.target.value }); clearFieldError('doctorName') }}
                    className={`input ${fieldErrors.doctorName ? 'border-red-400' : ''}`}
                    placeholder="Dr. Full Name" />
                </Field>

                <Field label="Specialization" error={fieldErrors.specialization}>
                  <input value={doctorForm.specialization}
                    onChange={e => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="input" placeholder="e.g. Hematology (optional)" />
                </Field>

                <Field label="MCI Registration Number" error={fieldErrors.medicalRegistrationNumber} required>
                  <input value={doctorForm.medicalRegistrationNumber}
                    onChange={e => { setDoctorForm({ ...doctorForm, medicalRegistrationNumber: e.target.value }); clearFieldError('medicalRegistrationNumber') }}
                    className={`input ${fieldErrors.medicalRegistrationNumber ? 'border-red-400' : ''}`}
                    placeholder="e.g. MCI-12345-UP" />
                </Field>

                <Field label="Phone Number" error={fieldErrors.phone} required>
                  <input type="tel" value={doctorForm.phone} maxLength={10}
                    onChange={e => { setDoctorForm({ ...doctorForm, phone: e.target.value.replace(/\D/g,'') }); clearFieldError('phone') }}
                    className={`input ${fieldErrors.phone ? 'border-red-400' : ''}`}
                    placeholder="10-digit number" />
                </Field>

                <Field label="Hospital Name" error={fieldErrors.hospitalName} required className="sm:col-span-2">
                  <input value={doctorForm.hospitalName}
                    onChange={e => { setDoctorForm({ ...doctorForm, hospitalName: e.target.value }); clearFieldError('hospitalName') }}
                    className={`input ${fieldErrors.hospitalName ? 'border-red-400' : ''}`}
                    placeholder="Hospital / Medical Center name" />
                </Field>

                <Field label="Hospital Address" error={fieldErrors.hospitalAddress} required className="sm:col-span-2">
                  <input value={doctorForm.hospitalAddress}
                    onChange={e => { setDoctorForm({ ...doctorForm, hospitalAddress: e.target.value }); clearFieldError('hospitalAddress') }}
                    className={`input ${fieldErrors.hospitalAddress ? 'border-red-400' : ''}`}
                    placeholder="Full hospital address" />
                </Field>

                <Field label="State" error={fieldErrors.state} required>
                  <select value={doctorForm.state}
                    onChange={e => { setDoctorForm({ ...doctorForm, state: e.target.value }); clearFieldError('state') }}
                    className={`input ${fieldErrors.state ? 'border-red-400' : ''}`}>
                    <option value="">— Select State —</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="City" error={fieldErrors.city} required>
                  <input value={doctorForm.city}
                    onChange={e => { setDoctorForm({ ...doctorForm, city: e.target.value }); clearFieldError('city') }}
                    className={`input ${fieldErrors.city ? 'border-red-400' : ''}`}
                    placeholder="City" />
                </Field>

                <Field label="Pincode" error={fieldErrors.pincode}>
                  <input value={doctorForm.pincode} maxLength={6}
                    onChange={e => setDoctorForm({ ...doctorForm, pincode: e.target.value.replace(/\D/g,'') })}
                    className="input" placeholder="6-digit pincode (optional)" />
                </Field>

                <div className="sm:col-span-2 pt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 border-b border-gray-100">
                    Login Credentials
                  </p>
                </div>

                <Field label="Login Email" error={fieldErrors.loginEmail} required>
                  <input type="email" value={doctorForm.loginEmail}
                    onChange={e => { setDoctorForm({ ...doctorForm, loginEmail: e.target.value }); clearFieldError('loginEmail') }}
                    className={`input ${fieldErrors.loginEmail ? 'border-red-400' : ''}`}
                    placeholder="dr.name@hospital.in" />
                </Field>

                <Field label="Password" error={fieldErrors.password} required>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={doctorForm.password}
                      onChange={e => { setDoctorForm({ ...doctorForm, password: e.target.value }); clearFieldError('password') }}
                      className={`input pr-10 ${fieldErrors.password ? 'border-red-400' : ''}`}
                      placeholder="Create strong password" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </div>

              {/* Password checklist */}
              {doctorForm.password && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3 flex flex-wrap gap-x-4 gap-y-1">
                  {pwChecks.map(({ ok, label }) => (
                    <span key={label} className={`text-xs flex items-center gap-1 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-xs ${ok ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                        {ok ? '✓' : ''}
                      </span>
                      {label}
                    </span>
                  ))}
                </div>
              )}

              <button type="submit" className="btn-primary w-full justify-center py-3 mt-5" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Submit Registration'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-4 text-sm text-gray-500">
          Already registered? <Link to="/login" className="text-red-600 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  )
}
