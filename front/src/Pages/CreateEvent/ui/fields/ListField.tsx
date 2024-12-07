import React from 'react';
import './ListField.scss';

interface ListFieldProps {
  label: string;
  isMulti?: boolean;
}

export default function ListField({ label, isMulti = false }: ListFieldProps): JSX.Element {
  return (
    <div className="ListField">
      <label>{label}</label>
      <input type="text" />
      <button>{isMulti ? 'Выбрать' : 'Добавить'}</button>
    </div>
  );
}
