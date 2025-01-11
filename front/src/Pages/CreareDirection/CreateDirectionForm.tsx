import React, { useState } from 'react';
import {
  useGetDirectionsQuery,
  useCreateDirectionMutation,
  useDeleteDirectionMutation,
} from 'Features/ApiSlices/directionSlice';

import CreateEventHeader from 'Widgets/CreateFormHeader/CreateFormHeader';
import 'Styles/CreateFormStyle.scss';
import './СreateDirectionForm.scss';
import SubmitButtons from 'Widgets/buttons/SubmitButtons';
import TrashIcon from 'assets/icons/trash-2.svg?react';

export default function CreateDirectionForm(): JSX.Element {
  const { data: directions, isLoading, isError } = useGetDirectionsQuery();
  const [createDirection, { isLoading: isCreating }] = useCreateDirectionMutation();
  const [deleteDirection, { isLoading: isDeleting }] = useDeleteDirectionMutation();

  const [newDirection, setNewDirection] = useState({
    event: 0,
    name: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDirection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateDirection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDirection.name.trim()) {
      await createDirection(newDirection);
      setNewDirection({ event: 0, name: '', description: '' });
    }
  };

  const handleDeleteDirection = async (id: number) => {
    await deleteDirection(id);
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

  return (
    <div className="CreateContainer">
        <div className="CreateFormContainer">
        <form  className="CreateForm CreateDirectionForm"  onSubmit={handleCreateDirection}>
            <CreateEventHeader label="Добавление направления" />
            <input
            type="number"
            name="event"
            value={newDirection.event}
            onChange={handleInputChange}
            placeholder="ID мероприятия"
            className="TextField FormField"
            />

            <div className="CreateNameContainer">
                <input
                type="text"
                name="name"
                value={newDirection.name}
                onChange={handleInputChange}
                required
                placeholder="Название направления"
                className="CreateName TextField FormField"
                />
                <textarea
                placeholder="Описание (опционально)"
                className="CreateDescription TextField FormField"
                name="description"
                value={newDirection.description}
                onInput={handleTextAtea}
                />
            </div>
        
            <SubmitButtons label="Создать" />
        </form>
        </div>

        <div className="ListResults">
            <h3>Список направлений</h3>
            {isLoading ? (
                <p>Загрузка...</p>
            ) : isError ? (
                <p>Ошибка при загрузке направлений.</p>
            ) : (
                <ul>
                {directions?.map((direction) => (
                    <li key={direction.id}>
                        <div>
                            <h4>{direction.name}</h4>
                            <p>Описание: {direction.description || 'Нет описания'}</p>
                            <p>Мероприятие ID: {direction.event}</p>
                        </div>
                        <button 
                            className="DeleteButton lfp-btn"
                            onClick={() => handleDeleteDirection(direction.id)}
                            disabled={isDeleting}>
                            <TrashIcon width="20" height="20" strokeWidth="2"/>
                        </button>
                    </li>
                ))}
                </ul>
        )}
      </div>
    </div>
  );
}