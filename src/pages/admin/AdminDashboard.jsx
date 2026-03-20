



import { useState, useEffect } from 'react'
import {
  Building2, Stethoscope, BarChart2, CheckCircle, XCircle,
  Clock, Users, Power, PowerOff, AlertTriangle
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, selectUser } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/apiServices'
import { getError } from '../../utils/constants'
import { Spinner, PageLoader, StatsCard, Modal, TableWrapper, SectionHeader, EmptyState } from '../../components/common'

const TABS = [
  { key: 'stats',   label: 'Overview',    icon: BarChart2 },
  { key: 'banks',   label: 'Blood Banks', icon: Building2 },
  { key: 'doctors', label: 'Doctors',     icon: Stethoscope },
]

// ── Status badge for verification ────────────────────────────────────────────
function VerifyBadge({ status }) {
  const map = {
    APPROVED: 'bg-green-100 text-green-700 border border-green-200',
    PENDING:  'bg-yellow-100 text-yellow-700 border border-yellow-200',
    REJECTED: 'bg-red-100 text-red-700 border border-red-200',
  }
  const icons = {
    APPROVED: <CheckCircle className="h-3 w-3" />,
    PENDING:  <Clock className="h-3 w-3" />,
    REJECTED: <XCircle className="h-3 w-3" />,
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || map.PENDING}`}>
      {icons[status]} {status}
    </span>
  )
}

// ── Enable/Disable status badge ───────────────────────────────────────────────
function EnabledBadge({ enabled }) {
  return enabled ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
      <Power className="h-3 w-3" /> Enabled
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-300">
      <PowerOff className="h-3 w-3" /> Disabled
    </span>
  )
}

export default function AdminDashboard() {
  const [tab,     setTab]     = useState('stats')
  const [stats,   setStats]   = useState(null)
  const [banks,   setBanks]   = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('ALL')

  // Verify modal state
  const [verifyModal,    setVerifyModal]    = useState(null)   // { type, item }
  const [verifyStatus,   setVerifyStatus]   = useState('')     // 'APPROVED' | 'REJECTED'
  const [rejectReason,   setRejectReason]   = useState('')
  const [confirmText,    setConfirmText]    = useState('')     // type-to-confirm input
  const [saving,         setSaving]         = useState(false)

  // Toggle modal state
  const [toggleModal,    setToggleModal]    = useState(null)   // { item, type }
  const [toggleConfirm,  setToggleConfirm]  = useState('')     // type-to-confirm

  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const adminUser = useSelector(selectUser)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, b, d] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllBanks(),
        adminAPI.getAllDoctors(),
      ])
      setStats(s.data.data)
      setBanks(b.data.data   || [])
      setDoctors(d.data.data || [])
    } catch (err) { toast.error(getError(err)) }
    finally { setLoading(false) }
  }

  // ── Open verify modal ────────────────────────────────────────────────────
  const openVerifyModal = (type, item) => {
    setVerifyModal({ type, item })
    setVerifyStatus('')
    setRejectReason('')
    setConfirmText('')
  }

  // ── Verify submission (with type-to-confirm check) ───────────────────────
  const handleVerify = async () => {
    if (!verifyStatus) { toast.error('Please choose Approve or Reject'); return }
    if (confirmText.trim().toUpperCase() !== verifyStatus) {
      toast.error(`Type exactly "${verifyStatus}" to confirm`); return
    }
    if (verifyStatus === 'REJECTED' && !rejectReason.trim()) {
      toast.error('Rejection reason is required'); return
    }
    setSaving(true)
    try {
      const payload = { status: verifyStatus, rejectionReason: rejectReason || null }
      if (verifyModal.type === 'bank') {
        await adminAPI.verifyBank(verifyModal.item.userId, payload)
      } else {
        await adminAPI.verifyDoctor(verifyModal.item.userId, payload)
      }
      const name = verifyModal.item.bankName || verifyModal.item.doctorName
      toast.success(`${name} has been ${verifyStatus.toLowerCase()}`)
      setVerifyModal(null)
      loadAll()
    } catch (err) { toast.error(getError(err)) }
    finally { setSaving(false) }
  }

  // ── Toggle enable/disable (with type-to-confirm) ─────────────────────────
  const openToggleModal = (item, type) => {
    setToggleModal({ item, type })
    setToggleConfirm('')
  }

  const handleToggle = async () => {
    const action = toggleModal.item.enabled ? 'DISABLE' : 'ENABLE'
    if (toggleConfirm.trim().toUpperCase() !== action) {
      toast.error(`Type exactly "${action}" to confirm`); return
    }
    setSaving(true)
    try {
      await adminAPI.toggleUser(toggleModal.item.userId)
      const name = toggleModal.item.bankName || toggleModal.item.doctorName
      toast.success(`${name} account ${action.toLowerCase()}d`)
      setToggleModal(null)
      loadAll()
    } catch (err) { toast.error(getError(err)) }
    finally { setSaving(false) }
  }

  const filterItems = (items) =>
    filter === 'ALL' ? items : items.filter(i => i.verificationStatus === filter)

  if (loading) return <PageLoader />

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              {stats?.pendingBloodBankApprovals > 0 && (
                <span className="hidden sm:flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-full animate-pulse">
                  <Clock className="h-3 w-3" /> {stats.pendingBloodBankApprovals} bank{stats.pendingBloodBankApprovals > 1 ? 's' : ''} pending
                </span>
              )}
              {stats?.pendingDoctorApprovals > 0 && (
                <span className="hidden sm:flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-full">
                  <Clock className="h-3 w-3" /> {stats.pendingDoctorApprovals} doctor{stats.pendingDoctorApprovals > 1 ? 's' : ''} pending
                </span>
              )}
              <button
                onClick={() => { dispatch(logout()); navigate('/') }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0">
            {TABS.map(({ key, label, icon: Icon }) => {
              const pending = key === 'banks'
                ? stats?.pendingBloodBankApprovals
                : key === 'doctors' ? stats?.pendingDoctorApprovals : 0
              return (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === key
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {pending > 0 && (
                    <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {pending}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
        {tab === 'stats' && stats && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard icon={Building2}    label="Total Blood Banks"        value={stats.totalBloodBanks}           color="red" />
              <StatsCard icon={Stethoscope}  label="Total Doctors"            value={stats.totalDoctors}              color="blue" />
              <StatsCard icon={Clock}        label="Pending Bank Approvals"   value={stats.pendingBloodBankApprovals} color="yellow" />
              <StatsCard icon={Clock}        label="Pending Doctor Approvals" value={stats.pendingDoctorApprovals}    color="purple" />
            </div>

            {(stats.pendingBloodBankApprovals > 0 || stats.pendingDoctorApprovals > 0) && (
              <div className="card border-yellow-200 bg-yellow-50">
                <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Action Required — Pending Approvals
                </h3>
                <div className="flex flex-wrap gap-3">
                  {stats.pendingBloodBankApprovals > 0 && (
                    <button onClick={() => { setTab('banks'); setFilter('PENDING') }} className="btn-primary text-sm py-2">
                      Review {stats.pendingBloodBankApprovals} Blood Bank{stats.pendingBloodBankApprovals > 1 ? 's' : ''}
                    </button>
                  )}
                  {stats.pendingDoctorApprovals > 0 && (
                    <button onClick={() => { setTab('doctors'); setFilter('PENDING') }} className="btn-secondary text-sm py-2">
                      Review {stats.pendingDoctorApprovals} Doctor{stats.pendingDoctorApprovals > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BLOOD BANKS TAB ──────────────────────────────────────────── */}
        {tab === 'banks' && (
          <div className="animate-fade-in">
            <SectionHeader title={`Blood Banks (${banks.length})`} subtitle="Verify, approve or manage blood bank accounts"
              action={
                <div className="flex gap-1 flex-wrap">
                  {['ALL','PENDING','APPROVED','REJECTED'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}
                    >{f} {f !== 'ALL' && `(${banks.filter(b => b.verificationStatus === f).length})`}</button>
                  ))}
                </div>
              }
            />
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Bank Name','License','City / State','Contact','Verify Status','Account Status','Actions'].map(h => (
                      <th key={h} className="table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filterItems(banks).length === 0 ? (
                    <tr><td colSpan={7} className="py-16 text-center text-gray-400">No banks found</td></tr>
                  ) : filterItems(banks).map(bank => (
                    <tr key={bank.id} className="table-row">
                      <td className="table-td">
                        <p className="font-semibold text-gray-900">{bank.bankName}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{bank.contactEmail}</p>
                      </td>
                      <td className="table-td text-xs text-gray-500 font-mono">{bank.licenseNumber}</td>
                      <td className="table-td">
                        <p className="text-gray-700">{bank.city}</p>
                        <p className="text-xs text-gray-400">{bank.state}</p>
                      </td>
                      <td className="table-td text-xs">{bank.contactPhone}</td>
                      <td className="table-td"><VerifyBadge status={bank.verificationStatus} /></td>
                      <td className="table-td"><EnabledBadge enabled={bank.enabled} /></td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          {bank.verificationStatus === 'PENDING' && (
                            <button
                              onClick={() => openVerifyModal('bank', bank)}
                              className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg font-medium transition-colors"
                            >
                              Review
                            </button>
                          )}
                          {bank.verificationStatus === 'APPROVED' && (
                            <button
                              onClick={() => openVerifyModal('bank', bank)}
                              className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg font-medium transition-colors"
                            >
                              Re-review
                            </button>
                          )}
                          <button
                            onClick={() => openToggleModal(bank, 'bank')}
                            title={bank.enabled ? 'Click to Disable' : 'Click to Enable'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              bank.enabled
                                ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-green-200'
                                : 'bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600 hover:border-green-200 border-gray-200'
                            }`}
                          >
                            {bank.enabled ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DOCTORS TAB ──────────────────────────────────────────────── */}
        {tab === 'doctors' && (
          <div className="animate-fade-in">
            <SectionHeader title={`Doctors (${doctors.length})`} subtitle="Verify, approve or manage doctor accounts"
              action={
                <div className="flex gap-1 flex-wrap">
                  {['ALL','PENDING','APPROVED','REJECTED'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}
                    >{f} {f !== 'ALL' && `(${doctors.filter(d => d.verificationStatus === f).length})`}</button>
                  ))}
                </div>
              }
            />
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Doctor','MCI No.','Hospital','City / State','Email','Verify Status','Account Status','Actions'].map(h => (
                      <th key={h} className="table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filterItems(doctors).length === 0 ? (
                    <tr><td colSpan={8} className="py-16 text-center text-gray-400">No doctors found</td></tr>
                  ) : filterItems(doctors).map(doc => (
                    <tr key={doc.id} className="table-row">
                      <td className="table-td">
                        <p className="font-semibold text-gray-900">{doc.doctorName}</p>
                        <p className="text-xs text-gray-400">{doc.specialization || '—'}</p>
                      </td>
                      <td className="table-td text-xs text-gray-500 font-mono">{doc.medicalRegistrationNumber}</td>
                      <td className="table-td text-xs max-w-[160px] truncate">{doc.hospitalName}</td>
                      <td className="table-td">
                        <p className="text-gray-700">{doc.city}</p>
                        <p className="text-xs text-gray-400">{doc.state}</p>
                      </td>
                      <td className="table-td text-xs">{doc.email}</td>
                      <td className="table-td"><VerifyBadge status={doc.verificationStatus} /></td>
                      <td className="table-td"><EnabledBadge enabled={doc.enabled} /></td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          {doc.verificationStatus === 'PENDING' && (
                            <button
                              onClick={() => openVerifyModal('doctor', doc)}
                              className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg font-medium transition-colors"
                            >
                              Review
                            </button>
                          )}
                          {doc.verificationStatus === 'APPROVED' && (
                            <button
                              onClick={() => openVerifyModal('doctor', doc)}
                              className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg font-medium transition-colors"
                            >
                              Re-review
                            </button>
                          )}
                          <button
                            onClick={() => openToggleModal(doc, 'doctor')}
                            title={doc.enabled ? 'Click to Disable' : 'Click to Enable'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              doc.enabled
                                ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-green-200'
                                : 'bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600 hover:border-green-200 border-gray-200'
                            }`}
                          >
                            {doc.enabled ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          VERIFY MODAL — GitHub-style type-to-confirm
      ══════════════════════════════════════════════════════════════════ */}
      <Modal open={!!verifyModal} onClose={() => setVerifyModal(null)} title="Review Registration" size="md">
        {verifyModal && (
          <div className="space-y-5">

            {/* Details card */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 border border-gray-100">
              <p className="font-bold text-gray-900 text-base mb-2">
                {verifyModal.item.bankName || verifyModal.item.doctorName}
              </p>
              {verifyModal.type === 'bank' ? (
                <>
                  <p><span className="text-gray-400 w-24 inline-block">License</span> <span className="font-mono">{verifyModal.item.licenseNumber}</span></p>
                  <p><span className="text-gray-400 w-24 inline-block">Location</span> {verifyModal.item.city}, {verifyModal.item.state}</p>
                  <p><span className="text-gray-400 w-24 inline-block">Phone</span> {verifyModal.item.contactPhone}</p>
                  <p><span className="text-gray-400 w-24 inline-block">Email</span> {verifyModal.item.contactEmail}</p>
                </>
              ) : (
                <>
                  <p><span className="text-gray-400 w-24 inline-block">MCI No.</span> <span className="font-mono">{verifyModal.item.medicalRegistrationNumber}</span></p>
                  <p><span className="text-gray-400 w-24 inline-block">Hospital</span> {verifyModal.item.hospitalName}</p>
                  <p><span className="text-gray-400 w-24 inline-block">Location</span> {verifyModal.item.city}, {verifyModal.item.state}</p>
                  <p><span className="text-gray-400 w-24 inline-block">Email</span> {verifyModal.item.email}</p>
                </>
              )}
            </div>

            {/* Choose action */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Choose action:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setVerifyStatus('APPROVED'); setConfirmText('') }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    verifyStatus === 'APPROVED'
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                      : 'border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-600'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" /> Approve
                </button>
                <button
                  onClick={() => { setVerifyStatus('REJECTED'); setConfirmText('') }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    verifyStatus === 'REJECTED'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                      : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600'
                  }`}
                >
                  <XCircle className="h-5 w-5" /> Reject
                </button>
              </div>
            </div>

            {/* Rejection reason */}
            {verifyStatus === 'REJECTED' && (
              <div>
                <label className="label">Rejection Reason <span className="text-red-400">*</span></label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="input min-h-[80px] resize-none"
                  placeholder="Explain why the registration is being rejected (this will be emailed to them)..."
                />
              </div>
            )}

            {/* GitHub-style type-to-confirm */}
            {verifyStatus && (
              <div className={`rounded-xl p-4 border ${verifyStatus === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${verifyStatus === 'APPROVED' ? 'text-green-600' : 'text-red-600'}`} />
                  <p className={`text-sm font-medium ${verifyStatus === 'APPROVED' ? 'text-green-800' : 'text-red-800'}`}>
                    To confirm, type <strong className="font-mono bg-white px-1.5 py-0.5 rounded border">{verifyStatus}</strong> in the box below:
                  </p>
                </div>
                <input
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  className={`input font-mono tracking-wider text-center ${
                    confirmText && confirmText.toUpperCase() !== verifyStatus
                      ? 'border-red-400 focus:ring-red-400 bg-red-50'
                      : confirmText.toUpperCase() === verifyStatus
                      ? 'border-green-400 focus:ring-green-400 bg-green-50'
                      : ''
                  }`}
                  placeholder={verifyStatus}
                  autoFocus
                />
                {confirmText && confirmText.toUpperCase() !== verifyStatus && (
                  <p className="text-xs text-red-500 mt-1">
                    ✗ Doesn't match — type exactly: {verifyStatus}
                  </p>
                )}
                {confirmText.toUpperCase() === verifyStatus && (
                  <p className="text-xs text-green-600 mt-1">✓ Confirmed</p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-end pt-1">
              <button className="btn-ghost" onClick={() => setVerifyModal(null)}>Cancel</button>
              <button
                onClick={handleVerify}
                disabled={
                  saving ||
                  !verifyStatus ||
                  confirmText.trim().toUpperCase() !== verifyStatus ||
                  (verifyStatus === 'REJECTED' && !rejectReason.trim())
                }
                className={`btn-primary ${
                  verifyStatus === 'REJECTED'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {saving ? <Spinner size="sm" /> : `Confirm ${verifyStatus || '—'}`}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════
          ENABLE / DISABLE MODAL — GitHub-style type-to-confirm
      ══════════════════════════════════════════════════════════════════ */}
      <Modal
        open={!!toggleModal}
        onClose={() => setToggleModal(null)}
        title={toggleModal?.item.enabled ? 'Disable Account' : 'Enable Account'}
        size="sm"
      >
        {toggleModal && (() => {
          const isDisabling = toggleModal.item.enabled
          const action      = isDisabling ? 'DISABLE' : 'ENABLE'
          const name        = toggleModal.item.bankName || toggleModal.item.doctorName
          return (
            <div className="space-y-4">
              <div className={`rounded-xl p-4 border ${isDisabling ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <p className={`text-sm font-semibold mb-1 ${isDisabling ? 'text-red-800' : 'text-green-800'}`}>
                  {isDisabling ? '⚠️ This will prevent login' : '✅ This will restore login access'}
                </p>
                <p className={`text-sm ${isDisabling ? 'text-red-700' : 'text-green-700'}`}>
                  {isDisabling
                    ? `${name} will not be able to login until re-enabled.`
                    : `${name} will be able to login again.`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">
                  To confirm, type{' '}
                  <strong className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border text-gray-800">{action}</strong>{' '}
                  below:
                </p>
                <input
                  value={toggleConfirm}
                  onChange={e => setToggleConfirm(e.target.value)}
                  className={`input font-mono tracking-wider text-center ${
                    toggleConfirm && toggleConfirm.toUpperCase() !== action
                      ? 'border-red-400'
                      : toggleConfirm.toUpperCase() === action
                      ? isDisabling ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
                      : ''
                  }`}
                  placeholder={action}
                  autoFocus
                />
                {toggleConfirm && toggleConfirm.toUpperCase() !== action && (
                  <p className="text-xs text-red-500 mt-1">✗ Type exactly: {action}</p>
                )}
                {toggleConfirm.toUpperCase() === action && (
                  <p className={`text-xs mt-1 ${isDisabling ? 'text-red-600' : 'text-green-600'}`}>✓ Confirmed</p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button className="btn-ghost" onClick={() => setToggleModal(null)}>Cancel</button>
                <button
                  onClick={handleToggle}
                  disabled={saving || toggleConfirm.trim().toUpperCase() !== action}
                  className={`btn-primary disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDisabling ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {saving ? <Spinner size="sm" /> : `${action} Account`}
                </button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}


