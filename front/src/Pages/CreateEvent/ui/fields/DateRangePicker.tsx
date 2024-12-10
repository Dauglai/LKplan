import { useRef, useState } from 'react';
import CalendarIcon from "assets/icons/calendar.svg?react";
import "./DateRangePicker.scss";

export default function DateRangePicker(): JSX.Element {
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="DateRangeContainer">
      <div className="DataField EventFormField">
        <input
          ref={startDateInputRef}
          type="date"
          data-placeholder="Дата начала"
          className={`DateInput ${startDate ? 'filled' : ''}`}
          value={startDate || ''}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <CalendarIcon 
          width="16" 
          height="16" 
          strokeWidth="1" 
          onClick={() => startDateInputRef.current?.showPicker()}
        />
      </div>
      <div className="DataField EventFormField">
        <input
          ref={endDateInputRef}
          type="date"
          className={`DateInput ${endDate ? 'filled' : ''}`}
          data-placeholder="Дата завершения"
          value={endDate || ''}
          onChange={(e) => setEndDate(e.target.value)}
          
        />
        <CalendarIcon 
          width="16" 
          height="16" 
          strokeWidth="1" 
          onClick={() => endDateInputRef.current?.showPicker()}
        />
      </div>
    </div>
  );
}
