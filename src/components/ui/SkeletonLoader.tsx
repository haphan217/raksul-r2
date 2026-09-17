import React from 'react';
import styles from './SkeletonLoader.module.css';

export interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  count?: number;
  className?: string;
  radius?: string;
}

function SkeletonLoaderComponent({
  width = '100%',
  height = '16px',
  count = 1,
  className,
  radius,
}: SkeletonLoaderProps) {
  const classes = [styles.wrapper, className ?? ''].filter(Boolean).join(' ');
  const bars = Array.from({ length: count }, (_, index) => index);

  return (
    <div className={classes} role="status" aria-busy="true">
      {bars.map((index) => (
        <div
          key={index}
          className={styles.bar}
          style={{
            width,
            height,
            borderRadius: radius ?? 'var(--rk-radius-1)',
          }}
        />
      ))}
      <span className="visually-hidden">Loading…</span>
    </div>
  );
}

export const SkeletonLoader = React.memo(SkeletonLoaderComponent);
SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
