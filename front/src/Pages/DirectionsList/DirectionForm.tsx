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

  const handleTextAtea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

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
      <form className="Form DirectionForm" onSubmit={existingDirection ? handleUpdateDirection : handleDirection}>
        <div className="FormHeader">
          <BackButton />
          <div className="">
            <h2>{existingDirection ? 'Редактирование направления' : 'Добавление направления'}</h2>
            <p>{stepEvent.name}</p>
          </div>
        </div>

        <div className="NameContainer">
          <input
            type="text"
            name="name"
            value={newDirection.name}
            onChange={handleInputChange}
            required
            placeholder="Название направления*"
            className="Name TextField FormField"
          />
          <textarea
            placeholder="Описание"
            className="Description TextField FormField"
            name="description"
            value={newDirection.description}
            onInput={handleTextAtea}
          />
        </div>

        <div className="FormButtons">
          <button className="primary-btn" type="submit" disabled={isUpdating}>
            {existingDirection ? 'Обновить' : 'Создать'}
            <ChevronRightIcon width="24" height="24" strokeWidth="1" />
          </button>

          <button
            className="primary-btn"
            type="button"
            onClick={handleNextStep}
          >
            Далее
            <ChevronRightIcon width="24" height="24" strokeWidth="1" />
          </button>
        </div>
      </form>

      <div className="DirectionList">
        <h3>Созданные направления:</h3>
        {stepDirections.directions.map((direction) => (
          <div key={direction.id} className="DirectionItem">
            <span>{direction.name}</span>
            <button onClick={() => handleRemoveDirection(direction.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  );
}
