import { apiSlice} from 'App/api/apiSlice.ts';

export interface User {
  user_id: number;
  telegram: string;
  email: string;
  name: string;
  surname: string;
  patronymic?: string; 
  course: string;
  university: string;
  vk: string;
  job: string;
  specializations: number[];
  role: string;
}

const determineUserRole = (email: string): 'Организатор' | 'Практикант' => {
  return email === 'admin@admin.com' ? 'Организатор' : 'Практикант';
};

const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<User, void>({
      query: () => ({
        url: '/api/profile/', // Получение текущего пользователя
        withCredentials: true,
      }),
      providesTags: ['User'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: User[] }) => {
        const user = response.results[0];
        return { ...user, role: determineUserRole(user.email) };
      },
    }),

    getUsers: builder.query<User[], void>({
      query: () => ({
        url: '/api/profiles/', // Получение списка пользователей
        withCredentials: true,
      }),
      providesTags: ['User'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: User[] }) => {
        return response.results;
      },
    }),

    getProfilesByIds: builder.query<User[], number[]>({
      query: (ids) => ({
        url: `/api/profiles/?ids=${ids.join(',')}`, // Запрос списка пользователей по ID
        withCredentials: true,
      }),
      providesTags: ['User'],
    }),

    updateUser: builder.mutation<User, { data: Omit<User, 'user_id'> }>({
      query: ({ data }) => ({
        url: `/api/profile/update/`, // Обновление данных пользователя
        method: 'PUT',
        body: data,
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }),
      invalidatesTags: ['User'],
    }),

    partialUpdateUser: builder.mutation<User, { data: Partial<Omit<User, 'user_id'>> }>({
      query: ({ data }) => ({
        url: `/api/profile/update`, // Частичное обновление данных пользователя
        method: 'PATCH',
        body: data,
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetUsersQuery,
  useGetProfilesByIdsQuery, // ✅ Добавленный хук
  useUpdateUserMutation,
} = userApi;