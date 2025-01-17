import { useState } from 'react';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

interface DirectionSelectorProps {
  selectedDirectionId: number | null;
  onChange: (directionId: number) => void;
}

export default function DirectionSelector({
    selectedDirectionId,
    onChange,
}: DirectionSelectorProps): JSX.Element {
    const { data: directions, isLoading, error } = useGetDirectionsQuery();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectDirection = (directionId: number) => {
        onChange(directionId);
    };

    if (isLoading) {
        return <div className="DirectionSelector">Загрузка направлений...</div>;
    }

    if (error || !directions || directions.length === 0) {
        return <div className="DirectionSelector">Направления не найдены</div>;
    }

    const selectedDirectionName = directions.find(direction => direction.id === selectedDirectionId)?.name || 'Выбрать мероприятие';

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

                {isOpen && (
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
            </div>
        </div>
    );
}