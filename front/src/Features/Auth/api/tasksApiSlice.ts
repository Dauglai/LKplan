import { apiSlice } from 'App/api/apiSlice.ts';

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTasks: builder.query({
      query: () => ({
        url: 'api/tasks',
        method: 'GET',
      }),
    }),
    //TODO type task
    createTask: builder.mutation({
      query: (task) => ({
        url: 'api/tasks',
        method: 'POST',
        body: task,
      }),
    }),
  }),
});

export const { useGetAllTasksQuery, useCreateTaskMutation } = tasksApiSlice;
