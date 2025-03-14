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
        url:'/api/profile/',   //получение пользователя
        withCredentials: true,} 
      ), 
      providesTags: ['User'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: User[] }) => {
        const user = response.results[0];
        return { ...user, role: determineUserRole(user.email) };
      },
    }),
    getUsers: builder.query<User[], void>({
      query: () => ({
          url:'/api/profiles/',   //получение пользователя
          withCredentials: true,}
      ),
      providesTags: ['User'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: User[] }) => {
        return response.results;
      },
    }),
    updateUser: builder.mutation<User, { data: Omit<User, 'user_id'> }>({
      query: ({ data }) => ({
        url: `/api/profile/update/`, // Обновляем данные пользователя
        method: 'PUT',
        body: data, 
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true, 
      }),
      invalidatesTags: ['User'],
    }),
    partialUpdateUser: builder.mutation<User, { data: Partial<Omit<User, 'user_id'>> }>({
      query: ({ data }) => ({
        url: `/api/profile/update`,  // Обновляем данные пользователя
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['User'],
    }),
    /* deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/users/${id}/`,
        method: 'DELETE',  // Удаляем пользователя
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
        withCredentials: true,
      }),
      invalidatesTags: ['User'],
    }), */
  }),
});

export const {
  useGetUserQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  //useDeleteUserMutation,
} = userApi;
  