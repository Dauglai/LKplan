import { apiSlice} from 'App/api/apiSlice.ts';

/**
 * Интерфейс для описания проекта.
 */
export interface Project {
  project_id?: number; // Идентификатор проекта (опционально)
  directionSet: number; // Идентификатор набора направлений
  name: string; // Название проекта
  description: string | null; // Описание проекта (может быть пустым)
  curatorsSet: number[]; // Массив идентификаторов кураторов проекта
  creator: number; // Идентификатор создателя проекта
}

/**
 * API для работы с проектами.
 * Включает эндпоинты для получения, создания, обновления и удаления проектов.
 */
const projectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getProjects: builder.query<Project[], void>({
      query: () => ({
        url: '/api/project/',   //получение списка проектов
        withCredentials: true,  // с учетом авторизации
      }), 
      providesTags: ['Project'],  // Поддержка тегов для кеширования
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: Project[] }) => {
        return response.results; // Возвращаем только список проектов
      },
    }),

    getProjectById: builder.query<Project, number>({
      query: (id) => ({
        url: `/api/project/${id}`,    //Получение проекта по id
        withCredentials: true,  // с учетом авторизации
      }),
      providesTags: ['Project'], // Поддержка тегов для кеширования
    }),

    createProject: builder.mutation<Project, Omit<Project, 'id'>>({
      query: (newProject) => ({    // Создание нового проекта
        url: '/api/project/create/',
        method: 'POST',
        body: newProject,
        headers: {
          'Content-Type': 'application/json', // Заголовок для JSON
        },
        withCredentials: true,  // с учетом авторизации
      }),
      invalidatesTags: ['Project'], // Инвалидируем кеш для обновления данных
    }),

    updateProject: builder.mutation<Project, { id: number; data: Omit<Project, 'id'> }>({
      query: ({ id, ...data }) => ({  // Обновление проекта
        url: `/api/project/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json', // Заголовок для JSON
        },
        withCredentials: true,  // с учетом авторизации
      }),
      invalidatesTags: ['Project'], // Инвалидируем кеш для обновления данных
    }),

    partialUpdateProject: builder.mutation<Project, { id: number; data: Partial<Omit<Project, 'id'>> }>({
      query: ({ id, ...data }) => ({ // Обновление проекта
        url: `/api/project/${id}`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json', // Заголовок для JSON
        },
        withCredentials: true,  // с учетом авторизации
      }),
      invalidatesTags: ['Project'], // Инвалидируем кеш для обновления данных
    }),

    deleteProject: builder.mutation<void, number>({
      query: (id) => ({          // Удаление проекта
        url: `/api/project/${id}`,
        method: 'DELETE',
        withCredentials: true, // с учетом авторизации
      }),
      invalidatesTags: ['Project'], // Инвалидируем кеш для обновления данных
    }),
    
  }),
});


export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  usePartialUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
