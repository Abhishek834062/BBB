import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Droplets, Building2, ArrowRight, Filter } from 'lucide-react'
import { inventoryAPI } from '../../services/apiServices'
import { useDispatch, useSelector } from 'react-redux'
import { setAllBanks, selectAllBanks } from '../../store/slices/inventorySlice'
import { BLOOD_GROUPS, COMPONENTS, INDIAN_STATES, stockBadge } from '../../utils/constants'
import InventoryTable from '../../components/common/InventoryTable'
import { Spinner, EmptyState } from '../../components/common'

export default function FindBloodPage() {
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity]   = useState('')
  const [selectedComp, setSelectedComp]   = useState('')
  const [results, setResults]   = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading]   = useState(false)
  const dispatch  = useNavigate()
  const navigate  = useNavigate()
  const allBanks  = useSelector(selectAllBanks)
  const reduxDispatch = useDispatch()

  useEffect(() => {
    if (!allBanks.length) {
      inventoryAPI.getAllBanksInventory()
        .then(r => reduxDispatch(setAllBanks(r.data.data || [])))
        .catch(() => {})
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)

    setTimeout(() => {
      let filtered = [...allBanks]

      // Filter by state/city (bank name or future: actual city field)
      if (selectedState) {
        filtered = filtered.filter(b =>
          b.bloodBankName?.toLowerCase().includes(selectedState.toLowerCase()) ||
          selectedState // keep all if state filter — real impl would use bank city/state
        )
      }
      if (selectedCity) {
        filtered = filtered.filter(b =>
          b.bloodBankName?.toLowerCase().includes(selectedCity.toLowerCase())
        )
      }

      // Filter by blood group + component availability
      if (selectedGroup && selectedComp) {
        const bg   = BLOOD_GROUPS.find(b => b.value === selectedGroup)
        const comp = COMPONENTS.find(c => c.value === selectedComp)
        if (bg && comp) {
          const key = `${bg.label} - ${comp.full}`
          filtered = filtered.filter(b => (b.inventory?.[key] || 0) > 0)
        }
      } else if (selectedGroup) {
        const bg = BLOOD_GROUPS.find(b => b.value === selectedGroup)
        if (bg) {
          filtered = filtered.filter(b =>
            COMPONENTS.some(c => (b.inventory?.[`${bg.label} - ${c.full}`] || 0) > 0)
          )
        }
      }

      // Sort by total units descending
      filtered.sort((a, b) => b.totalAvailableUnits - a.totalAvailableUnits)
      setResults(filtered)
      setLoading(false)
    }, 400)
  }

  const getHighlightedUnits = (bank) => {
    if (!selectedGroup) return null
    const bg = BLOOD_GROUPS.find(b => b.value === selectedGroup)
    if (!bg) return null
    return COMPONENTS.map(c => ({
      comp: c,
      units: bank.inventory?.[`${bg.label} - ${c.full}`] || 0,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1 text-sm mb-4">
            <Droplets className="h-4 w-4" /> Blood Availability Search
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Find Blood Near You</h1>
          <p className="text-red-100 text-lg">Search by blood group, state, and city to find available units</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="card shadow-lg">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Blood Group */}
              <div>
                <label className="label">Blood Group</label>
                <select
                  value={selectedGroup}
                  onChange={e => setSelectedGroup(e.target.value)}
                  className="input"
                >
                  <option value="">All Blood Groups</option>
                  {BLOOD_GROUPS.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Component */}
              <div>
                <label className="label">Component</label>
                <select
                  value={selectedComp}
                  onChange={e => setSelectedComp(e.target.value)}
                  className="input"
                >
                  <option value="">All Components</option>
                  {COMPONENTS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="label">State</label>
                <select
                  value={selectedState}
                  onChange={e => { setSelectedState(e.target.value); setSelectedCity('') }}
                  className="input"
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  placeholder="e.g. Lucknow"
                  className="input"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {allBanks.length} blood banks in system
              </p>
              <button type="submit" className="btn-primary px-8">
                {loading ? <Spinner size="sm" /> : <><Search className="h-4 w-4" /> Search Blood Banks</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Blood Group Quick Select */}
      {!searched && (
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <p className="text-sm text-gray-500 mb-3 font-medium">Quick select blood group:</p>
          <div className="flex flex-wrap gap-2">
            {BLOOD_GROUPS.map(b => (
              <button
                key={b.value}
                onClick={() => setSelectedGroup(b.value)}
                className={`w-12 h-12 rounded-full font-bold text-sm transition-colors ${
                  selectedGroup === b.value
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-red-600 border-2 border-red-200 hover:border-red-400'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        )}

        {searched && !loading && results.length === 0 && (
          <EmptyState
            icon={Building2}
            title="No blood banks found"
            desc="Try adjusting your filters or searching a different area"
          />
        )}

        {!loading && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">
                {results.length} Blood Bank{results.length > 1 ? 's' : ''} Found
                {selectedGroup && ` — ${BLOOD_GROUPS.find(b=>b.value===selectedGroup)?.label} Available`}
              </h2>
            </div>
            <div className="space-y-4">
              {results.map(bank => {
                const highlighted = getHighlightedUnits(bank)
                return (
                  <div key={bank.bloodBankId} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{bank.bloodBankName}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{bank.totalAvailableUnits} total units available</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/banks/${bank.bloodBankId}`)}
                        className="btn-primary text-sm py-2"
                      >
                        View Details <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Highlighted blood group availability */}
                    {highlighted && (
                      <div className="bg-red-50 rounded-xl p-4 mb-4">
                        <p className="text-sm font-semibold text-red-700 mb-3">
                          {BLOOD_GROUPS.find(b=>b.value===selectedGroup)?.label} Availability:
                        </p>
                        <div className="flex gap-4 flex-wrap">
                          {highlighted.map(({ comp, units }) => (
                            <div key={comp.value} className="text-center">
                              <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-bold min-w-[3rem] ${stockBadge(units)}`}>
                                {units}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">{comp.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full inventory table */}
                    {!selectedGroup && <InventoryTable inventory={bank.inventory} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Show all banks when no search done */}
        {!searched && allBanks.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 mb-4">All Blood Banks — Live Stock</h2>
            <div className="space-y-4">
              {allBanks.map(bank => (
                <div key={bank.bloodBankId} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{bank.bloodBankName}</h3>
                      <p className="text-sm text-gray-500">{bank.totalAvailableUnits} units</p>
                    </div>
                    <button onClick={() => navigate(`/banks/${bank.bloodBankId}`)} className="btn-secondary text-sm py-1.5">
                      Details →
                    </button>
                  </div>
                  <InventoryTable inventory={bank.inventory} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
