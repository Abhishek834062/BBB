import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2, MapPin, ArrowRight, Filter } from 'lucide-react'
import { inventoryAPI } from '../../services/apiServices'
import { useDispatch, useSelector } from 'react-redux'
import { setAllBanks, selectAllBanks } from '../../store/slices/inventorySlice'
import { INDIAN_STATES, stockColor } from '../../utils/constants'
import { Spinner, EmptyState } from '../../components/common'

export default function BanksPage() {
  const [search,   setSearch]   = useState('')
  const [state,    setState]    = useState('')
  const [city,     setCity]     = useState('')
  const [filtered, setFiltered] = useState([])
  const navigate       = useNavigate()
  const dispatch       = useDispatch()
  const allBanks       = useSelector(selectAllBanks)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    inventoryAPI.getAllBanksInventory()
      .then(r => {
        dispatch(setAllBanks(r.data.data || []))
        setFiltered(r.data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let res = [...allBanks]
    if (search) res = res.filter(b => b.bloodBankName?.toLowerCase().includes(search.toLowerCase()))
    if (state)  res = res.filter(b => b.bloodBankName?.toLowerCase().includes(state.toLowerCase()))
    if (city)   res = res.filter(b => b.bloodBankName?.toLowerCase().includes(city.toLowerCase()))
    setFiltered(res)
  }, [search, state, city, allBanks])

  const clearFilters = () => { setSearch(''); setState(''); setCity('') }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-extrabold mb-2">Blood Banks Directory</h1>
          <p className="text-red-100">Browse all registered blood banks and check live blood availability</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by bank name..."
                className="input pl-9"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select value={state} onChange={e => setState(e.target.value)} className="input pl-9">
                <option value="">All States</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Filter by city..."
                className="input pl-9"
              />
            </div>
          </div>
          {(search || state || city) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">{filtered.length} results</span>
              <button onClick={clearFilters} className="text-xs text-red-600 hover:underline ml-auto flex items-center gap-1">
                <Filter className="h-3 w-3" /> Clear filters
              </button>
            </div>
          )}
        </div>

        {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

        {!loading && filtered.length === 0 && (
          <EmptyState icon={Building2} title="No blood banks found" desc="Try different search filters" />
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(bank => (
              <div
                key={bank.bloodBankId}
                onClick={() => navigate(`/banks/${bank.bloodBankId}`)}
                className="card-hover group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-red-600" />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${bank.totalAvailableUnits > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {bank.totalAvailableUnits > 0 ? 'Stock Available' : 'Low Stock'}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                  {bank.bloodBankName}
                </h3>
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-4">
                  <MapPin className="h-3 w-3" />
                  <span>Blood Bank</span>
                </div>

                {/* Mini stock summary */}
                <div className="grid grid-cols-4 gap-1 mb-4">
                  {['A+','B+','O+','AB+'].map(bg => {
                    const total = ['Red Blood Cells','Fresh Frozen Plasma','Platelets'].reduce((s, c) => s + (bank.inventory?.[`${bg} - ${c}`] || 0), 0)
                    return (
                      <div key={bg} className="text-center bg-gray-50 rounded-lg py-2">
                        <div className={`text-sm font-bold ${stockColor(total)}`}>{total}</div>
                        <div className="text-xs text-gray-400">{bg}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    <span className={`font-bold text-base ${stockColor(bank.totalAvailableUnits)}`}>
                      {bank.totalAvailableUnits}
                    </span> total units
                  </span>
                  <span className="text-red-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Stock <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
