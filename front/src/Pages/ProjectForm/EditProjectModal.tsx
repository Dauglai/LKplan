import { Modal } from 'antd';
import { useState, useEffect } from 'react';
import { Project, useUpdateProjectMutation } from 'Features/ApiSlices/projectSlice';
import { useNotification } from 'Widgets/Notification/Notification'; 

import DirectionSelector from 'Widgets/Selectors/DirectionSelector';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptioninputField';
import UserSelector from 'Widgets/Selectors/UserSelector';

type EditProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  onSuccess?: () => void;
};

export default function EditProjectModal({ isOpen, onClose, project, onSuccess }: EditProjectModalProps): JSX.Element {
  const { showNotification } = useNotification();
  const [updateProject, { isLoading }] = useUpdateProjectMutation();

  const [editedProject, setEditedProject] = useState({
    project_id: 0,
    direction: null,
    name: '',
    description: '',
    //curators: 0,
  });


  useEffect(() => {
    if (project) {
      setEditedProject({
        project_id: project.project_id,
        direction: project.directionSet || project.direction,
        name: project.name,
        description: project.description || '',
        curators: project.curators || 0,
      });
    }
  }, [project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleDirectionChange = (selected) => {
    setEditedProject((prev) => ({
      ...prev,
      direction: selected,
    }));
  };

  const handleCuratorChange = (selected: number) => {
    setEditedProject((prev) => ({
      ...prev,
      curators: selected,
    }));
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedProject((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  console.log(editedProject)

  const handleSubmit = async () => {
    console.log(editedProject)
    if (!editedProject.name.trim() || !editedProject.direction) return;

    const payload = {
        ...editedProject,
        id: editedProject.project_id,
        direction: editedProject.direction.id,
    };

    await updateProject(payload);
    showNotification('Проект обновлён!', 'success');
    onSuccess?.();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      title="Редактировать проект"
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Сохранить"
      cancelText="Отмена"
      className="EditFormModal"
      destroyOnClose
    >
      <div className="Form ProjectForm">
        <DirectionSelector
          onChange={handleDirectionChange}
          sourceType="remote"
          selectedDirection={editedProject.direction}
        />

        <div className="NameContainer">
          <NameInputField
            name="name"
            value={editedProject.name}
            onChange={handleInputChange}
            placeholder="Название проекта"
            required
          />
          <DescriptionInputField
            name="description"
            value={editedProject.description}
            onChange={handleTextArea}
            placeholder="Описание проекта"
          />
        </div>

        {/*<UserSelector
          selectedUserId={editedProject.curators || null}
          onChange={handleCuratorChange}
          label="Добавить куратора"
        />*/}
      </div>
    </Modal>
  );
}
