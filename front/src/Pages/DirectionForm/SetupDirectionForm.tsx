import React, { useState } from 'react'; // Основные хуки React
import { useNotification } from 'Components/Common/Notification/Notification'; // Уведомления
import 'Styles/FormStyle.scss'; // Основные стили форм
import { useNavigate } from "react-router-dom"; // Навигация
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react'; // Иконка стрелки вправо
import { useDispatch, useSelector } from 'react-redux'; // Redux хуки
import { addDirection, updateDirections, removeDirection } from 'Features/store/eventSetupSlice'; // Экшены для направлений
import BackButton from 'Components/Common/BackButton/BackButton'; // Кнопка назад
import NameInputField from 'Components/Forms/NameInputField'; // Поле ввода названия
import DescriptionInputField from 'Components/Forms/DescriptionInputField.tsx'; // Поле ввода описания
import "Styles/FormSelectorStyle.scss"; // Стили селекторов
import CloseIcon from 'assets/icons/close.svg?react'; // Иконка закрытия
import UserSelector from 'Components/Selectors/UserSelector'; // Селектор пользователей
import { Direction } from 'Features/ApiSlices/directionSlice'; // Типы направлений
import SideStepNavigator from 'Components/Sections/SideStepNavigator'; // Навигатор шагов

interface FormErrors {
  name?: string;
  leader_id?: string;
}

/**
 * Форма настройки направлений мероприятия.
 * Позволяет добавлять, редактировать и удалять направления мероприятия.
 * 
 * @component
 * @example
 * // Пример использования:
 * <SetupDirectionForm />
 *
 * @returns {JSX.Element} Форма управления направлениями мероприятия.
 */
export default function SetupDirectionForm(): JSX.Element {
  const dispatch = useDispatch(); // Redux dispatch
  const navigate = useNavigate(); // Хук навигации
  const [editingDirectionId, setEditingDirectionId] = useState<string | null>(null); // ID редактируемого направления
  const { stepEvent, stepDirections } = useSelector((state: any) => state.event); // Данные из хранилища
  const { showNotification } = useNotification(); // Хук уведомлений
  const [errors, setErrors] = useState<FormErrors>({}); // Ошибки валидации

  // Состояние формы нового направления
  const [newDirection, setNewDirection] = useState({
    name: '',
    description: '',
    leader_id: null,
    event: stepEvent?.id || null,
  });

  /**
   * Обработчик начала редактирования направления.
   * @param {Direction} direction - Данные направления для редактирования
   */
  const handleEditDirection = (direction: Direction) => {
    setNewDirection({
      name: direction.name,
      description: direction.description || '',
      leader_id: direction.leader_id || null,
      event: stepEvent?.id || null,
    });
    setEditingDirectionId(direction.id);
  };

  /**
   * Обработчик изменения полей ввода.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Событие изменения
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDirection((prev) => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /**
   * Обработчик изменения куратора направления.
   * @param {number | null} userId - ID выбранного пользователя
   */
  const handleCuratorChange = (userId: number | null) => {
    setNewDirection((prev) => ({ ...prev, leader_id: userId }));
    setErrors(prev => ({ ...prev, leader_id: undefined }));
  };

  /**
   * Валидация формы.
   * @returns {boolean} Результат валидации (true - валидно)
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!newDirection.name.trim()) {
      newErrors.name = "Название направления обязательно";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Обработчик отправки формы.
   * @param {React.FormEvent} e - Событие формы
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification("Пожалуйста, заполните обязательные поля", "error");
      return;
    }

    const directionData = {
      ...newDirection,
      leader_id: newDirection.leader_id || undefined
    };

    if (editingDirectionId) {
      const updatedDirections = stepDirections.directions.map((dir) =>
        dir.id === editingDirectionId ? { ...dir, ...directionData, id: editingDirectionId } : dir
      );
      dispatch(updateDirections(updatedDirections));
    } else {
      dispatch(addDirection(directionData));
    }

    // Сброс формы
    setNewDirection({ name: '', description: '', leader_id: null, event: stepEvent?.id });
    setEditingDirectionId(null);
  };

  /** Переход к следующему шагу */
  const handleNextStep = () => {
    navigate('/projects-setup');
  };

  /**
   * Удаление направления.
   * @param {string} id - ID направления для удаления
   */
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
            label="Добавить руководителя"
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

