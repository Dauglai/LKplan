import { useState } from 'react';
import { useGetStatusesAppQuery } from 'Features/ApiSlices/statusAppSlice';
import "Styles/FormSelectorStyle.scss";
import CloseIcon from 'assets/icons/close.svg?react';
import PlusIcon from 'assets/icons/plus.svg?react';


interface StatusAppSelectorProps {
  selectedStatusesApp: number[];
  onChange: (selectedIds: number[]) => void;
}

export default function StatusAppSelector({
  selectedStatusesApp,
  onChange,
}: StatusAppSelectorProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const { data: allStatusesApp, isLoading } = useGetStatusesAppQuery();

  const handleToggleStatusApp = (id: number) => {
    const updatedStatusesApp = selectedStatusesApp.includes(id)
      ? selectedStatusesApp.filter(statusAppId => statusAppId !== id)
      : [...selectedStatusesApp, id];
    onChange(updatedStatusesApp);
  };

  const handleRemoveStatusApp = (id: number) => {
    const updatedStatusesApp = selectedStatusesApp.filter(statusAppId => statusAppId !== id);
    onChange(updatedStatusesApp);
  };

  if (isLoading) {
    return <div className="FormField">Загрузка...</div>;
  }

  return (
    <div className="StatusAppSelector SelectorContainer">
      <div
        className="ListField FormField"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <p>Добавить статус*</p>
        <PlusIcon width="20" height="20" strokeWidth="1" />

        {isOpen && (
          <div className="DropdownList">
            {allStatusesApp?.map(statusApp => (
              <div
                key={statusApp.id}
                className={`DropdownItem ${selectedStatusesApp.includes(statusApp.id) ? 'selected' : ''}`}
                onClick={() => handleToggleStatusApp(statusApp.id)}
              >
                {statusApp.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStatusesApp.length > 0 && (
        <ul className="selectedStatusesApp SelectedList">
          {selectedStatusesApp.map(statusAppId => {
            const statusApp = allStatusesApp?.find(s => s.id === statusAppId);
            return statusApp ? (
              <li className="SelectedListItem" key={statusApp.id}>
                {statusApp.name}
                <CloseIcon
                  className="RemoveIcon"
                  width="16"
                  height="16"
                  strokeWidth="1.5"
                  onClick={() => handleRemoveStatusApp(statusApp.id)}
                />
              </li>
            ) : null;
          })}
        </ul>
      )}
    </div>
  );
}
