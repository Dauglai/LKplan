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
  project: number;
  name: string;
  desription: string;
  dateCloseTask: string | null;
  author?: User;
  status: number;
  parent_task?: number;
  responsible_user?: User;
  checklist?: Checklist[];
}

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTasks: builder.query({
      query: () => ({
        url: 'api/tasks',
        method: 'GET',
      }),
    }),
    createTask: builder.mutation({
      query: (task: Task) => ({
        url: 'api/tasks/create/',
        method: 'POST',
        body: task,
      }),
    }),
  }),
});

export const { useGetAllTasksQuery, useCreateTaskMutation } = tasksApiSlice;
