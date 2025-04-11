import { Input, Form } from 'antd';
import { useState } from 'react';
import 'Styles/FormStyle.scss';

/**
 * Props для компонента `NameInputField`.
 * Используется для текстового ввода (например, имени мероприятия).
 */

interface NameInputFieldProps {
  name: string; // Уникальное имя поля, используется для идентификации внутри формы.
  value: string; // Текущее значение поля.

  /**
   * Обработчик изменения значения поля.
   * Получает событие ввода и передаёт его наверх.
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; // Подсказка внутри поля, отображается когда поле пустое.
  required?: boolean; // Флаг обязательности поля.
  withPlaceholder?: boolean; // Определяет, должен ли placeholder отображаться при фокусировке или наличии значения.
}

/**
 * Универсальное текстовое поле ввода с валидацией и лейблом.
 * Использует `Form.Item` и `Input` из Ant Design.
 *
 * @component
 * @example
 * ```tsx
 * <NameInputField
 *   name="eventName"
 *   label="Название мероприятия"
 *   value={event.name}
 *   onChange={handleChange}
 *   placeholder="Введите название"
 *   required
 * />
 * ```
 *
 * @param {NameInputFieldProps} props - Пропсы компонента.
 * @returns {JSX.Element} Компонент поля ввода.
 */

export default function NameInputField({
    name,
    value,
    onChange,
    placeholder,
    required = false,
    withPlaceholder = false,
}: NameInputFieldProps) : JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <Form.Item
      name={name}
      rules={required ? [{ required: true, message: `Пожалуйста, введите ${placeholder}` }] : []}
      className='InputWrapper'
    >
      <Input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={isFocused || value ? "" : (required && placeholder ? `${placeholder} *` : placeholder)}
        className="Name FormField"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {withPlaceholder && (isFocused || value) && (
        <div className="InputText">{placeholder}</div>
      )}
    </Form.Item>
  );
};
