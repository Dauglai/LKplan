import { Team, useGetTeamsQuery } from 'Features/ApiSlices/teamSlice'; // Тип Team и API-запрос команд
import { Select, Spin } from 'antd'; // Компоненты Ant Design
const { Option } = Select; // Деструктуризация Option из Select
import "Styles/FormSelectorStyle.scss"; // Стили компонента

/**
 * Интерфейс пропсов компонента TeamSelector.
 * 
 * @property {Team | null} [selectedTeam] - Выбранная команда (опционально).
 * @property {(team: Team) => void} onChange - Колбэк при изменении выбора команды.
 * @property {string} [label='Выбрать команду'] - Текст лейбла (опционально).
 * @property {Team[]} [teams] - Кастомный список команд (опционально).
 */
interface TeamSelectorProps {
  selectedTeam?: Team | null;
  onChange: (team: Team) => void;
  label?: string;
  teams?: Team[];
}

/**
 * Компонент выбора команды из списка.
 * Поддерживает как загрузку команд с сервера, так и использование переданного списка команд.
 * 
 * @component
 * @example
 * // Пример использования с загрузкой команд:
 * <TeamSelector
 *   onChange={(team) => handleTeamSelect(team)}
 * />
 * 
 * // Пример с кастомным списком команд:
 * <TeamSelector
 *   teams={customTeams}
 *   selectedTeam={currentTeam}
 *   label="Выберите команду"
 *   onChange={handleTeamChange}
 * />
 *
 * @param {TeamSelectorProps} props - Пропсы компонента.
 * @returns {JSX.Element} Выпадающий список команд или состояние загрузки/ошибки.
 */
export default function TeamSelector({
  selectedTeam,
  onChange,
  label = 'Выбрать команду',
  teams: propTeams,
}: TeamSelectorProps): JSX.Element {
  const { data: fetchedTeams, isLoading } = useGetTeamsQuery(); // Получаем команды с сервера
  const teams = propTeams || fetchedTeams; // Используем переданные команды или загруженные

  if (isLoading) return <Spin />; // Отображаем индикатор загрузки

  if (!teams || teams.length === 0) {
    return <div>Команды не найдены</div>; // Сообщение об отсутствии команд
  }

  return (
    <Select
      value={selectedTeam?.id ?? undefined}
      onChange={(id) => {
        const selected = teams.find((t) => t.id === id);
        if (selected) onChange(selected);
      }}
      placeholder={label}
      style={{ width: '100%' }}
      optionFilterProp="children"
      className="Selector"
      showSearch
    >
      {teams.map((team) => (
        <Option key={team.id} value={team.id}>
          {team.name}
        </Option>
      ))}
    </Select>
  );
}
