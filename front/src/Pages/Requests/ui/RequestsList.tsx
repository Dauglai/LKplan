import { Request } from 'Pages/Requests/typeRequests';
import React, { useEffect } from 'react';
import { useGetApplicationsQuery } from 'Features/ApiSlices/applicationSlice';
import { useGetStatusesAppQuery } from 'Features/ApiSlices/statusAppSlice';
import { useGetDirectionsQuery } from 'Features/ApiSlices/directionSlice';
import { useGetUserQuery } from 'Features/ApiSlices/userSlice';

import './RequestsList.scss';

export default function RequestsList({ onRequestSelect }: { onRequestSelect: (request: Request) => void; }): JSX.Element {
  const { data: applications, isLoading: applicationsLoading } = useGetApplicationsQuery();
  const { data: statuses, isLoading: statusesLoading } = useGetStatusesAppQuery();
  const { data: directions, isLoading: directionsLoading } = useGetDirectionsQuery();
  const { data: user, isLoading: usersLoading } = useGetUserQuery();

  if (applicationsLoading || statusesLoading || directionsLoading || usersLoading) {
    return <div>Загрузка..</div>;
  }
  return (
    <div className="RequestsList">
      {statuses.map((status, index) => {
        const filteredRequests = applications?.filter((request) => request.status === status.id); // Теперь фильтруем по id статуса
        const columnClass = `column-${index + 1}`;

        return (
          <div className={`RequestsListColumn ${columnClass}`} key={status.id}>
            <div className="RequestStatusName">{status.name}</div>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => {
                const direction = directions?.find(d => d.id === request.direction);
                
                return (
                  <div
                    key={request.id}
                    className="RequestItem"
                    onClick={() => onRequestSelect(request)}
                  >
                    <h3 className="RequestName">{user?.name} {user?.surname} {user?.patronymic}</h3>
                    <span className="RequestDirection">#{direction?.name || 'Неизвестно'}</span>
                  </div>
                  )})
            ) : (
              <div className="NoRequestsMessage">Заявки не найдены</div>
            )}
          </div>
        );
      })}
    </div>
  );
}


