import { useParams } from 'react-router-dom';
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice';
import { useGetSpecializationsQuery } from 'Features/ApiSlices/specializationSlice';
import BackButton from "Widgets/BackButton/BackButton";
import 'Styles/pages/common/InfoPageStyle.scss';
import { useEffect } from 'react';
import { getInitials } from 'Features/utils/getInitials';

export default function UsersProfilePage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const { data: users, isLoading: isUsersLoading } = useGetUsersQuery();
    const { data: specializations, isLoading: isSpecializationsLoading } = useGetSpecializationsQuery();
    const user = users?.find((u) => u.user_id === Number(id));

    useEffect(() => {
        if (user) {
            document.title = `${user.surname} ${getInitials(user.name, user.patronymic)} - MeetPoint`;
        } else {
            document.title = `Страница пользователя - MeetPoint`;
        }
	}, []);

    if (isUsersLoading || isSpecializationsLoading) {
        return <div>Загрузка...</div>;
    }

    if (!user) {
        return <div>Пользователь не найден</div>;
    }

    const userSpecializations = user.specializations
        ?.map((specId) => specializations.find((spec) => spec.id === specId)?.name)
        .filter(Boolean) || [];

    return (
        <div className="UserProfileContainer InfoPage">
        <div className="UserProfileInfoHeader InfoHeader">
            <BackButton />
            <h2>{`${user.surname} ${user.name} ${user.patronymic || ''}`}</h2>
        </div>
        <div className="UserProfileInfo MainInfo">
            <h3>Личная информация</h3>
            <ul className="ListInfo">
                <li><strong>Курс:</strong> {user.course || 'Не указано'}</li>
                <li><strong>Университет:</strong> {user.university || 'Не указано'}</li>
                <li><strong>Работа:</strong> {user.job || 'Не указано'}</li>
                <li><strong>Специализации:</strong> {userSpecializations.join(', ') || 'Не указаны'}</li>
            </ul>
            <h3>Контакты</h3>
            <ul className="ListInfo">
                <li><strong>Email:</strong> {user.email || 'Не указано'}</li>
                <li><strong>Telegram:</strong> {user.telegram}</li>
                <li><strong>ВКонтакте:</strong> {user.vk || 'Не указано'}</li>
            </ul>
        </div>
        </div>
    );
}
