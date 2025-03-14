import { apiSlice } from 'App/api/apiSlice.ts';

interface User {
  telegram?: string;
  email?: string;
  surname?: string;
  name?: string;
  partonymic?: string;
  course?: number;
  university?: string;
  vk?: string;
  job?: string;
  specializations?: number[];
}

interface Checklist {
  description: string;
  is_completed?: boolean;
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
  checklist?: Checklist[];
}

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTasks: builder.query<{ results: Task[] }, void>({
      query: () => ({
        url: '/api/tasks/',
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
  }),
});

export const {
  useGetAllTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetTaskCommentsQuery,
} = tasksApiSlice;
