import { Outlet } from 'react-router-dom';

import Header from 'Widgets/Header/ui/Header.tsx';

import './layout.scss';

const Layout = () => {
  return (
    <div className="GlobalContainer">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
