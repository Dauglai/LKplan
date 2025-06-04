import { apiSlice } from 'App/api/apiSlice.ts';

export interface StatusOrder {
  id: number;
  number: number; // Позиция в списке
  event: number;  // ID события
  status: number; // ID статуса
}

const statusOrderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Получение всех статус-ордеров
    getStatusOrders: builder.query<StatusOrder[], void>({
      query: () => ({
        url: 'api/status-orders/',
        withCredentials: true,
      }),
      providesTags: ['StatusOrder'],
      transformResponse: (response: { results: StatusOrder[] }) => response.results,
    }),

    // Получение всех статус-ордеров по мероприятию
    getStatusOrdersByEvent: builder.query<StatusOrder[], number>({
      query: (eventId) => ({
        url: `api/status-orders/?event=${eventId}`,
        withCredentials: true,
      }),
      providesTags: (result, error, eventId) => [
        { type: 'StatusOrder', id: `EVENT-${eventId}` }
      ],
      transformResponse: (response: { results: StatusOrder[] }) => response.results,
    }),

    // Получение статус-ордера по ID
    getStatusOrderById: builder.query<StatusOrder, number>({
      query: (id) => ({
        url: `/api/status-orders/${id}/`,
        withCredentials: true,
      }),
      providesTags: ['StatusOrder'],
    }),

    // Создание нового статус-ордера
    createStatusOrder: builder.mutation<StatusOrder, Omit<StatusOrder, 'id'>>({
      query: (newStatusOrder) => ({
        url: '/api/status-orders/',
        method: 'POST',
        body: newStatusOrder,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['StatusOrder'],
    }),

    // Полное обновление статус-ордера
    updateStatusOrder: builder.mutation<StatusOrder, { id: number; data: Omit<StatusOrder, 'id'> }>({
      query: ({ id, data }) => ({
        url: `/api/status-orders/${id}/`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['StatusOrder'],
    }),

    // Частичное обновление статус-ордера
    partialUpdateStatusOrder: builder.mutation<StatusOrder, { id: number; data: Partial<Omit<StatusOrder, 'id'>> }>({
      query: ({ id, data }) => ({
        url: `/api/status-orders/${id}/`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['StatusOrder'],
    }),

    // Удаление статус-ордера
    deleteStatusOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/status-orders/${id}/`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: ['StatusOrder'],
    }),
  }),
});

export const {
  useGetStatusOrdersQuery,
  useGetStatusOrdersByEventQuery,
  useGetStatusOrderByIdQuery,
  useCreateStatusOrderMutation,
  useUpdateStatusOrderMutation,
  usePartialUpdateStatusOrderMutation,
  useDeleteStatusOrderMutation,
} = statusOrderApi;