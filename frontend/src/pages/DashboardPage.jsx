import React, { useEffect, useState } from 'react';
import { 
  FiDollarSign, 
  FiArrowUpRight, 
  FiArrowDownRight, 
  FiPieChart, 
  FiAlertTriangle, 
  FiPlus, 
  FiUploadCloud,
  FiCpu,
  FiCheckCircle
} from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import '../utils/chartSetup';
import StatCard from '../components/StatCard';
import Skeleton from '../components/Skeleton';
import Modal from '../components/Modal';
import { dashboardService, transactionService, accountService, aiService } from '../services/api';
import toast from 'react-hot-toast';
import './Pages.css';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  
  // New transaction form state
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    description: '',
    category: '',
    type: 'EXPENSE',
    transactionDate: new Date().toISOString().split('T')[0]
  });
  const [aiPredicting, setAiPredicting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dash = await dashboardService.getDashboard();
      // unwrap if wrapped in ApiResponse
      const finalData = dash.data || dash;
      setData(finalData);

      const accs = await accountService.getAll();
      setAccounts(accs.data || accs || []);
      if (accs.length > 0) {
        setFormData(prev => ({ ...prev, accountId: accs[0].id }));
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Unable to fetch live dashboard updates');
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = async (e) => {
    const desc = e.target.value;
    setFormData(prev => ({ ...prev, description: desc }));

    // Real-time AI auto-tagging preview when typing description
    if (desc.length > 3) {
      setAiPredicting(true);
      try {
        const aiRes = await aiService.categorize(desc, parseFloat(formData.amount) || 100);
        if (aiRes && aiRes.category) {
          setFormData(prev => ({ ...prev, category: aiRes.category }));
        }
      } catch (err) {
        // silent fallback
      } finally {
        setAiPredicting(false);
      }
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!formData.accountId || !formData.amount || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await transactionService.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Transaction logged & processed by AI!');
      setShowAddModal(false);
      setFormData({
        accountId: accounts[0]?.id || '',
        amount: '',
        description: '',
        category: '',
        type: 'EXPENSE',
        transactionDate: new Date().toISOString().split('T')[0]
      });
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ padding: '2rem' }}>
        <Skeleton height="60px" width="300px" style={{ marginBottom: '2rem' }} />
        <div className="stats-grid">
          <Skeleton height="140px" />
          <Skeleton height="140px" />
          <Skeleton height="140px" />
          <Skeleton height="140px" />
        </div>
        <div className="charts-grid">
          <Skeleton height="350px" />
          <Skeleton height="350px" />
        </div>
      </div>
    );
  }

  // Real month-over-month changes from the backend monthly trends (no placeholder numbers)
  const trends = Array.isArray(data?.monthlyTrends) ? data.monthlyTrends : [];
  const curTrend = trends.length > 0 ? trends[trends.length - 1] : null;
  const prevTrend = trends.length > 1 ? trends[trends.length - 2] : null;
  const pctChange = (cur, prev) => {
    const c = Number(cur);
    const p = Number(prev);
    if (!p || p <= 0 || Number.isNaN(c)) return null;
    const pct = ((c - p) / p) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  };
  const incomeChange = curTrend && prevTrend ? pctChange(curTrend.income, prevTrend.income) : null;
  const expenseChange = curTrend && prevTrend ? pctChange(curTrend.expense, prevTrend.expense) : null;
  const refMonth = curTrend?.month || 'this month';

  // Setup Line Chart data
  const trendLabels = data?.monthlyTrends?.labels || 
    (Array.isArray(data?.monthlyTrends) ? data.monthlyTrends.map(m => m.month) : ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']);
  
  const incomeValues = data?.monthlyTrends?.income || 
    (Array.isArray(data?.monthlyTrends) ? data.monthlyTrends.map(m => m.income) : [9800, 10500, 11200, 10800, 12000, 12450]);

  const expenseValues = data?.monthlyTrends?.expenses || 
    (Array.isArray(data?.monthlyTrends) ? data.monthlyTrends.map(m => m.expense) : [5200, 4900, 5400, 4700, 5100, 4820]);

  const lineChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Income',
        data: incomeValues,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expense',
        data: expenseValues,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  // Setup Doughnut Chart data
  const rawCategories = data?.categoryBreakdown || data?.categoryExpenses || {
    'Food & Dining': 840,
    'Housing & Rent': 1800,
    'Investments': 950,
    'Transport': 380,
    'Utilities': 430
  };

  const catLabels = Array.isArray(rawCategories) ? rawCategories.map(c => c.category) : Object.keys(rawCategories);
  const catValues = Array.isArray(rawCategories) ? rawCategories.map(c => c.amount) : Object.values(rawCategories);

  const doughnutData = {
    labels: catLabels,
    datasets: [
      {
        data: catValues,
        backgroundColor: [
          '#6366f1',
          '#ec4899',
          '#10b981',
          '#06b6d4',
          '#f59e0b',
          '#8b5cf6',
          '#3b82f6'
        ],
        borderWidth: 2,
        borderColor: '#111827',
      }
    ]
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Financial Intelligence Command Center</h1>
          <p className="page-subtitle">
            AI-driven anomaly detection, real-time budgeting, and automated spend categorization.
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiPlus /> Add Transaction
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="stats-grid">
        <StatCard 
          title="Total Net Worth / Balance" 
          value={`₹${(data?.totalBalance || 0).toLocaleString()}`}
          change={null}
          isPositive={true}
          subtext={`across ${data?.activeAccountsCount ?? 0} active account(s)`}
          icon={<FiDollarSign />}
          gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
        />
        <StatCard 
          title="Monthly Income" 
          value={`₹${(data?.totalIncome || 0).toLocaleString()}`}
          change={incomeChange}
          isPositive={incomeChange ? !incomeChange.startsWith('-') : true}
          subtext={incomeChange ? 'vs. previous month' : `in ${refMonth}`}
          icon={<FiArrowUpRight />}
          gradient="linear-gradient(135deg, #10b981, #059669)"
        />
        <StatCard 
          title="Monthly Expenses" 
          value={`₹${(data?.totalExpense || 0).toLocaleString()}`}
          change={expenseChange}
          isPositive={expenseChange ? expenseChange.startsWith('-') : true}
          trendUp={expenseChange ? !expenseChange.startsWith('-') : undefined}
          subtext={expenseChange ? 'vs. previous month' : `in ${refMonth}`}
          icon={<FiArrowDownRight />}
          gradient="linear-gradient(135deg, #ef4444, #dc2626)"
        />
        <StatCard 
          title="Net Savings Rate" 
          value={`${Number(data?.savingsRate ?? 0).toFixed(1)}%`}
          change={`₹${(data?.netSavings || 0).toLocaleString()} saved`}
          isPositive={true}
          subtext={`in ${refMonth}`}
          icon={<FiPieChart />}
          gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
        />
      </div>

      {/* AI Anomaly Alert Banner */}
      {data?.anomalies && data.anomalies.length > 0 && (
        <div className="anomaly-banner">
          <div className="anomaly-content">
            <div className="anomaly-icon">
              <FiAlertTriangle />
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontWeight: 700, margin: 0 }}>
                AI Anomaly Detector Flagged {data.anomalies.length} Suspicious Charge{data.anomalies.length > 1 ? 's' : ''}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                {data.anomalies[0].description}
              </p>
            </div>
          </div>
          <span className="badge badge-anomaly">Action Required</span>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Income vs. Expenditure Trend</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last 6 Months</span>
          </div>
          <div className="chart-container">
            <Line 
              data={lineChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
              }} 
            />
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Spend by Category</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Month</span>
          </div>
          <div className="chart-container">
            <Doughnut 
              data={doughnutData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="card table-card">
        <div className="chart-header">
          <h3 className="chart-title">Recent Real-time Transactions</h3>
          <span className="badge badge-ai">
            <FiCpu /> Neural Categorization Active
          </span>
        </div>
        
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentTransactions || []).slice(0, 7).map((t, idx) => (
                <tr key={t.id || idx}>
                  <td style={{ color: 'var(--text-muted)' }}>{t.date || t.transactionDate}</td>
                  <td style={{ fontWeight: 600 }}>{t.description}</td>
                  <td>
                    <span className="badge badge-ai">
                      {t.category || t.aiCategory || 'General'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${t.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ 
                    fontWeight: 700, 
                    color: t.type === 'INCOME' ? 'var(--accent-green)' : '#ffffff' 
                  }}>
                    {t.type === 'INCOME' ? '+' : '-'}₹{(t.amount || 0).toLocaleString()}
                  </td>
                  <td>
                    {t.isAnomaly ? (
                      <span className="badge badge-anomaly">
                        <FiAlertTriangle /> Anomaly
                      </span>
                    ) : (
                      <span style={{ color: 'var(--accent-green)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                        <FiCheckCircle /> Verified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Log New Transaction">
        <form onSubmit={handleCreateTransaction}>
          <div className="form-group">
            <label>Select Account</label>
            <select 
              className="form-control" 
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Balance: ₹{acc.balance})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-control" 
                placeholder="e.g. 450.00" 
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label>Transaction Type</label>
              <select 
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description & Merchant</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Swiggy gourmet dinner or Uber ride" 
              value={formData.description}
              onChange={handleDescriptionChange}
              required 
            />
            {aiPredicting && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
                <FiCpu className="spin" /> AI analyzing transaction pattern...
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category (Auto-predicted by AI)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Food & Dining" 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Transaction Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Processing...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
