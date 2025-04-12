import { useState } from 'react';
import { Table } from 'antd';
import InfoCircle from "Components/Common/InfoCircle";
import 'Styles/components/Sections/ListTableStyles.scss';

interface TableColumn<T> {
  header: string;
  render: (row: T) => JSX.Element;
  sortKey?: keyof T;
  text?: string;
  width?: string | number;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
}

/**
 * Универсальная таблица с поддержкой сортировки данных.
 * Таблица отображает переданные данные с возможностью сортировки по указанным колонкам.
 * Также поддерживает рендеринг пользовательских колонок с помощью настроек `render`.
 * 
 * @component
 * @example
 * // Пример использования:
 * <ListTable
 *   data={data}
 *   columns={[
 *     { header: 'Название', sortKey: 'name', render: (record) => record.name },
 *     { header: 'Возраст', sortKey: 'age', render: (record) => record.age },
 *   ]}
 * />
 *
 * @param {Object} props - Свойства компонента.
 * @param {T[]} props.data - Массив данных для отображения в таблице.
 * @param {Column<T>[]} props.columns - Массив объектов, описывающих колонки таблицы, включая настройки сортировки и рендеринга.
 *
 * @returns {JSX.Element} Компонент таблицы с данными и функциональностью сортировки.
 */
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

  // Обработчик клика по заголовку колонки для смены направления сортировки
  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Настройка колонок для таблицы
  const tableColumns = columns.map((col) => ({
    title: (
      <div className="HeaderCell">
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
