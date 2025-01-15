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
import { apiSlice } from 'App/api/apiSlice';

export default function Header(): JSX.Element {
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

  const handleLogout = () => {
    dispatch(apiSlice.util.resetApiState());
    dispatch(logOut());
    navigate('/login');
  };

  return (
    <>
    <div className="HeaderContainer">
      <div className="GlobalHeader">
        <div className="HeaderLeft">
          {!isAuthPage && user && (
            <MenuIcon
              className="BurgerMenuIcon"
              width="24"
              height="24"
              strokeWidth="1.5"
              onClick={toggleSidebar}
            />
          )}
        </div>
        <div className="HeaderCenter">
          <LogoIcon />
        </div>
        <div className="HeaderRight">
          {user ? (
            <>
              <div className="UserInfo" onClick={() => navigate('/profile')}>
                <UserIcon className="UserIcon" width="16" height="16" strokeWidth="2" />
                {user.surname} {user.name}
              </div>
              <button onClick={handleLogout} className="LogoutButton">
                Выйти
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="LoginButton">
                Войти
              </button>
              <button onClick={() => navigate('/register')} className="RegisterButton">
                Зарегистрироваться
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    {!isAuthPage && <SidebarMenu isOpen={isSidebarOpen} onClose={toggleSidebar} />}
    </>
  );
}

