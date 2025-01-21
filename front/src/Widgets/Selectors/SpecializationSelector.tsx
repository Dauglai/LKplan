import { useState } from 'react';
import { useGetSpecializationsQuery } from 'Features/ApiSlices/specializationSlice';
import "Styles/FormSelectorStyle.scss";
import CloseIcon from 'assets/icons/close.svg?react';
import PlusIcon from 'assets/icons/plus.svg?react';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';


interface SpecializationSelectorProps {
  selectedSpecializations: number[];
  onChange: (selectedIds: number[]) => void;
  label?: string;
  isSingleSelect?: boolean;
}

export default function SpecializationSelector({
  selectedSpecializations = [],
  onChange,
  label = "Добавить специализацию*",
  isSingleSelect = false,
}: SpecializationSelectorProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const { data: allSpecializations, isLoading } = useGetSpecializationsQuery();

  const handleToggleSpecialization = (id: number) => {
    const updatedSpecializations = isSingleSelect
      ? [id]
      : selectedSpecializations.includes(id)
      ? selectedSpecializations.filter((specializationId) => specializationId !== id)
      : [...selectedSpecializations, id];
    onChange(updatedSpecializations);
  };

  const handleRemoveSpecialization = (id: number) => {
    const updatedSpecializations = selectedSpecializations.filter(
      (specializationId) => specializationId !== id
    );
    onChange(updatedSpecializations);
  };

  const selectedSpecializationName = isSingleSelect && selectedSpecializations.length > 0 
    ? allSpecializations?.find((s) => s.id === selectedSpecializations[0])?.name 
    : null;

  if (isLoading) {
    return <div className="FormField">Загрузка...</div>;
  }


  return (
    <div className="SpecializationSelector SelectorContainer">
      <div
        className="ListField FormField"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <p>{isSingleSelect && selectedSpecializationName ? selectedSpecializationName : label}</p>

        {isSingleSelect ? (
          <ChevronRightIcon
            width="20"
            height="20"
            strokeWidth="1"
            className={`ChevronDown ${isOpen ? "open" : ""}`}
          />
        ) : (
          <PlusIcon width="20" height="20" strokeWidth="1" />
        )}

        {isOpen && (
          <div className="DropdownList">
            {allSpecializations?.map((specialization) => (
              <div
                key={specialization.id}
                className={`DropdownItem ${
                  selectedSpecializations.includes(specialization.id) ? "selected" : ""
                }`}
                onClick={() => handleToggleSpecialization(specialization.id)}
              >
                {specialization.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {!isSingleSelect && selectedSpecializations.length > 0 && (
        <ul className="SelectedSpecializations SelectedList">
          {selectedSpecializations.map((specializationId) => {
            const specialization = allSpecializations?.find((s) => s.id === specializationId);
            return specialization ? (
              <li className="SelectedListItem" key={specialization.id}>
                {specialization.name}
                <CloseIcon
                  className="RemoveIcon"
                  width="16"
                  height="16"
                  strokeWidth="1.5"
                  onClick={() => handleRemoveSpecialization(specialization.id)}
                />
              </li>
            ) : null;
          })}
        </ul>
      )}
    </div>
  );
}

