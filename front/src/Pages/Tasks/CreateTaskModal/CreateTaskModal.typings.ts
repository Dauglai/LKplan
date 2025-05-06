export interface TaskFormValues {
  name: string;
  description: string;
  status: number;
  start: string;
  deadline: string;
  assignee: number;
  performers: number[];
}

export interface Assignee {
  id: number;
  surname: string;
  name: string;
  patronymic: string;
}

export interface CreateTaskModalProps {
  visible: boolean;
  onCreate: (values: TaskFormValues) => void;
  onCancel: () => void;
  statuses: string[];
  assignees: Assignee[];
}
