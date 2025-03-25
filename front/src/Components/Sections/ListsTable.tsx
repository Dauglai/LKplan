import { useState } from "react";
import 'Styles/components/Sections/ListTableStyles.scss';
import InfoCircle from "Components/Common/InfoCircle";

interface TableColumn<T> {
    header: string;
    render: (row: T) => JSX.Element;
    sortKey?: keyof T;
    text?: string;
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

    return (
        <table className="UniversalListTable">
            <thead>
                <tr>
                    {columns.map((col, index) => (
                        <th 
                            key={index} 
                            onClick={() => col.sortKey && handleSort(col.sortKey)}
                            style={{ cursor: col.sortKey ? 'pointer' : 'default' }} // Делаем заголовок кликабельным, если есть сортировка
                        >
                            {col.header}
                            {col.sortKey && sortConfig.key === col.sortKey && (
                                <span>
                                    {sortConfig.direction === 'asc' ? '🔼' : '🔽'}
                                </span>
                            )}
                            {col.text && <InfoCircle text={col.text} />}
                            {col.sortKey && sortConfig.key !== col.sortKey && (
                                <span> ↕</span>
                            )}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {sortedData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                            <td key={colIndex}>{col.render(row)}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
