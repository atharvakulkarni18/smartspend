import React, { useState } from 'react';
import { 
  FiDownload, 
  FiFileText, 
  FiCalendar, 
  FiCheckCircle, 
  FiClock,
  FiPrinter
} from 'react-icons/fi';
import { reportService } from '../services/api';
import toast from 'react-hot-toast';
import './Pages.css';

const ReportsPage = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [downloading, setDownloading] = useState(false);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await reportService.downloadMonthlyReport(month, year);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SmartSpend_Report_${year}_${String(month).padStart(2, '0')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Official PDF Statement Downloaded!');
    } catch (err) {
      toast.error('Could not generate PDF report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1>Financial Statement Export</h1>
          <p className="page-subtitle">
            Generate audit-ready, iText7-compiled PDF reports with itemized ledger and AI audit trail.
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '640px', padding: '2rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            color: '#fff'
          }}>
            <FiFileText />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Select Statement Period</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Choose billing period for statement compilation.
            </p>
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Month</label>
            <select 
              className="form-control"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Year</label>
            <select 
              className="form-control"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>
        </div>

        <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Report Inclusions:
          </h4>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
            <li>Complete Income vs Expense Breakdown</li>
            <li>Category-wise Distribution Table</li>
            <li>AI Flagged Anomaly Audit Log</li>
            <li>Formatted Timestamps & Running Account Balances</li>
          </ul>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleDownload}
          disabled={downloading}
          style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}
        >
          <FiDownload /> {downloading ? 'Compiling iText PDF...' : 'Download Official PDF Report'}
        </button>
      </div>
    </div>
  );
};

export default ReportsPage;
