import { apiSlice } from 'App/api/apiSlice.ts';

export interface Direction {
  id: number;
  event: number;
  name: string;
  description: string | null;
}

const directionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDirections: builder.query<Direction[], void>({
      query: () => '/api/direction/', // Получение списка направлений
      providesTags: ['Direction'],
      transformResponse: (response: Direction[]) => response,
    }),
    getDirectionById: builder.query<Direction, number>({
      query: (id) => `/api/direction/${id}/`, //Получение направления по id
      providesTags: ['Direction'],
    }),
    createDirection: builder.mutation<Direction, Omit<Direction, 'id'>>({
      query: (newDirection) => ({ // Создание направления
        url: '/api/direction/',
        method: 'POST',
        body: newDirection,
      }),
      invalidatesTags: ['Direction'],
    }),
    updateDirection: builder.mutation<Direction, { id: number; data: Omit<Direction, 'id'> }>({
      query: ({ id, ...data }) => ({ // Обновление направления
        url: `/api/direction/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Direction'],
    }),
    partialUpdateDirection: builder.mutation<Direction, { id: number; data: Partial<Omit<Direction, 'id'>> }>({
      query: ({ id, ...data }) => ({ // Обновление направления
        url: `/api/direction/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Direction'],
    }),
    deleteDirection: builder.mutation<void, number>({
      query: (id) => ({ // Удаление направления
        url: `/api/direction/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Direction'],
    }),
  }),
});

export const {
  useGetDirectionsQuery,
  useGetDirectionByIdQuery,
  useCreateDirectionMutation,
  useUpdateDirectionMutation,
  usePartialUpdateDirectionMutation,
  useDeleteDirectionMutation,
} = directionApi;
