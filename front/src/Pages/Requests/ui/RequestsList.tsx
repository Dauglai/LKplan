import RequestsHeaderPanel from './RequestsHeaderPanel';
import RequestItem from './RequestItem';

import './RequestsList.scss';

type Status = 'new' | 'joined_chat' | 'accepted';

type Request = {
  id: number;
  name: string;
  status: Status;
  direction: string;
};

export default function RequestsList(): JSX.Element {
    const requests: Request[] = [
      { id: 1, name: 'Тони Старк Отчество', status: 'new', direction: 'Веб' },
      { id: 2, name: 'Тони Старк Отчество', status: 'joined_chat', direction: '1C' },
      { id: 3, name: 'Тони Старк Отчество', status: 'accepted', direction: 'Игры' },
      { id: 4, name: 'Тони Старк Отчество', status: 'new', direction: 'Веб' },
    ];
  
    const statuses: { [key: string]: string } = {
      "Новые заявки": "new",
      "Вступившие в орг. чат": "joined_chat",
      "Приступившие к работе": "accepted"
    };
  
    return (
        <>
            <RequestsHeaderPanel />
            <div className="RequestsList">
                {Object.entries(statuses).map(([label, status]) => (
                <div className="RequestsListColumn" key={status}>
                    <div className="RequestStatusName">{label}</div>
                    {requests
                    .filter((request) => request.status === status)
                    .map((request) => (
                        <RequestItem
                        key={request.id}
                        name={request.name}
                        direction={request.direction}
                        />
                    ))}
                </div>
                ))}
            </div>
        </>
    );
}