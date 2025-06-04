import { apiSlice } from 'App/api/apiSlice.ts';

/**
 * Интерфейс для представления данных направления.
 * Используется для описания структуры объектов направлений в системе.
 */
export interface Direction {
  id?: number; // Уникальный идентификатор направления.
  event: number; // Идентификатор события, к которому относится направление.
  name: string; // Название направления.
  description: string | null; // Описание направления.
  leader_id: number; // Идентификатор руководителя направления.
}

/**
 * API-слайс для работы с данными направлений.
 * Включает в себя эндпоинты для получения, создания, обновления и удаления направлений.
 */
const directionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Эндпоинт для получения списка направлений.
    getDirections: builder.query<Direction[], void>({
      query: () => ({
        url: '/api/direction/',   // URL для получения списка направлений
        withCredentials: true,    // Отправка сессии/кредитов пользователя
      }), 
      providesTags: ['Direction'], // Указывает, что данные направлений должны быть обновлены/перезапрошены
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: Direction[] }) => {
        return response.results; // Преобразование ответа: возвращаем только список направлений
      },
    }),
    
    // Эндпоинт для получения одного направления по его ID.
    getDirectionById: builder.query<Direction, number>({
      query: (id) => ({
        url: `/api/direction/${id}/`,  // URL для получения направления по ID
        withCredentials: true,
      }),
      providesTags: ['Direction'], // Обновление/перезапрос данных направлений
    }),

    // Эндпоинт для создания нового направления.
    createDirection: builder.mutation<Direction, Omit<Direction, 'id'>>({
      query: (newDirection) => ({
        url: '/api/direction/',   // URL для создания нового направления
        method: 'POST',           // Метод POST
        body: newDirection,      // Тело запроса: новое направление
        headers: {
          'Content-Type': 'application/json', // Указываем, что тело запроса в формате JSON
        },
        withCredentials: true,  // Отправка сессии/кредитов пользователя
      }),
      invalidatesTags: ['Direction'], // После создания нужно обновить список направлений
    }),

    // Эндпоинт для обновления направления.
    updateDirection: builder.mutation<Direction, { id: number; data: Omit<Direction, 'id'> }>({
      query: ({ id, ...data }) => ({
        url: `/api/direction/${id}/`,  // URL для обновления направления по ID
        method: 'PUT',                // Метод PUT для полного обновления
        body: data,                   // Тело запроса: обновленные данные направления
        headers: {
          'Content-Type': 'application/json', // Указываем, что тело запроса в формате JSON
        },
        withCredentials: true, // Отправка сессии/кредитов пользователя
      }),
      invalidatesTags: ['Direction'], // После обновления нужно перезапросить данные направлений
    }),

    // Эндпоинт для частичного обновления направления.
    partialUpdateDirection: builder.mutation<Direction, { id: number; data: Partial<Omit<Direction, 'id'>> }>({
      query: ({ id, ...data }) => ({
        url: `/api/direction/${id}/`,  // URL для частичного обновления направления по ID
        method: 'PATCH',              // Метод PATCH для частичного обновления
        body: data,                   // Тело запроса: частично обновленные данные направления
        headers: {
          'Content-Type': 'application/json', // Указываем, что тело запроса в формате JSON
        },
        withCredentials: true, // Отправка сессии/кредитов пользователя
      }),
      invalidatesTags: ['Direction'], // После обновления нужно перезапросить данные направлений
    }),

    // Эндпоинт для удаления направления.
    deleteDirection: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/direction/${id}/`,  // URL для удаления направления по ID
        method: 'DELETE',              // Метод DELETE для удаления
        withCredentials: true,         // Отправка сессии/кредитов пользователя
      }),
      invalidatesTags: ['Direction'], // После удаления нужно перезапросить данные направлений
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
