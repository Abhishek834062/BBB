import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectToken, selectRole } from '../../store/slices/authSlice'

export default function ProtectedRoute({ children, role }) {
  const token    = useSelector(selectToken)
  const userRole = useSelector(selectRole)
  const location = useLocation()

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  if (role && userRole !== role) return <Navigate to="/" replace />
  return children
}
