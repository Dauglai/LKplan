import { Navigate, Outlet } from 'react-router-dom';
import { useGetUserQuery } from 'Features/ApiSlices/userSlice';

interface RequireRoleProps {
  allowedRoles: ('Организатор' | 'Практикант')[];
}

export const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles }) => {
  const { data: user, isLoading } = useGetUserQuery();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
