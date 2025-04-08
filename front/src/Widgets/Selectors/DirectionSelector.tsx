import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

interface DirectionSelectorProps {
  selectedDirectionId: number | null;
  onChange: (directionId: number) => void;
  label? : string;
}

export default function DirectionSelector({
    selectedDirectionId,
    onChange,
    label = "Выбрать направление*"
}: DirectionSelectorProps): JSX.Element {
    const { stepDirections } = useSelector((state: any) => state.event || []);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectDirection = (directionId: number) => {
        onChange(directionId);  // Отправляем выбранный directionId
        setIsOpen(false);  // Закрываем список после выбора
    };

    // Проверяем, есть ли направлений, если нет, показываем сообщение
    const directions = stepDirections?.directions || [];
    
    const selectedDirectionName = directions.find(direction => direction.id === selectedDirectionId)?.name || label;

    console.log('selectedDirectionName', selectedDirectionName);
    console.log('directions', directions);

    return (
        <div className="DirectionSelector">
            <div
                className="ListField FormField"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <p>{selectedDirectionName}</p>
                <ChevronRightIcon
                    width="20"
                    height="20"
                    strokeWidth="1"
                    className={`ChevronDown ${isOpen ? 'open' : ''}`}
                />
            </div>

            {/* Дропдаун со списком направлений */}
            {isOpen && directions.length > 0 && (
                <div className="DropdownList">
                    {directions.map(direction => (
                        <div
                            key={direction.id}
                            className={`DropdownItem ${selectedDirectionId === direction.id ? 'selected' : ''}`}
                            onClick={() => handleSelectDirection(direction.id)}
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
    );
}