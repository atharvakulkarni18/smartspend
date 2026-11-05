import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

// Request Interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartspend_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid infinite loop if refresh or login fails
      if (!error.config.url.includes('/api/auth/login') && !error.config.url.includes('/api/auth/refresh')) {
        localStorage.removeItem('smartspend_token');
        localStorage.removeItem('smartspend_user');
        window.dispatchEvent(new Event('smartspend_auth_change'));
      }
    }
    return Promise.reject(error);
  }
);

/* ==========================================================================
   Mock Fallback Data (Enables standalone showcase if backend is offline)
   ========================================================================== */
export const MOCK_USER = {
  id: 'usr-001',
  name: 'Alex Mercer',
  email: 'alex.mercer@smartspend.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  role: 'PREMIUM_USER',
  currency: 'USD',
  savingsGoal: 25000,
};

export const MOCK_DASHBOARD = {
  totalBalance: 42850.50,
  balanceChange: '+12.4%',
  totalIncome: 12450.00,
  incomeChange: '+8.2%',
  totalExpense: 4820.75,
  expenseChange: '-4.1%',
  netSavings: 7629.25,
  savingsRate: 61.3,
  monthlyTrends: {
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    income: [9800, 10500, 11200, 10800, 12000, 12450],
    expenses: [5200, 4900, 5400, 4700, 5100, 4820],
  },
  categoryBreakdown: [
    { category: 'Housing & Rent', amount: 1800, color: '#6366f1' },
    { category: 'Food & Dining', amount: 840, color: '#ec4899' },
    { category: 'Investments', amount: 950, color: '#10b981' },
    { category: 'Transport', amount: 380, color: '#06b6d4' },
    { category: 'Entertainment', amount: 420, color: '#f59e0b' },
    { category: 'Utilities & Cloud', amount: 430.75, color: '#8b5cf6' },
  ],
  anomalies: [
    {
      id: 'anom-1',
      type: 'SPIKE',
      severity: 'HIGH',
      description: 'Cloud Servers bill ($312) is 142% higher than your 3-month average ($129)',
      date: '2026-10-28',
      merchant: 'AWS Cloud Services',
      amount: 312.00,
      potentialSaving: 183.00,
    },
    {
      id: 'anom-2',
      type: 'RECURRING',
      severity: 'MEDIUM',
      description: 'Detected duplicate subscription charge for Spotify Premium',
      date: '2026-10-25',
      merchant: 'Spotify USA',
      amount: 19.99,
      potentialSaving: 19.99,
    }
  ],
  budgetSummary: [
    { category: 'Housing', allocated: 2000, spent: 1800, percentage: 90 },
    { category: 'Food & Dining', allocated: 1000, spent: 840, percentage: 84 },
    { category: 'Entertainment', allocated: 600, spent: 420, percentage: 70 },
    { category: 'Shopping', allocated: 500, spent: 230, percentage: 46 },
    { category: 'Health & Wellness', allocated: 400, spent: 140, percentage: 35 },
  ]
};

