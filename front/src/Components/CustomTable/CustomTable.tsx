// components/CustomTable.tsx
import React from 'react';
import { Table, TableProps } from 'antd';
import './TableStyles.module.scss';

export default function CustomTable<RecordType = any>(
  props: TableProps<RecordType>
) {
  return (
    <div className="Tasks-Table">
      <Table {...props} />
    </div>
  );
}
