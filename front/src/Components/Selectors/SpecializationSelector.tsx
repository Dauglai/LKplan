import { useGetSpecializationsQuery } from 'Features/ApiSlices/specializationSlice'; // API-запрос специализаций
import { Select, Spin } from "antd"; // Компоненты Ant Design
import "Styles/FormSelectorStyle.scss"; // Стили компонента

/**
 * Интерфейс пропсов компонента SpecializationSelector.
 * 
 * @property {number[]} selectedSpecializations - Массив выбранных ID специализаций.
 * @property {(selectedIds: number[]) => void} onChange - Колбэк при изменении выбора.
 * @property {string} [label="Добавить специализацию*"] - Текст лейбла (опционально).
 * @property {boolean} [isSingleSelect=false] - Режим одиночного выбора (опционально).
 * @property {number[]} [availableSpecializations] - Доступные для выбора ID специализаций (опционально).
 */
interface SpecializationSelectorProps {
  selectedSpecializations: number[];
  onChange: (selectedIds: number[]) => void;
  label?: string;
  isSingleSelect?: boolean;
  availableSpecializations?: number[];
}

/**
 * Компонент выбора специализаций с поддержкой одиночного и множественного выбора.
 * Позволяет фильтровать доступные специализации по ID.
 * 
 * @component
 * @example
 * // Множественный выбор:
 * <SpecializationSelector
 *   selectedSpecializations={[1, 3]}
 *   onChange={(ids) => setSelectedSpecs(ids)}
 *   label="Выберите специализации"
 * />
 * 
 * // Одиночный выбор с фильтрацией:
 * <SpecializationSelector
 *   isSingleSelect
 *   availableSpecializations={[2, 4, 6]}
 *   onChange={(ids) => setMainSpec(ids[0])}
 * />
 *
 * @param {SpecializationSelectorProps} props - Пропсы компонента.
 * @returns {JSX.Element} Выпадающий список специализаций или индикатор загрузки.
 */
export default function SpecializationSelector({
  selectedSpecializations = [],
  onChange,
  label = "Добавить специализацию*",
  isSingleSelect = false,
  availableSpecializations,
}: SpecializationSelectorProps): JSX.Element {
  const { data: allSpecializations, isLoading } = useGetSpecializationsQuery(); // Загрузка всех специализаций

  // Фильтрация специализаций по доступным ID, если указаны
  const filteredSpecializations = availableSpecializations
    ? allSpecializations?.filter(spec => 
        availableSpecializations.includes(spec.id)
      )
    : allSpecializations;

  // Обработчик изменения выбора
  const handleChange = (value: number | number[]) => {
    if (isSingleSelect) {
      onChange([value as number]); // Возвращаем массив с одним элементом
    } else {
      onChange(value as number[]); // Возвращаем массив выбранных ID
    }
  };

  if (isLoading) {
    return <div className="FormField"><Spin size="small" /></div>;
  }

  return (
        <Select
          mode={isSingleSelect ? undefined : "multiple"}
          value={isSingleSelect ? selectedSpecializations[0] : selectedSpecializations}
          onChange={handleChange}
          placeholder={label}
          className="Selector"
          options={filteredSpecializations?.map((spec) => ({
            label: spec.name,
            value: spec.id,
          }))}
          style={{ width: "100%" }}
          allowClear={!isSingleSelect}
        />
  );
}


