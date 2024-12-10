export type User = {
    id: string;
    lastName: string;
    firstName: string;
    patronymic: string;
    role: 'Руководитель' | 'Куратор' | 'Проектант';
}
  
export const mockUsers: User[] = [
    {
      id: '1',
      lastName: 'Иванов',
      firstName: 'Иван',
      patronymic: 'Иванович',
      role: 'Руководитель',
    },
    {
      id: '2',
      lastName: 'Петров',
      firstName: 'Петр',
      patronymic: 'Петрович',
      role: 'Куратор',
    },
    {
      id: '3',
      lastName: 'Сидоров',
      firstName: 'Сидор',
      patronymic: 'Сидорович',
      role: 'Проектант',
    },
    {
      id: '4',
      lastName: 'Иванов',
      firstName: 'Иван',
      patronymic: 'Иванович',
      role: 'Руководитель',
    },
    {
      id: '5',
      lastName: 'Петров',
      firstName: 'Петр',
      patronymic: 'Петрович',
      role: 'Куратор',
    },
    {
      id: '6',
      lastName: 'Сидоров',
      firstName: 'Сидор',
      patronymic: 'Сидорович',
      role: 'Проектант',
    },
];
  