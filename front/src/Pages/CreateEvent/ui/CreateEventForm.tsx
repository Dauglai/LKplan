import CreateEventHeader from './CreateEventHeader';
/* import TextField from './fields/TextField'; */
import FileUploader from './elements/FileUploader';
/* import ListField from './fields/ListField'; */
import CheckboxField from './checkbox/CheckboxField';
import DateRangePicker from './fields/DateRangePicker';
import SubmitButtons from './buttons/SubmitButtons';

import PlusIcon from "assets/icons/plus.svg?react";

import LinkIcon from "assets/icons/link.svg?react";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';


import './CreateEventForm.scss';

export default function CreateEventForm(): JSX.Element {

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className="CreateEventContainer">
      <form className="CreateEventForm">
        <CreateEventHeader />
          <input
            type="text"
            placeholder='Название мероприятия'
            className="EventName TextField EventFormField"/>
          <textarea
            placeholder='Описание мероприятия'
            className="EventDescription TextField EventFormField"
            onInput={handleInput}/>

          <FileUploader label="Файлы"/>

          <div className='ListField EventFormField'>
            <p>Руководитель мероприятия</p>
            <PlusIcon width="20" height="20" strokeWidth="2"/>
          </div>

          <div className='ListField EventFormField'>
            <p>Куратор мероприятия</p>
            <PlusIcon width="20" height="20" strokeWidth="2"/>
          </div>

          <div className='ListField EventFormField'>
            <p>Направление</p>
            <PlusIcon width="20" height="20" strokeWidth="2"/>
          </div>

          <div className='ListField EventFormField'>
            <p>Проекты</p>
            <PlusIcon width="20" height="20" strokeWidth="2"/>
          </div>

          <div className='ListField EventFormField'>
            <p>Специальности</p>
            <ChevronRightIcon width="20" height="20" strokeWidth="2" className='ChevronDown'/>
          </div>

          <DateRangePicker />

          <div className="LinkField EventFormField">
            <p>Ссылка на орг. чат:</p>
            <input
              type="text"
              placeholder=""
              className="LinkInput"
            />
            <LinkIcon width="16" height="16" strokeWidth="2" />
          </div>


          <div className="CountField EventFormField">
            <p>Количество участников:</p>
            <input
              type="number"
              placeholder="0"
              className="CountInput"
            />
          </div>


          <CheckboxField label="Запись без теста" />

          <SubmitButtons />
      </form>
    </div>
  );
}
