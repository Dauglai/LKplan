import { apiSlice} from 'App/api/apiSlice.ts';

/**
 * Интерфейс для работы с ролями пользователя
 * @typedef {Object} UserRole
 * @property {number} id - Уникальный идентификатор роли пользователя.
 * @property {'admin' | 'organizer' | 'direction_leader' | 'curator' | 'projectant'} role_type - Тип роли.
 * @property {string|null} content_type - Тип контента, к которому относится роль (или null).
 * @property {number|null} object_id - Идентификатор объекта, к которому привязана роль (или null).
 * @property {number} user - Идентификатор пользователя.
 */
export interface UserRole {
    id: number;
    role_type: 'admin' | 'organizer' | 'direction_leader' | 'curator' | 'projectant';
    content_type: string | null;
    object_id: number | null;
    user: number;
}


/**
 * Возможные разрешения пользователя при работе с сервисом.
 */
export type Permission = 
  | 'manage_roles'
  | 'edit_event'
  | 'edit_direction'
  | 'edit_project'
  | 'submit_application'
  | 'view_applications'
  | 'setup_notifications'
  | 'create_event'
  | 'create_direction'
  | 'create_project';



/**
 * Карта соответствия ролей и их разрешений.
 * @type {Record<UserRole['role_type'], Permission[]>}
 */
export const ROLE_PERMISSIONS: Record<UserRole['role_type'], Permission[]> = {
  admin: ['manage_roles'],
  organizer: [
    'edit_event',
    'edit_direction',
    'edit_project',
    'view_applications',
    'setup_notifications',
    'create_event',
    'create_direction',
    'create_project'
  ],
  direction_leader: [
    'edit_direction', 
    'create_project', 
    'edit_project'],
  curator: ['edit_project'],
  projectant: ['submit_application'],
};


/**
 * API для взаимодействия с ролями пользователя через сервер
 * 
 * @typedef {Object} UserRolesResponse
 * @property {number} count - Общее количество ролей.
 * @property {string|null} next - URL следующей страницы (если есть).
 * @property {string|null} previous - URL предыдущей страницы (если есть).
 * @property {UserRole[]} results - Список ролей.
 */

export const roleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Запрос на получение ролей пользователей.
     * 
     * @returns {UserRole[]} Массив ролей пользователей.
     */
    getUserRoles: builder.query<UserRole[], void>({
      query: () => ({
        url: '/api/role/',
        withCredentials: true,
      }),
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: UserRole[]}) => response.results,
      providesTags: ['UserRoles'],
    }),
  }),
})

export const { useGetUserRolesQuery } = roleApi

