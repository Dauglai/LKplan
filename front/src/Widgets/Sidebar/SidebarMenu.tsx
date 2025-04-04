import './SidebarMenu.scss';

import { useNavigate } from 'react-router-dom';

import CloseIcon from 'assets/icons/close.svg?react';
import HomeIcon from 'assets/icons/home.svg?react';
import UserIcon from 'assets/icons/user.svg?react';
import TableIcon from 'assets/icons/table.svg?react';
import BriefCaseIcon from 'assets/icons/briefcase.svg?react';
import { User } from 'Features/ApiSlices/userSlice';
import { useGetTeamsQuery } from 'Features/ApiSlices/teamSlice';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function SidebarMenu({ isOpen, onClose, user }: SidebarProps): JSX.Element {
  const navigate = useNavigate();
  const { data: teams } = useGetTeamsQuery();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const userTeam = teams?.find((team) => 
    team.students.includes(user.user_id)
  );

  const adminMenu = [
    {
      title: 'Управление',
      icon: <BriefCaseIcon width="16" height="16" strokeWidth="1" className="menu-btn" />,
      items: [
        { label: 'Мероприятия', path: '/events' },
        { label: 'Направления', path: '/directions' },
        { label: 'Проекты', path: '/projects' },
        { label: 'Список заявок', path: '/requests' },
      ],
    },
    {
      title: 'Планировщик',
      icon: <TableIcon width="16" height="16" strokeWidth="1" className="menu-btn" />,
      items: [
        { label: 'Команды', path: '/teams' },
        { label: 'Список задач', path: `/projects/:project_id/tasks` },
      ],
    },
  ];

  const studentMenu = [
    {
      title: 'Мероприятия',
      icon: <BriefCaseIcon width="16" height="16" strokeWidth="1" className="menu-btn" />,
      items: [
        { label: 'Доступные мероприятия', path: '/events' },
      ],
    },
    {
      title: 'Планировщик',
      icon: <TableIcon width="16" height="16" strokeWidth="1" className="menu-btn" />,
      items: [
        ...(userTeam ? [{ label: 'Моя команда', path: `/team/${userTeam.id}` }] : []),
        { label: 'Команды', path: '/teams' },
        { label: 'Список задач', path: `/projects/:project_id/tasks` },
      ],
    },
  ];
  

  const menu = user.role === 'Организатор' ? adminMenu : studentMenu;

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
              {section.title && (
                <li className="SidebarSectionTitle">
                  {section.icon}
                  {section.title}
                </li>
              )}
              {section.items.map((item) => (
                <li key={item.path} onClick={() => handleNavigation(item.path)}>
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

