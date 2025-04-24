// components/TaskTable.tsx
import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Profile {
  user_id: number;
  surname: string;
  name: string;
  patronymic: string;
}

interface Stage {
  id: number;
  name: string;
}

interface Task {
  key: string;
  name: string;
  sprint: string;
  status: string;
  stage: Stage;
  end: string;
  assignee: Profile;
  author: Profile;
  performers: Profile[];
  children?: Task[]; // Подзадачи
  parent_task: number;
}

interface TaskTableProps {
  dataSource: Task[];
  expandedRowKeys: React.Key[];
  onExpand: (expanded: boolean, record: Task) => void;
  onRowClick: (record: Task) => void;
  onChange: (pagination: any, filters: any, sorter: any) => void;
  columns: ColumnsType<Task>;
}

const TaskTable: React.FC<TaskTableProps> = ({
                                               dataSource,
                                               expandedRowKeys,
                                               onExpand,
                                               onRowClick,
                                               onChange,
                                               columns,
                                             }) => {
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      expandable={{
        expandedRowKeys,
        onExpand,
      }}
      pagination={false}
      onRow={(record) => ({
        onClick: () => onRowClick(record),
      })}
      onChange={onChange}
      rowClassName="task-row"
    />
  );
};

export default TaskTable;
