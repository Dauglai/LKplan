import { Select } from "antd"; // Компонент Select из Ant Design
const { Option } = Select; // Деструктуризация Option из Select
import "Styles/FormSelectorStyle.scss"; // Стили компонента

/**
 * Интерфейс пропсов компонента StageSelector.
 * 
 * @property {string | null} selectedStage - Выбранный этап (может быть null).
 * @property {(stage: string) => void} onChange - Колбэк при изменении выбора этапа.
 */
interface StageSelectorProps {
  selectedStage: string | null;
  onChange: (stage: string) => void;
}

// Доступные этапы мероприятия
const stages = [
  'Редактирование',
  'Набор участников',
  'Проведение мероприятия',
  'Мероприятие завершено',
];

/**
 * Компонент выбора этапа мероприятия из фиксированного списка.
 * Используется для управления статусом/этапом мероприятия.
 * 
 * @component
 * @example
 * // Пример использования:
 * <StageSelector
 *   selectedStage={currentStage}
 *   onChange={(stage) => updateStage(stage)}
 * />
 *
 * @param {StageSelectorProps} props - Пропсы компонента.
 * @returns {JSX.Element} Выпадающий список этапов мероприятия.
 */
export default function StageSelector({
  selectedStage,
  onChange,
}: StageSelectorProps): JSX.Element {
  return (
      <Select
        value={selectedStage ?? undefined}
        onChange={onChange}
        placeholder="Выбрать этап"
        className="Selector"
        style={{ width: '100%' }}
      >
        {stages.map(stage => (
          <Option key={stage} value={stage}>
            {stage}
          </Option>
        ))}
      </Select>
  );
}