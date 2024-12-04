import { Request } from 'Pages/Requests/typeRequests';
import { useState, useEffect } from 'react';

export function RequestDetails({
    selectedRequest,
    onClose,
  }: {
    selectedRequest: Request;
    onClose: () => void;
  }): JSX.Element {

    const [status, setStatus] = useState(selectedRequest.status);

    useEffect(() => {
        setStatus(selectedRequest.status);
    }, [selectedRequest]);

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(event.target.value);
    };

    return (
      <>
        <select
            value={status} // Контролируемый компонент
            onChange={handleStatusChange}
            className="StatusSelector"
        >
            <option value="Новые заявки">Новые заявки</option>
            <option value="Вступившие в орг. чат">Вступившие в орг. чат</option>
            <option value="Приступившие к работе">Приступившие к работе</option>
        </select>
        <div className="RequestInfo">
            <p><strong>ФИО:</strong> {selectedRequest.name}</p>
            <p><strong>Мероприятие:</strong> {selectedRequest.eventName}</p>
            <p><strong>Направление:</strong> {selectedRequest.direction}</p>
            <p><strong>Проект:</strong> {selectedRequest.project}</p>
            <p><strong>Специализация:</strong> {selectedRequest.specialization}</p>
            <p><strong>Результат теста:</strong> {selectedRequest.testScore}/100</p>
            <p><strong>Учебное заведение:</strong> {selectedRequest.institution}</p>
            <p><strong>Курс:</strong> {selectedRequest.course}</p>
        </div>
        <div className="ModalActions">
            <button className="CancelButton modal-btn" onClick={onClose}>
                Отмена
            </button>
            <button className="SaveButton modal-btn">Сохранить</button>
        </div>
      </>
    );
}
  