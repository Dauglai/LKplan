export interface TaskFormValues {
  name: string;
  sprint: string;
  status: string;
  deadline: string;
  assignee: string;
  tags: string[];
}

export interface Assignee {
  id: number;
  name: string;
}

export interface CreateTaskModalProps {
  visible: boolean;
  onCreate: (values: TaskFormValues) => void;
  onCancel: () => void;
  statuses: string[];
  assignees: Assignee[];
  tags: string[];
}
