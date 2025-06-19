import { useEffect, useState } from 'react'; // Хуки React
import { useNotification } from 'Components/Common/Notification/Notification'; // Уведомления
import NameInputField from 'Components/Forms/NameInputField'; // Поле ввода названия
import DescriptionInputField from 'Components/Forms/DescriptioninputField'; // Поле ввода описания
import UserSelector from 'Components/Selectors/UserSelector'; // Селектор пользователей
import EventSelector from 'Components/Selectors/EventSelector'; // Селектор мероприятий
import { Direction, useUpdateDirectionMutation } from 'Features/ApiSlices/directionSlice'; // Типы и API направлений
import { Modal } from 'antd'; // Компонент модального окна
import { useUserRoles } from 'Features/context/UserRolesContext'; // Контекст ролей пользователя

type EditDirectionModalProps = {
    direction?: Direction;
    isOpen: boolean;
    onClose: () => void;
};

/**
 * Модальное окно для редактирования существующего направления.
 * Позволяет изменить название, описание, куратора и мероприятие направления.
 * 
 * @component
 * @example
 * // Пример использования:
 * <EditDirectionModal 
 *   direction={selectedDirection}
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 * />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {Direction} [props.direction] - Данные направления для редактирования.
 * @param {boolean} props.isOpen - Флаг видимости модального окна.
 * @param {function} props.onClose - Функция закрытия модального окна.
 *
 * @returns {JSX.Element} Модальное окно редактирования направления.
 */
export default function EditDirectionModal({
  direction,
  isOpen,
  onClose,
}: EditDirectionModalProps): JSX.Element {
  const { showNotification } = useNotification(); // Хук для показа уведомлений
  const [updateDirection, { isLoading }] = useUpdateDirectionMutation(); // Мутация для обновления направления
  const { hasRole } = useUserRoles(); // Проверка ролей пользователя

  // Состояние формы редактирования направления
  const [updatedDirection, setUpdatedDirection] = useState({
    ...direction,
    leader_id: direction?.leader ?? null,
  });

  // Эффект для обновления состояния при изменении направления
  useEffect(() => {
    setUpdatedDirection({
      ...direction,
      leader_id: direction?.leader ?? null,
    });
  }, [direction]);

  /**
   * Обработчик изменения полей ввода.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Событие изменения
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedDirection((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Обработчик изменения куратора направления.
   * @param {number | null} userId - ID выбранного пользователя
   */
  const handleCuratorChange = (userId: number | null) => {
    setUpdatedDirection((prev) => ({ 
      ...prev, 
      leader: userId,
      leader_id: userId
    }));
  };

  /**
   * Обработчик изменения мероприятия.
   * @param {any} event - Выбранное мероприятие
   */
  const handleEventChange = (event: any) => {
    setUpdatedDirection((prev) => ({ ...prev, event: event.event_id }));
  };

  /**
   * Обработчик отправки формы.
   * Валидирует данные и отправляет запрос на обновление направления.
   */
  const handleSubmit = async () => {
    if (!updatedDirection?.name?.trim() || !updatedDirection?.event) {
      showNotification('Заполните обязательные поля', 'error');
      return;
    }

    // Формируем payload без leader_id, если он не указан
    const payload = {
      id: updatedDirection.id,
      name: updatedDirection.name,
      description: updatedDirection.description,
      event: updatedDirection.event,
      // Добавляем leader_id только если он есть
      ...(updatedDirection.leader && { leader_id: updatedDirection.leader })
    };

    try {
      await updateDirection(payload);
      showNotification('Направление обновлено!', 'success');
      onClose();
    } catch (error) {
      showNotification('Ошибка при обновлении', 'error');
    }
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