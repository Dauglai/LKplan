import { apiSlice} from 'App/api/apiSlice.ts';

/**
 * Интерфейс для описания триггера
 */
export interface Trigger {
  id?: number;
  name: string;
  robotId?: number;
  description?: string | null;
  type_condition: 'time_expiration' | 'status_check' | 'field_comparison';
  status?: boolean;
  parameters_template: {
    // Для time_expiration
    interval?: 'days' | 'hours' | 'minutes';
    value?: number;
    field?: string;
    
    // Для status_check
    status?: string;
    
    // Для field_comparison
    field?: string;
    operator?: '>' | '<' | '==' | '!=';
    value?: any;
  };
}

/**
 * API для работы с триггерами
 */
const triggerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка триггеров
    getTriggers: builder.query<Trigger[], void>({
      query: () => ({
        url: '/api/triggers/',
        withCredentials: true,
      }),
      providesTags: ['Trigger'],
      transformResponse: (response: { results: Trigger[] }) => response.results,
    }),

    // Получение триггера по ID
    getTriggerById: builder.query<Trigger, number>({
      query: (id) => ({
        url: `/api/triggers/${id}/`,
        withCredentials: true,
      }),
      providesTags: ['Trigger'],
    }),

    // Создание триггера
    createTrigger: builder.mutation<Trigger, Omit<Trigger, 'id'>>({
      query: (newTrigger) => ({
        url: '/api/triggers/',
        method: 'POST',
        body: {
          ...newTrigger,
          parameters_template: JSON.stringify(newTrigger.parameters_template),
        },
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Trigger'],
    }),

    // Обновление триггера
    updateTrigger: builder.mutation<Trigger, { id: number; data: Partial<Trigger> }>({
      query: ({ id, data }) => ({
        url: `/api/triggers/${id}/`,
        method: 'PUT',
        body: {
          ...data,
          parameters_template: data.parameters_template 
            ? JSON.stringify(data.parameters_template)
            : undefined,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Trigger'],
    }),

    // Удаление триггера
    deleteTrigger: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/triggers/${id}/`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: ['Trigger'],
    }),
    
  }),
});

export const {
  useGetTriggersQuery,
  useGetTriggerByIdQuery,
  useCreateTriggerMutation,
  useUpdateTriggerMutation,
  useDeleteTriggerMutation,
} = triggerApi;