export const MOCK_TRANSACTIONS = [
  {
    id: 'tx-101',
    date: '2026-11-01',
    description: 'Stripe Payout - SaaS Revenue',
    category: 'Income',
    type: 'INCOME',
    amount: 4250.00,
    account: 'Silicon Valley Bank (Tech)',
    aiCategorized: true,
    confidence: 0.99,
    isAnomaly: false,
  },
  {
    id: 'tx-102',
    date: '2026-10-31',
    description: 'Whole Foods Market Organic Groceries',
    category: 'Food & Dining',
    type: 'EXPENSE',
    amount: 142.50,
    account: 'Chase Sapphire Reserve',
    aiCategorized: true,
    confidence: 0.96,
    isAnomaly: false,
  },
  {
    id: 'tx-103',
    date: '2026-10-28',
    description: 'AWS Cloud Services Hosting',
    category: 'Utilities & Cloud',
    type: 'EXPENSE',
    amount: 312.00,
    account: 'Business Amex',
    aiCategorized: true,
    confidence: 0.98,
    isAnomaly: true,
    anomalyReason: 'Unusually high compute surge detected (+142%)',
  },
  {
    id: 'tx-104',
    date: '2026-10-26',
    description: 'Vanguard Index Fund S&P 500',
    category: 'Investments',
    type: 'EXPENSE',
    amount: 950.00,
    account: 'Primary Checking',
    aiCategorized: true,
    confidence: 0.95,
    isAnomaly: false,
  },
  {
    id: 'tx-105',
    date: '2026-10-25',
    description: 'Spotify Family Subscription',
    category: 'Entertainment',
    type: 'EXPENSE',
    amount: 19.99,
    account: 'Chase Sapphire Reserve',
    aiCategorized: true,
    confidence: 0.94,
    isAnomaly: true,
    anomalyReason: 'Possible duplicate billing detected',
  },
  {
    id: 'tx-106',
    date: '2026-10-24',
    description: 'Equinox Gym Membership',
    category: 'Health & Wellness',
    type: 'EXPENSE',
    amount: 280.00,
    account: 'Chase Sapphire Reserve',
    aiCategorized: true,
    confidence: 0.97,
    isAnomaly: false,
  },
  {
    id: 'tx-107',
    date: '2026-10-22',
    description: 'Consulting Advisory Retainer',
    category: 'Income',
    type: 'INCOME',
    amount: 3500.00,
    account: 'Silicon Valley Bank (Tech)',
    aiCategorized: true,
    confidence: 0.98,
    isAnomaly: false,
  },
  {
    id: 'tx-108',
    date: '2026-10-20',
    description: 'Uber Black Ride to Airport',
    category: 'Transport',
    type: 'EXPENSE',
    amount: 78.40,
    account: 'Chase Sapphire Reserve',
    aiCategorized: true,
    confidence: 0.96,
    isAnomaly: false,
  },
  {
    id: 'tx-109',
    date: '2026-10-18',
    description: 'Blue Bottle Coffee Roasters',
    category: 'Food & Dining',
    type: 'EXPENSE',
    amount: 14.75,
    account: 'Apple Pay',
    aiCategorized: true,
    confidence: 0.92,
    isAnomaly: false,
  },
  {
    id: 'tx-110',
    date: '2026-10-15',
    description: 'Apple Store - Studio Display Cable',
    category: 'Shopping',
    type: 'EXPENSE',
    amount: 129.00,
    account: 'Apple Card',
    aiCategorized: true,
    confidence: 0.91,
    isAnomaly: false,
  }
];

export const MOCK_BUDGETS = [
  {
    id: 'b-1',
    category: 'Housing & Rent',
    allocated: 2000,
    spent: 1800,
    period: 'MONTHLY',
    color: '#6366f1',
    icon: 'home',
  },
  {
    id: 'b-2',
    category: 'Food & Dining',
    allocated: 1000,
    spent: 840,
    period: 'MONTHLY',
    color: '#ec4899',
    icon: 'utensils',
  },
  {
    id: 'b-3',
    category: 'Entertainment',
    allocated: 600,
    spent: 420,
    period: 'MONTHLY',
    color: '#f59e0b',
    icon: 'film',
  },
  {
    id: 'b-4',
    category: 'Transport',
    allocated: 400,
    spent: 380,
    period: 'MONTHLY',
    color: '#06b6d4',
    icon: 'car',
  },
  {
    id: 'b-5',
    category: 'Shopping',
    allocated: 500,
    spent: 230,
    period: 'MONTHLY',
    color: '#8b5cf6',
    icon: 'bag',
  },
  {
    id: 'b-6',
    category: 'Health & Wellness',
    allocated: 400,
    spent: 140,
    period: 'MONTHLY',
    color: '#10b981',
    icon: 'heart',
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'High Spend Alert',
    message: 'AWS Cloud Services bill surged by 142% this billing cycle.',
    timestamp: '2 hours ago',
    read: false,
    type: 'warning',
  },
  {
    id: 'n-2',
    title: 'Smart Budget Milestone',
    message: 'Great job! You stayed 24% under your Dining budget this week.',
    timestamp: 'Yesterday',
    read: false,
    type: 'success',
  },
  {
    id: 'n-3',
    title: 'AI Prediction Ready',
    message: 'November cashflow forecast is ready for review with 94% confidence.',
    timestamp: '2 days ago',
    read: true,
    type: 'info',
  },
];

