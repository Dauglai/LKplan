// context/UserRolesContext.tsx
import {
  createContext,
  useContext,
  ReactNode,
} from 'react'
import { Permission, ROLE_PERMISSIONS, UserRole, useGetUserRolesQuery } from 'Features/ApiSlices/roleSlice'
import { useGetUserQuery } from 'Features/ApiSlices/userSlice'
import { useSelector } from 'react-redux'

interface UserRolesContextValue {
  roles: UserRole[]
  hasRole: (roleType: UserRole['role_type']) => boolean
  getRolesByType: (roleType: UserRole['role_type']) => UserRole[]
  getRoleForObject: (
    roleType: UserRole['role_type'],
    objectId: number,
    contentType: string
  ) => UserRole | undefined
  hasPermission: (permission: Permission,
    context?: { content_type?: string; object_id?: number}) => boolean
  isLoading: boolean;
}

const UserRolesContext = createContext<UserRolesContextValue | null>(null)


/**
 * Контекст провайдер ролей и разрешений пользователя.
 * 
 * Используется для предоставления информации о ролях текущего пользователя 
 * и проверки наличия разрешений.
 *
 * @param {Object} props - Свойства компонента.
 * @param {ReactNode} props.children - Вложенные компоненты.
 *
 * @returns {JSX.Element} Провайдер контекста ролей пользователя.
 *
 * @example
 * <UserRolesProvider>
 *   <YourComponent />
 * </UserRolesProvider>
 */

export const UserRolesProvider = ({ children }: { children: ReactNode }) => {

  const { data: user, isLoading: isUserLoading } = useGetUserQuery();
  const { token } = useSelector(state => state.auth);

    // Пропускаем запрос на роли, если нет токена
  const { data: allRoles = [], isLoading: isRolesLoading, error } = useGetUserRolesQuery(undefined, {
    skip: !token,  // Пропускаем запрос на роли, если нет токена
  });

  // Получаем роли только для текущего пользователя
  const roles = allRoles.filter(role => role.user === user?.user_id)

  /**
   * Проверяет наличие роли у пользователя.
   *
   * @param {UserRole['role_type']} roleType - Тип роли.
   * @returns {boolean} - Возвращает true, если у пользователя есть указанная роль.
   */
  const hasRole = (roleType: UserRole['role_type']) => 
    roles.some(r => r.role_type === roleType)

  /**
   * Возвращает все роли определённого типа.
   *
   * @param {UserRole['role_type']} roleType - Тип роли.
   * @returns {UserRole[]} - Массив ролей указанного типа.
   */
  const getRolesByType = (roleType: UserRole['role_type']) =>
    roles.filter(r => r.role_type === roleType)

  /**
   * Возвращает роль для конкретного объекта.
   *
   * @param {UserRole['role_type']} roleType - Тип роли.
   * @param {number} objectId - Идентификатор объекта.
   * @param {string} contentType - Тип контента.
   * @returns {UserRole | undefined} - Роль для объекта или undefined.
   */
  const getRoleForObject = (
    roleType: UserRole['role_type'],
    objectId: number,
    contentType: string
  ) => {
    return roles.find(
      r =>
        r.role_type === roleType &&
        r.object_id === objectId &&
        r.content_type === contentType
    );
  };

  /**
   * Проверяет наличие разрешения у пользователя.
   *
   * @param {Permission} permission - Проверяемое разрешение.
   * @returns {boolean} - Возвращает true, если у пользователя есть указанное разрешение.
   *
   * @example
   * const canEditEvent = hasPermission('edit_event');
   */
  const hasPermission = (
    permission: Permission,
  ): boolean => {
    return roles.some(role => {
      const rolePerms = ROLE_PERMISSIONS[role.role_type];
  
      // Если роль включает необходимое разрешение, возвращаем true
      if (rolePerms?.includes(permission)) {
        return true;
      }
  
      // Если не включается разрешение, возвращаем false
      return false;
    });
  };

  if (error) {
    console.error("Ошибка при загрузке ролей", error);
  }

  return (
    <UserRolesContext.Provider
      value={{ roles, hasRole, getRolesByType, getRoleForObject, hasPermission, isLoading: isRolesLoading}}
    >
      {children}
    </UserRolesContext.Provider>
  );
};

/**
 * Хук для использования контекста ролей и разрешений.
 * 
 * @returns {UserRolesContextValue} Контекст значений ролей и разрешений.
 *
 * @throws {Error} Если хук используется вне `UserRolesProvider`.
 *
 * @example
 * const { hasPermission } = useUserRoles();
 * const canEdit = hasPermission('edit_event');
 */
export const useUserRoles = (): UserRolesContextValue => {
  const context = useContext(UserRolesContext);

  if (!context) {
    throw new Error("useUserRoles must be used within a UserRolesProvider");
  }

  return context;
};

