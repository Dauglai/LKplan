import React from 'react';
import { Button, ButtonProps } from 'antd';
import classNames from 'classnames';
import styles from './PlanButton.module.scss';

interface PlanButtonProps extends ButtonProps {
  variant?: 'primary' | 'default';
}

const PlanButton: React.FC<PlanButtonProps> = ({ variant = 'primary', className, ...rest }) => {
  return (
    <Button
      {...rest}
      className={classNames(
        styles.planButton,
        variant === 'default' && styles.default,
        className
      )}
    />
  );
};

export default PlanButton;