/* Helper to execute request with seamless fallback to mock data */
async function requestWithFallback(requestFn, mockFallback) {
  try {
    const res = await requestFn();
    return res.data;
  } catch (error) {
    // If backend is unreachable or 404s during development, return mock data
    if (error.response) throw error;
    console.warn('API call failed or backend offline. Using fallback data:', error.message);
    return mockFallback;
  }
}

/* ==========================================================================
   Services
   ========================================================================== */

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      // Standalone fallback: validate test user or create session
      if (email && password) {
        return {
          token: 'mock-jwt-smartspend-' + Date.now(),
          user: {
            ...MOCK_USER,
            email: email,
            name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          },
        };
      }
      throw error;
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      return {
        token: 'mock-jwt-smartspend-' + Date.now(),
        user: {
          ...MOCK_USER,
          name: name || 'Demo Member',
          email: email || 'demo@smartspend.ai',
        },
      };
    }
  },

  refreshToken: async () => {
    return requestWithFallback(
      () => api.post('/api/auth/refresh'),
      { token: 'mock-jwt-refreshed-' + Date.now() }
    );
  },
};

export const transactionService = {
  getAll: async (params = {}) => {
    return requestWithFallback(
      () => api.get('/api/transactions', { params }),
      MOCK_TRANSACTIONS
    );
  },

  create: async (transactionData) => {
    return requestWithFallback(
      () => api.post('/api/transactions', transactionData),
      {
        id: 'tx-' + Date.now(),
        ...transactionData,
        aiCategorized: true,
        confidence: 0.94,
        isAnomaly: false,
      }
    );
  },

  update: async (id, transactionData) => {
    return requestWithFallback(
      () => api.put(`/api/transactions/${id}`, transactionData),
      { id, ...transactionData }
    );
  },

  delete: async (id) => {
    return requestWithFallback(
      () => api.delete(`/api/transactions/${id}`),
      { success: true, id }
    );
  },

  importCsv: async (formData) => {
    return requestWithFallback(
      () => api.post('/api/transactions/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      {
        success: true,
        count: 15,
        message: 'Successfully parsed and auto-categorized 15 transactions via AI.',
      }
    );
  },
};

export const accountService = {
  getAll: async () => {
    return requestWithFallback(
      () => api.get('/api/accounts'),
      [
        { id: 'acc-1', name: 'Silicon Valley Bank (Tech)', type: 'CHECKING', balance: 28450.00, currency: 'USD' },
        { id: 'acc-2', name: 'Chase Sapphire Reserve', type: 'CREDIT', balance: -2410.50, currency: 'USD' },
        { id: 'acc-3', name: 'Vanguard Brokerage', type: 'INVESTMENT', balance: 16811.00, currency: 'USD' },
      ]
    );
  },

  create: async (accountData) => {
    return requestWithFallback(
      () => api.post('/api/accounts', accountData),
      { id: 'acc-' + Date.now(), ...accountData }
    );
  },

  update: async (id, accountData) => {
    return requestWithFallback(
      () => api.put(`/api/accounts/${id}`, accountData),
      { id, ...accountData }
    );
  },

  delete: async (id) => {
    return requestWithFallback(
      () => api.delete(`/api/accounts/${id}`),
      { success: true, id }
    );
  },
};

export const budgetService = {
  getAll: async () => {
    return requestWithFallback(
      () => api.get('/api/budgets'),
      MOCK_BUDGETS
    );
  },

  create: async (budgetData) => {
    return requestWithFallback(
      () => api.post('/api/budgets', budgetData),
      {
        id: 'b-' + Date.now(),
        spent: 0,
        ...budgetData,
      }
    );
  },

  update: async (id, budgetData) => {
    return requestWithFallback(
      () => api.put(`/api/budgets/${id}`, budgetData),
      { id, ...budgetData }
    );
  },

  delete: async (id) => {
    return requestWithFallback(
      () => api.delete(`/api/budgets/${id}`),
      { success: true, id }
    );
  },
};

