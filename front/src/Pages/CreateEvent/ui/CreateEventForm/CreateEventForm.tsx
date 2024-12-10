import CreateEventHeader from '../CreateFormHeader';
import DateRangePicker from '../fields/DateRangePicker';
import SubmitButtons from '../buttons/SubmitButtons';
import RoleSelector from '../fields/RoleSelector';

import PlusIcon from "assets/icons/plus.svg?react";
import LinkIcon from "assets/icons/link.svg?react";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import UsersIcon from 'assets/icons/users.svg?react'


import '../CreateFormStyle.scss'
import './CreateEventForm.scss';

export default function CreateEventForm(): JSX.Element {

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className="CreateFormContainer">
      <form className="CreateEventForm CreateForm">
        <CreateEventHeader label="Добавление мероприятия"/>
        <div className="CreateNameContainer">
          <input
            type="text"
            placeholder='Название мероприятия'
            className="CreateName TextField EventFormField"/>
          <textarea
            placeholder='Описание мероприятия'
            className="CreateDescription TextField EventFormField"
            onInput={handleInput}/>
        </div>

          <RoleSelector role="Руководитель" />

          <div className='ListField EventFormField'>
            <p>Направления</p>
            <PlusIcon width="20" height="20" strokeWidth="1"/>
          </div>

          <div className='ListField EventFormField'>
            <p>Специальности</p>
            <ChevronRightIcon width="20" height="20" strokeWidth="1" className='ChevronDown'/>
          </div>

          <DateRangePicker />

          <div className="LinkField EventFormField">
            <input
              type="text"
              placeholder="Ссылка на орг. чат"
              className="LinkInput"
            />
            <LinkIcon width="16" height="16" strokeWidth="1" />
          </div>


          <div className="CountField EventFormField">
            <input
              type="number"
              placeholder="Количество участников"
              className="CountInput"
            />
            <UsersIcon width="24" height="24" strokeWidth="1" />
          </div>

          <SubmitButtons label="Добавить мероприятие"/>
      </form>
    </div>
  );
}
