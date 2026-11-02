import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatCard = ({
  title,
  value,
  change,
  isPositive,
  icon,
  gradient = 'var(--gradient-primary)',
  subtext = 'vs. last month',
}) => {
  return (
    <div className="card card-interactive" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
            }}
          >
            {title}
          </span>
          <h2
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              marginTop: '0.4rem',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </h2>
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.35rem',
            color: '#ffffff',
            boxShadow: '0 8px 18px rgba(0,0,0,0.3)',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
        {change && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              background: isPositive
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
              color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)',
              border: `1px solid ${
                isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
              }`,
            }}
          >
            {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            {change}
          </span>
        )}
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {subtext}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
