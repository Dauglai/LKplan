import React from 'react';
import { Button } from 'antd';
import './ViewSwitchButtons.scss';

interface ViewModeButtonsProps {
  activeMode: 'tasks' | 'gantt' | 'kanban';
  onChange: (mode: 'tasks' | 'gantt' | 'kanban') => void;
}

export const ViewModeButtons: React.FC<ViewModeButtonsProps> = ({
                                                                  activeMode,
                                                                  onChange,
                                                                }) => {
  return (
    <div className="ViewModeButtons">
      <Button
        type={activeMode === 'tasks' ? 'primary' : 'default'}
        onClick={() => onChange('tasks')}
      >
        Список
      </Button>
      <Button
        type={activeMode === 'kanban' ? 'primary' : 'default'}
        onClick={() => onChange('kanban')}
      >
        Канбан
      </Button>

      <Button
        type={activeMode === 'gantt' ? 'primary' : 'default'}
        onClick={() => onChange('gantt')}
      >
        Гант
      </Button>
    </div>
  );
};
