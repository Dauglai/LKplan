import './Header.scss';

import LogoIcon from 'assets/LogoIcon.svg?react';
import UserIcon from 'assets/icons/user.svg?react';
import MenuIcon from 'assets/icons/menu.svg?react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useGetUserQuery } from 'Features/ApiSlices/userSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { logOut } from 'Features/Auth/model/authSlice';
import SidebarMenu from 'Widgets/Sidebar/SidebarMenu';

export default function Header(): JSX.Element {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const { data: user } = useGetUserQuery(undefined, {
    skip: isAuthPage,
  });

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
    navigate('/profile');
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  return (
    <>
    <div className="GlobalHeader">
      {!isAuthPage && (
        <div className="HeaderLeft">
        <MenuIcon 
            className="BurgerMenuIcon"
            width="24"
            height="24"
            strokeWidth="1.5"
            onClick={toggleSidebar}/>
            </div>
          )}
      <div className="HeaderCenter">
        <LogoIcon />
      </div>
      {!isAuthPage && (
      <div className="HeaderRight">
        <div className="UserInfo" onClick={handleProfileClick}>
          <UserIcon 
            className="UserIcon"
            width="16"
            height="16"
            strokeWidth="2"/>
          {user?.surname} {user?.name}
        </div>
        <button onClick={handleLogout} className="LogoutButton">
          Выйти
        </button>
      </div>)}
    </div>
    <SidebarMenu isOpen={isSidebarOpen} onClose={toggleSidebar} />
    </>
  );
}
