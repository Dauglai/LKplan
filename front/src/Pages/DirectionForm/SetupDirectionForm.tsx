import React, { useState, useEffect } from 'react';
import { useCreateDirectionMutation} from 'Features/ApiSlices/directionSlice';
import { useNotification } from 'Widgets/Notification/Notification';
import 'Styles/FormStyle.scss';
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import { useDispatch, useSelector } from 'react-redux';
import { addDirection, removeDirection } from 'Features/store/eventSetupSlice';
import BackButton from 'Widgets/BackButton/BackButton';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptionInputField.tsx';
import "Styles/FormSelectorStyle.scss";
import CloseIcon from 'assets/icons/close.svg?react';
import UserSelector from 'Widgets/Selectors/UserSelector';
import { useGetUserQuery } from 'Features/ApiSlices/userSlice';
import EventSelector from 'Widgets/Selectors/EventSelector';

export default function SetupDirectionForm(): JSX.Element {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: user } = useGetUserQuery();
  const [createDirection] = useCreateDirectionMutation();
  const { stepEvent, stepDirections } = useSelector((state: any) => state.event);
  const { showNotification } = useNotification();

  const [newDirection, setNewDirection] = useState({
    name: '',
    description: '',
    leader_id: null,
    event: stepEvent?.id || null,
  });
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDirection((prev) => ({ ...prev, [name]: value }));
  };

  const handleCuratorChange = (userId: number) => {
    setNewDirection((prev) => ({ ...prev, leader_id: userId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(stepDirections.directions)
    e.preventDefault();
    if (!newDirection.name.trim()) return;

    dispatch(addDirection(newDirection));
    showNotification('Направление добавлено локально!', 'success');
    setNewDirection({ name: '', description: '', leader_id: null, event: stepEvent?.id });
  };

  const handleNextStep = () => {
    navigate('/projects-setup');
  };

  const handleRemoveDirection = (id: string) => {
    dispatch(removeDirection(id));
  };
  
  

  return (
    <div className="FormContainer">
      <div className="FormHeader">
        <BackButton />
        <div>
          <h2>Добавление направления</h2>
          <p>{stepEvent?.name}</p>
        </div>
      </div>

      <form className="Form DirectionForm" onSubmit={handleSubmit}>

        <div className="NameContainer">
          <NameInputField
            name="name"
            value={newDirection.name}
            onChange={handleInputChange}
            placeholder="Название направления"
            required
          />
          <DescriptionInputField
            name="description"
            value={newDirection.description}
            onChange={handleInputChange}
            placeholder="Описание направления"
          />
        </div>

        <UserSelector
          selectedUserId={newDirection.leader_id}
          onChange={handleCuratorChange}
          label="Добавить руководителя"
        />

        <div className="FormButtons">
          <button className="primary-btn" type="submit">
            Добавить направление
          </button>
            <button
              className="primary-btn"
              type="button"
              onClick={handleNextStep}
            >
              Настройка проектов
              <ChevronRightIcon width="24" height="24" strokeWidth="1" />
            </button>
        </div>
      </form>

        {stepDirections?.directions?.length > 0 && (
          <div className="DirectionList">
            <h3>Созданные направления:</h3>
            <ul className="SelectedList">
              {stepDirections.directions.map((direction) => (
                <li key={direction.id} className="SelectedListItem">
                  {direction.name}
                  <CloseIcon
                    className="RemoveIcon"
                    width="16"
                    height="16"
                    strokeWidth="1.5"
                    onClick={() => handleRemoveDirection(direction.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}

