import { useEffect, useState } from 'react';
import { useNotification } from 'Components/Common/Notification/Notification'; 
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import UserSelector from 'Components/Selectors/UserSelector';
import EventSelector from 'Components/Selectors/EventSelector';
import { Direction, useUpdateDirectionMutation } from 'Features/ApiSlices/directionSlice';
import { Modal } from 'antd';
import { useUserRoles } from 'Features/context/UserRolesContext';

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
  const { hasRole } = useUserRoles();

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
        {hasRole('organizer') && (
          <EventSelector
          selectedEvent={updatedDirection.event}
          onChange={handleEventChange}
          />
        )}
        

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

        {hasRole('organizer') && (
          <UserSelector
            selectedUserId={updatedDirection.leader}
            onChange={handleCuratorChange}
            label="Добавить руководителя"
          />
        )}
      </div>
    </Modal>
  );
}