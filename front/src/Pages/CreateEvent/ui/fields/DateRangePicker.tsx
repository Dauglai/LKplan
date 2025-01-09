import React, { useRef, useState } from 'react';
import CalendarIcon from "assets/icons/calendar.svg?react";
import "./DateRangePicker.scss";

interface DatePickerProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DatePickerProps): JSX.Element {
  //const [startDate, setStartDate] = useState<string | undefined>();
  //const [endDate, setEndDate] = useState<string | undefined>();

  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(startDate, e.target.value);
  };

  return (
    <div className="DateRangeContainer">
      <div 
      className="DataField EventFormField" 
      onClick={() => startDateInputRef.current?.showPicker()}>
        <input
          ref={startDateInputRef}
          type="date"
          data-placeholder="Дата начала"
          className={`DateInput ${startDate ? 'filled' : ''}`}
          value={startDate || ''}
          onChange={handleStartDateChange}
        />
        <CalendarIcon 
          width="16" 
          height="16" 
          strokeWidth="1" 
        />
      </div>
      <div 
      className="DataField EventFormField" 
      onClick={() => endDateInputRef.current?.showPicker()}>
        <input
          ref={endDateInputRef}
          type="date"
          className={`DateInput ${endDate ? 'filled' : ''}`}
          data-placeholder="Дата завершения"
          value={endDate || ''}
          onChange={handleEndDateChange}
          
        />
        <CalendarIcon 
          width="16" 
          height="16" 
          strokeWidth="1" 
        />
      </div>
    </div>
  );
}
