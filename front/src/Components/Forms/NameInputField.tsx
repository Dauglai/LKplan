import { Input, Form } from 'antd';
import { useState } from 'react';
import 'Styles/FormStyle.scss';

interface NameInputFieldProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  withPlaceholder?: boolean;
}

/**
 * Компонент текстового поля для ввода названия.
 * Поддерживает динамический плейсхолдер, валидацию обязательности и отображение подписи поверх поля.
 *
 * @component
 * @example
 * <NameInputField
 *   name="title"
 *   value={title}
 *   onChange={handleChange}
 *   placeholder="Название"
 *   required={true}
 *   withPlaceholder={true}
 * />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {string} props.name - Имя поля в форме.
 * @param {string} props.value - Текущее значение поля.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - Обработчик изменения текста.
 * @param {string} [props.placeholder] - Текст плейсхолдера.
 * @param {boolean} [props.required=false] - Является ли поле обязательным.
 * @param {boolean} [props.withPlaceholder=false] - Показывать ли текст-подсказку над полем при фокусе или наличии значения.
 *
 * @returns {JSX.Element} JSX-элемент текстового поля ввода названия.
 */

export default function NameInputField({
  name,
  value,
  onChange,
  placeholder,
  required = false,
  withPlaceholder = false,
}: NameInputFieldProps): JSX.Element {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <Form.Item
      className="InputWrapper"
      shouldUpdate={false}
      rules={required ? [{ required: true, message: `Пожалуйста, введите ${placeholder}` }] : []}
    >
      <Input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={isFocused || value ? "" : (required && placeholder ? `${placeholder} *` : placeholder)}
        className="Name"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {withPlaceholder && (isFocused || value) && (
        <div className="InputText">{placeholder}</div>
      )}
    </Form.Item>
  );
}

