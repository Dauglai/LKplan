import CreateEventHeader from '../CreateFormHeader';
import DateRangePicker from '../fields/DateRangePicker';
import SubmitButtons from '../buttons/SubmitButtons';
import RoleSelector from '../fields/RoleSelector';

import PlusIcon from "assets/icons/plus.svg?react";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

import '../CreateFormStyle.scss'
import './CreateProjectForm.scss';

export default function CreateEventForm(): JSX.Element {

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className="CreateFormContainer">
      <form className="CreateProjectForm CreateForm">
        <CreateEventHeader label="Добавление проекта"/>
        <div className="CreateNameContainer">
          <input
            type="text"
            placeholder='Название проекта'
            className="CreateName TextField EventFormField"/>
          <textarea
            placeholder='Описание проекта'
            className="CreateDescription TextField EventFormField"
            onInput={handleInput}/>
        </div>

        <RoleSelector role="Куратор" />

          <div className='ListField EventFormField'>
            <p>Направление</p>
            <ChevronRightIcon width="20" height="20" strokeWidth="1" className='ChevronDown'/>
          </div>

          <div className='ListField EventFormField'>
            <p>Прикрепить к мероприятию</p>
            <PlusIcon width="20" height="20" strokeWidth="1"/>
          </div>

          <DateRangePicker />

          <SubmitButtons label="Добавить проект" />
      </form>
    </div>
  );
}