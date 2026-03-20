import { BLOOD_GROUPS, COMPONENTS, stockBadge, stockColor } from '../../utils/constants'

export default function InventoryTable({ inventory = {} }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="table-th w-24">Blood Group</th>
            {COMPONENTS.map(c => (
              <th key={c.value} className="table-th text-center">
                <div>{c.label}</div>
                <div className="text-xs font-normal text-gray-400 normal-case">{c.expiry}</div>
              </th>
            ))}
            <th className="table-th text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          {BLOOD_GROUPS.map(bg => {
            const rowTotal = COMPONENTS.reduce((sum, c) => {
              const key = `${bg.label} - ${c.full}`
              return sum + (inventory[key] || 0)
            }, 0)
            return (
              <tr key={bg.value} className="table-row">
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {bg.label}
                    </div>
                  </div>
                </td>
                {COMPONENTS.map(c => {
                  const key   = `${bg.label} - ${c.full}`
                  const units = inventory[key] || 0
                  return (
                    <td key={c.value} className="table-td text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-lg text-xs font-semibold min-w-[2.5rem] ${stockBadge(units)}`}>
                        {units}
                      </span>
                    </td>
                  )
                })}
                <td className="table-td text-center">
                  <span className={`font-bold text-base ${stockColor(rowTotal)}`}>{rowTotal}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-semibold">
            <td className="table-td text-gray-700">Total</td>
            {COMPONENTS.map(c => {
              const colTotal = BLOOD_GROUPS.reduce((sum, bg) => {
                const key = `${bg.label} - ${c.full}`
                return sum + (inventory[key] || 0)
              }, 0)
              return (
                <td key={c.value} className="table-td text-center">
                  <span className={`font-bold ${stockColor(colTotal)}`}>{colTotal}</span>
                </td>
              )
            })}
            <td className="table-td text-center">
              <span className="font-bold text-gray-900">
                {BLOOD_GROUPS.reduce((s1, bg) =>
                  s1 + COMPONENTS.reduce((s2, c) => s2 + (inventory[`${bg.label} - ${c.full}`] || 0), 0), 0)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
