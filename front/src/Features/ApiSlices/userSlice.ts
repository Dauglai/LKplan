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
  specialization: number;
}

const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({
        url:'/api/profile/',   //получение списка пользователей
        withCredentials: true,} 
      ), 
      providesTags: ['User'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: User[] }) => {
        return response.results;
      },
    }),
    /* getUserById: builder.query<User, number>({
      query: (id) => `/api/users/${id}/`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }), */
    updateUser: builder.mutation<User, { id: number; data: Omit<User, 'id'> }>({
      query: ({ id, ...data }) => ({
        url: `/api/users/${id}/`, //////// Обновляем данные пользователя
        method: 'PUT',
        body: data, 
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true, 
      }),
      invalidatesTags: ['User'],
    }),
    partialUpdateUser: builder.mutation<User, { id: number; data: Partial<Omit<User, 'id'>> }>({
      query: ({ id, data }) => ({
        url: `/api/users/${id}`,  //////// Обновляем данные пользователя
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
  useGetUsersQuery,
  //useGetUserByIdQuery,
  useUpdateUserMutation,
  //useDeleteUserMutation,
} = userApi;
  