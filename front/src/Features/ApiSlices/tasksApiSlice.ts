import { apiSlice } from 'App/api/apiSlice.ts';

interface User {
  telegram?: string;
  email?: string;
  surname?: string;
  name?: string;
  partronymic?: string;
  course?: number;
  university?: string;
  vk?: string;
  job?: string;
  specializations?: number[];
}


interface Task {
  id?: number;
  project: number;
  name: string;
  description: string; // Исправлено
  start?: string;
  end?: string;
  creator?: User;
  status: number;
  parent_task?: number;
  responsible_user?: User;
}

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTasks: builder.query<
      { results: Task[] },
      {
        name?: string;
        status?: string;
        creator?: number;
        responsible_user?: number;
        project?: number;
        deadline?: string;
        created_after?: string;
        created_before?: string;
        task_id?: number;
        team?: number;
        page?: number;
        page_size?: number;
        sort?: string;
      }
    >({
      query: ({
                name,
                status,
                creator,
                responsible_user,
                project,
                deadline,
                created_after,
                created_before,
                task_id,
                team,
                page = 1,
                page_size = 10,
                sort,
              }) => ({
        url: '/api/tasks/',
        params: {
          name,
          status,
          creator,
          responsible_user,
          project,
          deadline,
          created_after,
          created_before,
          task_id,
          team,
          page,
          page_size,
          ordering: sort,
        },
        withCredentials: true,
      }),
      transformResponse: (response: { results: Task[] }) => response.results,
      providesTags: ['Task'],
    }),
    createTask: builder.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: '/api/tasks/create/',
        method: 'POST',
        body: task,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation<Task, { id: number; data: Partial<Task> }>({
      query: ({ id, data }) => ({
        url: `/api/tasks/${id}/`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Task'],
    }),
    getTaskComments: builder.query<any[], number>({
      query: (taskId) => ({
        url: `/api/tasks/${taskId}/comments/`,
        withCredentials: true,
      }),
    }),
    deleteTask: builder.mutation<void, number>({  // Изменяем тип данных, теперь он принимает только id
      query: (id) => ({
        url: `/api/tasks/${id}/`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: (result, error, itemId) => [{ type: 'Task', id: itemId }],
    }),
  }),
});

export const {
  useGetAllTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetTaskCommentsQuery,
  useDeleteTaskMutation,
} = tasksApiSlice;
