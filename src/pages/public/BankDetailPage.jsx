import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Building2, ArrowLeft, Droplets, BarChart2 } from 'lucide-react'
import { inventoryAPI } from '../../services/apiServices'
import { BLOOD_GROUPS, COMPONENTS } from '../../utils/constants'
import InventoryTable from '../../components/common/InventoryTable'
import { PageLoader, EmptyState } from '../../components/common'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const COMP_COLORS = { RBC: '#dc2626', PLASMA: '#f59e0b', PLATELETS: '#3b82f6' }

export default function BankDetailPage() {
  const { id }  = useParams()
  const [bank, setBank] = useState(null)
  const [view, setView] = useState('table') // table | chart
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    inventoryAPI.getBankInventory(id)
      .then(r => setBank(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!bank) return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <EmptyState icon={Building2} title="Blood bank not found" />
      <div className="text-center mt-4">
        <Link to="/banks" className="btn-primary inline-flex">← Back to Banks</Link>
      </div>
    </div>
  )

  // Build chart data
  const chartData = BLOOD_GROUPS.map(bg => {
    const entry = { name: bg.label }
    COMPONENTS.forEach(c => {
      entry[c.label] = bank.inventory?.[`${bg.label} - ${c.full}`] || 0
    })
    return entry
  })

  const totalByComponent = COMPONENTS.map(c => ({
    name: c.label,
    value: BLOOD_GROUPS.reduce((s, bg) => s + (bank.inventory?.[`${bg.label} - ${c.full}`] || 0), 0),
    color: COMP_COLORS[c.value],
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white py-10">
        <div className="max-w-5xl mx-auto px-4">
          <Link to="/banks" className="inline-flex items-center gap-1 text-red-200 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to All Banks
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">{bank.bloodBankName}</h1>
              <p className="text-red-100 mt-1">
                {bank.totalAvailableUnits} units available across all blood groups and components
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {totalByComponent.map(({ name, value, color }) => (
            <div key={name} className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                <Droplets className="h-6 w-6" style={{ color }} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">{name}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">units available</p>
              </div>
            </div>
          ))}
        </div>

        {/* View Toggle */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 text-lg">Blood Stock Details</h2>
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setView('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'table' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Table View
              </button>
              <button
                onClick={() => setView('chart')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${view === 'chart' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <BarChart2 className="h-4 w-4" /> Chart
              </button>
            </div>
          </div>

          {view === 'table' ? (
            <InventoryTable inventory={bank.inventory} />
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: 12 }}
                    formatter={(val, name) => [`${val} units`, name]}
                  />
                  <Legend />
                  {COMPONENTS.map(c => (
                    <Bar key={c.value} dataKey={c.label} fill={COMP_COLORS[c.value]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="card bg-blue-50 border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-3">About Blood Components</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {COMPONENTS.map(c => (
              <div key={c.value}>
                <p className={`font-semibold mb-1 inline-flex px-2 py-0.5 rounded ${c.color}`}>{c.label}</p>
                <p className="text-gray-600">{c.full}</p>
                <p className="text-gray-400 text-xs">Expires in {c.expiry}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor CTA */}
        <div className="card bg-red-600 text-white text-center">
          <Droplets className="h-10 w-10 mx-auto mb-3 text-red-200" />
          <h3 className="font-bold text-xl mb-2">Are you a Doctor?</h3>
          <p className="text-red-100 mb-4 text-sm">Login to request blood from this bank directly</p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors">
            Login to Request Blood
          </Link>
        </div>
      </div>
    </div>
  )
}
