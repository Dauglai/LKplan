import CreateSpecializationModal from 'Pages/CreateSpecialization/CreateSpecializationModal'; // Компонент модального окна создания специализации
import PlusIcon from 'assets/icons/plus.svg?react'; // Иконка плюса для кнопки
import { useState } from 'react'; // Хуки React
import SpecializationSelector from 'Components/Selectors/SpecializationSelector'; // Компонент выбора специализации
import "./SpecializationField.scss"; // Стили компонента

/**
 * Компонент для выбора специализаций с возможностью добавления новых.
 * Позволяет выбирать существующие специализации и открывать модальное окно для создания новых.
 * 
 * @component
 * @example
 * // Пример использования:
 * <SpecializationField 
 *   selectedSpecializations={selectedSpecs} 
 *   onChange={handleSpecChange} 
 * />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {number[]} props.selectedSpecializations - Массив выбранных ID специализаций.
 * @param {function} props.onChange - Функция обработки изменения выбранных специализаций.
 *
 * @returns {JSX.Element} Поле выбора специализаций с кнопкой добавления новых.
 */
export default function SpecializationField({ 
  selectedSpecializations, 
  onChange 
}: {
  selectedSpecializations: number[];
  onChange: (ids: number[]) => void;
}) {
  // Состояние видимости модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="SpecializationField">
      <div className="SpecializationSelectorWrapper">
        <SpecializationSelector
          selectedSpecializations={selectedSpecializations}
          onChange={onChange}
        />
        <button 
          type="button" 
          className="AddSpecializationBtn"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusIcon width="16" height="16" />
        </button>
      </div>
      
      <CreateSpecializationModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSpecializationCreated={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}