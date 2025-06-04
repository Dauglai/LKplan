import { Input, Form } from 'antd';
import { useState } from 'react';
import 'Styles/FormStyle.scss';
import "Styles/components/Common/UniversalInputStyle.scss";

interface NameInputFieldProps {
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  withPlaceholder?: boolean;
  disabled? : boolean;
  error?: string;
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
  disabled,
  error
}: NameInputFieldProps): JSX.Element {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const getPlaceholder = () => {
    if (error && !value) {
      return error; // Показываем текст ошибки, если есть ошибка и поле пустое
    }
    if (isFocused || value) {
      return ""; // Пустой плейсхолдер при фокусе или если есть значение
    }
    return required ? `${placeholder} *` : placeholder;
  };

  return (
    <Form.Item
      className="UniversalInputWrapper InputWrapper"
      shouldUpdate={false}
      rules={required ? [{ required: true, message: `Пожалуйста, введите ${placeholder}` }] : []}
    >
      <Input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={getPlaceholder()}
        className={`Name UniversalInput ${error ? 'error' : ''}`}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled ? true : undefined}
        style={error ? { borderColor: 'red', color: 'red' } : undefined}
      />
      {withPlaceholder && (isFocused || value) && (
        <div 
          className="UniversalInputText InputText" 
          style={error ? { color: 'red' } : undefined}
        >
          {placeholder}
        </div>
      )}
    </Form.Item>
  );
}

