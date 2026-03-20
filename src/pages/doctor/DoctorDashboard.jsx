import { useState, useEffect } from 'react'
import { Search, ClipboardList, BarChart2, LogOut, Menu, X, Plus, Droplets, Building2, AlertTriangle } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, selectUser } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import { inventoryAPI, requestAPI } from '../../services/apiServices'
import { BLOOD_GROUPS, COMPONENTS, bgLabel, compInfo, fmtDateTime, getError } from '../../utils/constants'
import { Spinner, PageLoader, Modal, EmptyState, StatusBadge, SectionHeader, BloodGroupBadge, ComponentBadge, TableWrapper, StatsCard } from '../../components/common'
import InventoryTable from '../../components/common/InventoryTable'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const SECTIONS = [
  { key: 'search',   label: 'Find & Request', icon: Search },
  { key: 'requests', label: 'My Requests',    icon: ClipboardList },
  { key: 'stats',    label: 'Overview',       icon: BarChart2 },
]

export default function DoctorDashboard() {
  const [active,   setActive]   = useState('search')
  const [sideOpen, setSideOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user     = useSelector(selectUser)

  const [allBanks,  setAllBanks]  = useState([])
  const [requests,  setRequests]  = useState([])
  const [loading,   setLoading]   = useState(false)

  // Bank detail / request flow
  const [selectedBank, setSelectedBank] = useState(null)
  const [bankInventory, setBankInventory] = useState(null)
  const [bankLoading, setBankLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Request modal
  const [reqModal, setReqModal] = useState(false)
  const [reqForm, setReqForm] = useState({ bloodGroup: '', component: '', unitsRequired: 1, patientName: '', patientCondition: '', emergency: false, emergencyReason: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadSection(active) }, [active])

  const loadSection = async (sec) => {
    setLoading(true)
    try {
      if (sec === 'search' || sec === 'stats') {
        const r = await inventoryAPI.getAllBanksInventory()
        setAllBanks(r.data.data || [])
      }
      if (sec === 'requests' || sec === 'stats') {
        const r = await requestAPI.getDoctorRequests()
        setRequests(r.data.data || [])
      }
    } catch (err) { toast.error(getError(err)) }
    finally { setLoading(false) }
  }

  const handleBankSelect = async (bank) => {
    setSelectedBank(bank)
    setBankLoading(true)
    try {
      const r = await inventoryAPI.getBankInventory(bank.bloodBankId)
      setBankInventory(r.data.data)
    } catch { }
    finally { setBankLoading(false) }
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await requestAPI.create({ ...reqForm, bloodBankId: selectedBank.bloodBankId, unitsRequired: Number(reqForm.unitsRequired) })
      toast.success('Blood request submitted!')
      setReqModal(false)
      setReqForm({ bloodGroup: '', component: '', unitsRequired: 1, patientName: '', patientCondition: '', emergency: false, emergencyReason: '' })
      loadSection('requests')
    } catch (err) { toast.error(getError(err)) }
    finally { setSaving(false) }
  }

  const handleCancel = async (id) => {
    try {
      await requestAPI.cancelRequest(id)
      toast.success('Request cancelled')
      loadSection('requests')
    } catch (err) { toast.error(getError(err)) }
  }

  const filteredBanks = allBanks.filter(b => b.bloodBankName?.toLowerCase().includes(searchTerm.toLowerCase()))

  const chartData = BLOOD_GROUPS.map(bg => ({
    name: bg.label,
    Pending:   requests.filter(r => r.bloodGroup === bg.value && r.status === 'PENDING').length,
    Fulfilled: requests.filter(r => r.bloodGroup === bg.value && r.status === 'FULFILLED').length,
  }))

  const navItem = (item) => (
    <button key={item.key} onClick={() => { setActive(item.key); setSideOpen(false) }}
      className={active === item.key ? 'sidebar-link-active' : 'sidebar-link'}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" /> {item.label}
      {item.key === 'requests' && requests.filter(r=>r.status==='PENDING').length > 0 && (
        <span className="ml-auto bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {requests.filter(r=>r.status==='PENDING').length}
        </span>
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <p className="font-bold text-gray-900 truncate">Dr. {user?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">Doctor</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">{SECTIONS.map(navItem)}</nav>
        <div className="p-4 border-t">
          <button onClick={() => { dispatch(logout()); navigate('/') }} className="sidebar-link w-full text-red-500 hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSideOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col">
            <div className="p-4 flex items-center justify-between border-b">
              <p className="font-bold">Dr. {user?.name}</p>
              <button onClick={() => setSideOpen(false)}><X className="h-5 w-5"/></button>
            </div>
            <nav className="flex-1 p-4 space-y-1">{SECTIONS.map(navItem)}</nav>
            <div className="p-4 border-t">
              <button onClick={() => { dispatch(logout()); navigate('/') }} className="sidebar-link w-full text-red-500">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-gray-100 h-14 flex items-center gap-4 px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
          <button className="lg:hidden" onClick={() => setSideOpen(true)}><Menu className="h-5 w-5 text-gray-500"/></button>
          <h2 className="font-semibold text-gray-900">{SECTIONS.find(s=>s.key===active)?.label}</h2>
        </div>

        <div className="flex-1 p-4 lg:p-8">
          {loading ? <PageLoader /> : (
            <>
              {/* ── SEARCH & REQUEST ──────────────────────────── */}
              {active === 'search' && (
                <div className="animate-fade-in">
                  {!selectedBank ? (
                    <>
                      <SectionHeader title="Find a Blood Bank" subtitle="Search for a bank and check real-time stock before requesting" />
                      <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          placeholder="Search blood bank by name..."
                          className="search-input"
                        />
                      </div>
                      {filteredBanks.length === 0 ? (
                        <EmptyState icon={Building2} title="No banks found" />
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredBanks.map(bank => (
                            <button
                              key={bank.bloodBankId}
                              onClick={() => handleBankSelect(bank)}
                              className="card-hover text-left"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-red-600" />
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bank.totalAvailableUnits > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                  {bank.totalAvailableUnits} units
                                </span>
                              </div>
                              <h3 className="font-bold text-gray-900 mb-1">{bank.bloodBankName}</h3>
                              <div className="flex gap-1 flex-wrap mt-2">
                                {BLOOD_GROUPS.slice(0,4).map(bg => {
                                  const total = COMPONENTS.reduce((s,c) => s + (bank.inventory?.[`${bg.label} - ${c.full}`]||0), 0)
                                  return total > 0 ? (
                                    <span key={bg.value} className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-medium">{bg.label}: {total}</span>
                                  ) : null
                                })}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => { setSelectedBank(null); setBankInventory(null) }} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
                        <h2 className="font-bold text-gray-900 text-lg">{selectedBank.bloodBankName}</h2>
                        <button onClick={() => setReqModal(true)} className="btn-primary ml-auto text-sm">
                          <Plus className="h-4 w-4" /> Request Blood
                        </button>
                      </div>

                      {bankLoading ? <div className="flex justify-center py-16"><Spinner size="lg"/></div> : bankInventory && (
                        <div className="card">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Blood Availability</h3>
                            <span className="text-sm text-gray-500">{bankInventory.totalAvailableUnits} total units</span>
                          </div>
                          <InventoryTable inventory={bankInventory.inventory} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── MY REQUESTS ───────────────────────────────── */}
              {active === 'requests' && (
                <div className="animate-fade-in">
                  <SectionHeader title={`My Blood Requests (${requests.length})`} subtitle="Track all your blood requests" />
                  {requests.length === 0 ? (
                    <EmptyState icon={ClipboardList} title="No requests yet" desc="Find a blood bank and request blood"
                      action={<button onClick={() => setActive('search')} className="btn-primary mt-2"><Search className="h-4 w-4"/> Find Blood Bank</button>}
                    />
                  ) : (
                    <div className="space-y-4">
                      {requests.map(req => (
                        <div key={req.id} className={`card ${req.emergency ? 'border-red-200' : ''}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <BloodGroupBadge value={req.bloodGroup} size="lg" />
                            <div className="flex-1">
                              <div className="flex items-center flex-wrap gap-2 mb-1">
                                <span className="font-bold">{bgLabel(req.bloodGroup)} — <ComponentBadge value={req.component} /></span>
                                {req.emergency && <span className="badge-emergency">🚨 Emergency</span>}
                                <StatusBadge status={req.status} />
                              </div>
                              <p className="text-sm text-gray-600">
                                <strong>{req.bloodBankName}</strong> • {req.unitsRequired} unit{req.unitsRequired>1?'s':''}
                              </p>
                              {req.patientName && <p className="text-xs text-gray-400">Patient: {req.patientName}</p>}
                              {req.bankNotes && <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">Bank: {req.bankNotes}</p>}
                              {req.rejectionReason && <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mt-1">Rejected: {req.rejectionReason}</p>}
                              <p className="text-xs text-gray-400 mt-1">{fmtDateTime(req.requestedAt)}</p>
                            </div>
                            {['PENDING','ACCEPTED'].includes(req.status) && (
                              <button onClick={() => handleCancel(req.id)} className="btn-danger text-sm py-1.5 flex-shrink-0">
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── OVERVIEW / STATS ──────────────────────────── */}
              {active === 'stats' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard icon={ClipboardList} label="Total Requests"    value={requests.length}                             color="red" />
                    <StatsCard icon={Droplets}      label="Pending"           value={requests.filter(r=>r.status==='PENDING').length}   color="yellow" />
                    <StatsCard icon={Droplets}      label="Fulfilled"         value={requests.filter(r=>r.status==='FULFILLED').length}  color="green" />
                    <StatsCard icon={Building2}     label="Banks Available"   value={allBanks.length}                             color="blue" />
                  </div>
                  <div className="card">
                    <h3 className="font-bold text-gray-900 mb-4">My Requests by Blood Group</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: 12 }} />
                          <Bar dataKey="Pending"   fill="#f59e0b" radius={[4,4,0,0]} />
                          <Bar dataKey="Fulfilled" fill="#22c55e" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── REQUEST MODAL ───────────────────────────────────────── */}
      <Modal open={reqModal} onClose={() => setReqModal(false)} title={`Request Blood — ${selectedBank?.bloodBankName}`} size="md">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Blood Group *</label>
              <select value={reqForm.bloodGroup} onChange={e=>setReqForm({...reqForm,bloodGroup:e.target.value})} className="input" required>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(b=><option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Component *</label>
              <select value={reqForm.component} onChange={e=>setReqForm({...reqForm,component:e.target.value})} className="input" required>
                <option value="">Select</option>
                {COMPONENTS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Units Required *</label>
              <input type="number" min="1" max="10" value={reqForm.unitsRequired} onChange={e=>setReqForm({...reqForm,unitsRequired:e.target.value})} className="input" required />
            </div>
            <div>
              <label className="label">Patient Name</label>
              <input value={reqForm.patientName} onChange={e=>setReqForm({...reqForm,patientName:e.target.value})} className="input" placeholder="Patient's name" />
            </div>
            <div className="col-span-2">
              <label className="label">Patient Condition</label>
              <input value={reqForm.patientCondition} onChange={e=>setReqForm({...reqForm,patientCondition:e.target.value})} className="input" placeholder="Brief description" />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={reqForm.emergency} onChange={e=>setReqForm({...reqForm,emergency:e.target.checked,emergencyReason:''})} className="w-4 h-4 accent-red-600" />
              <div>
                <span className="font-semibold text-orange-800 flex items-center gap-1"><AlertTriangle className="h-4 w-4"/> Mark as Emergency</span>
                <p className="text-xs text-orange-600">Use only for genuine emergencies — bank will verify</p>
              </div>
            </label>
          </div>

          {reqForm.emergency && (
            <div>
              <label className="label">Emergency Reason *</label>
              <textarea
                value={reqForm.emergencyReason}
                onChange={e=>setReqForm({...reqForm,emergencyReason:e.target.value})}
                className="input min-h-[70px] resize-none"
                placeholder="Explain the emergency — include hospital cert no, patient condition..."
                required
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-ghost" onClick={() => setReqModal(false)}>Cancel</button>
            <button type="submit" className={`btn-primary ${reqForm.emergency ? 'bg-orange-600 hover:bg-orange-700' : ''}`} disabled={saving}>
              {saving ? <Spinner size="sm"/> : reqForm.emergency ? '🚨 Submit Emergency' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
