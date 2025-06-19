import { useState } from 'react'; // React хуки
import { Pagination, Table } from 'antd'; // Компоненты Ant Design
import InfoCircle from "Components/Common/InfoCircle"; // Компонент подсказки
import 'Styles/components/Sections/ListTableStyles.scss'; // Стили таблицы

/**
 * Интерфейс колонки таблицы
 * @template T - Тип данных строк таблицы
 * @property {string} header - Заголовок колонки
 * @property {function(T): JSX.Element} render - Функция рендеринга содержимого ячейки
 * @property {keyof T} [sortKey] - Ключ для сортировки (опционально)
 * @property {string} [text] - Текст подсказки (опционально)
 * @property {string | number} [width] - Ширина колонки (опционально)
 * @property {function} [onFilter] - Функция фильтрации (опционально)
 * @property {Array} [filters] - Опции фильтров (опционально)
 * @property {boolean} [autoFilters] - Флаг автоматического создания фильтров (опционально)
 */
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

/**
 * Пропсы компонента таблицы
 * @template T - Тип данных строк таблицы
 * @property {T[]} data - Массив данных для отображения
 * @property {TableColumn<T>[]} columns - Конфигурация колонок
 * @property {function(T[]): void} [onSelectRows] - Колбэк при выборе строк (опционально)
 * @property {Object} [defaultSort] - Настройки сортировки по умолчанию (опционально)
 * @property {string} defaultSort.key - Ключ сортировки по умолчанию
 * @property {'asc' | 'desc'} defaultSort.direction - Направление сортировки
 * @property {function} [defaultSort.customSort] - Кастомная функция сортировки
 */
interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onSelectRows?: (selected: T[]) => void;
  defaultSort?: { 
    key: string; 
    direction: 'asc' | 'desc'; 
    customSort?: (a: T, b: T) => number 
  };
}

/**
 * Универсальный компонент таблицы с поддержкой:
 * - Сортировки (включая кастомную)
 * - Пагинации
 * - Фильтрации (автоматической и ручной)
 * - Выбора строк
 * - Подсказок для колонок
 * 
 * @component
 * @template T - Тип данных строк таблицы
 * @param {TableProps<T>} props - Пропсы компонента
 * @returns {JSX.Element} Таблица с расширенной функциональностью
 * 
 * @example
 * // Пример использования с базовой сортировкой
 * <ListTable
 *   data={users}
 *   columns={[
 *     { 
 *       header: 'Имя', 
 *       sortKey: 'name',
 *       render: (user) => <span>{user.name}</span> 
 *     },
 *     { 
 *       header: 'Возраст', 
 *       sortKey: 'age',
 *       render: (user) => <span>{user.age}</span> 
 *     }
 *   ]}
 * />
 * 
 * @example
 * // Пример с кастомной сортировкой и выбором строк
 * <ListTable
 *   data={products}
 *   columns={[...]}
 *   onSelectRows={(selected) => console.log(selected)}
 *   defaultSort={{
 *     key: 'price',
 *     direction: 'desc',
 *     customSort: (a, b) => a.discountPrice - b.discountPrice
 *   }}
 * />
 */
export default function ListTable<T>({ data, columns, onSelectRows, defaultSort }: TableProps<T>): JSX.Element {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); // Ключи выбранных строк
  const [selectedRows, setSelectedRows] = useState<T[]>([]); // Данные выбранных строк
  const [sortConfig, setSortConfig] = useState<{ 
    key: string | null; 
    direction: 'asc' | 'desc' | null;
    customSort?: (a: T, b: T) => number;
  }>({
    key: defaultSort?.key || columns[0]?.sortKey || null, // Ключ сортировки по умолчанию
    direction: defaultSort?.direction || 'asc', // Направление по умолчанию
    customSort: defaultSort?.customSort, // Кастомная сортировка
  });

  const [currentPage, setCurrentPage] = useState(1); // Текущая страница
  const [pageSize, setPageSize] = useState(10); // Количество элементов на странице

  /**
   * Получает значение из объекта по пути
   * @param {any} obj - Исходный объект
   * @param {string} path - Путь к свойству (например 'user.address.city')
   * @returns {any} Значение свойства
   */
  const getValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Сортировка данных с учетом кастомной функции
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.customSort) {
      return sortConfig.customSort(a, b);
    }

    const aValue = getValue(a, sortConfig.key);
    const bValue = getValue(b, sortConfig.key);

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Данные для текущей страницы
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  /**
   * Обработчик сортировки
   * @param {keyof T} key - Ключ сортировки
   */
  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Формирование конфигурации колонок для Ant Design Table
  const tableColumns = columns.map((col) => {
    let filters = col.filters;
    let onFilter = col.onFilter;

    // Автоматическое создание фильтров
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

  /**
   * Обработчик изменения страницы
   * @param {number} page - Новая страница
   * @param {number} size - Новый размер страницы
   */
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Конфигурация выбора строк
  const rowSelection = onSelectRows
    ? {
        selectedRowKeys,
        onChange: (keys: React.Key[], rows: T[]) => {
          setSelectedRowKeys(keys);
          setSelectedRows(rows);
          onSelectRows?.(rows);
        },
      }
    : undefined;

  return (
    <div className="ListTableContainer">
      <Table
        dataSource={paginatedData}
        columns={tableColumns}
        rowKey={(record, index) => index.toString()}
        pagination={false} // Выключаем пагинацию на уровне таблицы
        className="UniversalListTable"
        showSorterTooltip={false}
        rowSelection={rowSelection}
        locale={{
          filterTitle: 'Фильтр',
          filterConfirm: 'Ок',
          filterReset: 'Сброс',
          filterEmptyText: 'Нет фильтров',
          emptyText: 'Нет данных',
          filterSearchPlaceholder: 'Поиск',
        }}
      />

      <div className="PaginationContainer">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={sortedData.length}
          onChange={handlePageChange}
          showSizeChanger
          pageSizeOptions={['10', '20', '30', '50']}
          showTotal={(total) => `Всего ${total} записей`}
          locale={{
            items_per_page: '/ Записей на странице',
            jump_to: 'Перейти к',
            page: 'Страница',
            prev_page: 'Предыдущая страница',
            next_page: 'Следующая страница',
          }}
        />
      </div>
    </div>
  );
}
