import React, { useEffect, useState } from 'react';
import { 
  FiPlus, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiTrash2, 
  FiPercent, 
  FiDollarSign,
  FiTrendingUp
} from 'react-icons/fi';
import Modal from '../components/Modal';
import Skeleton from '../components/Skeleton';
import { budgetService } from '../services/api';
import toast from 'react-hot-toast';
import './Pages.css';

const BudgetPage = () => {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    limitAmount: '',
    alertThreshold: 80,
    period: 'MONTHLY',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetService.getAll();
      const list = res.data || res || [];
      setBudgets(list);
    } catch (err) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await budgetService.create({
        ...formData,
        limitAmount: parseFloat(formData.limitAmount)
      });
      toast.success('Budget ceiling created!');
      setShowAddModal(false);
      setFormData({
        category: '',
        limitAmount: '',
        alertThreshold: 80,
        period: 'MONTHLY',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      loadBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget target?')) return;
    try {
      await budgetService.delete(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast.success('Budget removed');
    } catch (err) {
      toast.error('Failed to delete budget');
    }
  };

  const getProgressColor = (percent) => {
    if (percent >= 90) return 'var(--accent-red)';
    if (percent >= 75) return '#f59e0b';
    return 'var(--accent-green)';
  };

  const totalAllocated = budgets.reduce((acc, b) => acc + (b.limitAmount || b.allocated || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spentAmount || b.spent || 0), 0);

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1>Smart Budgeting & Ceilings</h1>
          <p className="page-subtitle">
            Configure threshold triggers and real-time spending caps per category.
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiPlus /> New Budget Limit
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Budget Pool
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
              ₹{totalSpent.toLocaleString()} / ₹{totalAllocated.toLocaleString()}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Overall Budget Utilization
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: totalSpent > totalAllocated ? 'var(--accent-red)' : 'var(--accent-green)' }}>
              {totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
      {loading ? (
        <div className="budget-grid">
          <Skeleton height="180px" />
          <Skeleton height="180px" />
          <Skeleton height="180px" />
        </div>
      ) : (
        <div className="budget-grid">
          {budgets.map(b => {
            const limit = b.limitAmount || b.allocated || 0;
            const spent = b.spentAmount || b.spent || 0;
            const percent = b.percentageUsed || (limit > 0 ? Math.round((spent / limit) * 100) : 0);
            const isAlert = b.isAlertTriggered || percent >= (b.alertThreshold || 80);

            return (
              <div key={b.id} className="card budget-card">
                <div className="budget-card-header">
                  <div className="budget-category-title">
                    <span>{b.category}</span>
                    {isAlert && (
                      <span className="badge badge-anomaly" style={{ fontSize: '0.7rem' }}>
                        <FiAlertCircle /> Alert Threshold
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDelete(b.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    title="Remove Budget"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(percent, 100)}%`, 
                      background: getProgressColor(percent) 
                    }}
                  />
                </div>

                <div className="budget-numbers">
                  <span>Spent: ₹{spent.toLocaleString()}</span>
                  <span>Limit: ₹{limit.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Trigger at: {b.alertThreshold || 80}%
                  </span>
                  <span style={{ fontWeight: 700, color: getProgressColor(percent) }}>
                    {percent}% utilized
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Category Budget">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Category</label>
            <input 
              type="text"
              className="form-control"
              placeholder="e.g. Food & Dining, Shopping, Utilities"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Monthly Limit (₹)</label>
              <input 
                type="number"
                step="100"
                className="form-control"
                placeholder="e.g. 5000"
                value={formData.limitAmount}
                onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Alert Threshold (%)</label>
              <input 
                type="number"
                min="10"
                max="100"
                className="form-control"
                value={formData.alertThreshold}
                onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) || 80 })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetPage;
