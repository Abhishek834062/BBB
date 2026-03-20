import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectToken, selectRole } from './store/slices/authSlice'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'

// Public Pages
import HomePage       from './pages/public/HomePage'
import FindBloodPage  from './pages/public/FindBloodPage'
import BanksPage      from './pages/public/BanksPage'
import BankDetailPage from './pages/public/BankDetailPage'

// Auth Pages
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import { ForgotPasswordPage, ResetPasswordPage } from './pages/auth/PasswordPages'

// Dashboard Pages
import AdminDashboard  from './pages/admin/AdminDashboard'
import BankDashboard   from './pages/bank/BankDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'

// Layout wrapper for public pages
function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

// Auto-redirect logged-in users to their dashboard
function AuthRedirect({ children }) {
  const token = useSelector(selectToken)
  const role  = useSelector(selectRole)
  if (token) {
    const dest = role === 'ADMIN' ? '/admin' : role === 'BLOOD_BANK' ? '/bank' : '/doctor'
    return <Navigate to={dest} replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes ────────────────────────────── */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/find-blood" element={<PublicLayout><FindBloodPage /></PublicLayout>} />
        <Route path="/banks" element={<PublicLayout><BanksPage /></PublicLayout>} />
        <Route path="/banks/:id" element={<PublicLayout><BankDetailPage /></PublicLayout>} />

        {/* ── Auth Routes ──────────────────────────────── */}
        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* ── Protected Dashboards ─────────────────────── */}
        <Route path="/admin/*" element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/bank/*" element={
          <ProtectedRoute role="BLOOD_BANK">
            <BankDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor/*" element={
          <ProtectedRoute role="DOCTOR">
            <DoctorDashboard />
          </ProtectedRoute>
        } />

        {/* ── Fallback ─────────────────────────────────── */}
        <Route path="*" element={
          <PublicLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="text-8xl font-black text-red-100 mb-4">404</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
              <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </PublicLayout>
        } />
      </Routes>
    </BrowserRouter>
  )
}
