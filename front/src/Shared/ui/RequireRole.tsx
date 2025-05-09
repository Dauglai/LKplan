import { Navigate, Outlet } from 'react-router-dom';
import { Permission, UserRole } from 'Features/ApiSlices/roleSlice';
import { ReactNode } from 'react';
import { useUserRoles } from 'Features/context/UserRolesContext';

/**
 * @typedef {Object} RequireRoleProps
 * @property {UserRole['role_type'][]} allowedRoles - Список допустимых ролей.
 * @property {Permission[]} [permissions] - Список разрешений, которые должен иметь пользователь.
 * @property {ReactNode} [fallback] - Компонент, который отобразится, если доступ запрещён. По умолчанию - редирект на "/".
 */
interface RequireRoleProps {
  allowedRoles?: UserRole['role_type'][];
  permissions?: Permission[];
  fallback?: ReactNode;
}

/**
 * Компонент для защиты маршрутов в зависимости от ролей и/или разрешений.
 * 
 * @param {RequireRoleProps} props - Свойства компонента.
 * @returns {JSX.Element} - Outlet, если доступ разрешён, иначе редирект или fallback-компонент.
 *
 * @example
 * <Route element={<RequireRole allowedRoles={['projectant']} />}>
 *   <Route path="/projectant-dashboard" element={<ProjectantDashboard />} />
 * </Route>
 *
 * <Route element={<RequireRole permissions={['edit_event']} />}>
 *   <Route path="/edit-event/:id" element={<EditEvent />} />
 * </Route>
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ 
  allowedRoles = [], 
  permissions = [], 
  fallback 
}) => {
  const { hasRole, hasPermission, isLoading } = useUserRoles();

  // Пока данные о ролях и разрешениях загружаются, рендерим скелетон или пустой экран
  if (isLoading) {
    return null; // Либо можно вернуть лоадер, например <Loader />
  }

  // Проверка ролей
  const roleCheck = allowedRoles.length ? allowedRoles.some(hasRole) : true;

  
  // Проверка разрешений
  const permissionCheck = permissions.length 
    ? permissions.every(permission => hasPermission(permission)) 
    : true;

  if (!roleCheck || !permissionCheck) {
    return fallback ? <>{fallback}</> : <Navigate to="/" replace />;
  }

  return <Outlet />;
};
