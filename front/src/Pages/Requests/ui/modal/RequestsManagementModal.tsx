import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { Request } from 'Pages/Requests/typeRequests';

import SearchIcon from 'assets/icons/search.svg?react';
import UserIcon from 'assets/icons/user.svg?react';
import CloseIcon from 'assets/icons/x-circle.svg?react';
import './RequestsManagementModal.scss';

type RequestsManagementModalProps = {
  onClose: () => void;
  requests: Request[];
};

export default function RequestsManagementModal({
  onClose,
  requests,
}: RequestsManagementModalProps): JSX.Element | null {

    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRequests, setFilteredRequests] = useState<Request[]>(requests);

    const modalRoot = document.getElementById('modal-root') || document.body;
    const modalContainer = document.createElement('div');
    
    useEffect(() => {
        modalRoot.appendChild(modalContainer);
    
        return () => {
          modalRoot.removeChild(modalContainer);
        };
      }, [modalContainer, modalRoot]);

    useEffect(() => {
      setFilteredRequests(
        requests.filter(
          (request) => request.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }, [searchTerm, requests]);
  
    return ReactDOM.createPortal(
        <div className="ModalOverlay" onClick={onClose}>
            <div className="RequestModalContent" onClick={(e) => e.stopPropagation()}>
                <div className="ModalLeft">
                    <div className="RequestSearchBar">
                      <SearchIcon className="SearchIcon" width="16" height="16"/>
                      <input
                        type="text"
                        placeholder="Поиск заявок"
                        className="SearchInput"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="RequestCount">
                        <UserIcon width="16" height="16"/>
                        {filteredRequests.length}
                      </div>
                    </div>
                    <div className="RequestList">
                      {filteredRequests.length > 0 ? (
                        filteredRequests.map((request) => (
                          <div
                            key={request.id}
                            className={`RequestListItem ${
                              selectedRequest?.id === request.id ? 'Selected' : ''
                            }`}
                            onClick={() => setSelectedRequest(request)}
                          >
                            {request.name}
                          </div>
                        ))
                      ) : (
                        <p>Заявки не найдены</p>
                      )}
                    </div>
                </div>
                <div className="ModalRight">
                    <div className="ModalHeader">
                        <h2 className="ModalTitle">Управление заявками</h2>
                        <button className="ModalCloseButton" onClick={onClose}>
                          <CloseIcon width="24" height="24"/>
                        </button>
                    </div>
                    {selectedRequest ? (
                      <>
                        <select defaultValue={selectedRequest.status} className="StatusSelector">
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
                    ) : (
                      <p>Выберите заявку для управления</p>
                    )}
                  </div>
            </div>
        </div>,
      modalContainer
    );
}
