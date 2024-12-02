import RequestsHeaderPanel from './RequestsHeaderPanel';
import RequestsList from './RequestsList';
import { useState } from 'react';
import { Request } from 'Pages/Requests/typeRequests';

import { mockRequests } from 'Pages/Requests/mockRequests';

export default function RequestsManagement(): JSX.Element {
    const [requests, setRequests] = useState<Request[]>(mockRequests);
    const [searchTerm, setSearchTerm] = useState('');
  
    const handleSearch = (term: string) => {
      setSearchTerm(term);
    };
  
    const filteredRequests = requests.filter((request) =>
      request.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return (
      <>
        <RequestsHeaderPanel
          searchTerm={searchTerm}
          onSearch={handleSearch}
          requests={requests}
        />
        <RequestsList requests={filteredRequests} />
      </>
    );
  }