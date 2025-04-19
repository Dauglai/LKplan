import './TeamMeetingsTab.scss';
import { useGetMeetingsQuery, useRespondMeetingMutation } from 'Features/Auth/api/meetingApiSlice';
import { Input, Button, Tooltip } from 'antd';
import { useState } from 'react';
import moment from 'moment';
import 'moment/locale/ru';

moment.locale('ru');

export default function TeamMeetingsTab() {
  const { data: meetings = [], isLoading } = useGetMeetingsQuery();
  const [respondMeeting] = useRespondMeetingMutation();

  const [responseMap, setResponseMap] = useState<{ [id: number]: { attending: boolean | null; reason: string } }>({});

  const handleResponse = async (id: number, attending: boolean) => {
    const reason = responseMap[id]?.reason || '';
    setResponseMap(prev => ({ ...prev, [id]: { ...prev[id], attending } }));
    await respondMeeting({ meetingId: id, attending, reason });
  };

  const handleReasonChange = (id: number, reason: string) => {
    setResponseMap(prev => ({ ...prev, [id]: { ...prev[id], reason } }));
  };

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="TeamMeetingsTab">
      {meetings.map((meeting) => (
        <div className="MeetingCard" key={meeting.id}>
          <div className="MeetingHeader">
            <div className="MeetingDate">{moment(meeting.datetime).format('DD.MM.YYYY')}</div>
            <div className="MeetingTime">{moment(meeting.datetime).format('HH:mm')}</div>
            <div className="MeetingTitle">{meeting.name}</div>
          </div>

          <div className="MeetingActions">
            <Button
              type={responseMap[meeting.id]?.attending === true ? 'primary' : 'default'}
              className="GoButton"
              onClick={() => handleResponse(meeting.id, true)}
            >
              Приду ✓
            </Button>
            <Button
              danger
              type={responseMap[meeting.id]?.attending === false ? 'primary' : 'default'}
              className="NotGoButton"
              onClick={() => handleResponse(meeting.id, false)}
            >
              Не приду ✕
            </Button>
            <Input
              placeholder="Почему не сможете прийти?"
              className="ReasonInput"
              value={responseMap[meeting.id]?.reason || ''}
              onChange={(e) => handleReasonChange(meeting.id, e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
