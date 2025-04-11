import { Input, Form } from 'antd';
import { useState } from 'react';
import 'Styles/FormStyle.scss';

const { TextArea } = Input;

interface DescriptionInputFieldProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  withPlaceholder?: boolean;
}

export default function DescriptionInputField({
  name,
  value,
  onChange,
  placeholder,
  required = false,
  withPlaceholder = false,
}: DescriptionInputFieldProps): JSX.Element {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const finalPlaceholder = required ? `${placeholder} *` : placeholder;

  return (
    <Form.Item
      name={name}
      rules={required ? [{ required: true, message: `Пожалуйста, введите ${placeholder}` }] : []}
      className='InputWrapper'
    >
      <TextArea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={isFocused || value ? "" : finalPlaceholder}
        className="Description FormField"
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoSize={{ minRows: 7 }}
      />
      {withPlaceholder && (isFocused || value) && (
        <div className="InputText">{placeholder}</div>
      )}
    </Form.Item>
  );
}
