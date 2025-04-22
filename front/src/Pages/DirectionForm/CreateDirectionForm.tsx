import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateDirectionMutation } from 'Features/ApiSlices/directionSlice';
import { useNotification } from 'Widgets/Notification/Notification'; 
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import UserSelector from 'Widgets/Selectors/UserSelector';
import EventSelector from 'Widgets/Selectors/EventSelector';

export default function CreateDirectionForm(): JSX.Element {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
  
    const [createDirection, { isLoading }] = useCreateDirectionMutation();
  
    const [newDirection, setNewDirection] = useState({
      name: '',
      description: '',
      leader_id: null,
      event_id: null,
    });
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewDirection((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleCuratorChange = (userId: number) => {
      setNewDirection((prev) => ({ ...prev, leader_id: userId }));
    };
  
    const handleEventChange = (event: any) => {
      setNewDirection((prev) => ({ ...prev, event_id: event.id }));
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newDirection.name.trim() || !newDirection.event_id) {
        // Можно добавить уведомление или валидацию, если событие не выбрано
        return;
      }
  
      await createDirection(newDirection);
      showNotification('Направление создано!', 'success');
    };
  
    return (
      <form className="Form DirectionForm" onSubmit={handleSubmit}>
        <div className="FormHeader">
          <h2>Создание направления</h2>
        </div>
  
        <EventSelector onChange={handleEventChange} />
  
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
          <button className="primary-btn" type="submit" disabled={isLoading}>
            Создать направление
          </button>
        </div>
      </form>
    );
  }
