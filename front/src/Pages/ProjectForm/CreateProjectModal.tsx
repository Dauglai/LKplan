import { useMemo, useState } from 'react'; // Хуки React
import { useCreateProjectMutation } from 'Features/ApiSlices/projectSlice'; // Мутация создания проекта
import { useNotification } from 'Components/Common/Notification/Notification'; // Хук уведомлений
import NameInputField from 'Components/Forms/NameInputField'; // Поле ввода названия
import DescriptionInputField from 'Components/Forms/DescriptioninputField'; // Поле ввода описания
import { Modal } from 'antd'; // Модальное окно Ant Design
import DirectionSelector from 'Components/Selectors/DirectionSelector'; // Селектор направления
import { useUserRoles } from 'Features/context/UserRolesContext'; // Контекст ролей пользователя
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice'; // Запрос списка направлений

interface CreateProjectModalProps {
  isOpen: boolean; // Флаг открытия модального окна
  onClose: () => void; // Функция закрытия модального окна
}

/**
 * Модальное окно создания нового проекта.
 * Позволяет задать название, описание и выбрать направление для проекта.
 * Автоматически фильтрует доступные направления в зависимости от ролей пользователя.
 * 
 * @component
 * @example
 * // Пример использования:
 * <CreateProjectModal 
 *   isOpen={isModalOpen} 
 *   onClose={() => setIsModalOpen(false)} 
 * />
 *
 * @param {CreateProjectModalProps} props - Свойства компонента
 * @returns {JSX.Element} Модальное окно с формой создания проекта
 */
export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps): JSX.Element {
  const { showNotification } = useNotification(); // Хук для показа уведомлений
  const [createProject, { isLoading }] = useCreateProjectMutation(); // Мутация создания проекта
  const { hasRole, getRoleForObject } = useUserRoles(); // Хук для проверки ролей
  const { data: allDirections } = useGetDirectionsQuery(); // Запрос всех направлений

  // Состояние формы нового проекта
  const [newProject, setNewProject] = useState({
    direction: 0, // ID направления
    name: '', // Название проекта
    description: '', // Описание проекта
  });

  /**
   * Фильтрует направления доступные для выбора в зависимости от роли пользователя:
   * - Организатор видит все направления
   * - Руководитель направления видит только свои направления
   * - Остальные пользователи не видят направлений
   */
  const filteredDirections = useMemo(() => {
    if (!allDirections) return []; // Если направления не загружены
    
    if (hasRole('organizer')) {
      return allDirections; // Организатор видит все
    }

    if (hasRole('direction_leader')) {
      return allDirections.filter((direction) => {
        // Фильтруем только направления где пользователь является руководителем
        return getRoleForObject('direction_leader', direction.id, 'crm.direction');
      });
    }

    return []; // Для остальных ролей - пустой список
  }, [allDirections, hasRole, getRoleForObject]);

  /**
   * Обработчик изменения текстовых полей ввода
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Событие изменения
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Обработчик изменения текстового поля (textarea)
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Событие изменения
   */
  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewProject((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Обработчик изменения выбранного направления
   * @param {Object} selected - Выбранное направление
   * @param {number} selected.id - ID направления
   */
  const handleDirectionChange = (selected: number) => {
    setNewProject((prev) => ({
      ...prev,
      direction: selected.id,
    }));
  };

  /**
   * Обработчик отправки формы
   * Проверяет обязательные поля и создает новый проект
   */
  const handleSubmit = async () => {
    if (!newProject.name.trim() || !newProject.direction) return;

    try {
      await createProject(newProject).unwrap();
      showNotification('Проект создан!', 'success');
      onClose();
      
      // Сброс формы после успешного создания
      setNewProject({
        direction: 0,
        name: '',
        description: '',
      });
    } catch (error) {
      showNotification('Ошибка при создании проекта', 'error');
      console.error(error);
    }
  };

  return (
    <Modal
      open={isOpen}
      title="Создать проект"
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Создать"
      cancelText="Отмена"
      className="CreateFormModal"
      destroyOnClose
    >
      <div className="Form ProjectForm">
        <DirectionSelector
            onChange={handleDirectionChange}
            sourceType='remote'
            directions={filteredDirections}
        />

        <div className="NameContainer">
            <NameInputField
                name="name"
                value={newProject.name}
                onChange={handleInputChange}
                placeholder="Название проекта"
                required
            />
            <DescriptionInputField
                name="description"
                value={newProject.description}
                onChange={handleTextArea}
                placeholder="Описание проекта"
            />
        </div>

        {/*<UserSelector
          selectedUserId={newProject.curators || null}
          onChange={handleCuratorChange}
          label="Добавить куратора"
        />*/}
      </div>
    </Modal>
  );
}
