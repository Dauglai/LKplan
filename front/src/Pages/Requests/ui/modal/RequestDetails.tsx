import { Request } from 'Pages/Requests/typeRequests';
import { useState, useEffect, useRef } from 'react';

import "./RequestDetails.scss"

const projects = [
  "Создание CMS",
  "Разработка сценариев",
  "Учет финансов",
  "Образовательная платформа",
  "Разработка CRM-системы",
  "Создание игрового прототипа",
  "Автоматизация складов",
  "Проектирование уровней",
];

const statuses = [
  'Новые заявки',
  'Вступившие в орг. чат',
  'Приступившие к работе',
];



export function RequestDetails({
    selectedRequest,
  }: {
    selectedRequest: Request;
  }): JSX.Element {

    const [status, setStatus] = useState(selectedRequest.status);
    const [project, setProject] = useState(selectedRequest.project);
    const requestInfoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setStatus(selectedRequest.status);
      setProject(selectedRequest.project);

      if (requestInfoRef.current) {
          requestInfoRef.current.scrollTop = 0;
      }
  }, [selectedRequest]);

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(event.target.value);
    };

    const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setProject(event.target.value);
    };


    return (
      <>
      <div className="RequestManagementContainer">
        <h3 className="RequestManagementTitle">Изменить статус</h3>
          <select
              value={status}
              onChange={handleStatusChange}
              className="StatusSelector"
          >
              {statuses.map((status) => (
                    <option key={status} value={status}>
                        {status}
                    </option>
              ))}
          </select>
          <h3 className="RequestManagementTitle">Изменить проект</h3>
          <select
            value={project}
            onChange={handleProjectChange}
            className="ProjectSelector"
            >
                {projects.map((proj) => (
                    <option key={proj} value={proj}>
                        {proj}
                    </option>
                ))}
            </select>
        </div>
        <div 
          className="RequestInfo"
          ref={requestInfoRef}>
            <p>ФИО: {selectedRequest.name}</p>
            <p>Мероприятие: {selectedRequest.eventName}</p>
            <p>Направление: {selectedRequest.direction}</p>
            <p>Проект: {selectedRequest.project}</p>
            <p>Специализация: {selectedRequest.specialization}</p>
            <p>Результат теста: {selectedRequest.testScore}/100</p>
            <p>Учебное заведение: {selectedRequest.institution}</p>
            <p>Курс: {selectedRequest.course}</p>
            <div className="RequestDescriptionContainer">
              <h4 className="RequestDescriptionTitle">Описание заявки</h4>
              <p className="RequestDescription">{selectedRequest.description}</p>
            </div>
        </div>
      </>
    );
}
  