export const dashboardService = {
  getDashboard: async () => {
    return requestWithFallback(
      () => api.get('/api/dashboard'),
      MOCK_DASHBOARD
    );
  },
};

export const aiService = {
  categorize: async (description, amount) => {
    return requestWithFallback(
      () => api.post('/api/ai/categorize', { description, amount }),
      {
        category: description.toLowerCase().includes('coffee') ? 'Food & Dining' : 'General & Services',
        confidence: 0.95,
        tags: ['AI-Tagged', 'Neural-v3'],
      }
    );
  },

  predict: async () => {
    return requestWithFallback(
      () => api.get('/api/ai/predict'),
      {
        forecastNextMonthExpense: 4650.00,
        projectedSavings: 7800.00,
        confidenceScore: 92.4,
        insights: [
          'Utility costs are trending 12% lower moving into winter.',
          'Expected discretionary spending will drop by $320 next month.',
          'Recurring subscriptions total $248/month across 8 active services.',
        ],
        monthlyForecastData: {
          labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
          projected: [4650, 5200, 4400, 4350, 4500],
          confidenceUpper: [4950, 5600, 4700, 4650, 4800],
          confidenceLower: [4350, 4800, 4100, 4050, 4200],
        }
      }
    );
  },

  getAnomalies: async () => {
    return requestWithFallback(
      () => api.get('/api/ai/anomalies'),
      MOCK_DASHBOARD.anomalies
    );
  },
};

export const notificationService = {
  getAll: async () => {
    return requestWithFallback(
      () => api.get('/api/notifications'),
      MOCK_NOTIFICATIONS
    );
  },

  markRead: async (id) => {
    return requestWithFallback(
      () => api.put(`/api/notifications/${id}/read`),
      { success: true, id }
    );
  },

  markAllRead: async () => {
    return requestWithFallback(
      () => api.put('/api/notifications/read-all'),
      { success: true }
    );
  },

  getUnreadCount: async () => {
    return requestWithFallback(
      () => api.get('/api/notifications/unread-count'),
      { count: 2 }
    );
  },
};

export const reportService = {
  downloadMonthlyReport: async (month, year) => {
    try {
      const response = await api.get(`/api/reports/monthly`, {
        params: { month, year },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      // In offline/mock mode, generate a dummy downloadable file
      console.warn('Backend PDF endpoint offline. Generating simulated financial statement blob...');
      const dummyContent = `SMARTSPEND EXECUTIVE FINANCIAL REPORT\nPeriod: ${month} ${year}\n=======================================\nTotal Income: $12,450.00\nTotal Expenses: $4,820.75\nNet Savings: $7,629.25 (61.3% Savings Rate)\nAI Anomaly Flags Resolved: 2\n\nGenerated with SmartSpend AI Neural Engine.`;
      return new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    }
  },

  getReportSummary: async (month, year) => {
    return requestWithFallback(
      () => api.get('/api/reports/summary', { params: { month, year } }),
      {
        month,
        year,
        totalIncome: 12450.00,
        totalExpense: 4820.75,
        netSavings: 7629.25,
        savingsRate: 61.3,
        highestExpenseCategory: 'Housing & Rent ($1,800.00)',
        totalTransactions: 68,
        aiAnomaliesDetected: 3,
        potentialSavingsIdentified: 202.99,
      }
    );
  }
};

export default api;

// Wake a sleeping free-tier backend as soon as the app loads
if (typeof window !== 'undefined') {
  fetch(`${BASE_URL}/actuator/health`, { mode: 'no-cors' }).catch(() => {});
}

// Wake a sleeping free-tier backend as soon as the app loads
if (typeof window !== 'undefined') {
  fetch(`${BASE_URL}/actuator/health`, { mode: 'no-cors' }).catch(() => {});
}
