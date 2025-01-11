//import { useDispatch, useSelector } from 'react-redux';
import PlusIcon from 'assets/icons/plus.svg?react';
//import CloseIcon from 'assets/icons/close.svg?react';
//import { RootState } from 'App/model/store.ts';
import { useState } from 'react';
//import { Event, setCurrentEvent } from 'Features/Forms/model/eventFormModelSlice';

//import "./FormSelectorStyle.scss";

interface Direction {
  id: number;
  name: string;
}

export const allDirections: Direction[] = [
    { id: 0, name: 'Игроделы' },
    { id: 1, name: '1С' },
    { id: 2, name: 'Веб-разработка' },
];

interface DirectionSelectorProps {
    selectedDirections: number[];
    onChange: (selected: number[]) => void;
}

export default function DirectionSelector({ 
    selectedDirections,
    onChange,
  }: DirectionSelectorProps): JSX.Element {


  

  const [isOpen, setIsOpen] = useState(false);

  /*const handleToggleDirection = (id: string) => {
    const newDirections = selectedDirections.includes(id)
      ? selectedDirections.filter(directionId => directionId !== id)
      : [...selectedDirections, id];

    if (formData) {
      dispatch(
        setCurrentEvent({
          ...formData,
          directions: newDirections,
        })
      );
    }
  }; */

  const handleToggleDirection = (id: number) => {
    const updatedDirections = selectedDirections.includes(id)
      ? selectedDirections.filter(directionId => directionId !== id)
      : [...selectedDirections, id];
    onChange(updatedDirections);
  };

  /*const handleRemoveDirection = (id: number) => {
    const newDirections = selectedDirections.filter(directionId => directionId !== id);

    if (formData) {
      dispatch(
        setCurrentEvent({
          ...formData,
          directions: newDirections,
        })
      );
    }
  };*/

  const handleRemoveDirection = (id: number) => {
    const updatedDirections = selectedDirections.filter(directionId => directionId !== id);
    onChange(updatedDirections);
  };

  return (
    <>
      <div
        className="ListField EventFormField"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <p>Направления</p>
        <PlusIcon width="20" height="20" strokeWidth="1" />

        {isOpen && (
          <div className="DropdownList">
            {allDirections.map(direction => (
              <div
                key={direction.id}
                className={`DropdownItem ${selectedDirections.includes(direction.id) ? 'selected' : ''}`}
                onClick={() => handleToggleDirection(direction.id)}
              >
                {direction.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedDirections.length > 0 && (
        <ul className="SelectedDirections SelectedList">
          {selectedDirections.map(directionId => {
            const direction = allDirections.find(d => d.id === directionId);
            return direction ? (
              <li className="SelectedListItem" key={direction.id} onClick={() => handleRemoveDirection(direction.id)}>
                {direction.name}
                {/*<CloseIcon
                  className="RemoveIcon"
                  width="16"
                  height="16"
                  strokeWidth="1.5"
                  onClick={() => handleRemoveDirection(direction.id)}
                />*/}
              </li>
            ) : null;
          })}
        </ul>
      )}
    </>
  );
}