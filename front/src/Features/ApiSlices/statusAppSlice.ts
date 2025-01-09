import { apiSlice } from 'App/api/apiSlice.ts';

export interface StatusApp {
  id: number;
  name: string;
  description: string;
}

const statusAppApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStatusesApp: builder.query<StatusApp[], void>({
      query: () => '/api/status_app/',  // Получаем список статусов
      providesTags: ['StatusApp'],
    }),
    getStatusAppById: builder.query<StatusApp, number>({
      query: (id) => `/api/status_app/${id}/`, //Получаем статус по id
      providesTags: ['StatusApp'],
    }),
    createStatusApp: builder.mutation<StatusApp, Omit<StatusApp, 'id'>>({
      query: (newStatus) => ({ // Создаем новый статус
        url: '/api/status_app/',
        method: 'POST',
        body: newStatus,  
      }),
      invalidatesTags: ['StatusApp'],
    }),
    updateStatusApp: builder.mutation<StatusApp, { id: number; data: Omit<StatusApp, 'id'> }>({
      query: ({ id, ...data }) => ({  // Обновляем статус заявки
        url: `/api/status_app/${id}/`,
        method: 'PUT',
        body: data, 
      }),
      invalidatesTags: ['StatusApp'],
    }),
    partialUpdateStatusApp: builder.mutation<StatusApp, { id: number; data: Partial<Omit<StatusApp, 'id'>> }>({
      query: ({ id, ...data }) => ({ // Обновляем статус заявки
        url: `/api/status_app/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['StatusApp'],
    }),
    deleteStatusApp: builder.mutation<void, number>({
      query: (id) => ({  // Удаляем статус
        url: `/api/status_app/${id}/`,
        method: 'DELETE', 
      }),
      invalidatesTags: ['StatusApp'],
    }),
  }),
});

export const {
  useGetStatusesAppQuery,
  useGetStatusAppByIdQuery,
  useCreateStatusAppMutation,
  useUpdateStatusAppMutation,
  usePartialUpdateStatusAppMutation,
  useDeleteStatusAppMutation,
} = statusAppApi;
