import React, { useState, useEffect } from 'react';
import { 
  Direction,
  useCreateDirectionMutation,
  useUpdateDirectionMutation} from 'Features/ApiSlices/directionSlice';
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

type DirectionFormProps = {
  mode: 'setup' | 'create' | 'edit';
  existingDirection?: Direction;
};

export default function DirectionForm({
  mode,
  existingDirection,
}: DirectionFormProps): JSX.Element {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: user } = useGetUserQuery();
  const [createDirection] = useCreateDirectionMutation();
  const [updateDirection, { isLoading: isUpdating }] = useUpdateDirectionMutation();
  const { stepEvent, stepDirections } = useSelector((state: any) => state.event);
  const { showNotification } = useNotification();

  const [newDirection, setNewDirection] = useState({
    name: '',
    description: '',
    leader_id: existingDirection?.leader_id || null,
    event: existingDirection?.event_id || stepEvent?.id || null,
  });
  

  useEffect(() => {
    if (existingDirection) {
      setNewDirection(existingDirection);
    }
  }, [existingDirection]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDirection((prev) => ({ ...prev, [name]: value }));
  };

  const handleCuratorChange = (userId: number) => {
    setNewDirection((prev) => ({ ...prev, leader_id: userId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirection.name.trim()) return;

    if (mode === 'setup') {
      dispatch(addDirection({ ...newDirection, leader_id: user?.user_id }));
      showNotification('Направление добавлено локально!', 'success');
      setNewDirection({ name: '', description: '', leader_id: user?.user_id, event: stepEvent?.id });
    }

    if (mode === 'create') {
      await createDirection(newDirection);
      showNotification('Направление создано!', 'success');
    }

    if (mode === 'edit') {
      await updateDirection(newDirection);
      showNotification('Направление обновлено!', 'success');
    }
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
        {mode === 'create' || mode === 'edit' ? <BackButton /> : null}
        <div>
          <h2>
            {mode === 'edit'
              ? 'Редактирование направления'
              : 'Добавление направления'}
          </h2>
          <p>{mode === 'create' ? selectedEvent?.name : stepEvent?.name}</p>
        </div>
      </div>

      <form className="Form DirectionForm" onSubmit={handleSubmit}>
      {mode === 'create' && (
            <EventSelector
              onChange={(event) =>
                setNewDirection((prev) => ({ ...prev, event_id: event.id }))
              }
            />
          )}


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
          <button className="primary-btn" type="submit" disabled={isUpdating}>
            {mode === 'edit' ? 'Обновить' : 'Создать направление'}
          </button>

          {mode === 'setup' && (
            <button
              className="primary-btn"
              type="button"
              onClick={handleNextStep}
            >
              Настройка проектов
              <ChevronRightIcon width="24" height="24" strokeWidth="1" />
            </button>
          )}
        </div>
      </form>

      {mode === 'setup' &&
        stepDirections?.directions?.length > 0 && (
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

