import { apiSlice  } from 'App/api/apiSlice.ts';

export interface Event {
  event_id?: number;
  name: string;
  specializations: number[];
  statuses: number[];
  description: string | null;
  link: string | null;
  start: string | null;
  end: string | null;
  supervisor: number;
  creator: number;
  stage: string;
}

const eventApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<Event[], void>({
      query: () => ({
        url:'/api/events/',   //получение списка мероприятий
        withCredentials: true,} 
      ), 
      providesTags: ['Event'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: Event[] }) => {
        return response.results.map(event => ({
          ...event,
          start: event.start ? new Date(event.start) : null,
          end: event.end ? new Date(event.end) : null,
        }));
      },
    }),
    getEventById: builder.query<Event, number>({
      query: (id) => ({
        url: `/api/events/${id}`,    //Получение мероприятия по id
        withCredentials: true,}
      ),
      providesTags: (result, error, id) => [{ type: 'Event', id }],
      transformResponse: (response: Event) => ({
        ...response,
        start: response.start ? new Date(response.start) : null,
        end: response.end ? new Date(response.end) : null,
      }),
    }),
    createEvent: builder.mutation<Event, Omit<Event, 'id'>>({
      query: (newEvent) => ({ // Создаем новое мероприятие
        url: '/api/events/create/',
        method: 'POST',
        body: {
          ...newEvent,
          start: newEvent.start ? new Date(newEvent.start).toISOString().split('T')[0] : null,
          end: newEvent.end ? new Date(newEvent.end).toISOString().split('T')[0] : null,
        },
        headers: {
          'Content-Type': 'application/json',
          
        },
        withCredentials: true,  
      }),
      invalidatesTags: ['Event'],
    }),
    updateEvent: builder.mutation<Event, { id: number; data: Omit<Event, 'id'> }>({
      query: ({ id, data }) => ({   // Обновляем мероприятие
        url: `/api/events/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Event'],
    }),
    partialUpdateEvent: builder.mutation<Event, { id: number; data: Partial<Omit<Event, 'id'>> }>({
      query: ({ id, data }) => ({   // Обновляем мероприятие
        url: `/api/events/${id}`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Event'],
    }),
    deleteEvent: builder.mutation<void, number>({
      query: (id) => ({  // Удаляем мероприятие
        url: `/api/events/delete/${id}`,
        method: 'DELETE', 

        withCredentials: true,
      }),
      invalidatesTags: ['Event'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  usePartialUpdateEventMutation,
  useDeleteEventMutation,
} = eventApi;

