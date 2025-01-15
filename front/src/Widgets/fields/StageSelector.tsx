import { useState } from 'react';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import "Styles/FormSelectorStyle.scss";

interface StageSelectorProps {
  selectedStage: string | null;
  onChange: (stage: string) => void;
}

const stages = [
  'Редактирование',
  'Набор участников',
  'Формирование команд',
  'Проведение мероприятия',
  'Мероприятие завершено',
];

export default function StageSelector({
  selectedStage,
  onChange,
}: StageSelectorProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectStage = (stage: string) => {
    onChange(stage);
  };

  return (
    <div className="StageSelector">
      <div
        className="ListField FormField"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <p>{selectedStage || 'Выбрать этап'}</p>
        <ChevronRightIcon width="20" height="20" strokeWidth="1" className={`ChevronDown ${isOpen ? 'open' : ''}`} />

        {isOpen && (
          <div className="DropdownList">
            {stages.map(stage => (
              <div
                key={stage}
                className={`DropdownItem ${selectedStage === stage ? 'selected' : ''}`}
                onClick={() => handleSelectStage(stage)}
              >
                {stage}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}