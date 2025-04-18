import { Team, useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import { Select, Spin } from 'antd';
const { Option } = Select;
import "Styles/FormSelectorStyle.scss";

interface TeamSelectorProps {
  selectedTeam?: Team | null;
  onChange: (team: Team) => void;
  label?: string;
  teams?: Team[];
}

export default function TeamSelector({
  selectedTeam,
  onChange,
  label = 'Выбрать команду',
  teams: propTeams,
}: TeamSelectorProps): JSX.Element {
  const { data: fetchedTeams, isLoading } = useGetTeamsQuery();
  const teams = propTeams || fetchedTeams;

  if (isLoading) return <Spin />;

  if (!teams || teams.length === 0) {
    return <div>Команды не найдены</div>;
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
