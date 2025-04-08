import { apiSlice } from 'App/api/apiSlice.ts';

export interface Direction {
  id?: number | string;
  event: number;
  name: string;
  description: string | null;
}

const directionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDirections: builder.query<Direction[], void>({
      query: () => ({
        url:'/api/direction/',   // Получение списка направлений
        withCredentials: true,} 
      ), 
      providesTags: ['Direction'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: Direction[] }) => {
        return response.results;
      },
    }),
    getDirectionById: builder.query<Direction, number>({
      query: (id) => ({
        url: `/api/direction/${id}/`,    //Получение направления по id
        withCredentials: true,}
      ),
      providesTags: ['Direction'],
    }),
    createDirection: builder.mutation<Direction, Omit<Direction, 'id'>>({
      query: (newDirection) => ({ // Создание направления
        url: '/api/direction/',
        method: 'POST',
        body: newDirection,
        headers: {
            'Content-Type': 'application/json',

          },
        withCredentials: true,
      }),
      invalidatesTags: ['Direction'],
    }),
    updateDirection: builder.mutation<Direction, { id: number; data: Omit<Direction, 'id'> }>({
      query: ({ id, ...data }) => ({ // Обновление направления
        url: `/api/direction/${id}/`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['Direction'],
    }),
    partialUpdateDirection: builder.mutation<Direction, { id: number; data: Partial<Omit<Direction, 'id'>> }>({
      query: ({ id, ...data }) => ({ // Обновление направления
        url: `/api/direction/${id}/`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['Direction'],
    }),
    deleteDirection: builder.mutation<void, number>({
      query: (id) => ({ // Удаление направления
        url: `/api/direction/${id}/`,
        method: 'DELETE',

        withCredentials: true,
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
