import { Outlet } from 'react-router-dom';
import { Header } from 'Widgets/Header';
import './AuthedLayout.scss';

const AuthedLayout = () => {
  return (
    <div className="AuthedContainer">
      <Header />
      <div className="AuthedContainer-Content">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthedLayout;
