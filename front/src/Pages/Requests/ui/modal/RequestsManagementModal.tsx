import ReactDOM from 'react-dom';
import { useState, useEffect, useMemo } from 'react';
import { Request } from 'Pages/Requests/typeRequests';
import { RequestSearchBar } from './RequestSearchBar';
import { RequestModalList } from './RequestModalList';
import { RequestDetails } from './RequestDetails';

import CloseIcon from 'assets/icons/x-circle.svg?react';
import './RequestsManagementModal.scss';

type RequestsManagementModalProps = {
  onClose: () => void;
  requests: Request[];
  selectedRequest: Request | null;
};

export default function RequestsManagementModal({
  onClose,
  requests,
  selectedRequest,
}: RequestsManagementModalProps): JSX.Element | null {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedRequest, setLocalSelectedRequest] = useState<Request | null>(selectedRequest);

  const modalRoot = document.getElementById('modal-root') || document.body;
  const modalContainer = useMemo(() => document.createElement('div'), []);

  useEffect(() => {
    setLocalSelectedRequest(selectedRequest);
  }, [selectedRequest]);


  useEffect(() => {
    modalRoot.appendChild(modalContainer);

    return () => {
      modalRoot.removeChild(modalContainer);
    };
  }, [modalContainer, modalRoot]);

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) =>
        request.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, requests]
  );

  return ReactDOM.createPortal(
    <div className="ModalOverlay" onClick={onClose}>
      <div
        className="RequestModalContent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ModalLeft">
          <RequestSearchBar
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            requestCount={filteredRequests.length}
          />
          <RequestModalList
            requests={filteredRequests}
            selectedRequest={localSelectedRequest}
            onRequestSelect={setLocalSelectedRequest}
          />
        </div>
        <div className="ModalRight">
          <div className="ModalHeader">
            <h2 className="ModalTitle">Управление заявками</h2>
            <button className="ModalCloseButton" onClick={onClose}>
              <CloseIcon width="24" height="24" />
            </button>
          </div>
          {localSelectedRequest ? (
            <RequestDetails
              selectedRequest={localSelectedRequest}
              onClose={onClose}
            />
          ) : (
            <p>Выберите заявку для управления</p>
          )}
        </div>
      </div>
    </div>,
    modalContainer
  );
}
