// components/LinkField/LinkField.tsx
import React from 'react';
import { Input, Tooltip } from 'antd';
import { CopyOutlined, CloseOutlined } from '@ant-design/icons';
import styles from './LinkField.module.scss';

interface LinkFieldProps {
  title: string; // Название слева от поля
  value: string;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  onCopy?: () => void;
  onClear?: () => void;
}

const LinkField: React.FC<LinkFieldProps> = ({
                                               title,
                                               value,
                                               isEditing = false,
                                               onChange,
                                               onCopy,
                                               onClear,
                                             }) => {
  return (
    <div className={styles.LinkField}>
      <div className={styles.Title}>{title}</div>

      {isEditing ? (
        <Input
          className={styles.Input}
          value={value}
          onChange={e => onChange?.(e.target.value)}
        />
      ) : (
        <div className={styles.Text}>{value}</div>
      )}

      {isEditing ? (
        <Tooltip title="Очистить">
          <CloseOutlined className={styles.Icon} onClick={onClear} />
        </Tooltip>
      ) : (
        <Tooltip title="Скопировать">
          <CopyOutlined className={styles.Icon} onClick={onCopy} />
        </Tooltip>
      )}
    </div>
  );
};

export default LinkField;
