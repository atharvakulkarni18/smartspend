import React, { useEffect, useState } from 'react';
import { 
  FiSearch, 
  FiPlus, 
  FiUploadCloud, 
  FiTrash2, 
  FiAlertTriangle, 
  FiFilter, 
  FiDownload,
  FiCpu
} from 'react-icons/fi';
import Modal from '../components/Modal';
import Skeleton from '../components/Skeleton';
import { transactionService, accountService, aiService } from '../services/api';
import toast from 'react-hot-toast';
import './Pages.css';

const TransactionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New Transaction Form
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    description: '',
    category: '',
    type: 'EXPENSE',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txnsRes, accsRes] = await Promise.all([
        transactionService.getAll(),
        accountService.getAll()
      ]);
      const txnList = txnsRes.data?.content || txnsRes.data || txnsRes || [];
      const accList = accsRes.data || accsRes || [];

      setTransactions(txnList);
      setAccounts(accList);
      if (accList.length > 0) {
        setSelectedAccountId(accList[0].id);
        setFormData(prev => ({ ...prev, accountId: accList[0].id }));
      }
    } catch (err) {
      toast.error('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction removed');
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await transactionService.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Transaction logged successfully!');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile || !selectedAccountId) {
      toast.error('Please choose a file and target account');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('file', csvFile);
      form.append('accountId', selectedAccountId);

      const res = await transactionService.importCsv(form);
      toast.success(res.message || 'CSV imported and AI categorized successfully!');
      setShowCsvModal(false);
      setCsvFile(null);
      loadData();
    } catch (err) {
      toast.error('Failed to import CSV file');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesType = selectedType === 'ALL' || t.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean)));

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1>Transactions Ledger</h1>
          <p className="page-subtitle">
            All records processed through automated neural categorization and anomaly detection.
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCsvModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiUploadCloud /> Import Bank CSV
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiPlus /> New Record
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search transactions by merchant, description or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="select-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {uniqueCategories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select 
          className="select-filter"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="EXPENSE">Expenses Only</option>
          <option value="INCOME">Income Only</option>
        </select>
      </div>

      {/* Transactions Table Card */}
      <div className="card table-card">
        {loading ? (
          <div style={{ padding: '1rem' }}>
            <Skeleton height="40px" style={{ marginBottom: '1rem' }} />
            <Skeleton height="40px" style={{ marginBottom: '1rem' }} />
            <Skeleton height="40px" style={{ marginBottom: '1rem' }} />
            <Skeleton height="40px" />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Intelligence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No transactions match your search filter.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{t.date || t.transactionDate}</td>
                      <td style={{ fontWeight: 600 }}>{t.description}</td>
                      <td>
                        <span className="badge badge-ai">
                          {t.category || t.aiCategory || 'General'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {t.accountName || t.account || 'Primary'}
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
                          <span className="badge badge-anomaly" title={t.anomalyReason}>
                            <FiAlertTriangle /> Anomaly Flag
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <FiCpu /> Confirmed
                          </span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn-danger-icon"
                          onClick={() => handleDelete(t.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-red)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            padding: '0.4rem',
                            borderRadius: '4px'
                          }}
                          title="Delete Transaction"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Transaction Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Log Transaction">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Account</label>
            <select 
              className="form-control"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              required
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} (₹{a.balance})</option>
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
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Type</label>
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
            <label>Description</label>
            <input 
              type="text"
              className="form-control"
              placeholder="e.g. Netflix Monthly or Grocery run"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category (Optional, AI will auto-assign)</label>
              <input 
                type="text"
                className="form-control"
                placeholder="Leave blank for AI auto-tag"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Date</label>
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
              {submitting ? 'Saving...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal isOpen={showCsvModal} onClose={() => setShowCsvModal(false)} title="Bulk Import CSV Statement">
        <form onSubmit={handleCsvUpload}>
          <div className="form-group">
            <label>Destination Account</label>
            <select 
              className="form-control"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              required
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>CSV Bank Statement File</label>
            <input 
              type="file"
              accept=".csv"
              className="form-control"
              onChange={(e) => setCsvFile(e.target.files[0])}
              required
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Expected CSV columns: Date (YYYY-MM-DD), Description, Amount, Type (Optional), Category (Optional)
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCsvModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Parsing & Classifying...' : 'Import Statement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TransactionsPage;
