import { Request } from 'Pages/Requests/typeRequests';

import './RequestsList.scss';

const statuses: Request['status'][] = [
  'Новые заявки',
  'Вступившие в орг. чат',
  'Приступившие к работе',
];


export default function RequestsList({ 
  requests,
  onRequestSelect 
}: {
  requests: Request[];
  onRequestSelect: (request: Request) => void;
}): JSX.Element {
  return (
    <div className="RequestsList">
      {statuses.map((status, index) => {
        const filteredRequests = requests.filter((request) => request.status === status);
        const columnClass = `column-${index + 1}`;

        return (
          <div className={`RequestsListColumn ${columnClass}`} key={status}>
            <div className="RequestStatusName">{status}</div>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="RequestItem"
                  onClick={() => onRequestSelect(request)}
                >
                  <h3 className="RequestName">{request.name}</h3>
                  <span className="RequestDirection">#{request.direction}</span>
                </div>
              ))
            ) : (
              <div className="NoRequestsMessage">Заявки не найдены</div>
            )}
          </div>
        );
      })}
    </div>
  );
}


