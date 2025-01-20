import React, { useState, useEffect } from 'react';
import { 
  Direction, 
  useCreateDirectionMutation,  
  useUpdateDirectionMutation} from 'Features/ApiSlices/directionSlice';
import { useNotification } from 'Widgets/Notification/Notification';
import 'Styles/FormStyle.scss';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import CloseIcon from 'assets/icons/close.svg?react';
import EventSelector from 'Widgets/Selectors/EventSelector';


export default function DirectionForm({ 
  closeModal,
  existingDirection,
}:{
  closeModal: () => void; 
  existingDirection?: Direction;}): JSX.Element {
  const [createDirection, { isLoading: isCreating }] = useCreateDirectionMutation();
  const [updateDirection, { isLoading: isUpdating }] = useUpdateDirectionMutation();
  const { showNotification } = useNotification();

  const [newDirection, setNewDirection] = useState({
    event: 0,
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
      await createDirection(newDirection);
      setNewDirection({ event: 0, name: '', description: '' });
      showNotification('Направление создано!', 'success');
      closeModal();
    }
  };

  const handleUpdateDirection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDirection.name.trim()) {
      await updateDirection(newDirection);
      showNotification('Направление обновлено!', 'success');
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
    <div className="FormContainer">
        <form  className="Form DirectionForm"
          onSubmit={existingDirection ? handleUpdateDirection : handleDirection}>
              
            <div className="ModalFormHeader">
              <h2>{existingDirection ? 'Редактирование направления' : 'Добавление направления'}</h2>
              <CloseIcon width="24" height="24" strokeWidth="1" onClick={closeModal} className="ModalCloseButton"/>
            </div>

            <EventSelector
              selectedEventId={newDirection.event}
              onChange={handleEventChange}
            />

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
              <button className="primary-btn" type="submit" disabled={isCreating || isUpdating}>
                {existingDirection ? 'Обновить' : 'Создать'}
                <ChevronRightIcon width="24" height="24" strokeWidth="1" />
              </button>
            </div>
        </form>
    </div>
  );
}