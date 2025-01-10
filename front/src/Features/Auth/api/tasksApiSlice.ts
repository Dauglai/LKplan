import { apiSlice } from 'App/api/apiSlice.ts';

function getCSRFToken() {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken'))
    ?.split('=')[1];
  return csrfToken;
}

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
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
      }),
    }),
  }),
});
