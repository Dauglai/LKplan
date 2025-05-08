import { useMemo, useState } from 'react';
import { useCreateProjectMutation } from 'Features/ApiSlices/projectSlice';
import { useNotification } from 'Components/Common/Notification/Notification'; 
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import UserSelector from 'Components/Selectors/UserSelector';
import { Modal } from 'antd';
import DirectionSelector from 'Components/Selectors/DirectionSelector';
import { useUserRoles } from 'Features/context/UserRolesContext';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps): JSX.Element {
  const { showNotification } = useNotification();
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const { hasRole, getRoleForObject } = useUserRoles();
  const { data: allDirections } = useGetDirectionsQuery();

  const [newProject, setNewProject] = useState({
    direction: 0,
    name: '',
    description: '',
  });

  const filteredDirections = useMemo(() => {
      if (!allDirections) {
        return []; 
      }
      
      if (hasRole('organizer')) {
        return allDirections;
      }

  
      if (hasRole('direction_leader')) {
        return allDirections.filter((direction) => {
          // Для каждого направления проверяем, есть ли роль руководителя для этого направления
          const role = getRoleForObject('direction_leader', direction.id, 'crm.direction');
  
          return role; // если роль есть, это направление доступно
        });
      }
  
      return []; // Если роль не определена, возвращаем пустой список
  }, [allDirections, hasRole, getRoleForObject]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleCuratorChange = (selected: number) => {
    setNewProject((prev) => ({
      ...prev,
      curators: selected,
    }));
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewProject((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    };

  const handleDirectionChange = (selected: number) => {
    setNewProject((prev) => ({
      ...prev,
      direction: selected.id,
    }));
  };

  const handleSubmit = async () => {
    if (!newProject.name.trim() || !newProject.direction) return;

    await createProject(newProject);
    showNotification('Проект создан!', 'success');
    onClose();

    // Сброс значений после закрытия
    setNewProject({
        direction: 0,
        name: '',
        description: '',
    });
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
