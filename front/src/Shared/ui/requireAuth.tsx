import { Outlet, Navigate, useLocation } from 'react-router-dom';

import { useAppSelector } from 'App/model/hooks.ts';

import { selectCurrentToken } from 'Features/Auth/model/authSlice.ts';

const RequireAuth = () => {
  const token = useAppSelector(selectCurrentToken);
  const location = useLocation();
  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
