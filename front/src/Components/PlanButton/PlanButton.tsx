import React from 'react';
import classNames from 'classnames';
import styles from './PlanButton.module.scss';

interface PlanButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary-btn-plan' | 'default';
}

const PlanButton: React.FC<PlanButtonProps> = ({ variant = 'primary-btn-plan', className, children, ...rest }) => {
  return (
    <button
      {...rest}
      className={classNames(styles.planButton, variant && styles[variant], className)}
    >
      {children}
    </button>
  );
};

export default PlanButton;