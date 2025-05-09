import React from 'react';
import classNames from 'classnames';
import styles from './PlanButton.module.scss';

interface PlanButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'grey' | 'white';
}

const PlanButton: React.FC<PlanButtonProps> = ({
                                                 variant = 'blue',
                                                 className,
                                                 children,
                                                 ...rest
                                               }) => {
  return (
    <button
      {...rest}
      className={classNames(
        styles.planButton,
        variant && styles[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

export default PlanButton;