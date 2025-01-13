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
    getUser: builder.query<User[], void>({
      query: () => ({
        url:'/api/profile/',   //получение пользователя
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
  //useGetUserByIdQuery,
  useUpdateUserMutation,
  //useDeleteUserMutation,
} = userApi;
  