import { Outlet } from 'react-router-dom';

import Header from 'Widgets/Header/ui/Header.tsx';

import './layout.scss';

const AuthLayout = () => {
  return (
    <div className="AuthContainer">
      <Header />
      <Outlet />
    </div>
  );
};

export default AuthLayout;
