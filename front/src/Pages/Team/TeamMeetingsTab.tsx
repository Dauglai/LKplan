import './TeamMeetingsTab.scss';
import { Input, Button } from 'antd';
import { useState } from 'react';
import moment from 'moment';
import 'moment/locale/ru';
import {
  useGetUserMeetingsQuery,
  useRespondMeetingMutation,
} from 'Features/ApiSlices/meetingApiSlice';
import { useParams } from 'react-router-dom';

moment.locale('ru');

export default function TeamMeetingsTab({ currentUser }) {
  const userId = Number(currentUser);
  const { teamId } = useParams();

  const { data: userMeetingsData = [], isLoading: loadingUser } = useGetUserMeetingsQuery(userId!, { skip: !userId });
  const [respondMeeting] = useRespondMeetingMutation();

  const [responseMap, setResponseMap] = useState<{
    [id: number]: { attending: boolean | null; reason: string; responded: boolean }
  }>({});

  const handleResponse = async (id: number, attending: boolean) => {
    if (responseMap[id]?.responded) return; // 🔒 блок повторной отправки

    const reason = responseMap[id]?.reason || '';
    await respondMeeting({ meeting: id, attending, reason, user: userId });

    setResponseMap((prev) => ({
      ...prev,
      [id]: { attending, reason, responded: true },
    }));
  };

  const handleReasonChange = (id: number, reason: string) => {
    if (responseMap[id]?.responded) return; // 🔒 блок изменения причины
    setResponseMap((prev) => ({
      ...prev,
      [id]: { ...prev[id], reason, attending: prev[id]?.attending ?? null, responded: false },
    }));
  };

  if (loadingUser) return <div>Загрузка...</div>;

  return (
    <div className="TeamMeetingsTab">
      {userMeetingsData.map((meeting) => {
        const response = responseMap[meeting.id] || {};
        const isDisabled = response.responded;

        return (
          <div className="MeetingCard" key={meeting.id}>
            <div className="MeetingHeader">
              <div className="MeetingDate">{moment(meeting.datetime).format('DD.MM.YYYY')}</div>
              <div className="MeetingTime">{moment(meeting.datetime).format('HH:mm')}</div>
              <div className="MeetingTitle">{meeting.name}</div>
            </div>

            <div className="MeetingActions">
              <Button
                type={response.attending === true ? 'primary' : 'default'}
                className="GoButton"
                onClick={() => handleResponse(meeting.id, true)}
                disabled={isDisabled}
              >
                Приду ✓
              </Button>
              <Button
                danger
                type={response.attending === false ? 'primary' : 'default'}
                className="NotGoButton"
                onClick={() => handleResponse(meeting.id, false)}
                disabled={isDisabled}
              >
                Не приду ✕
              </Button>
              <Input
                placeholder="Почему не сможете прийти?"
                className="ReasonInput"
                value={response.reason || ''}
                onChange={(e) => handleReasonChange(meeting.id, e.target.value)}
                disabled={isDisabled}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
