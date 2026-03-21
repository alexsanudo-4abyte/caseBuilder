import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const http = axios.create({ baseURL: API_BASE });

// Attach JWT token to every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('cb_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap response data; on 401 clear token so AuthContext re-runs auth check
http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cb_access_token');
    }
    return Promise.reject(err.response ?? err);
  },
);

// ─── Entity client factory ────────────────────────────────────────────────────

const ENTITY_SLUGS = {
  Case: 'cases',
  Task: 'tasks',
  FraudAlert: 'fraud-alerts',
  Document: 'documents',
  MedicalRecord: 'medical-records',
  TortCampaign: 'tort-campaigns',
  Communication: 'communications',
  FinancialRecord: 'financial-records',
  Prediction: 'predictions',
  IntakeSubmission: 'intake-submissions',
  User: 'users',
};

function buildEntityClient(slug) {
  return {
    list(sort, limit) {
      const params = {};
      if (sort != null) params.sort = sort;
      if (limit != null) params.limit = limit;
      return http.get(`/${slug}`, { params });
    },

    filter(queryObject, sort, limit) {
      const params = { ...queryObject };
      if (sort != null) params.sort = sort;
      if (limit != null) params.limit = limit;
      return http.get(`/${slug}`, { params });
    },

    get(id) {
      return http.get(`/${slug}/${id}`);
    },

    create(data) {
      return http.post(`/${slug}`, data);
    },

    update(id, data) {
      return http.patch(`/${slug}/${id}`, data);
    },

    delete(id) {
      return http.delete(`/${slug}/${id}`);
    },
  };
}

// ─── Auth interface ───────────────────────────────────────────────────────────

export const auth = {
  me() {
    return http.get('/auth/me');
  },

  async login(email, password) {
    const response = await http.post('/auth/login', { email, password });
    localStorage.setItem('cb_access_token', response.access_token);
    return response.user;
  },

  async register(full_name, email, password) {
    const response = await http.post('/auth/register', { full_name, email, password });
    localStorage.setItem('cb_access_token', response.access_token);
    return response.user;
  },

  async registerClaimant(full_name, email, password) {
    const response = await http.post('/auth/register/claimant', { full_name, email, password });
    localStorage.setItem('cb_access_token', response.access_token);
    return response.user;
  },

  updateClaimantProfile(data) {
    return http.patch('/auth/claimant-profile', data);
  },
  mySubmissions() {
    return http.get('/auth/my-submissions');
  },

  updateProfile(data) {
    return http.patch('/auth/profile', data);
  },

  logout() {
    localStorage.removeItem('cb_access_token');
    window.location.href = '/Login';
  },

  redirectToLogin(returnUrl) {
    const url = returnUrl ? `/Login?return=${encodeURIComponent(returnUrl)}` : '/Login';
    window.location.href = url;
  },
};

// ─── Integrations interface ───────────────────────────────────────────────────

export const integrations = {
  Core: {
    async InvokeLLM({ prompt, response_json_schema, messages, system }) {
      const res = await http.post('/integrations/core/invoke-llm', { prompt, response_json_schema, messages, system });
      // Unwrap { result: text } for plain text responses; JSON responses are returned as-is
      return response_json_schema ? res : (res?.result ?? res);
    },
  },
};

// ─── Public intake gateway ───────────────────────────────────────────────────

export const intake = {
  submit(data) {
    return http.post('/intake/submit', data);
  },
  updateConversation(submissionId, conversation) {
    return http.patch(`/intake/submissions/${submissionId}/conversation`, { conversation });
  },
  uploadDocument(submissionId, file, documentType) {
    const form = new FormData();
    form.append('file', file);
    return http.post(`/intake/submissions/${submissionId}/documents?document_type=${encodeURIComponent(documentType)}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getDocuments(submissionId) {
    return http.get(`/intake/submissions/${submissionId}/documents`);
  },
};

// ─── Case analysis ────────────────────────────────────────────────────────────

export const caseAnalysis = {
  analyze: (caseId) => http.post(`/cases/${caseId}/analyze`),
};

// ─── Staff user management ────────────────────────────────────────────────────

export const staffUsers = {
  list: () => http.get('/users'),
  create: (data) => http.post('/users', data),
  update: (id, data) => http.patch(`/users/${id}`, data),
  delete: (id) => http.delete(`/users/${id}`),
};

// ─── Agents stub (used in PublicIntake) ──────────────────────────────────────

export const agents = {
  createConversation() {
    console.warn('[apiClient] agents.createConversation not yet implemented');
    return Promise.resolve({ id: crypto.randomUUID(), messages: [] });
  },
  addMessage() {
    console.warn('[apiClient] agents.addMessage not yet implemented');
    return Promise.resolve();
  },
  subscribeToConversation() {
    console.warn('[apiClient] agents.subscribeToConversation not yet implemented');
    return () => {};
  },
  getConversation() {
    console.warn('[apiClient] agents.getConversation not yet implemented');
    return Promise.resolve(null);
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = {
  list: (limit = 50) => http.get('/notifications', { params: { limit } }),
  unreadCount: () => http.get('/notifications/unread-count'),
  markRead: (id) => http.patch(`/notifications/${id}/read`),
  markAllRead: () => http.patch('/notifications/read-all'),
};

// ─── App logs stub (used in NavigationTracker) ───────────────────────────────

export const appLogs = {
  logUserInApp: () => Promise.resolve(),
};

// ─── Exported apiClient object ────────────────────────────────────────────────

export const apiClient = {
  entities: Object.fromEntries(
    Object.entries(ENTITY_SLUGS).map(([name, slug]) => [name, buildEntityClient(slug)]),
  ),
  auth,
  integrations,
  intake,
  caseAnalysis,
  staffUsers,
  agents,
  appLogs,
  notifications,
};

export default apiClient;
