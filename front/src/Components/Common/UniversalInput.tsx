import { useState } from "react";
import SearchIcon from 'assets/icons/search.svg?react';
import CalendarIcon from "assets/icons/calendar.svg?react";
import "Styles/components/UniversalInput.scss";


interface UniversalInputProps {
  value: string;
  onChange: (value: string) => void;
  type: "text" | "number" | "date" | "email" | "password";
  placeholder: string;
  disabled?: boolean;
  withPlaceholder?: boolean;
}

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

