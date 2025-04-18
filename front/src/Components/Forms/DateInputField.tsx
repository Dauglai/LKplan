import { DatePicker, Form } from 'antd';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import CalendarIcon from "assets/icons/calendar.svg?react";
import 'Styles/FormStyle.scss';


interface DateInputFieldProps {
  name: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  withPlaceholder?: boolean;
}

/**
 * Поле ввода даты на основе Ant Design DatePicker.
 * Поддерживает кастомное отображение плейсхолдера, обязательность заполнения и передачу значения в формате строки.
 * Отображает иконку календаря, а при включённом `withPlaceholder` показывает текст-подсказку поверх поля при фокусе или наличии значения.
 *
 * @component
 * @example
 * <DateInputField
 *   name="startDate"
 *   value={formValues.startDate}
 *   onChange={(val) => setFormValues({ ...formValues, startDate: val })}
 *   required
 *   withPlaceholder
 * />
 *
 * @param {Object} props - Пропсы компонента.
 * @param {string} props.name - Имя поля формы.
 * @param {string} props.value - Текущее значение поля в формате строки.
 * @param {(date: string) => void} props.onChange - Функция, вызываемая при изменении значения.
 * @param {string} [props.placeholder] - Текст плейсхолдера (по умолчанию: "Выберите дату").
 * @param {boolean} [props.required] - Является ли поле обязательным (по умолчанию: false).
 * @param {boolean} [props.withPlaceholder] - Показывать ли текст плейсхолдера поверх поля при фокусе/значении.
 *
 * @returns {JSX.Element} Компонент поля ввода даты.
 */

export default function DateInputField({
  name,
  value,
  onChange,
  placeholder = 'Выберите дату',
  required = false,
  withPlaceholder = false,
}: DateInputFieldProps): JSX.Element {
    const [isFocused, setIsFocused] = useState(false); // Состояние фокуса поля ввода

    const handleFocus = () => setIsFocused(true); // Обработчик фокуса: устанавливает состояние в true
    const handleBlur = () => setIsFocused(false); // Обработчик потери фокуса: устанавливает состояние в false

    const finalPlaceholder = required ? `${placeholder} *` : placeholder; // Добавляет * к плейсхолдеру, если поле обязательное

    const dateValue = value ? dayjs(value, "DD.MM.YYYY", true) : null; // Преобразует строковое значение в Dayjs-дату

    const handleDateChange = (date: Dayjs | null, dateString: string) => {
        onChange(dateString); // Передаёт строковое значение даты во внешний обработчик
    };


    return (
        <Form.Item
            name={name}
            rules={required ? [{ required: true, message: `Пожалуйста, выберите ${placeholder}` }] : []}
            className='InputWrapper'
        >
            <DatePicker
                name={name}
                value={dateValue}
                onChange={handleDateChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={isFocused || value ? "" : finalPlaceholder}
                format="DD.MM.YYYY"
                className="DateInput FormField"
                suffixIcon={<CalendarIcon width={16} height={16} strokeWidth={1} />}
            />
            {withPlaceholder && (isFocused || value) && (
                <div className="InputText">{placeholder}</div>
            )}
        </Form.Item>
    );
}

