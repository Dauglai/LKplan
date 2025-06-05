import { apiSlice} from 'App/api/apiSlice.ts';

/**
 * Интерфейс для описания робота
 */
export interface Robot {
  id?: number;
  name: string;
  description?: string | null;
  type_action: 'move_status' | 'notification';
  status?: boolean;
  parameters_template: {
    // Для move_status
    target_status?: string;
    
    // Для notification
    bot_token?: string;
    chat_id?: string | number;
    message?: string;
  };
}

/**
 * API для работы с роботами
 */
const robotApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка роботов
    getRobots: builder.query<Robot[], void>({
      query: () => ({
        url: '/api/robots/',
        withCredentials: true,
      }),
      providesTags: ['Robot'],
      transformResponse: (response: { results: Robot[] }) => response.results,
    }),

    // Получение робота по ID
    getRobotById: builder.query<Robot, number>({
      query: (id) => ({
        url: `/api/robots/${id}/`,
        withCredentials: true,
      }),
      providesTags: ['Robot'],
    }),

    // Создание робота
    createRobot: builder.mutation<Robot, Omit<Robot, 'id'>>({
      query: (newRobot) => ({
        url: '/api/robots/',
        method: 'POST',
        body: {
          ...newRobot,
          parameters_template: JSON.stringify(newRobot.parameters_template),
        },
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Robot'],
    }),

    // Обновление робота
    updateRobot: builder.mutation<Robot, { id: number; data: Partial<Robot> }>({
      query: ({ id, data }) => ({
        url: `/api/robots/${id}/`,
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
      invalidatesTags: ['Robot'],
    }),

    // Удаление робота
    deleteRobot: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/robots/${id}/`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: ['Robot'],
    }),
  }),
});

export const {
  useGetRobotsQuery,
  useGetRobotByIdQuery,
  useCreateRobotMutation,
  useUpdateRobotMutation,
  useDeleteRobotMutation,
} = robotApi;