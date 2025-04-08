import { useState } from 'react';
import { Table } from 'antd';
import InfoCircle from "Components/Common/InfoCircle";
import ArrowDownIcon from 'assets/icons/arrow-down.svg?react';
import 'Styles/components/Sections/ListTableStyles.scss';

interface TableColumn<T> {
  header: string;
  render: (row: T) => JSX.Element;
  sortKey?: keyof T;
  text?: string;
  width?: string | number; // Добавляем пропс для ширины колонок
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
}

export default function ListTable<T>({ data, columns }: TableProps<T>): JSX.Element {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' | null }>({
    key: columns[0]?.sortKey || null, direction: 'asc',
  });

  // Сортировка данных на основе конфигурации сортировки
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const getValue = (obj: T, key: keyof T) => {
      const keys = key.split('.'); // Для вложенных объектов
      return keys.reduce((acc, curr) => acc && acc[curr], obj);
    };

    const aValue = getValue(a, sortConfig.key);
    const bValue = getValue(b, sortConfig.key);

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const tableColumns = columns.map((col) => ({
    title: (
      <div className="HeaderCell">
        {/*{col.sortKey && sortConfig.key === col.sortKey && (
          <span className="SortIcon">
            {sortConfig.direction === 'asc' ? 
                <ArrowDownIcon width="16" height="16" strokeWidth="1" className="ArrowUp"/> : 
                <ArrowDownIcon width="16" height="16" strokeWidth="1"/>}
            
          </span>
        )}
        {col.sortKey && sortConfig.key !== col.sortKey && (
          <span>↕</span>
        )}*/}
        {col.header}
        {col.text && <InfoCircle text={col.text} />}
      </div>
    ),
    dataIndex: col.sortKey,
    key: col.sortKey as string,
    render: (text: any, record: T) => col.render(record),
    sorter: col.sortKey ? (a: T, b: T) => {
      const aValue = a[col.sortKey as keyof T];
      const bValue = b[col.sortKey as keyof T];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    } : undefined,
    width: col.width, // Применяем ширину
  }));

  return (
    <Table
      dataSource={sortedData}
      columns={tableColumns}
      rowKey={(record, index) => index.toString()} // Применяем уникальный ключ для строк
      pagination={false} // Добавляем пагинацию (если нужно, можно настроить)
      className="UniversalListTable"
      showSorterTooltip={false}
    />
  );
}