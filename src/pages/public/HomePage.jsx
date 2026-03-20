import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Droplets, Heart, Users, Building2, ArrowRight, Phone, AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react'
import { inventoryAPI } from '../../services/apiServices'
import { useDispatch, useSelector } from 'react-redux'
import { setAllBanks, selectAllBanks } from '../../store/slices/inventorySlice'
import { Spinner } from '../../components/common'
import InventoryTable from '../../components/common/InventoryTable'

const STATS = [
  { icon: Droplets, label: 'Blood Units Available', value: '50,000+', color: 'red' },
  { icon: Building2, label: 'Registered Blood Banks', value: '500+',   color: 'blue' },
  { icon: Users,    label: 'Active Donors',           value: '1 Lakh+', color: 'green' },
  { icon: Heart,    label: 'Lives Saved',             value: '10 Lakh+', color: 'purple' },
]

const HOW_IT_WORKS = [
  { step: 1, icon: Search,       title: 'Search Blood Bank', desc: 'Find nearby blood banks by city or state and check real-time availability.' },
  { step: 2, icon: Activity,     title: 'Check Stock',        desc: 'View available blood groups and components — RBC, Plasma, and Platelets.' },
  { step: 3, icon: Users,        title: 'Contact or Request', desc: 'Doctors can request blood directly. Banks connect with registered donors.' },
  { step: 4, icon: Heart,        title: 'Save a Life',        desc: 'Blood is dispatched swiftly — emergency requests fulfilled within hours.' },
]

export default function HomePage() {
  const [bankSearch, setBankSearch] = useState('')
  const [filteredBanks, setFilteredBanks] = useState([])
  const [searching, setSearching] = useState(false)
  const dispatch = useDispatch()
  const allBanks = useSelector(selectAllBanks)
  const navigate = useNavigate()

  useEffect(() => {
    if (!allBanks.length) {
      inventoryAPI.getAllBanksInventory()
        .then(r => dispatch(setAllBanks(r.data.data || [])))
        .catch(() => {})
    }
  }, [])

  const handleBankSearch = (e) => {
    e.preventDefault()
    if (!bankSearch.trim()) return
    setSearching(true)
    const results = allBanks.filter(b =>
      b.bloodBankName?.toLowerCase().includes(bankSearch.toLowerCase())
    )
    setFilteredBanks(results)
    setTimeout(() => setSearching(false), 300)
  }

  return (
    <div className="animate-fade-in">

      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live Blood Availability — Updated in Real Time
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Saving Lives,<br />One Drop at a Time
            </h1>
            <p className="text-red-100 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
              India's trusted blood bank management platform. Find blood banks near you,
              check real-time blood availability, and connect with verified donors —
              all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/find-blood" className="inline-flex items-center justify-center gap-2 bg-white text-red-600 font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-colors shadow-lg text-base">
                <Droplets className="h-5 w-5" /> Find Blood Now
              </Link>
              <Link to="/banks" className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-xl hover:bg-white/30 transition-colors text-base border border-white/30">
                <Building2 className="h-5 w-5" /> Search Blood Banks
              </Link>
            </div>
          </div>
        </div>
        {/* Emergency strip */}
        <div className="relative bg-red-900/50 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Emergency Blood Helpline:</span>
              <span className="font-bold text-base">104</span>
            </div>
            <span className="hidden sm:block text-white/40">|</span>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-300" />
              <span>For emergency requests, doctors can flag priority — fulfilled within hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ icon: Icon, label, value, color }) => {
              const cls = {
                red:    'bg-red-50 text-red-600',
                blue:   'bg-blue-50 text-blue-600',
                green:  'bg-green-50 text-green-600',
                purple: 'bg-purple-50 text-purple-600',
              }[color]
              return (
                <div key={label} className="card text-center hover:shadow-md transition-shadow">
                  <div className={`w-14 h-14 rounded-2xl ${cls} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900 mb-1">{value}</div>
                  <div className="text-gray-500 text-sm">{label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── BANK SEARCH BY NAME ───────────────────────────────────── */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 rounded-full px-4 py-1 text-sm font-medium mb-3">
              <Building2 className="h-4 w-4" /> Quick Bank Search
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Search Blood Banks by Name</h2>
            <p className="text-gray-500">Know the bank name? Find it directly and check their blood stock.</p>
          </div>

          <form onSubmit={handleBankSearch} className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={bankSearch}
                onChange={e => { setBankSearch(e.target.value); if (!e.target.value) setFilteredBanks([]) }}
                placeholder="Type blood bank name e.g. 'Red Cross Lucknow'..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm text-sm"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-4 text-base">
              {searching ? <Spinner size="sm" /> : <><Search className="h-5 w-5" /> Search</>}
            </button>
          </form>

          {/* Results */}
          {filteredBanks.length > 0 && (
            <div className="space-y-3 animate-slide-up">
              {filteredBanks.map(bank => (
                <div
                  key={bank.bloodBankId}
                  onClick={() => navigate(`/banks/${bank.bloodBankId}`)}
                  className="card-hover flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{bank.bloodBankName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {bank.totalAvailableUnits} units available across all components
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-lg font-bold ${bank.totalAvailableUnits > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {bank.totalAvailableUnits}
                      </span>
                      <p className="text-xs text-gray-400">units</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-red-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {bankSearch && !searching && filteredBanks.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-200" />
              <p>No blood banks found matching "{bankSearch}"</p>
              <Link to="/banks" className="text-red-600 text-sm mt-2 inline-block hover:underline">
                Browse all banks →
              </Link>
            </div>
          )}

          <div className="text-center mt-6">
            <Link to="/find-blood" className="inline-flex items-center gap-2 text-red-600 font-semibold hover:underline">
              Search by blood group + city/state instead <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LIVE INVENTORY PREVIEW ────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Live Blood Availability</h2>
            <p className="text-gray-500">Real-time stock across all registered blood banks</p>
          </div>
          {allBanks.length > 0 ? (
            <div className="space-y-6">
              {allBanks.slice(0, 3).map(bank => (
                <div key={bank.bloodBankId} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{bank.bloodBankName}</h3>
                      <p className="text-sm text-gray-500">{bank.totalAvailableUnits} units available</p>
                    </div>
                    <Link to={`/banks/${bank.bloodBankId}`} className="btn-secondary text-sm py-1.5">
                      View Details
                    </Link>
                  </div>
                  <InventoryTable inventory={bank.inventory} />
                </div>
              ))}
              {allBanks.length > 3 && (
                <div className="text-center">
                  <Link to="/banks" className="btn-primary inline-flex">
                    View All {allBanks.length} Banks <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-400">
              <Spinner className="mx-auto mb-3" />
              <p>Loading live inventory...</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500">Simple, fast, and reliable blood management</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="card text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step}
                </div>
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2">
                  <Icon className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Are You a Doctor or Blood Bank?</h2>
          <p className="text-red-100 mb-8 text-lg">
            Join India's national blood management network. Register today and start saving lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-red-600 font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-colors">
              <CheckCircle className="h-5 w-5" /> Register Now
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-red-700 text-white font-bold px-8 py-4 rounded-xl hover:bg-red-800 transition-colors border border-red-500">
              <Clock className="h-5 w-5" /> Already Registered? Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
