import React from 'react';
import { Button } from 'antd';
import './ViewSwitchButtons.scss';
import PlanButton from '../PlanButton/PlanButton.tsx';

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
      <PlanButton
        variant={activeMode === 'tasks' ? 'blue' : 'white'}
        onClick={() => onChange('tasks')}
      >
        Список
      </PlanButton>
      <PlanButton
        variant={activeMode === 'kanban' ? 'blue' : 'white'}
        onClick={() => onChange('kanban')}
      >
        Канбан
      </PlanButton>

      <PlanButton
        variant={activeMode === 'gantt' ? 'blue' : 'white'}
        onClick={() => onChange('gantt')}
      >
        Гант
      </PlanButton>
    </div>
  );
};
