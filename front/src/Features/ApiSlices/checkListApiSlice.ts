import { apiSlice } from 'App/api/apiSlice.ts';

interface Checklist {
  id: number;
  description: string;
  is_completed?: boolean;
}

interface ChecklistItem {
  id: number;
  description: string;
  is_checked: boolean;
}

export const CheckListApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 Получить все чек-листы для задачи
    getCheckListsByTask: builder.query<Checklist[], number>({
      query: (taskId) => ({
        url: `/api/tasks/${taskId}/checklists/`,
        withCredentials: true,
      }),
      transformResponse: (response: { results: Checklist[] }) => response.results,
      providesTags: ['Checklist'],
    }),

    // 🔹 Создать чек-лист для задачи
    createCheckList: builder.mutation<Checklist, { taskId: number; data: Partial<Checklist> }>({
      query: ({ taskId, data }) => ({
        url: `/api/tasks/${taskId}/checklists/`,
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: 'CheckList', id: taskId }],
    }),

    // 🔹 Обновить чек-лист
    updateCheckList: builder.mutation<Checklist, { checkListId: number; data: Partial<Checklist> }>({
      query: ({ checkListId, data }) => ({
        url: `/api/checklists/${checkListId}/`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: (result, error, { checkListId }) => [{ type: 'CheckList', id: checkListId }],
    }),

    // 🔹 Удалить чек-лист
    deleteCheckList: builder.mutation<void, number>({
      query: (checkListId) => ({
        url: `/api/checklists/${checkListId}/`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: (result, error, checkListId) => [{ type: 'CheckList', id: checkListId }],
    }),

    // 🔹 Получить все пункты чек-листа
    getCheckListItems: builder.query<ChecklistItem[], number>({
      query: (checkListId) => ({
        url: `/api/checklists/${checkListId}/checklistItems/`,
        withCredentials: true,
      }),
      transformResponse: (response: { results: ChecklistItem[] }) => response.results,
      providesTags: ['ChecklistItem'],
    }),

    // 🔹 Создать пункт чек-листа
    createCheckListItem: builder.mutation<ChecklistItem, { checkListId: number; data: Partial<ChecklistItem> }>({
      query: ({ checkListId, data }) => ({
        url: `/api/checklists/${checkListId}/checklistItems/`,
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: (result, error, { checkListId }) => [{ type: 'CheckListItem', id: checkListId }],
    }),

    // 🔹 Обновить пункт чек-листа
    updateCheckListItem: builder.mutation<ChecklistItem, { itemId: number; data: Partial<ChecklistItem> }>({
      query: ({ itemId, data }) => ({
        url: `/api/checklistItems/${itemId}/`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: (result, error, { itemId }) => [{ type: 'CheckListItem', id: itemId }],
    }),

    // 🔹 Удалить пункт чек-листа
    deleteCheckListItem: builder.mutation<void, number>({
      query: (itemId) => ({
        url: `/api/checklistItems/${itemId}/`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: (result, error, itemId) => [{ type: 'CheckListItem', id: itemId }],
    }),
  }),
});

export const {
  useGetCheckListsByTaskQuery,
  useCreateCheckListMutation,
  useUpdateCheckListMutation,
  useDeleteCheckListMutation,
  useGetCheckListItemsQuery,
  useCreateCheckListItemMutation,
  useUpdateCheckListItemMutation,
  useDeleteCheckListItemMutation,
} = CheckListApiSlice;
