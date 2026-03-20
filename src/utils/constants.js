// Blood groups
export const BLOOD_GROUPS = [
  { value: 'A_POSITIVE',  label: 'A+' },
  { value: 'A_NEGATIVE',  label: 'A-' },
  { value: 'B_POSITIVE',  label: 'B+' },
  { value: 'B_NEGATIVE',  label: 'B-' },
  { value: 'O_POSITIVE',  label: 'O+' },
  { value: 'O_NEGATIVE',  label: 'O-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
]

export const COMPONENTS = [
  { value: 'RBC',       label: 'RBC',     full: 'Red Blood Cells',      expiry: '42 days',  color: 'bg-red-100 text-red-700' },
  { value: 'PLASMA',    label: 'Plasma',  full: 'Fresh Frozen Plasma',  expiry: '365 days', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'PLATELETS', label: 'Platelets', full: 'Platelets',          expiry: '5 days',   color: 'bg-blue-100 text-blue-700' },
]

export const REQUEST_STATUS_CONFIG = {
  PENDING:                 { label: 'Pending',             color: 'badge-pending' },
  ACCEPTED:                { label: 'Accepted',            color: 'badge-available' },
  EMERGENCY_PENDING_VERIFY:{ label: 'Emergency Verify',    color: 'badge-emergency' },
  EMERGENCY_VERIFIED:      { label: 'Emergency Verified',  color: 'badge-emergency' },
  DONOR_CONTACT_PENDING:   { label: 'Donor Contacted',     color: 'badge-pending' },
  FULFILLED:               { label: 'Fulfilled',           color: 'badge-fulfilled' },
  REJECTED:                { label: 'Rejected',            color: 'badge-rejected' },
  CANCELLED:               { label: 'Cancelled',           color: 'badge-rejected' },
}

export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra & Nagar Haveli',
  'Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
]

// Get blood group label from enum value
export const bgLabel = (val) =>
  BLOOD_GROUPS.find(b => b.value === val)?.label || val?.replace('_', ' ') || '-'

// Get component info
export const compInfo = (val) =>
  COMPONENTS.find(c => c.value === val) || { label: val, full: val, color: 'bg-gray-100 text-gray-700' }

// Format date
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

// Format datetime
export const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'

// Get error message from axios error
export const getError = (err) =>
  err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong'

// Stock level color
export const stockColor = (units) => {
  if (units === 0) return 'text-red-600 font-semibold'
  if (units <= 2)  return 'text-orange-500 font-semibold'
  if (units <= 5)  return 'text-yellow-600'
  return 'text-green-600 font-semibold'
}

// Stock level badge
export const stockBadge = (units) => {
  if (units === 0) return 'bg-red-100 text-red-700 border border-red-200'
  if (units <= 2)  return 'bg-orange-100 text-orange-700 border border-orange-200'
  if (units <= 5)  return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
  return 'bg-green-100 text-green-700 border border-green-200'
}
