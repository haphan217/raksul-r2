import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

function CardComponent({ title, children, className, footer }: CardProps) {
  const classes = [styles.card, className ?? ''].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
}

export const Card = React.memo(CardComponent);
Card.displayName = 'Card';

export default Card;
