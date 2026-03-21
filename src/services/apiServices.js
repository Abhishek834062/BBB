import api from './api'

// ─── AUTH ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login:           (data) => api.post('/auth/login', data),
  registerBank:    (data) => api.post('/auth/register/blood-bank', data),
  registerDoctor:  (data) => api.post('/auth/register/doctor', data),
  forgotPassword:  (data) => api.post('/auth/forgot-password', data),
  resetPassword:   (data) => api.post('/auth/reset-password', data),
}

// ─── ADMIN ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard:       () => api.get('/admin/dashboard'),
  getAllBanks:         () => api.get('/admin/blood-banks'),
  getPendingBanks:    () => api.get('/admin/blood-banks/pending'),
  verifyBank:         (userId, data) => api.put(`/admin/blood-banks/${userId}/verify`, data),
  getAllDoctors:       () => api.get('/admin/doctors'),
  getPendingDoctors:  () => api.get('/admin/doctors/pending'),
  verifyDoctor:       (userId, data) => api.put(`/admin/doctors/${userId}/verify`, data),
  toggleUser:         (userId) => api.put(`/admin/users/${userId}/toggle-status`),
}

// ─── INVENTORY (PUBLIC) ────────────────────────────────────────────────────
export const inventoryAPI = {
  getAllBanksInventory: () => api.get('/inventory/public/all'),
  getBankInventory:    (bankId) => api.get(`/inventory/public/bank/${bankId}`),
  checkAvailability:   (bankId, bloodGroup, component) =>
    api.get(`/inventory/public/bank/${bankId}/available`, { params: { bloodGroup, component } }),
  getMyInventory:      () => api.get('/inventory/my'),
}

// ─── DONORS ────────────────────────────────────────────────────────────────
export const donorAPI = {
  addDonor:          (data) => api.post('/donors', data),
  getMyDonors:       () => api.get('/donors'),
  getDonorById:      (id) => api.get(`/donors/${id}`),
  getEligible:       (bloodGroup) => api.get('/donors/eligible', { params: { bloodGroup } }),
  checkEligibility:  (id) => api.get(`/donors/${id}/eligibility`),
}

// ─── DONATIONS ─────────────────────────────────────────────────────────────
export const donationAPI = {
  confirm:          (data) => api.post('/donations/confirm', data),
  getMyDonations:   () => api.get('/donations'),
  getById:          (id) => api.get(`/donations/${id}`),
  getDonorHistory:  (donorId) => api.get(`/donations/donor/${donorId}`),
}

// ─── BLOOD REQUESTS ────────────────────────────────────────────────────────
export const requestAPI = {
  create:              (data) => api.post('/requests', data),
  getDoctorRequests:   () => api.get('/requests/doctor/my'),
  cancelRequest:       (id) => api.put(`/requests/${id}/cancel`),
  getBankRequests:     (status) => api.get('/requests/bank/my', { params: status ? { status } : {} }),
  getEmergencyReqs:    () => api.get('/requests/bank/emergency'),
  handleRequest:       (id, data) => api.put(`/requests/${id}/handle`, data),
  getById:             (id) => api.get(`/requests/${id}`),
  getAvailableDonors:  (id) => api.get(`/requests/${id}/available-donors`),
}
