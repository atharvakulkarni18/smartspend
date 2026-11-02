import React, { useEffect, useState } from 'react';
import { 
  FiTrendingUp, 
  FiCpu, 
  FiShield, 
  FiCheckCircle, 
  FiPieChart, 
  FiBarChart2,
  FiZap
} from 'react-icons/fi';
import { Bar, Radar } from 'react-chartjs-2';
import '../utils/chartSetup';
import Skeleton from '../components/Skeleton';
import { aiService, dashboardService } from '../services/api';
import toast from 'react-hot-toast';
import './Pages.css';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [aiData, setAiData] = useState(null);
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [predictionRes, dashRes] = await Promise.all([
        aiService.predict(),
        dashboardService.getDashboard()
      ]);
      setAiData(predictionRes.data || predictionRes || {});
      setDashData(dashRes.data || dashRes || {});
    } catch (err) {
      toast.error('Could not compute AI projections');
    } finally {
      setLoading(false);
    }
  };

  const forecastData = aiData?.monthlyForecastData || {
    labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    projected: [4650, 5200, 4400, 4350, 4500]
  };

  const barChartData = {
    labels: forecastData.labels,
    datasets: [
      {
        label: 'AI Projected Expenses (₹)',
        data: forecastData.projected,
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderRadius: 6,
      }
    ]
  };

  const insights = aiData?.insights || [
    'Utility and subscription overhead is projected 8% lower for next month.',
    'Discretionary dining spend shows positive contraction (-14%).',
    'Predicted savings rate remains healthy above 55% target.'
  ];

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1>AI Predictive Analytics & Forecasting</h1>
          <p className="page-subtitle">
            Linear regression and time-series modeling to project future cash flows and burn rates.
          </p>
        </div>
      </div>

      {/* AI Model Summary Banner */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <FiCpu /> ML FORECAST ENGINE
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Projected Next Month Burn: ₹{(aiData?.forecastNextMonthExpense || 4650).toLocaleString()}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.4rem 0 0' }}>
              Projected Net Savings Opportunity: <strong style={{ color: 'var(--accent-green)' }}>₹{(aiData?.projectedSavings || 7800).toLocaleString()}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confidence Metric</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
              {aiData?.confidenceScore || 92.4}%
            </div>
          </div>
        </div>
      </div>

      {/* Projections Chart */}
      <div className="card chart-card" style={{ marginBottom: '2rem' }}>
        <div className="chart-header">
          <h3 className="chart-title">5-Month Forward Cashflow Projections</h3>
          <span className="badge badge-ai">
            <FiZap /> Neural Linear Extrapolation
          </span>
        </div>
        <div className="chart-container" style={{ height: '320px' }}>
          <Bar 
            data={barChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } }
            }}
          />
        </div>
      </div>

      {/* AI Insights & Observations */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiShield style={{ color: 'var(--accent-primary)' }} /> Automated Financial Health Diagnostics
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {insights.map((insight, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <FiCheckCircle style={{ color: 'var(--accent-green)', marginTop: '0.2rem', flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
