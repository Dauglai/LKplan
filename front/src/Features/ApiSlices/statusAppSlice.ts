import { apiSlice } from 'App/api/apiSlice.ts';
import { Trigger } from './functionOrdersApiSlice';

/**
 * Интерфейс для представления данных статусов мероприятий.
 * Используется для описания структуры объектов статусов в системе.
 */
export interface StatusApp {
  id: number;
  name: string;
  description?: string;
  is_positive?: boolean;
  triggers?: Trigger[];
}

const statusAppApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStatusesApp: builder.query<StatusApp[], void>({
      query: () => ({
        url:'/api/status_app/',  //получение списка статусов 
        withCredentials: true,} 
      ), 
      providesTags: ['StatusApp'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: StatusApp[] }) => {
        return response.results;
      },
    }),
    getStatusAppById: builder.query<StatusApp, number>({
      query: (id) => ({
        url: `/api/status_app/${id}/`,    //Получение статуса по id
        withCredentials: true,}
      ),
      providesTags: ['StatusApp'],
    }),
    createStatusApp: builder.mutation<StatusApp, Omit<StatusApp, 'id'>>({
      query: (newStatus) => ({ // Создаем новый статус
        url: '/api/status_app/',
        method: 'POST',
        body: newStatus,  
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['StatusApp'],
    }),
    updateStatusApp: builder.mutation<StatusApp, { id: number; data: Omit<StatusApp, 'id'> }>({
      query: (status) => ({  // Обновляем статус заявки
        url: `/api/status_app/${status.id}/`,
        method: 'PUT',
        body: status, 
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['StatusApp'],
    }),
    partialUpdateStatusApp: builder.mutation<StatusApp, { id: number; data: Partial<Omit<StatusApp, 'id'>> }>({
      query: ({ id, ...data }) => ({ // Обновляем статус заявки
        url: `/api/status_app/${id}/`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['StatusApp'],
    }),
    deleteStatusApp: builder.mutation<void, number>({
      query: (id) => ({  // Удаляем статус
        url: `/api/status_app/${id}/`,
        method: 'DELETE', 
        headers: {

        },
        withCredentials: true,
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
