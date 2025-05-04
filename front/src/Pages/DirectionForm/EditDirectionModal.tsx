import { useEffect, useState } from 'react';
import { useNotification } from 'Widgets/Notification/Notification'; 
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import UserSelector from 'Widgets/Selectors/UserSelector';
import EventSelector from 'Widgets/Selectors/EventSelector';
import { Direction, useUpdateDirectionMutation } from 'Features/ApiSlices/directionSlice';
import { Modal } from 'antd';

type EditDirectionModalProps = {
    direction?: Direction;
    isOpen: boolean;
    onClose: () => void;
};

export default function EditDirectionModal({
  direction,
  isOpen,
  onClose,
}: EditDirectionModalProps): JSX.Element {
  const { showNotification } = useNotification();
  const [updateDirection, { isLoading }] = useUpdateDirectionMutation();

  const [updatedDirection, setUpdatedDirection] = useState({
    ...direction,
    leader_id: direction.leader ?? null,
  });


  useEffect(() => {
    setUpdatedDirection({
      ...direction,
      leader_id: direction.leader ?? null,
    });
  }, [direction]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedDirection((prev) => ({ ...prev, [name]: value }));
  };

  const handleCuratorChange = (userId: number) => {
    setUpdatedDirection((prev) => ({ ...prev, leader: userId }));
  };

  const handleEventChange = (event: any) => {
    setUpdatedDirection((prev) => ({ ...prev, event: event.event_id }));
  };

  const handleSubmit = async () => {
    if (!updatedDirection.name.trim() || !updatedDirection.event) {
      return;
    }

    const payload = {
      ...updatedDirection,
      leader_id: updatedDirection.leader,
    };

    await updateDirection(payload);
    showNotification('Направление обновлено!', 'success');
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      title="Редактировать направление"
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Редактировать"
      cancelText="Отмена"
      className="EditFormModal"
      destroyOnClose
    >
      <div className="Form DirectionForm">
        <EventSelector
          selectedEvent={updatedDirection.event}
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
            maxRows={10}
          />
        </div>

        <UserSelector
          selectedUserId={updatedDirection.leader}
          onChange={handleCuratorChange}
          label="Добавить руководителя"
        />
      </div>
    </Modal>
  );
}