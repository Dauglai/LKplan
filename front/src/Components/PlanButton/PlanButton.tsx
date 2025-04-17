import React from 'react';
import { Button, ButtonProps } from 'antd';
import classNames from 'classnames';
import styles from './PlanButton.module.scss';

interface PlanButtonProps extends ButtonProps {
  variant?: 'primary-btn-plan';
}

const PlanButton: React.FC<PlanButtonProps> = ({ variant = 'primary-btn-plan', className, ...rest }) => {
  return (
    <Button
      {...rest}
      className={'primary-btn-plan'}
    />
  );
};

export default PlanButton;
