import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import "Styles/FormSelectorStyle.scss"

interface DirectionSelectorProps {
    onChange: (directionId: number) => void;
    label?: string;
  }
  
export default function DirectionSelector({
    onChange,
    label = "Выбрать направление *",  // Текст по умолчанию
  }: DirectionSelectorProps): JSX.Element {
    const { stepDirections } = useSelector((state: any) => state.event || []);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDirectionId, setSelectedDirectionId] = useState<number | null>(null); // Начальное значение null
  
    // Функция, которая вызывается при выборе направления
    const handleSelectDirection = (directionId: number) => {
      setSelectedDirectionId(directionId);  // Обновляем состояние выбранного направления
      onChange(directionId);  // Передаем обновленный id наверх
    };
  
    const directions = stepDirections?.directions || [];
  
    // Отображаем название выбранного направления или текст по умолчанию
    const selectedDirectionName =
      selectedDirectionId !== null
        ? directions.find((direction) => direction.id === selectedDirectionId)?.name
        : label;
  
    return (
      <div className="DirectionSelector">
        <div
          className="ListField FormField"
          onClick={() => setIsOpen((prev) => !prev)} // Открываем/закрываем список
        >
          <p>{selectedDirectionName}</p> {/* Отображаем название выбранного направления */}
          <ChevronRightIcon
            width="20"
            height="20"
            strokeWidth="1"
            className={`ChevronDown ${isOpen ? 'open' : ''}`}
          />
        
  
            {/* Дропдаун со списком направлений */}
            {isOpen && directions.length > 0 && (
            <div className="DropdownList">
                {directions.map((direction) => (
                <div
                    key={direction.id}
                    className={`DropdownItem ${selectedDirectionId === direction.id ? 'selected' : ''}`}
                    onClick={() => handleSelectDirection(direction.id)} // Выбираем направление при клике
                >
                    {direction.name}
                </div>
                ))}
            </div>
            )}
    
            {/* Если направлений нет */}
            {isOpen && directions.length === 0 && (
            <div className="DropdownList">
                <p>Нет доступных направлений</p>
            </div>
            )}
        </div>
      </div>
    );
}
  