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
    InvokeLLM({ prompt, response_json_schema }) {
      return http.post('/integrations/core/invoke-llm', { prompt, response_json_schema });
    },
  },
};

// ─── Agents stub (used in PublicIntake) ──────────────────────────────────────

export const agents = {
  createConversation() {
    console.warn('[base44] agents.createConversation not yet implemented');
    return Promise.resolve({ id: crypto.randomUUID(), messages: [] });
  },
  addMessage() {
    console.warn('[base44] agents.addMessage not yet implemented');
    return Promise.resolve();
  },
  subscribeToConversation() {
    console.warn('[base44] agents.subscribeToConversation not yet implemented');
    return () => {};
  },
  getConversation() {
    console.warn('[base44] agents.getConversation not yet implemented');
    return Promise.resolve(null);
  },
};

// ─── App logs stub (used in NavigationTracker) ───────────────────────────────

export const appLogs = {
  logUserInApp: () => Promise.resolve(),
};

// ─── Exported base44 object ───────────────────────────────────────────────────

export const base44 = {
  entities: Object.fromEntries(
    Object.entries(ENTITY_SLUGS).map(([name, slug]) => [name, buildEntityClient(slug)]),
  ),
  auth,
  integrations,
  agents,
  appLogs,
};

export default base44;
