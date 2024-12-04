import RequestsHeaderPanel from './RequestsHeaderPanel';
import RequestsList from './RequestsList';
import RequestsManagementModal from './modal/RequestsManagementModal';
import { useState } from 'react';
import { Request } from 'Pages/Requests/typeRequests';

import { mockRequests } from 'Pages/Requests/mockRequests';

export default function RequestsManagement(): JSX.Element {
    const [requests, setRequests] = useState<Request[]>(mockRequests);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  
    const handleSearch = (term: string) => {
      setSearchTerm(term);
    };

    const handleOpenModal = (request: Request | null = null) => {
      setSelectedRequest(request);
      setIsModalOpen(true);
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedRequest(null);
    };
  
    const filteredRequests = requests.filter((request) =>
      request.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return (
      <>
        <RequestsHeaderPanel
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onOpenModal={() => handleOpenModal()}
        />
        <RequestsList
          requests={filteredRequests}
          onRequestSelect={handleOpenModal}
        />
        {isModalOpen && (
          <RequestsManagementModal
            onClose={handleCloseModal}
            requests={filteredRequests}
            selectedRequest={selectedRequest}
          />
        )}
      </>
    );
  }