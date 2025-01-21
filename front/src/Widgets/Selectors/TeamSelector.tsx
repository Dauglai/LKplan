import { useState } from 'react';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

interface TeamSelectorProps {
  selectedTeamId: number | null;
  onChange: (teamId: number) => void;
  label? : string;
  teams?: [];
}

export default function TeamSelector({
  selectedTeamId,
  onChange,
  label = "Выбрать команду",
  teams: propTeams,
}: TeamSelectorProps): JSX.Element {
  const { data: fetchedTeams, isLoading, error } = useGetTeamsQuery();
  const [isOpen, setIsOpen] = useState(false);

  const teams = propTeams || fetchedTeams;

  const handleSelectTeam = (teamId: number) => {
    onChange(teamId);
  };

  if (isLoading) {
    return <div className="TeamSelector FormField">Загрузка команд...</div>;
  }

  if (error || !teams || teams.length === 0) {
    return <div className="TeamSelector FormField">Команды не найдены</div>;
  }

  const selectedteamName = teams.find(team => team.id === selectedTeamId)?.name || label;

  return (
    <div className="TeamSelector">
      <div
        className="ListField FormField"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <p>{selectedteamName}</p>
        <ChevronRightIcon
          width="20"
          height="20"
          strokeWidth="1"
          className={`ChevronDown ${isOpen ? 'open' : ''}`}
        />

        {isOpen && (
          <div className="DropdownList">
            {teams.map(team => (
              <div
                key={team.id}
                className={`DropdownItem ${selectedTeamId === team.id ? 'selected' : ''}`}
                onClick={() => handleSelectTeam(team.id)}
              >
                {team.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}