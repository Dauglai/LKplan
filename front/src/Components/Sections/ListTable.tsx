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
  onFilter?: (value: string | number, record: T) => boolean;
  filters?: { text: string; value: string | number }[];
  autoFilters?: boolean;
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
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({
    key: columns[0]?.sortKey || null,
    direction: 'asc',
  });

  const getValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };
  

  // Сортировка данных на основе конфигурации сортировки
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
  
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
  const tableColumns = columns.map((col) => {
    let filters = col.filters;
    let onFilter = col.onFilter;
  
    // Автоматическое формирование фильтров
    if (col.autoFilters && sortConfig.key) {
      const uniqueValues = Array.from(
        new Set(data.map((item) => getValue(item, col.sortKey as string)))
      ).filter((v) => v !== undefined && v !== null);
  
      filters = uniqueValues.map((val) => ({
        text: String(val),
        value: val,
      }));
  
      onFilter = (value, record) => getValue(record, col.sortKey as string) === value;
    }
  
    return {
      title: (
        <div className="HeaderCell">
          {col.header}
          {col.text && <InfoCircle text={col.text} />}
        </div>
      ),
      dataIndex: col.sortKey,
      key: col.sortKey as string,
      render: (text: any, record: T) => col.render(record),
      filters,
      onFilter,
      sorter: col.sortKey
        ? (a: T, b: T) => {
            const aValue = getValue(a, col.sortKey as string);
            const bValue = getValue(b, col.sortKey as string);
            if (aValue < bValue) return -1;
            if (aValue > bValue) return 1;
            return 0;
          }
        : undefined,
      width: col.width,
      filterSearch: true,
      
    };
  });
  

  return (
    <Table
      dataSource={sortedData}
      columns={tableColumns}
      rowKey={(record, index) => index.toString()} // Применяем уникальный ключ для строк
      pagination={false} // Добавляем пагинацию (если нужно, можно настроить)
      className="UniversalListTable"
      showSorterTooltip={false}
      locale={{
        filterTitle: 'Фильтр',
        filterConfirm: 'ОК',
        filterReset: 'Сброс',
        filterEmptyText: 'Нет фильтров',
        emptyText: 'Нет данных',
        filterSearchPlaceholder: 'Поиск',
      }}
    />
  );
}
