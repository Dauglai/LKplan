
import './SidebarMenu.scss';

import { useNavigate } from 'react-router-dom';

import CloseIcon from 'assets/icons/close.svg?react';
import HomeIcon from 'assets/icons/home.svg?react';
import UserIcon from 'assets/icons/user.svg?react';
import TableIcon from 'assets/icons/table.svg?react';
import ListIcon from 'assets/icons/list.svg?react';
import { User } from 'Features/ApiSlices/userSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';
import { useUserRoles } from 'Features/context/UserRolesContext';
import { useGetApplicationsQuery, useGetUserApplicationsQuery } from 'Features/ApiSlices/applicationSlice.ts';
import { Tag } from 'antd';
import { useGetEventByIdQuery, useGetEventsQuery } from 'Features/ApiSlices/eventSlice.ts';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function SidebarMenu({ isOpen, onClose, user }: SidebarProps): JSX.Element {
  const navigate = useNavigate();
  const { data: teams } = useGetTeamsQuery();
  const { hasRole } = useUserRoles();
  const { data: applications} = useGetUserApplicationsQuery(user.user_id);
  const { data: events} = useGetEventsQuery();


  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const userTeam = teams?.find((team) =>
    team.students.includes(user.user_id)
  );

  // 🔽 Мероприятия пользователя
  const dynamicEventSections = applications?.filter(app => app.is_approved).map((application) => {
    const myTeam = teams?.find(
      (team) => team.project === application.project && team.students.includes(user.user_id)
    );

    return {
      title: application.event.name,
      icon: (
        <Tag color="#d9d9d9" style={{ marginRight: 8 }}>{`M${application.id}`}</Tag>
      ),
      items: [
        ...(myTeam ? [{ label: 'Моя команда', path: `/teams/${myTeam.id}` }] : []),
        { label: 'Формирование команды', path: `/teams/create?event=${application.event.id}` },
        { label: 'Список задач', path: `/projects/${application.project}/tasks?team=${myTeam?.id ?? ''}` },
        { label: 'Канбан доска', path: `/projects/${application.project}/kanban?team=${myTeam?.id ?? ''}` },
        { label: 'Диаграмма Ганта', path: `/projects/${application.project}/gantt?team=${myTeam?.id ?? ''}` }

      ],
    };
  }) || [];

  const dynamicEventSectionsAdmin = (events || []).map((event) => ({
    title: event.name,
    icon: (
      <Tag color="#d9d9d9" style={{ marginRight: 8 }}>{`M${event.event_id}`}</Tag>
    ),
    items: [
      { label: 'Формирование команды', path: `/teams/create?event=${event?.event_id ?? ''}` },
      { label: 'Список задач', path: `/projects/tasks?team=${event?.event_id ?? ''}` },
      { label: 'Канбан доска', path: `/projects/kanban?event=${event?.event_id ?? ''}` },
      { label: 'Диаграмма Ганта', path: `/projects/gantt` }
    ],
  })) || [];


  const adminMenu = [



  const organizerMenu = [
    {
      icon: <ListIcon width="16" height="16" strokeWidth="1" className="menu-btn" />,
      items: [
        { label: 'Мероприятия', path: '/events' },
        { label: 'Направления', path: '/directions' },
        { label: 'Проекты', path: '/projects' },
      ],
    },
    {
      icon: <ListIcon width="16" height="16" strokeWidth="1" className="menu-btn" />,
      items: [
        { label: 'Список заявок', path: '/requests' },
      ],
    },
    {
      title: 'Планировщик',
      icon: <TableIcon width="16" height="16" strokeWidth="1" className="menu-btn" />,
      items: [
        //{ label: 'Формирование команды', path: `/teams/create` },
       // { label: 'Команды', path: '/teams' },
      ],
    },
    ...dynamicEventSectionsAdmin,
  ];

  const directionLeaderMenu = [
    {
      icon: <ListIcon width="16" height="16" strokeWidth="1" className="menu-btn" />,
      items: [
        { label: 'Мероприятия', path: '/events' },
        { label: 'Направления', path: '/directions' },
        { label: 'Проекты', path: '/projects' },
      ],
    },
    ...dynamicEventSections,
  ];

  const projectantMenu = [
    {
      icon: <ListIcon width="16" height="16" strokeWidth="1" className="menu-btn" />,
      items: [
        { label: 'Доступные мероприятия', path: '/events' },
        ...(userTeam ? [{ label: 'Моя команда', path: `/teams/${userTeam.id}` }] : []),
      ],
    },
    ...dynamicEventSections, //  вставляем мероприятия
  ];

  let menu = [];

  if (hasRole('organizer')) {
    menu = organizerMenu;
  } else if (hasRole('direction_leader')) {
    menu = directionLeaderMenu;
  } else if (hasRole('projectant')) {
    menu = projectantMenu;
  }

  return (
    <div className={`Sidebar ${isOpen ? 'open' : ''}`}>
      <div className="SidebarHeader">
        <h3>Меню</h3>
        <CloseIcon
          width="20"
          height="20"
          strokeWidth="1.5"
          onClick={onClose}
          className="CloseButton"
        />
      </div>
      <div className="SidebarContent">
        <ul>
          <li onClick={() => handleNavigation('/')} className="SidebarSection">
            <HomeIcon width="16" height="16" strokeWidth="1" className="menu-btn" />
            Главная
          </li>
          <li onClick={() => handleNavigation('/profile')} className="SidebarSection">
            <UserIcon width="16" height="16" strokeWidth="1" className="menu-btn" />
            Профиль
          </li>

          {menu.map((section, index) => (
            <ul key={index} className="SidebarSection">
              {section.items.map((item) => (
                <li key={item.path} onClick={() => handleNavigation(item.path)} className="SidebarSectionTitle">
                  {section.icon}
                  {item.label}
                </li>
              ))}
            </ul>
          ))}
        </ul>
      </div>
    </div>
  );
}
