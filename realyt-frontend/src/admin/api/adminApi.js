import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('realyt_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DEFAULT_STATS = {
  totalBookings: 0,
  openRequests: 0,
  activeAssignments: 0,
  inProgress: 0,
  completedBookings: 0,
  gmv: 0.0,
  monthlyRevenue: 0.0,
  platformCommission: 0.0,
  editorPayouts: 0.0,
  avgOrderValue: 0.0,
  totalEditors: 0,
  activeEditors: 0,
  availableEditors: 0,
  bookedEditors: 0,
  editorUtilizationPct: 0,
  customers: 0,
  totalApplications: 0,
  newApplications: 0,
  shortlistedApplications: 0,
  approvedApplications: 0,
  pendingApplications: 0,
  availableSlots: 0,
  bookedSlots: 0,
  unreadNotifications: 0,
};

export async function fetchAdminDashboardStats() {
  try {
    const res = await api.get('/admin/dashboard/stats');
    return res.data ? { ...DEFAULT_STATS, ...res.data } : DEFAULT_STATS;
  } catch (err) {
    return DEFAULT_STATS;
  }
}

export async function fetchCustomerRequests() {
  try {
    const res = await api.get('/admin/requests/customer');
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return [];
  }
}

export async function assignEditorToOrder(orderId, editorId) {
  try {
    const res = await api.post(`/admin/requests/${orderId}/assign?editorId=${editorId}`);
    return res.data;
  } catch (err) {
    return { status: 'ERROR', message: 'Failed to assign editor' };
  }
}

export async function fetchEditorApplications() {
  try {
    const res = await api.get('/admin/requests/editor-applications');
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return [];
  }
}

export async function updateEditorApplicationStatus(id, status) {
  try {
    const res = await api.patch(`/admin/requests/editor-applications/${id}/status`, { status });
    return res.data;
  } catch (err) {
    return { id, status };
  }
}

export async function fetchEditorsRoster() {
  try {
    const res = await api.get('/admin/editors');
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return [];
  }
}

export async function fetchEditorDetail(id) {
  try {
    const res = await api.get(`/admin/editors/${id}`);
    return res.data;
  } catch (err) {
    return null;
  }
}

export async function fetchPayments() {
  try {
    const res = await api.get('/admin/payments');
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return [];
  }
}

export async function releasePayment(orderId) {
  try {
    const res = await api.post(`/admin/payments/${orderId}/release`);
    return res.data;
  } catch (err) {
    return { status: 'ERROR', message: 'Failed to release payment' };
  }
}

export async function fetchAnalyticsData() {
  try {
    const res = await api.get('/admin/analytics');
    return res.data || {
      orderVolume: [],
      revenueTrend: [],
      occasionBreakdown: [],
      editorUtilizationPct: 0,
      avgTurnaroundDays: 0,
    };
  } catch (err) {
    return {
      orderVolume: [],
      revenueTrend: [],
      occasionBreakdown: [],
      editorUtilizationPct: 0,
      avgTurnaroundDays: 0,
    };
  }
}

export async function fetchNotifications() {
  try {
    const res = await api.get('/admin/notifications');
    if (res.data && Array.isArray(res.data.items)) return res.data;
    if (Array.isArray(res.data)) return { unreadCount: res.data.filter(n => !n.read).length, items: res.data };
    return { unreadCount: 0, items: [] };
  } catch (err) {
    return { unreadCount: 0, items: [] };
  }
}

export async function markNotificationRead(id) {
  try {
    const res = await api.patch(`/admin/notifications/${id}/read`);
    return res.data;
  } catch (err) {
    return { id, read: true };
  }
}

export async function markAllNotificationsRead() {
  try {
    const res = await api.patch('/admin/notifications/read-all');
    return res.data;
  } catch (err) {
    return { status: 'SUCCESS' };
  }
}
