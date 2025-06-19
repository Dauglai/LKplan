import { useEffect, useState } from 'react'; // Хуки React  
import { useSelector } from 'react-redux'; // Доступ к состоянию Redux  
import "Styles/FormSelectorStyle.scss"; // Стили компонента  

import { Select, Spin } from 'antd'; // UI-компоненты Ant Design  
import { Direction, useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice'; // Типы и API-запросы  

const { Option } = Select; // Деструктуризация Option из Select  

/**
 * Интерфейс пропсов компонента DirectionSelector.  
 * 
 * @property {Direction | null} [selectedDirection] - Выбранное направление (опционально).  
 * @property {(direction: Direction) => void} onChange - Колбэк при изменении выбора.  
 * @property {'local' | 'remote'} sourceType - Источник данных ('local' или 'remote').  
 * @property {string} [label='Выбрать направление'] - Текст лейбла (опционально).  
 * @property {Direction[]} [directions] - Локальный список направлений (опционально).  
 * @property {string} [error] - Текст ошибки (опционально).  
 */
interface DirectionSelectorProps {
  selectedDirection?: Direction | null;
  onChange: (direction: Direction) => void;
  sourceType: 'local' | 'remote';
  label?: string;
  directions?: Direction[];
  error?: string;
}

/**
 * Компонент выбора направления из списка. Поддерживает локальные и удалённые данные.  
 * 
 * @component  
 * @example  
 * // Пример использования с локальными данными:  
 * <DirectionSelector  
 *   sourceType="local"  
 *   onChange={(dir) => console.log(dir)}  
 * />  
 * 
 * // Пример с удалёнными данными:  
 * <DirectionSelector  
 *   sourceType="remote"  
 *   selectedDirection={currentDirection}  
 *   onChange={handleDirectionChange}  
 *   label="Выберите направление"  
 * />  
 * 
 * @param {DirectionSelectorProps} props - Пропсы компонента.  
 * @returns {JSX.Element} Выпадающий список направлений или спиннер загрузки.  
 */
export default function DirectionSelector({
  selectedDirection,
  onChange,
  sourceType,
  label = 'Выбрать направление',
  directions,
  error
}: DirectionSelectorProps): JSX.Element {
  const [options, setOptions] = useState<Direction[]>([]); // Локальное состояние списка направлений  
  const { data: remoteDirections, isLoading } = useGetDirectionsQuery(undefined, { skip: sourceType !== 'remote' }); // Запрос направлений (если sourceType='remote')  
  const localDirections = useSelector((state: any) => state.event?.stepDirections?.directions || []); // Направления из Redux (если sourceType='local')  

  // Обновление списка направлений в зависимости от источника данных  
  useEffect(() => {
    if (directions) {
      setOptions(directions); // Используем переданный массив направлений  
    } else if (sourceType === 'remote' && remoteDirections) {
      setOptions(remoteDirections); // Берём данные из API  
    } else if (sourceType === 'local') {
      setOptions(localDirections); // Берём данные из Redux  
    }
  }, [sourceType, remoteDirections, localDirections, directions]);

  // Обработчик выбора направления  
  const handleChange = (id: number) => {
    const selected = options.find((dir) => dir.id === id); // Находим выбранное направление  
    if (selected) onChange(selected); // Вызываем колбэк  
  };

  if (isLoading) return <Spin />; // Загрузка данных  

  if (!options || options.length === 0) {
    return <div>Направления не найдены</div>; // Пустой список  
  }

  return (
    <Select
      value={selectedDirection?.id ?? undefined}
      onChange={handleChange}
      placeholder={label}
      optionFilterProp="children"
      showSearch
      status={error ? 'error' : undefined}
      className="Selector"
    >
      {options.map((direction) => (
        <Option key={direction.id} value={direction.id}>
          {direction.name}
        </Option>
      ))}
    </Select>
  );
}

  