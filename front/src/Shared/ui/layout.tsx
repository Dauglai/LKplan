import { Outlet } from "react-router-dom";
import Header from "../../Widgets/Header/ui/Header.tsx";

const Layout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default Layout;
