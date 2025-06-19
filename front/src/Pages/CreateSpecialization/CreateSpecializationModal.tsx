import { useState } from 'react';
import {
  useCreateSpecializationMutation,
  useGetSpecializationsQuery,
  useDeleteSpecializationMutation
} from 'Features/ApiSlices/specializationSlice';

import 'Styles/FormStyle.scss';
import './CreateSpecializationModal.scss';
import TrashIcon from 'assets/icons/trash-2.svg?react';
import { Modal, Button } from 'antd';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import { useNotification } from 'Components/Common/Notification/Notification';

interface CreateSpecializationModalProps {
  visible: boolean;
  onClose: () => void;
  onSpecializationCreated?: () => void;
}

/**
 * Модальное окно для создания и управления специализациями.
 * Позволяет создавать новые специализации, просматривать существующие и удалять их.
 * 
 * @component
 * @example
 * // Пример использования:
 * <CreateSpecializationModal 
 *   visible={isModalVisible} 
 *   onClose={() => setIsModalVisible(false)}
 *   onSpecializationCreated={refetchSpecializations}
 * />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {boolean} props.visible - Флаг видимости модального окна.
 * @param {function} props.onClose - Функция закрытия модального окна.
 * @param {function} [props.onSpecializationCreated] - Callback, вызываемый после успешного создания специализации.
 *
 * @returns {JSX.Element} Модальное окно управления специализациями.
 */
export default function CreateSpecializationModal({
  visible,
  onClose,
  onSpecializationCreated,
}: CreateSpecializationModalProps) {
  // Мутации и запросы для работы со специализациями
  const [createSpecialization, { isLoading: isCreating }] = useCreateSpecializationMutation();
  const { data: specializations, isLoading, isError, refetch } = useGetSpecializationsQuery();
  const [deleteSpecialization] = useDeleteSpecializationMutation();
  const { showNotification } = useNotification();
  
  // Состояния для формы
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  /**
   * Обработчик создания новой специализации.
   * Валидирует введенные данные, отправляет запрос на создание и обновляет список.
   * 
   * @param {React.FormEvent} e - Событие формы.
   */
  const handleCreateSpecialization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!name.trim()) {
        showNotification('Введите название специализации', 'error');
        return;
      }

      const result = await createSpecialization({ name, description }).unwrap();
      setName('');
      setDescription('');
      await refetch();
      onSpecializationCreated?.();
      showNotification('Специализация создана!', 'success');
    } catch (error) {
      showNotification('Ошибка при создании специализации', 'error');
      console.error('Create specialization error:', error);
    }
  };

  /**
   * Обработчик удаления специализации.
   * 
   * @param {number} id - ID специализации для удаления.
   */
  const handleDeleteSpecialization = async (id: number) => {
    try {
      await deleteSpecialization(id).unwrap();
      showNotification('Специализация удалена!', 'success');
      await refetch();
    } catch (error) {
      showNotification('Ошибка при удалении специализации', 'error');
      console.error('Delete specialization error:', error);
    }
  };

  // Обработчик изменения текста в textarea с автоматическим изменением высоты
  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setDescription(e.target.value);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1160}
    >
      <div className="Container">
        <div className="FormContainer">
          <form onSubmit={handleCreateSpecialization} className='Form'>
            <h3>Создать специализацию</h3>
            <div className="NameContainer">
              <NameInputField
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Название специализации"
              />
              <DescriptionInputField
                placeholder="Описание (опционально)"
                name="description"
                value={description}
                onChange={handleTextArea}
              />
            </div>
            <div className="FormButtons">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isCreating}
              >
                Создать
              </Button>
            </div>
          </form>
        </div>

        <div className="ListResults">
          <h3>Существующие специализации</h3>
          {isLoading ? (
            <p>Загрузка...</p>
          ) : isError ? (
            <p>Ошибка при загрузке специализаций.</p>
          ) : (
            <ul className="SpecializationsList">
              {specializations?.map((specialization) => (
                <li key={specialization.id} className="SpecializationItem">
                  <div className="SpecializationInfo">
                    <h4>{specialization.name}</h4>
                    <p>{specialization.description}</p>
                  </div>
                  <button 
                    className="DeleteButton"
                    onClick={() => handleDeleteSpecialization(specialization.id)}
                  >
                    <TrashIcon width="16" height="16" strokeWidth="2"/>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}