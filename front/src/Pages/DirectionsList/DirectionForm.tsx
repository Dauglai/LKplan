import React, { useState, useEffect } from 'react';
import { 
  Direction,
  useUpdateDirectionMutation} from 'Features/ApiSlices/directionSlice';
import { useNotification } from 'Widgets/Notification/Notification';
import 'Styles/FormStyle.scss';
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import { useDispatch, useSelector } from 'react-redux';
import { addDirection, removeDirection } from 'Features/store/eventSetupSlice';
import BackButton from 'Widgets/BackButton/BackButton';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import "Styles/FormSelectorStyle.scss";
import CloseIcon from 'assets/icons/close.svg?react';

export default function DirectionForm({ 
  existingDirection,
}: {
  existingDirection?: Direction;
}): JSX.Element {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [updateDirection, { isLoading: isUpdating }] = useUpdateDirectionMutation();
  const { stepEvent } = useSelector((state: any) => state.event);
  const { showNotification } = useNotification();
  const { stepDirections } = useSelector((state: any) => state.event || []);

  const [newDirection, setNewDirection] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (existingDirection) {
      setNewDirection(existingDirection);
    }
  }, [existingDirection]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDirection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDirection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDirection.name.trim()) {
      setNewDirection({ name: '', description: '' });
      showNotification('Направление создано!', 'success');
      dispatch(addDirection(newDirection));  // Сохраняем в хранилище
    }
  };

  const handleUpdateDirection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDirection.name.trim()) {
      await updateDirection(newDirection);
      showNotification('Направление обновлено!', 'success');
      dispatch(addDirection(newDirection));  // Сохраняем в хранилище
    }
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    setNewDirection((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNextStep = () => {
    navigate("/projects-setup")
  };

  const handleRemoveDirection = (id: string) => {
    dispatch(removeDirection(id));  // Удаляем направление по id
  };

  return (
    <div className="FormContainer">
      <div className="FormHeader">
          <BackButton />
          <div className="">
            <h2>{existingDirection ? 'Редактирование направления' : 'Добавление направления'}</h2>
            <p>{stepEvent.name}</p>
          </div>
        </div>

      <form className="Form DirectionForm" onSubmit={existingDirection ? handleUpdateDirection : handleDirection}>

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
            onChange={handleTextArea}
            placeholder="Описание направления"
          />
        </div>

        <div className="FormButtons">
          <button className="primary-btn" type="submit" disabled={isUpdating}>
            {existingDirection ? 'Обновить' : 'Создать направление'}
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

      {
        stepDirections.directions && stepDirections.directions.length > 0 && (
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
        )
      }
    </div>
  );
}
