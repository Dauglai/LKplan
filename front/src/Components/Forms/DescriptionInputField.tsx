import { Input, Form } from 'antd';
import { useState } from 'react';
import 'Styles/FormStyle.scss';

const { TextArea } = Input;

interface DescriptionInputFieldProps {
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  withPlaceholder?: boolean;
  maxRows? : number;
  disabled? : boolean;
}

/**
 * Компонент текстового поля для ввода описания.
 * Поддерживает отображение плейсхолдера поверх поля, валидацию обязательности и автоизменение размера.
 *
 * @component
 * @example
 * // Пример использования:
 * <DescriptionInputField
 *   name="description"
 *   value={description}
 *   onChange={handleChange}
 *   placeholder="Введите описание"
 *   required={true}
 *   withPlaceholder={true}
 * />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {string} props.name - Имя поля формы.
 * @param {string} props.value - Текущее значение поля.
 * @param {function} props.onChange - Обработчик изменения значения поля.
 * @param {string} [props.placeholder] - Текст плейсхолдера.
 * @param {boolean} [props.required=false] - Обязательное ли поле.
 * @param {boolean} [props.withPlaceholder=false] - Отображать ли плейсхолдер поверх поля при фокусе или наличии значения.
 *
 * @returns {JSX.Element} Компонент поля ввода описания.
 */

export default function DescriptionInputField({
  name,
  value,
  onChange,
  placeholder,
  required = false,
  withPlaceholder = false,
  maxRows,
  disabled
}: DescriptionInputFieldProps): JSX.Element {
  const [isFocused, setIsFocused] = useState(false); // Состояние фокуса поля ввода

  const handleFocus = () => setIsFocused(true); // Устанавливает фокус
  const handleBlur = () => setIsFocused(false); // Снимает фокус

  const finalPlaceholder = required ? `${placeholder} *` : placeholder; // Добавляет * к плейсхолдеру, если поле обязательное

  const autoSizeConfig = maxRows
  ? { minRows: 4, maxRows: maxRows }
  : { minRows: 7 };

  return (
    <Form.Item
      rules={required ? [{ required: true, message: `Пожалуйста, введите ${placeholder}` }] : []}
      className="UniversalInputWrapper InputWrapper"
      shouldUpdate={false}
    >
      <TextArea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={isFocused || value ? "" : finalPlaceholder}
        className="Description UniversalInput"
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoSize={autoSizeConfig}
        disabled={disabled ? true : undefined}
      />
      {withPlaceholder && (isFocused || value) && (
        <div className="UniversalInputText InputText">{placeholder}</div> 
      )}
    </Form.Item>
  );
}

