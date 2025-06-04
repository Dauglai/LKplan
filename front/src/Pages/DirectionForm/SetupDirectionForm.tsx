import React, { useState } from 'react';
import { useNotification } from 'Components/Common/Notification/Notification';
import 'Styles/FormStyle.scss';
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import { useDispatch, useSelector } from 'react-redux';
import { addDirection, updateDirections, removeDirection } from 'Features/store/eventSetupSlice';
import BackButton from 'Components/Common/BackButton/BackButton';
import NameInputField from 'Components/Forms/NameInputField';
import DescriptionInputField from 'Components/Forms/DescriptionInputField.tsx';
import "Styles/FormSelectorStyle.scss";
import CloseIcon from 'assets/icons/close.svg?react';
import UserSelector from 'Components/Selectors/UserSelector';
import { Direction } from 'Features/ApiSlices/directionSlice';
import SideStepNavigator from 'Components/Sections/SideStepNavigator';

interface FormErrors {
  name?: string;
  leader_id?: string;
}

export default function SetupDirectionForm(): JSX.Element {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [editingDirectionId, setEditingDirectionId] = useState<string | null>(null);
  const { stepEvent, stepDirections } = useSelector((state: any) => state.event);
  const { showNotification } = useNotification();
  const [errors, setErrors] = useState<FormErrors>({});

  const [newDirection, setNewDirection] = useState({
    name: '',
    description: '',
    leader_id: null,
    event: stepEvent?.id || null,
  });

  const handleEditDirection = (direction: Direction) => {
    setNewDirection({
      name: direction.name,
      description: direction.description || '',
      leader_id: direction.leader_id || null,
      event: stepEvent?.id || null,
    });
    setEditingDirectionId(direction.id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDirection((prev) => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleCuratorChange = (userId: number | null) => {
    setNewDirection((prev) => ({ ...prev, leader_id: userId }));
    setErrors(prev => ({ ...prev, leader_id: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!newDirection.name.trim()) {
      newErrors.name = "Название направления обязательно";
    }
    
    if (!newDirection.leader_id) {
      newErrors.leader_id = "Руководитель обязателен";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification("Пожалуйста, заполните все обязательные поля", "error");
      return;
    }
  
    if (editingDirectionId) {
      const updatedDirections = stepDirections.directions.map((dir) =>
        dir.id === editingDirectionId ? { ...dir, ...newDirection, id: editingDirectionId } : dir
      );
      dispatch(updateDirections(updatedDirections));
      showNotification('Направление обновлено!', 'success');
    } else {
      dispatch(addDirection(newDirection));
      showNotification('Направление добавлено локально!', 'success');
    }
  
    setNewDirection({ name: '', description: '', leader_id: null, event: stepEvent?.id });
    setEditingDirectionId(null);
  };

  const handleNextStep = () => {
    navigate('/projects-setup');
  };

  const handleRemoveDirection = (id: string) => {
    dispatch(removeDirection(id));
  };

  return (
    <div className="SetupContainer">
      <SideStepNavigator />
      <div className="FormContainer">
        <div className="FormHeader">
          <BackButton />
          <div>
            <h2>Добавление направления</h2>
            <p>{stepEvent?.name}</p>
          </div>
        </div>

        <form className="Form DirectionForm" onSubmit={handleSubmit}>
          <div className="NameContainer">
            <NameInputField
              name="name"
              value={newDirection.name}
              onChange={handleInputChange}
              placeholder="Название направления"
              required
              error={errors.name}
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
            label="Добавить руководителя *"
            error={errors.leader_id}
          />

          <div className="FormButtons">
            {editingDirectionId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setEditingDirectionId(null);
                  setNewDirection({ name: '', description: '', leader_id: null, event: stepEvent?.id });
                }}
              >
                Отменить редактирование
              </button>
            )}
            <button className="primary-btn" type="submit">
              Сохранить направление
            </button>
          </div>
        </form>

        {stepDirections?.directions?.length > 0 && (
          <div className="DirectionList">
            <h3>Созданные направления:</h3>
            <ul className="SelectedList">
              {stepDirections.directions.map((direction) => (
                <li
                  key={direction.id}
                  className={`SelectedListItem ${editingDirectionId === direction.id ? 'editing' : ''}`}
                  onClick={() => handleEditDirection(direction)}
                >
                  {direction.name}
                  <CloseIcon
                    className="RemoveIcon"
                    width="16"
                    height="16"
                    strokeWidth="1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDirection(direction.id);
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="FormButtons navigate">
          <button
            className="primary-btn"
            type="button"
            onClick={handleNextStep}
          >
            Далее
            <ChevronRightIcon width="24" height="24" strokeWidth="1" />
          </button>
        </div>
      </div>
    </div>
  );
}

