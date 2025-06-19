import { apiSlice } from 'App/api/apiSlice.ts';

/**
 * Тип сущности в function_order (триггер или робот)
 */
export type FunctionType = 'trigger' | 'robot';

/**
 * Конфиг для триггера (если type_function = 'trigger')
 */
export interface TriggerConfig {
  expiration: string; // "14d", "24h" и т.д.
}

/**
 * Конфиг для робота (если type_function = 'robot')
 */
export interface RobotConfig {
  target_status: number; // ID статуса, в который переведёт робот
}

/**
 * Общий интерфейс для function_order
 */
export interface FunctionOrder {
  id?: number;
  position: number;       // Порядковый номер в цепочке
  type_function: FunctionType;
  config: TriggerConfig | RobotConfig; // Зависит от type_function
  status_order_id: number; // ID статуса, к которому привязано правило
  trigger?: number;     // ID триггера (если type_function = 'trigger')
  robot?: number;       // ID робота (если type_function = 'robot')
}

const functionOrderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Получение всех привязок (триггеры + роботы)
    getFunctionOrders: builder.query<FunctionOrder[], void>({
      query: () => ({
        url: '/api/function-orders/',
        withCredentials: true,
      }),
      providesTags: ['FunctionOrder'],
    }),

    // Создание привязки (триггер или робот)
    createFunctionOrder: builder.mutation<FunctionOrder, Omit<FunctionOrder, 'id'>>({
      query: (newFunctionOrder) => ({
        url: '/api/function-orders/',
        method: 'POST',
        body: newFunctionOrder,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['FunctionOrder'],
    }),

    // Обновление привязки
    updateFunctionOrder: builder.mutation<FunctionOrder, { id: number; data: Partial<FunctionOrder> }>({
      query: ({ id, data }) => ({
        url: `/api/function-orders/${id}/`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['FunctionOrder'],
    }),

    // Удаление привязки
    deleteFunctionOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/function-orders/${id}/`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: ['FunctionOrder'],
    }),
  }),
});

export const {
  useGetFunctionOrdersQuery,
  useCreateFunctionOrderMutation,
  useUpdateFunctionOrderMutation,
  useDeleteFunctionOrderMutation,
} = functionOrderApi;