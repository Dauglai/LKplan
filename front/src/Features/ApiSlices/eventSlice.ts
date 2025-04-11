import { apiSlice  } from 'App/api/apiSlice.ts';
import dayjs from 'dayjs';

export interface Event {
  event_id?: number;
  name: string;
  specializations: number[];
  statuses: number[];
  description: string | null;
  link: string | null;
  start: string | null;
  end: string | null;
  end_app: string | null;
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
          end_app: event.end_app ? new Date(event.end_app) : null,
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
        end_app: response.end_app ? new Date(response.end_app) : null,
      }),
    }),
    createEvent: builder.mutation<Event, Omit<Event, 'id'>>({
      query: (newEvent) => {
        const formatDate = (value?: string | null) => {
          const parsed = dayjs(value, 'DD.MM.YYYY', true);
          return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
        };
    
        return {
          url: '/api/events/create/',
          method: 'POST',
          body: {
            ...newEvent,
            start: formatDate(newEvent.start),
            end: formatDate(newEvent.end),
            end_app: formatDate(newEvent.end_app),
          },
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        };
      },
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


