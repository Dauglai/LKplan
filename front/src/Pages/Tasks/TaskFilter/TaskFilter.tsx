import React from "react";
import { Select, Input, DatePicker } from "antd";
import { useGetUsersQuery } from 'Features/ApiSlices/userSlice.ts';
import { useGetProjectByIdQuery, useGetProjectsQuery } from 'Features/ApiSlices/projectSlice.ts';

const { Option } = Select;
const { RangePicker } = DatePicker;


const TaskFilter = ({ filter, setFilter, stages, users, projectData}) => {
  return (
    <div className="task-filter">
      <Input
        placeholder="Название задачи"
        value={filter.query}
        onChange={(e) => setFilter({ ...filter, query: e.target.value })}
      />
      <Select
        placeholder="Статус"
        value={filter.status || undefined}
        onChange={(value) => setFilter({ ...filter, status: value })}
      >
        {stages.map((stage)  => (
            <Option key={stage.id} value={stage.id}>
              {stage.name}
            </Option>
          ))}
      </Select>
      <Select
        placeholder="Проект"
        value={filter.project || undefined}
        onChange={(value) => setFilter({ ...filter, project: value })}
      >
        {projectData.map((project)  => (
          <Option key={project.id} value={project.id}>
            {project.name}
          </Option>
        ))}
      </Select>
      <Select
        placeholder="Исполнитель"
        value={filter.responsible_user || undefined}
        onChange={(value) => setFilter({ ...filter, responsible_user: value })}
      >
        {users && users.length > 0 ? (
          users.map((assignee) => (
            <Option key={assignee.user_id} value={assignee.user_id}>
              {assignee.surname} {assignee.name} {assignee.patronymic}
            </Option>
          ))
        ) : (
          <Option disabled>Нет доступных исполнителей</Option>
        )}
      </Select>
      <RangePicker
        onChange={(dates) => {
          setFilter({
            ...filter,
            created_after: dates ? dates[0].format("YYYY-MM-DD") : undefined,
            created_before: dates ? dates[1].format("YYYY-MM-DD") : undefined,
          });
        }}
      />
    </div>
  );
};

export default TaskFilter;
