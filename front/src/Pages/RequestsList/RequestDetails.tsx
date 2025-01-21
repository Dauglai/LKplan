import { Application } from 'Features/ApiSlices/applicationSlice';
import CloseIcon from 'assets/icons/close.svg?react';

interface RequestDetailsProps {
    closeModal: () => void;
    request: Application; 
}

export default function RequestDetails({ closeModal, request }: RequestDetailsProps): JSX.Element {    

    return (
        <div className="FormContainer">
            <div className="Form">
                <div className="ModalFormHeader">
                    <h2>Детали заявки</h2>
                    <CloseIcon width="24" height="24" strokeWidth="1" onClick={closeModal} className="ModalCloseButton"/>
                </div>
                <p>{`${request.user.surname} ${request.user.name} ${request.user.patronymic}`}</p>
                <p><strong>Telegram:</strong> {request.user.telegram}</p>
                <p><strong>Мероприятие:</strong> {request.event.name}</p>
                <p><strong>Направление:</strong> {request.direction.name}</p>
                <p><strong>Проект:</strong> {request.project.name}</p>
                <p><strong>Статус:</strong> {request.status.name}</p>
                <p><strong>Команда:</strong> {request.team?.name || 'Не указана'}</p>
                <p><strong>Специализация:</strong> {request.specialization?.name || "Не указана"}</p>
                <p><strong>Сообщение:</strong> {request.message ? request.message : '-'}</p>
                <p><strong>Состоит в чате?</strong> {request.is_link ? "Да" : "Нет"}</p>
                <p><strong>Ответ:</strong> {request.comment ? request.comment : '-'}</p>
            </div>
        </div>
    );
};
