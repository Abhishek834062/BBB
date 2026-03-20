

import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Droplets, ClipboardList, Activity, Menu, X, LogOut, Plus, CheckCircle, AlertCircle, Search } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectUser } from '../../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { donorAPI, donationAPI, requestAPI, inventoryAPI } from '../../services/apiServices'
import { BLOOD_GROUPS, COMPONENTS, REQUEST_STATUS_CONFIG, fmtDate, fmtDateTime, bgLabel, compInfo, getError } from '../../utils/constants'
import { Spinner, PageLoader, Modal, EmptyState, StatusBadge, SectionHeader, BloodGroupBadge, ComponentBadge, TableWrapper, StatsCard } from '../../components/common'
import InventoryTable from '../../components/common/InventoryTable'

const SECTIONS = [
  { key: 'overview',   label: 'Overview',    icon: LayoutDashboard },
  { key: 'inventory',  label: 'Inventory',   icon: Activity },
  { key: 'donors',     label: 'Donors',      icon: Users },
  { key: 'donations',  label: 'Donations',   icon: Droplets },
  { key: 'requests',   label: 'Requests',    icon: ClipboardList },
]

export default function BankDashboard() {
  const [active,   setActive]   = useState('overview')
  const [sideOpen, setSideOpen] = useState(false)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)

  // Data states
  const [inventory,  setInventory]  = useState(null)
  const [donors,     setDonors]     = useState([])
  const [donations,  setDonations]  = useState([])
  const [requests,   setRequests]   = useState([])
  const [loading,    setLoading]    = useState(false)

  // Modals
  const [addDonorModal, setAddDonorModal]     = useState(false)
  const [confirmDonModal, setConfirmDonModal] = useState(false)
  const [handleReqModal, setHandleReqModal]   = useState(null)
  const [saving, setSaving] = useState(false)
  const [availableDonors, setAvailableDonors] = useState([]) // for CONTACT_DONOR
  const [donorsLoading, setDonorsLoading] = useState(false)

  // Forms
  const [donorForm, setDonorForm] = useState({ name: '', phone: '', email: '', address: '', bloodGroup: '', gender: '', dateOfBirth: '' })
  const [donationForm, setDonationForm] = useState({ donorId: '', donationDate: '', notes: '', linkedRequestId: '' })
  const [reqAction, setReqAction] = useState({ action: '', rejectionReason: '', bankNotes: '', donorId: '' })
  const [reqFilter, setReqFilter] = useState('ALL')

  useEffect(() => { loadSection(active) }, [active])

  const loadSection = async (sec) => {
    setLoading(true)
    try {
      if (sec === 'overview' || sec === 'inventory') {
        const r = await inventoryAPI.getMyInventory()
        setInventory(r.data.data)
      }
      if (sec === 'donors')    { const r = await donorAPI.getMyDonors();    setDonors(r.data.data || []) }
      if (sec === 'donations') { const r = await donationAPI.getMyDonations(); setDonations(r.data.data || []) }
      if (sec === 'requests')  { const r = await requestAPI.getBankRequests(); setRequests(r.data.data || []) }
    } catch (err) { toast.error(getError(err)) }
    finally { setLoading(false) }
  }

  const handleAddDonor = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await donorAPI.addDonor(donorForm)
      toast.success('Donor added successfully!'); setAddDonorModal(false)
      setDonorForm({ name: '', phone: '', email: '', address: '', bloodGroup: '', gender: '', dateOfBirth: '' })
      loadSection('donors')
    } catch (err) { toast.error(getError(err)) }
    finally { setSaving(false) }
  }

  const handleConfirmDonation = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await donationAPI.confirm({ ...donationForm, donorId: Number(donationForm.donorId), linkedRequestId: donationForm.linkedRequestId || null })
      toast.success('Donation confirmed! Blood split into components.'); setConfirmDonModal(false)
      setDonationForm({ donorId: '', donationDate: '', notes: '', linkedRequestId: '' })
      loadSection('donations')
      if (active === 'inventory') loadSection('inventory')
    } catch (err) { toast.error(getError(err)) }
    finally { setSaving(false) }
  }

  const handleReqSubmit = async () => {
    setSaving(true)
    try {
      await requestAPI.handleRequest(handleReqModal.id, reqAction)
      toast.success(`Request ${reqAction.action.toLowerCase()}d!`)
      setHandleReqModal(null)
      setAvailableDonors([])
      loadSection('requests')
    } catch (err) { toast.error(getError(err)) }
    finally { setSaving(false) }
  }

  const [donorsError, setDonorsError] = useState('')

  const openHandleModal = async (req) => {
    setHandleReqModal(req)
    setReqAction({ action: '', rejectionReason: '', bankNotes: '', donorId: '' })
    setAvailableDonors([])
    setDonorsError('')
    // Pre-load available donors if request is ACCEPTED and not emergency
    if (req.status === 'ACCEPTED' && !req.emergency) {
      loadAvailableDonors(req.id)
    }
  }

  const loadAvailableDonors = async (requestId) => {
    setDonorsLoading(true)
    setDonorsError('')
    try {
      const r = await requestAPI.getAvailableDonors(requestId)
      setAvailableDonors(r.data.data || [])
    } catch (err) {
      console.error('Failed to load available donors:', err)
      setDonorsError(getError(err))
      setAvailableDonors([])
    } finally {
      setDonorsLoading(false)
    }
  }

  const filteredRequests = reqFilter === 'ALL' ? requests : requests.filter(r => r.status === reqFilter)

  const navItem = (item) => (
    <button
      key={item.key}
      onClick={() => { setActive(item.key); setSideOpen(false) }}
      className={active === item.key ? 'sidebar-link-active' : 'sidebar-link'}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      {item.label}
      {item.key === 'requests' && requests.filter(r => r.status === 'PENDING').length > 0 && (
        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {requests.filter(r => r.status === 'PENDING').length}
        </span>
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <p className="font-bold text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">Blood Bank</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {SECTIONS.map(navItem)}
        </nav>
        <div className="p-4 border-t border-gray-100">
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
              <p className="font-bold text-gray-900">{user?.name}</p>
              <button onClick={() => setSideOpen(false)}><X className="h-5 w-5" /></button>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 h-14 flex items-center gap-4 px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
          <button className="lg:hidden" onClick={() => setSideOpen(true)}>
            <Menu className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="font-semibold text-gray-900">{SECTIONS.find(s => s.key === active)?.label}</h2>
          <div className="ml-auto flex gap-2">
            {active === 'donors' && (
              <button onClick={() => setAddDonorModal(true)} className="btn-primary text-sm py-1.5">
                <Plus className="h-4 w-4" /> Add Donor
              </button>
            )}
            {active === 'donations' && (
              <button onClick={() => setConfirmDonModal(true)} className="btn-primary text-sm py-1.5">
                <Plus className="h-4 w-4" /> Confirm Donation
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-8 space-y-6">
          {loading ? <PageLoader /> : (
            <>
              {/* ── OVERVIEW ──────────────────────────────────── */}
              {active === 'overview' && inventory && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard icon={Activity}     label="Total Units"         value={inventory.totalAvailableUnits} color="red" />
                    <StatsCard icon={Users}         label="Total Donors"        value={donors.length || '—'}         color="blue" />
                    <StatsCard icon={Droplets}      label="Total Donations"     value={donations.length || '—'}      color="green" />
                    <StatsCard icon={ClipboardList} label="Active Requests"     value={requests.filter(r=>r.status==='PENDING').length || '—'} color="yellow" />
                  </div>
                  <div className="card">
                    <h3 className="font-bold text-gray-900 mb-4">Live Inventory — {inventory.bloodBankName}</h3>
                    <InventoryTable inventory={inventory.inventory} />
                  </div>
                </div>
              )}

              {/* ── INVENTORY ─────────────────────────────────── */}
              {active === 'inventory' && inventory && (
                <div className="card animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Blood Inventory</h3>
                      <p className="text-gray-500 text-sm">{inventory.totalAvailableUnits} total units available</p>
                    </div>
                  </div>
                  <InventoryTable inventory={inventory.inventory} />
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {COMPONENTS.map(c => (
                      <div key={c.value} className={`rounded-xl p-4 ${c.color}`}>
                        <p className="font-semibold text-sm">{c.full}</p>
                        <p className="text-xs mt-1 opacity-80">Expires: {c.expiry}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── DONORS ────────────────────────────────────── */}
              {active === 'donors' && (
                <div className="animate-fade-in">
                  <SectionHeader title={`Donors (${donors.length})`} subtitle="All donors registered at your blood bank" />
                  {donors.length === 0 ? (
                    <EmptyState icon={Users} title="No donors yet" desc="Add your first donor to get started"
                      action={<button onClick={() => setAddDonorModal(true)} className="btn-primary mt-2"><Plus className="h-4 w-4" /> Add Donor</button>}
                    />
                  ) : (
                    <TableWrapper>
                      <thead className="bg-gray-50">
                        <tr>{['Name','Phone','Blood Group','Last Donated','Eligible','Added On'].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {donors.map(d => (
                          <tr key={d.id} className="table-row">
                            <td className="table-td font-medium">{d.name}</td>
                            <td className="table-td">{d.phone}</td>
                            <td className="table-td"><BloodGroupBadge value={d.bloodGroup} /></td>
                            <td className="table-td text-gray-500">{fmtDate(d.lastDonationDate) || 'Never'}</td>
                            <td className="table-td">
                              <span className={d.eligible ? 'badge-available' : 'badge-rejected'}>
                                {d.eligible ? '✓ Eligible' : '✗ Not yet'}
                              </span>
                            </td>
                            <td className="table-td text-gray-400 text-xs">{fmtDate(d.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </TableWrapper>
                  )}
                </div>
              )}

              {/* ── DONATIONS ─────────────────────────────────── */}
              {active === 'donations' && (
                <div className="animate-fade-in">
                  <SectionHeader title={`Donations (${donations.length})`} subtitle="All confirmed donations and blood component splits" />
                  {donations.length === 0 ? (
                    <EmptyState icon={Droplets} title="No donations yet" desc="Confirm a donation to add blood to inventory"
                      action={<button onClick={() => setConfirmDonModal(true)} className="btn-primary mt-2"><Plus className="h-4 w-4" /> Confirm Donation</button>}
                    />
                  ) : (
                    <TableWrapper>
                      <thead className="bg-gray-50">
                        <tr>{['Donor','Blood Group','Date','Volume','Split','Status'].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {donations.map(d => (
                          <tr key={d.id} className="table-row">
                            <td className="table-td font-medium">{d.donorName}</td>
                            <td className="table-td"><BloodGroupBadge value={d.bloodGroup} /></td>
                            <td className="table-td text-gray-500">{fmtDate(d.donationDate)}</td>
                            <td className="table-td">{d.volumeMl} ml</td>
                            <td className="table-td">
                              <span className={d.splitDone ? 'badge-available' : 'badge-pending'}>
                                {d.splitDone ? '✓ Split Done' : 'Pending'}
                              </span>
                            </td>
                            <td className="table-td"><span className="badge-available">{d.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </TableWrapper>
                  )}
                </div>
              )}

              {/* ── REQUESTS ──────────────────────────────────── */}
              {active === 'requests' && (
                <div className="animate-fade-in">
                  <SectionHeader
                    title={`Blood Requests (${requests.length})`}
                    subtitle="Manage incoming blood requests from doctors"
                    action={
                      <div className="flex gap-1 flex-wrap">
                        {['ALL','PENDING','ACCEPTED','FULFILLED','REJECTED'].map(f => (
                          <button key={f} onClick={() => setReqFilter(f)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${reqFilter === f ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
                          >{f}</button>
                        ))}
                      </div>
                    }
                  />
                  {filteredRequests.length === 0 ? (
                    <EmptyState icon={ClipboardList} title="No requests" desc="No requests matching the current filter" />
                  ) : (
                    <div className="space-y-4">
                      {filteredRequests.map(req => (
                        <div key={req.id} className={`card ${req.emergency ? 'border-red-200 bg-red-50/30' : ''}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <BloodGroupBadge value={req.bloodGroup} size="lg" />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-gray-900">
                                    {bgLabel(req.bloodGroup)} — <ComponentBadge value={req.component} />
                                  </span>
                                  {req.emergency && <span className="badge-emergency animate-pulse-red">🚨 EMERGENCY</span>}
                                  <StatusBadge status={req.status} />
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Dr. {req.doctorName}</strong> • {req.hospitalName}
                                </p>
                                {req.patientName && <p className="text-xs text-gray-400">Patient: {req.patientName}</p>}
                                {req.emergency && req.emergencyReason && (
                                  <p className="text-xs text-red-600 mt-1 bg-red-100 px-2 py-1 rounded">
                                    Emergency: {req.emergencyReason}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">{fmtDateTime(req.requestedAt)} • {req.unitsRequired} unit{req.unitsRequired > 1 ? 's' : ''} required</p>
                              </div>
                            </div>
                            {!['FULFILLED','REJECTED','CANCELLED'].includes(req.status) && (
                              <button
                                onClick={() => openHandleModal(req)}
                                className="btn-primary text-sm py-2 flex-shrink-0"
                              >
                                Handle Request
                              </button>
                            )}
                          </div>
                          {req.contactedDonorName && (
                            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-green-600" />
                              Donor contacted: <strong>{req.contactedDonorName}</strong> ({req.contactedDonorPhone})
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── ADD DONOR MODAL ─────────────────────────────────────── */}
      <Modal open={addDonorModal} onClose={() => setAddDonorModal(false)} title="Add Donor" size="md">
        <form onSubmit={handleAddDonor} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Full Name *</label><input value={donorForm.name} onChange={e=>setDonorForm({...donorForm,name:e.target.value})} className="input" required /></div>
            <div><label className="label">Phone *</label><input value={donorForm.phone} onChange={e=>setDonorForm({...donorForm,phone:e.target.value})} className="input" pattern="[6-9]\d{9}" required /></div>
            <div><label className="label">Blood Group *</label>
              <select value={donorForm.bloodGroup} onChange={e=>setDonorForm({...donorForm,bloodGroup:e.target.value})} className="input" required>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(b=><option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div><label className="label">Gender</label>
              <select value={donorForm.gender} onChange={e=>setDonorForm({...donorForm,gender:e.target.value})} className="input">
                <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div><label className="label">Date of Birth</label><input type="date" value={donorForm.dateOfBirth} onChange={e=>setDonorForm({...donorForm,dateOfBirth:e.target.value})} className="input" /></div>
            <div><label className="label">Email</label><input type="email" value={donorForm.email} onChange={e=>setDonorForm({...donorForm,email:e.target.value})} className="input" /></div>
            <div><label className="label">Address</label><input value={donorForm.address} onChange={e=>setDonorForm({...donorForm,address:e.target.value})} className="input" /></div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-ghost" onClick={() => setAddDonorModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? <Spinner size="sm"/> : 'Add Donor'}</button>
          </div>
        </form>
      </Modal>

      {/* ── CONFIRM DONATION MODAL ──────────────────────────────── */}
      <Modal open={confirmDonModal} onClose={() => setConfirmDonModal(false)} title="Confirm Donation" size="md">
        <form onSubmit={handleConfirmDonation} className="space-y-4">
          <div>
            <label className="label">Select Donor *</label>
            <select value={donationForm.donorId} onChange={e=>setDonationForm({...donationForm,donorId:e.target.value})} className="input" required>
              <option value="">Select donor...</option>
              {donors.filter(d=>d.eligible).map(d=>(
                <option key={d.id} value={d.id}>{d.name} — {bgLabel(d.bloodGroup)} ({d.phone})</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Only eligible donors shown (3+ months since last donation)</p>
          </div>
          <div><label className="label">Donation Date *</label><input type="date" value={donationForm.donationDate} onChange={e=>setDonationForm({...donationForm,donationDate:e.target.value})} className="input" required max={new Date().toISOString().split('T')[0]} /></div>
          <div>
            <label className="label">Link to Request (optional)</label>
            <select value={donationForm.linkedRequestId} onChange={e=>setDonationForm({...donationForm,linkedRequestId:e.target.value})} className="input">
              <option value="">None — voluntary donation</option>
              {requests.filter(r=>r.status==='DONOR_CONTACT_PENDING').map(r=>(
                <option key={r.id} value={r.id}>#{r.id} — Dr. {r.doctorName} — {bgLabel(r.bloodGroup)}</option>
              ))}
            </select>
          </div>
          <div><label className="label">Notes</label><input value={donationForm.notes} onChange={e=>setDonationForm({...donationForm,notes:e.target.value})} className="input" placeholder="Optional notes" /></div>
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            <strong>Auto-split:</strong> 1 donation → RBC (42 days) + Plasma (365 days) + Platelets (5 days)
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-ghost" onClick={() => setConfirmDonModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? <Spinner size="sm"/> : 'Confirm Donation'}</button>
          </div>
        </form>
      </Modal>

      {/* ── HANDLE REQUEST MODAL ────────────────────────────────── */}
      <Modal open={!!handleReqModal} onClose={() => { setHandleReqModal(null); setAvailableDonors([]); setDonorsError('') }} title="Handle Blood Request" size="lg">
        {handleReqModal && (
          <div className="space-y-4">

            {/* Request summary */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm grid grid-cols-2 gap-2 border border-gray-100">
              <div><span className="text-gray-500">Doctor:</span> <strong>Dr. {handleReqModal.doctorName}</strong></div>
              <div><span className="text-gray-500">Hospital:</span> {handleReqModal.hospitalName}</div>
              <div><span className="text-gray-500">Blood Group:</span> <strong>{bgLabel(handleReqModal.bloodGroup)}</strong></div>
              <div><span className="text-gray-500">Component:</span> <ComponentBadge value={handleReqModal.component} /></div>
              <div><span className="text-gray-500">Units Needed:</span> <strong>{handleReqModal.unitsRequired}</strong></div>
              <div><span className="text-gray-500">Status:</span> <StatusBadge status={handleReqModal.status} /></div>
              {handleReqModal.emergency && (
                <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-xs font-medium">
                  🚨 Emergency: {handleReqModal.emergencyReason}
                </div>
              )}
              {handleReqModal.contactedDonorName && (
                <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-700 text-xs">
                  👤 Linked Donor: <strong>{handleReqModal.contactedDonorName}</strong> — {handleReqModal.contactedDonorPhone}
                </div>
              )}
            </div>

            {/* Action buttons — strictly based on current status */}
            <div>
              <label className="label">Select Action</label>
              <div className="flex flex-wrap gap-2">

                {/* ACCEPT — only PENDING */}
                {handleReqModal.status === 'PENDING' && (
                  <button onClick={() => setReqAction({...reqAction, action: 'ACCEPT'})}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${reqAction.action==='ACCEPT' ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'}`}
                  >✓ Accept</button>
                )}

                {/* REJECT — PENDING or ACCEPTED only */}
                {['PENDING', 'ACCEPTED'].includes(handleReqModal.status) && (
                  <button onClick={() => setReqAction({...reqAction, action: 'REJECT', rejectionReason: ''})}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${reqAction.action==='REJECT' ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'}`}
                  >✗ Reject</button>
                )}

                {/* VERIFY_EMERGENCY — only EMERGENCY_PENDING_VERIFY */}
                {handleReqModal.status === 'EMERGENCY_PENDING_VERIFY' && (
                  <button onClick={() => setReqAction({...reqAction, action: 'VERIFY_EMERGENCY'})}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${reqAction.action==='VERIFY_EMERGENCY' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}
                  >🚨 Verify Emergency</button>
                )}

                {/* CONTACT_DONOR — ACCEPTED + not emergency ONLY.
                    NOT shown when status is DONOR_CONTACT_PENDING (donor already linked) */}
                {handleReqModal.status === 'ACCEPTED' && !handleReqModal.emergency && (
                  <button onClick={() => setReqAction({...reqAction, action: 'CONTACT_DONOR', donorId: ''})}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${reqAction.action==='CONTACT_DONOR' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}
                  >👤 Contact Donor</button>
                )}

                {/* FULFILL — only after donor is connected (normal) or emergency verified */}
                {handleReqModal.status === 'DONOR_CONTACT_PENDING' && (
                  <button onClick={() => setReqAction({...reqAction, action: 'FULFILL'})}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${reqAction.action==='FULFILL' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600'}`}
                  >🚚 Dispatch Blood</button>
                )}
                {handleReqModal.status === 'EMERGENCY_VERIFIED' && (
                  <button onClick={() => setReqAction({...reqAction, action: 'FULFILL'})}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${reqAction.action==='FULFILL' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'}`}
                  >⚡ Emergency Dispatch</button>
                )}
              </div>
            </div>

            {/* REJECT — reason */}
            {reqAction.action === 'REJECT' && (
              <div>
                <label className="label">Rejection Reason <span className="text-red-400">*</span></label>
                <textarea
                  value={reqAction.rejectionReason}
                  onChange={e => setReqAction({...reqAction, rejectionReason: e.target.value})}
                  className="input min-h-[80px] resize-none"
                  placeholder="Explain why this request is being rejected..."
                />
              </div>
            )}

            {/* CONTACT_DONOR — available donors */}
            {reqAction.action === 'CONTACT_DONOR' && (
              <div>
                <label className="label">
                  Select Donor <span className="text-red-400">*</span>
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    Donors who have donated at this bank and are not linked to another active request
                  </span>
                </label>

                {donorsLoading ? (
                  <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                    <Spinner size="sm" /> Loading donors...
                  </div>
                ) : donorsError ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-700 text-xs font-medium mb-2">⚠️ Failed to load donors: {donorsError}</p>
                    <button
                      onClick={() => loadAvailableDonors(handleReqModal.id)}
                      className="text-xs text-red-600 underline hover:no-underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : availableDonors.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-yellow-800 mb-2">⚠️ No donors available</p>
                    <ul className="text-xs space-y-1 list-disc list-inside text-yellow-700">
                      <li>Donor must have at least 1 confirmed donation at this bank</li>
                      <li>Or all donors are already linked to another active request</li>
                    </ul>
                    <button
                      onClick={() => loadAvailableDonors(handleReqModal.id)}
                      className="text-xs text-yellow-700 underline mt-2 block hover:no-underline"
                    >
                      Refresh list
                    </button>
                  </div>
                ) : (
                  <>
                    <select
                      value={reqAction.donorId}
                      onChange={e => setReqAction({...reqAction, donorId: e.target.value})}
                      className="input"
                    >
                      <option value="">— Select donor —</option>
                      {availableDonors.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} [{bgLabel(d.bloodGroup)}] — {d.phone}
                          {d.lastDonationDate ? ` · Last donated: ${d.lastDonationDate}` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      {availableDonors.length} donor{availableDonors.length > 1 ? 's' : ''} available
                    </p>
                  </>
                )}
              </div>
            )}

            {/* FULFILL info card */}
            {reqAction.action === 'FULFILL' && (
              <div className={`rounded-xl p-4 text-sm border ${
                handleReqModal.status === 'EMERGENCY_VERIFIED'
                  ? 'bg-orange-50 border-orange-200 text-orange-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                {handleReqModal.status === 'EMERGENCY_VERIFIED' ? (
                  <>
                    <p className="font-semibold mb-1">⚡ Emergency Dispatch</p>
                    <p className="text-xs">Blood will be deducted from inventory (FIFO — oldest units first).</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold mb-1">🚚 Dispatch from Inventory</p>
                    <p className="text-xs text-blue-700">
                      <strong>{bgLabel(handleReqModal.bloodGroup)} {handleReqModal.component}</strong> units will be deducted from bank stock (FIFO).
                      Donor's donation already added to stock when confirmed — no separate deduction needed.
                    </p>
                    {handleReqModal.contactedDonorName && (
                      <p className="text-xs text-blue-500 mt-1">
                        👤 Linked donor: <strong>{handleReqModal.contactedDonorName}</strong>
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* VERIFY_EMERGENCY confirmation note */}
            {reqAction.action === 'VERIFY_EMERGENCY' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                ⚠️ By verifying, you confirm you have checked the hospital emergency certificate. After this, blood will be dispatched from inventory.
              </div>
            )}

            {/* Bank Notes */}
            <div>
              <label className="label">Bank Notes <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
              <input
                value={reqAction.bankNotes}
                onChange={e => setReqAction({...reqAction, bankNotes: e.target.value})}
                className="input"
                placeholder="Internal notes for this action..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button className="btn-ghost" onClick={() => { setHandleReqModal(null); setAvailableDonors([]); setDonorsError('') }}>
                Cancel
              </button>
              <button
                onClick={handleReqSubmit}
                disabled={
                  saving ||
                  !reqAction.action ||
                  (reqAction.action === 'REJECT' && !reqAction.rejectionReason.trim()) ||
                  (reqAction.action === 'CONTACT_DONOR' && (!reqAction.donorId || availableDonors.length === 0))
                }
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? <Spinner size="sm" /> : `Confirm: ${reqAction.action || '—'}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
