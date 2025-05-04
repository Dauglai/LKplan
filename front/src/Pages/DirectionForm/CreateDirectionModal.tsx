import { useState } from 'react';
import { useCreateDirectionMutation } from 'Features/ApiSlices/directionSlice';
import { useNotification } from 'Components/Common/Notification/Notification'; 
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import UserSelector from 'Components/Selectors/UserSelector';
import EventSelector from 'Components/Selectors/EventSelector';
import { Modal } from 'antd';

interface CreateDirectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateDirectionModal({ isOpen, onClose }: CreateDirectionModalProps): JSX.Element {
  const { showNotification } = useNotification();
  const [createDirection, { isLoading }] = useCreateDirectionMutation();

  const [newDirection, setNewDirection] = useState({
    name: '',
    description: '',
    leader_id: null,
    event: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDirection((prev) => ({ ...prev, [name]: value }));
  };

  const handleCuratorChange = (userId: number) => {
    setNewDirection((prev) => ({ ...prev, leader_id: userId }));
  };

  const handleEventChange = (event: any) => {
    setNewDirection((prev) => ({ ...prev, event: event.event_id }));
  };

  const handleSubmit = async () => {
    if (!newDirection.name.trim() || !newDirection.event) return;

    await createDirection(newDirection);
    showNotification('Направление создано!', 'success');
    onClose();

    // Сброс значений после закрытия
    setNewDirection({
      name: '',
      description: '',
      leader_id: null,
      event: null,
    });
  };

  return (
    <Modal
      open={isOpen}
      title="Создать направление"
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Создать"
      cancelText="Отмена"
      className="CreateFormModal"
      destroyOnClose
    >
      <div className="Form DirectionForm">
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
      </div>
    </Modal>
  );
}
