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

export default function DateInputField({
  name,
  value,
  onChange,
  placeholder = 'Выберите дату',
  required = false,
  withPlaceholder = false,
}: DateInputFieldProps): JSX.Element {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const finalPlaceholder = required ? `${placeholder} *` : placeholder;

    const dateValue = value ? dayjs(value, "DD.MM.YYYY", true) : null;

    const handleDateChange = (date: Dayjs | null, dateString: string) => {
        onChange(dateString); // Передаем строку в onChange
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

