import { X, Droplets, AlertCircle } from 'lucide-react'
import { REQUEST_STATUS_CONFIG, bgLabel, compInfo } from '../../utils/constants'

export function Spinner({ size = 'md', className = '' }) {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6'
  return (
    <div className={`animate-spin rounded-full border-2 border-red-200 border-t-red-600 ${s} ${className}`} />
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Spinner size="lg" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  )
}

export function EmptyState({ icon: Icon = Droplets, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-red-300" />
      </div>
      <h3 className="text-gray-700 font-semibold mb-1">{title}</h3>
      {desc && <p className="text-gray-400 text-sm mb-4">{desc}</p>}
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} animate-slide-up max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

export function StatusBadge({ status }) {
  const cfg = REQUEST_STATUS_CONFIG[status] || { label: status, color: 'badge-pending' }
  return <span className={cfg.color}>{cfg.label}</span>
}

export function BloodGroupBadge({ value, size = 'sm' }) {
  const s = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-xs'
  return (
    <div className={`blood-group-badge ${s}`}>{bgLabel(value)}</div>
  )
}

export function ComponentBadge({ value }) {
  const info = compInfo(value)
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${info.color}`}>{info.label}</span>
}

export function ErrorAlert({ message, onClose }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="flex-shrink-0"><X className="h-4 w-4" /></button>}
    </div>
  )
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, loading, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button
          className={danger ? 'btn-primary bg-red-600' : 'btn-primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-sub">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatsCard({ icon: Icon, label, value, color = 'red', trend }) {
  const colors = {
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    val: 'text-red-700' },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700' },
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', val: 'text-yellow-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', val: 'text-purple-700' },
  }
  const c = colors[color] || colors.red
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-6 w-6 ${c.icon}`} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
        {trend && <p className="text-xs text-gray-400">{trend}</p>}
      </div>
    </div>
  )
}

export function TableWrapper({ children, loading }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <table className="w-full">{children}</table>
      )}
    </div>
  )
}
