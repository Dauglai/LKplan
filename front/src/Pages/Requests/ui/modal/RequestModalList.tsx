import { Request } from 'Pages/Requests/typeRequests';

import "./RequestModalList.scss";

export function RequestModalList({
    requests,
    selectedRequest,
    onRequestSelect,
  }: {
    requests: Request[];
    selectedRequest: Request | null;
    onRequestSelect: (request: Request) => void;
  }): JSX.Element {
    return (
      <div className="RequestModalList">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.id}
              className={`RequestListItem ${
                selectedRequest?.id === request.id ? 'Selected' : ''
              }`}
              onClick={() => onRequestSelect(request)}
            >
              {request.name}
            </div>
          ))
        ) : (
          <p>Заявки не найдены</p>
        )}
      </div>
    );
}
  