import RequestItem from './RequestItem';
import { Request } from 'Pages/Requests/typeRequests';

import './RequestsList.scss';

const statuses: Request['status'][] = [
  'Новые заявки',
  'Вступившие в орг. чат',
  'Приступившие к работе',
];

type RequestsListProps = {
  requests: Request[];
};

export default function RequestsList({ requests }: RequestsListProps): JSX.Element {
  return (
    <div className="RequestsList">
      {statuses.map((status) => {
        const filteredRequests = requests.filter((request) => request.status === status);

        return (
          <div className="RequestsListColumn" key={status}>
            <div className="RequestStatusName">{status}</div>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <RequestItem
                  key={request.id}
                  name={request.name}
                  direction={request.direction}
                />
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

