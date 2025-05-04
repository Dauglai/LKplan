import { Select } from "antd";
const { Option } = Select;
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