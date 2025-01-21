import { useParams, useNavigate } from "react-router-dom";
import { useGetEventByIdQuery } from "Features/ApiSlices/eventSlice";
import { useCreateApplicationMutation } from "Features/ApiSlices/applicationSlice";
import { useGetUserQuery } from 'Features/ApiSlices/userSlice';
import RequestForm from "./RequestForm";
import { useNotification } from 'Widgets/Notification/Notification';
import 'Styles/InfoPageStyle.scss';
import 'Styles/FormStyle.scss';
import './RequestPage.scss';
import BackButton from "Widgets/BackButton/BackButton";
import { useEffect } from "react";

export default function RequestPage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const eventId = Number(id);
    const { data: user, isLoading: userLoading, error: userError } = useGetUserQuery();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const { data: event, isLoading: eventLoading, error: eventError } = useGetEventByIdQuery(eventId);
    const [createApplication, { isLoading: isSubmitting, isSuccess, isError }] = useCreateApplicationMutation();

    useEffect(() => {
		document.title = 'Подать заявку - MeetPoint';
	}, []);

    const handleSubmit = async (requestData: any) => {
        try {
        await createApplication(requestData).unwrap();
        showNotification('Заявка успешно отправлена!', 'success');
        navigate('/events')
        } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        showNotification(`Ошибка при отправке заявки: ${error.status} ${error.stage}`, 'error');
        }
    };

        if (userLoading || eventLoading) {
            return <div>Загрузка...</div>;
        }

        if (eventError || userError) {
            return <div>Ошибка загрузки данных</div>;
        }

    return (
        <div className="RequestPage InfoPage">
            <div className="RequestHeader InfoHeader">
                <BackButton />
                <h2>{event?.name}</h2>
            </div>
            <div className="RequestContainer">
                <div className="EventInfo MainInfo">
                    <div className="EventDescription InfoDescription">{event?.description}</div>
                    <ul className="SpecializationsList">
                        {event?.specializationsSet.map((spec) => <li>{spec.name}</li>)}
                    </ul>
                </div>
                <RequestForm eventId={eventId} userId={user.user_id} onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
