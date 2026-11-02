import React from 'react';

export const SkeletonText = ({ width = '100%', height = '1rem', style = {} }) => (
  <div
    className="skeleton"
    style={{
      width,
      height,
      borderRadius: 'var(--radius-sm)',
      marginBottom: '0.5rem',
      ...style,
    }}
  />
);

export const SkeletonCard = ({ height = '140px', style = {} }) => (
  <div
    className="skeleton skeleton-card"
    style={{
      height,
      borderRadius: 'var(--radius-lg)',
      ...style,
    }}
  />
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
    {Array.from({ length: rows }).map((_, idx) => (
      <div
        key={idx}
        className="skeleton"
        style={{
          height: '48px',
          width: '100%',
          borderRadius: 'var(--radius-md)',
        }}
      />
    ))}
  </div>
);

export default SkeletonCard;
