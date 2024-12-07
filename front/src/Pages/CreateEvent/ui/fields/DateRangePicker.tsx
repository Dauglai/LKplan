import {useState} from 'react';
import CalendarIcon from "assets/icons/calendar.svg?react";
import "./DateRangePicker.scss";

export default function DateRangePicker(): JSX.Element {
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  return (
    <div className="DataField EventFormField">
      <p>Сроки проведения</p>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="date"
          className="DateInput"
          value={startDate || ''}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="___"
        />
        <span>по</span>
        <input
          type="date"
          className="DateInput"
          value={endDate || ''}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="___"
        />
      </div>
      <CalendarIcon width="16" height="16" strokeWidth="2"/>
    </div>
  );
}
