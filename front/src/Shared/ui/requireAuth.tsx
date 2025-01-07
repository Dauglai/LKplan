import { Outlet, Navigate, useLocation } from 'react-router-dom';

import { useAppSelector } from 'App/model/hooks.ts';

import { selectCurrentToken } from 'Features/Auth/model/authSlice.ts';

const RequireAuth = () => {
  function getCSRFToken() {
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken'))
      ?.split('=')[1];
    return csrfToken;
  }
  const token = getCSRFToken();
  const location = useLocation();
  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
