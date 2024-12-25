import { useState } from 'react';
import axios from "axios";
import CreateEventHeader from '../CreateFormHeader';
import DateRangePicker from '../fields/DateRangePicker';
import SubmitButtons from '../buttons/SubmitButtons';
import RoleSelector from '../fields/RoleSelector';
import DirectionSelector from '../fields/DirectionSelector';
import {baseURL} from 'App/config/api';

import PlusIcon from "assets/icons/plus.svg?react";
import LinkIcon from "assets/icons/link.svg?react";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import UsersIcon from 'assets/icons/users.svg?react'


import '../CreateFormStyle.scss'
import './CreateEventForm.scss';

export default function CreateEventForm(): JSX.Element {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    supervisorId: null,
    startDate: "",
    endDate: "",
    chatlink: "",
    directions: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSupervisorChange = (id: number) => {
    setFormData({
      ...formData,
      supervisorId: id,
    });
  };

  const handleDatesChange = (start: string, end: string) => {
    setFormData({
      ...formData,
      startDate: start,
      endDate: end,
    });
  };

  const handleDirectionsChange = (selectedDirections: number[]) => {
    setFormData({
      ...formData,
      directions: selectedDirections,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseURL}/api/events/create`, formData);
      console.log("Event created successfully:", response.data);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleTextAtea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="CreateFormContainer">
      <form className="CreateEventForm CreateForm" onSubmit={handleSubmit}>
        <CreateEventHeader label="Добавление мероприятия"/>
        <div className="CreateNameContainer">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder='Название мероприятия'
            className="CreateName TextField EventFormField"/>
          <textarea
            placeholder='Описание мероприятия'
            className="CreateDescription TextField EventFormField"
            name="description"
            value={formData.description}
            onInput={handleTextAtea}/>
        </div>

          <RoleSelector 
          role="Руководитель" 
          onChange={handleSupervisorChange}/>

          <DirectionSelector 
          selectedDirections={formData.directions}
          onChange={handleDirectionsChange} />

          <DateRangePicker 
          startDate={formData.startDate}
          endDate={formData.endDate}
          onChange={handleDatesChange}/>

          <div className="LinkField EventFormField">
            <input
              type="text"
              placeholder="Ссылка на орг. чат"
              className="LinkInput"
              name="chatlink"
              value={formData.chatlink}
              onChange={handleChange}
            />
            <LinkIcon width="16" height="16" strokeWidth="1" />
          </div>

          <SubmitButtons label="Добавить мероприятие"/>
      </form>
    </div>
  );
}
