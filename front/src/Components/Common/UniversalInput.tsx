import { useState } from "react";
import SearchIcon from 'assets/icons/search.svg?react';
import CalendarIcon from "assets/icons/calendar.svg?react";
import "Styles/components/Common/UniversalInput.scss";

interface UniversalInputProps {
  value: string;
  onChange: (value: string) => void;
  type: "text" | "date" ;
  placeholder: string;
  disabled?: boolean;
  withPlaceholder?: boolean;
}

/**
 * Компонент для отображения универсального инпута с иконками для разных типов.
 * В зависимости от типа инпута (текстовый или дата) отображается соответствующая иконка.
 * Компонент также поддерживает дополнительный placeholder и возможность фокусировки.
 *
 * @component
 * @example
 * // Пример использования:
 * <UniversalInput 
 *   value={value}
 *   onChange={handleChange}
 *   type="text"
 *   placeholder="Поиск"
 *   disabled={false}
 *   withPlaceholder={true}
 * />
 *
 * @param {Object} props - Свойства компонента.
 * @param {string} props.value - Значение инпута.
 * @param {Function} props.onChange - Функция, которая вызывается при изменении значения инпута.
 * @param {"text" | "date"} props.type - Тип инпута: "text" или "date".
 * @param {string} props.placeholder - Текст, который отображается в поле при отсутствии значения.
 * @param {boolean} [props.disabled=false] - Определяет, доступен ли инпут для редактирования.
 * @param {boolean} [props.withPlaceholder=true] - Определяет, должен ли placeholder отображаться при фокусировке или наличии значения.
 * @returns {JSX.Element} Компонент универсального инпута.
 */

export default function UniversalInput({
  value,
  onChange,
  type,
  placeholder,
  disabled = false,
  withPlaceholder = true,
}: UniversalInputProps): JSX.Element {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const getIcon = () => {
    switch (type) {
      case "text":
        return <SearchIcon className="UniversalInputIcon" width="16" height="16" strokeWidth="1" />;
      case "date":
        return <CalendarIcon className="UniversalInputIcon" width="16" height="16" strokeWidth="1" />;
      default:
        return null;
    }
  };

  return (
    <div className="UniversalInputWrapper">
      <input
        type={type}
        className="UniversalInput"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isFocused || value ? "" : placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
      />
      {!isFocused && !value && getIcon()}
      {withPlaceholder && (isFocused || value) && (
        <div className="UniversalInputText">{placeholder}</div>
      )}
    </div>
  );
};

