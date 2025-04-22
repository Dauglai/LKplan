import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from 'Widgets/Notification/Notification'; 
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import UserSelector from 'Widgets/Selectors/UserSelector';
import EventSelector from 'Widgets/Selectors/EventSelector';
import { Direction, useUpdateDirectionMutation } from 'Features/ApiSlices/directionSlice';

type EditDirectionFormProps = {
    direction?: Direction;
};

export default function EditDirectionForm({ direction }: EditDirectionFormProps): JSX.Element {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [updateDirection, { isLoading }] = useUpdateDirectionMutation();

  const [updatedDirection, setUpdatedDirection] = useState(direction);

  // Когда пропс изменится, обновим форму
  useEffect(() => {
    setUpdatedDirection(direction);
  }, [direction]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedDirection((prev) => ({ ...prev, [name]: value }));
  };

  const handleCuratorChange = (userId: number) => {
    setUpdatedDirection((prev) => ({ ...prev, leader_id: userId }));
  };

  const handleEventChange = (event: any) => {
    setUpdatedDirection((prev) => ({ ...prev, event_id: event.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatedDirection.name.trim() || !updatedDirection.event_id) {
      // Можно добавить уведомление или валидацию, если событие не выбрано
      return;
    }

    await updateDirection(updatedDirection);
    showNotification('Направление обновлено!', 'success');
    navigate(-1); // Возвращаемся на предыдущую страницу или куда нужно
  };

  return (
    <form className="Form DirectionForm" onSubmit={handleSubmit}>
      <div className="FormHeader">
        <h2>Редактирование направления</h2>
      </div>

      {/* Селектор мероприятия, выбираем из существующего события */}
      <EventSelector
        selectedEventId={updatedDirection.event_id}
        onChange={handleEventChange}
      />

      <div className="NameContainer">
        <NameInputField
          name="name"
          value={updatedDirection.name}
          onChange={handleInputChange}
          placeholder="Название направления"
          required
        />
        <DescriptionInputField
          name="description"
          value={updatedDirection.description}
          onChange={handleInputChange}
          placeholder="Описание направления"
        />
      </div>

      <UserSelector
        selectedUserId={updatedDirection.leader_id}
        onChange={handleCuratorChange}
        label="Добавить руководителя"
      />

      <div className="FormButtons">
        <button className="primary-btn" type="submit" disabled={isLoading}>
          Обновить направление
        </button>
      </div>
    </form>
  );
}