import { useState } from 'react'; // Хуки React
import { useCreateDirectionMutation } from 'Features/ApiSlices/directionSlice'; // API для работы с направлениями
import { useNotification } from 'Components/Common/Notification/Notification'; // Уведомления
import NameInputField from 'Components/Forms/NameInputField'; // Поле ввода названия
import DescriptionInputField from 'Components/Forms/DescriptioninputField'; // Поле ввода описания
import UserSelector from 'Components/Selectors/UserSelector'; // Селектор пользователей
import EventSelector from 'Components/Selectors/EventSelector'; // Селектор мероприятий
import { Modal } from 'antd'; // Компонент модального окна

interface CreateDirectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Модальное окно для создания нового направления.
 * Позволяет задать название, описание, выбрать куратора и мероприятие для направления.
 * 
 * @component
 * @example
 * // Пример использования:
 * <CreateDirectionModal 
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 * />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {boolean} props.isOpen - Флаг видимости модального окна.
 * @param {function} props.onClose - Функция закрытия модального окна.
 *
 * @returns {JSX.Element} Модальное окно создания направления.
 */
export default function CreateDirectionModal({ isOpen, onClose }: CreateDirectionModalProps): JSX.Element {
  const { showNotification } = useNotification(); // Хук для показа уведомлений
  const [createDirection, { isLoading }] = useCreateDirectionMutation(); // Мутация для создания направления

  // Состояние формы нового направления
  const [newDirection, setNewDirection] = useState({
    name: '',
    description: '',
    leader_id: null,
    event: null,
  });

  /**
   * Обработчик изменения полей ввода.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Событие изменения
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDirection((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Обработчик изменения куратора направления.
   * @param {number | null} userId - ID выбранного пользователя
   */
  const handleCuratorChange = (userId: number | null) => {
    setNewDirection((prev) => ({ ...prev, leader_id: userId }));
  };

  /**
   * Обработчик изменения мероприятия.
   * @param {any} event - Выбранное мероприятие
   */
  const handleEventChange = (event: any) => {
    setNewDirection((prev) => ({ ...prev, event: event.event_id }));
  };

  /**
   * Обработчик отправки формы.
   * Валидирует данные и отправляет запрос на создание направления.
   */
  const handleSubmit = async () => {
    if (!newDirection.name.trim() || !newDirection.event) {
      showNotification('Заполните обязательные поля', 'error');
      return;
    }

    const payload = {
      name: newDirection.name,
      description: newDirection.description,
      event: newDirection.event,
      ...(newDirection.leader_id && { leader_id: newDirection.leader_id })
    };

    try {
      await createDirection(payload);
      showNotification('Направление создано!', 'success');
      onClose();
      
      // Сброс формы
      setNewDirection({
        name: '',
        description: '',
        leader_id: null,
        event: null,
      });
    } catch (error) {
      showNotification('Ошибка при создании направления', 'error');
    }
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
