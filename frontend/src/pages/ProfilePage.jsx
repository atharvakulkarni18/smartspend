import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiShield, 
  FiPlus, 
  FiCreditCard, 
  FiLogOut,
  FiCheckCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { accountService } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import './Pages.css';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'SAVINGS',
    balance: '',
    currency: 'INR',
    colorCode: '#6366f1'
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const res = await accountService.getAll();
      setAccounts(res.data || res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await accountService.create({
        ...formData,
        balance: parseFloat(formData.balance) || 0
      });
      toast.success('New Account Linked!');
      setShowAddModal(false);
      setFormData({
        name: '',
        type: 'SAVINGS',
        balance: '',
        currency: 'INR',
        colorCode: '#6366f1'
      });
      loadAccounts();
    } catch (err) {
      toast.error('Failed to link account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1>User Profile & Linked Accounts</h1>
          <p className="page-subtitle">
            Manage your credentials, multi-account banking connections, and security profiles.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* User Info Card */}
        <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: '#fff',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
            }}>
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{user?.name || 'Demo User'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{user?.email}</p>
            <span className="badge badge-ai" style={{ marginTop: '0.75rem' }}>
              <FiShield /> {user?.role || 'PREMIUM_USER'}
            </span>
          </div>

          <button 
            className="btn btn-secondary"
            onClick={logout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--accent-red)' }}
          >
            <FiLogOut /> Sign Out
          </button>
        </div>

        {/* Linked Accounts */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Connected Accounts</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <FiPlus /> Link Account
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {accounts.map(acc => (
              <div 
                key={acc.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '8px',
                    background: acc.colorCode || '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.2rem'
                  }}>
                    <FiCreditCard />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{acc.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{acc.type}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                    ₹{(acc.balance || 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                    <FiCheckCircle /> Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Link New Financial Account">
        <form onSubmit={handleCreateAccount}>
          <div className="form-group">
            <label>Account Name</label>
            <input 
              type="text"
              className="form-control"
              placeholder="e.g. HDFC Bank, SBI Savings, CRED Wallet"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Account Type</label>
              <select 
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="SAVINGS">Savings Account</option>
                <option value="CURRENT">Current Account</option>
                <option value="CREDIT">Credit Card</option>
                <option value="WALLET">Digital Wallet</option>
                <option value="CASH">Cash Holdings</option>
              </select>
            </div>
            <div className="form-group">
              <label>Starting Balance (₹)</label>
              <input 
                type="number"
                step="0.01"
                className="form-control"
                placeholder="0.00"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Linking...' : 'Add Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
