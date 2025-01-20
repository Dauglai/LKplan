import './SidebarMenu.scss';

import { useNavigate } from 'react-router-dom';

import CloseIcon from 'assets/icons/close.svg?react';
import HomeIcon from 'assets/icons/home.svg?react';
import UserIcon from 'assets/icons/user.svg?react';
import TableIcon from 'assets/icons/table.svg?react';
import BriefCaseIcon from 'assets/icons/briefcase.svg?react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarProps): JSX.Element {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className={`Sidebar ${isOpen ? 'open' : ''}`}>
      <div className="SidebarHeader">
        <h3>Меню</h3>
          <CloseIcon 
          width="20" 
          height="20" 
          strokeWidth="1.5" 
          onClick={onClose} 
          className="CloseButton"/>
      </div>
      <div className="SidebarContent">
        <ul>
          <li onClick={() => handleNavigation('/')} className="SidebarSection">
          <HomeIcon
                width="16" 
                height="16" 
                strokeWidth="1" 
                className="menu-btn"/>
            Главная</li>
          <li onClick={() => handleNavigation('/profile')} className="SidebarSection">
            <UserIcon
                width="16" 
                height="16" 
                strokeWidth="1" 
                className="menu-btn"/>
            Профиль</li>
          <ul className="SidebarSection">
            <li className="SidebarSectionTitle">
                <BriefCaseIcon
                    width="16" 
                    height="16" 
                    strokeWidth="1" 
                    className="menu-btn"/>
                Управление
            </li>
            <li onClick={() => handleNavigation('/events')}>Мероприятия</li>
            <li onClick={() => handleNavigation('/directions')}>Направления</li>
            <li onClick={() => handleNavigation('/projects')}>Проекты</li>
            <li onClick={() => handleNavigation('/requests')}>Список заявок</li>
          </ul>
          <ul className="SidebarSection">
            <li className="SidebarSectionTitle">
                <TableIcon
                    width="16" 
                    height="16" 
                    strokeWidth="1" 
                    className="menu-btn"/>
                Планировщик
            </li>
            <li onClick={() => handleNavigation('/teams')}>Команды</li>
            <li onClick={() => handleNavigation('/members')}>Участники</li>
            <li onClick={() => handleNavigation('/tasks')}>Список задач</li>
          </ul>
        </ul>
      </div>
    </div>
  );
}
