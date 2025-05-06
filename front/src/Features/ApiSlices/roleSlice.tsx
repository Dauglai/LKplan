import { apiSlice} from 'App/api/apiSlice.ts';

export interface UserRole {
    id: number;
    role_type: 'admin' | 'organizer' | 'direction_leader' | 'curator' | 'projectant';
    content_type: string | null;
    object_id: number | null;
    user: number;
}

export type Permission = 
  | 'manage_roles'
  | 'edit_event'
  | 'edit_direction'
  | 'submit_application'
  | 'view_application_process'
  | 'setup_notifications'
  | 'edit_own_profile';

export const ROLE_PERMISSIONS: Record<UserRole['role_type'], Permission[]> = {
  admin: ['manage_roles'],
  organizer: [
    'edit_event',
    'manage_roles',
    'view_application_process',
    'setup_notifications',
  ],
  direction_leader: ['edit_direction', 'view_application_process'],
  curator: [],
  projectant: ['submit_application', 'view_application_process', 'edit_own_profile'],
};

export const roleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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

export default function hasPermission(
  roles: UserRole[],
  permission: Permission,
  context?: { content_type?: string; object_id?: number }
): boolean {
  return roles.some(role => {
    const rolePerms = ROLE_PERMISSIONS[role.role_type];
    if (!rolePerms?.includes(permission)) return false;

    // Глобальная роль
    if (!role.object_id) return true;

    // Если передан контекст — проверяем соответствие
    if (
      context &&
      role.content_type === context.content_type &&
      role.object_id === context.object_id
    ) {
      return true;
    }

    return false;
  });
}

export function useHasPermission(
  permission: Permission,
  context?: { content_type?: string; object_id?: number }
): boolean {
  const { data: roles, isLoading } = useGetUserRolesQuery()

  if (isLoading || !roles) return false

  return hasPermission(roles, permission, context)
}

export const { useGetUserRolesQuery } = roleApi

