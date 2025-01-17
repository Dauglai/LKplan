import React, { useState } from 'react';
import { useCreateDirectionMutation } from 'Features/ApiSlices/directionSlice';
import { useNotification } from 'Widgets/Notification/Notification';
import CreateEventHeader from 'Widgets/CreateFormHeader/CreateFormHeader';
import 'Styles/CreateFormStyle.scss';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import EventSelector from 'Widgets/Selectors/EventSelector';

export default function CreateDirectionForm({ closeModal }: { closeModal: () => void }): JSX.Element {
  const [createDirection, { isLoading: isCreating }] = useCreateDirectionMutation();
  const { showNotification } = useNotification();

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
      showNotification('Направление создано!', 'success');
      closeModal();
    }
  };

  const handleEventChange = (selected: number) => {
    setNewDirection((prev) => ({
      ...prev,
      event: selected,
    }));
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

            <EventSelector
              selectedEventId={newDirection.event}
              onChange={handleEventChange}
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
        
            <div className="FormButtons">
              <button className="primary-btn" type="submit">
                Создать
                <ChevronRightIcon width="24" height="24" strokeWidth="1"/>
              </button>
            </div>
        </form>
        </div>
    </div>
  );
}