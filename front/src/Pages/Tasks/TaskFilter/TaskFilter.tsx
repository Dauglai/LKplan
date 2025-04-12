import React from 'react';
import { Select, Input, DatePicker, Dropdown, Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import './TaskFilters.css';
import PlanButton from '../../../Components/PlanButton/PlanButton.tsx';

const { Option } = Select;
const { RangePicker } = DatePicker;

const TaskFilter = ({
                      filter,
                      setFilter,
                      stages,
                      users,
                      projectData,
                      teams = [],
                      specializations = [],
                    }) => {
  const filterDropdown = (
    <div className="filter-dropdown">
      <Select
        placeholder="Статус"
        value={filter.status || undefined}
        onChange={(value) => setFilter({ ...filter, status: value })}
      >
        {stages.map((stage) => (
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
        {projectData.map((project) => (
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
        {users.map((u) => (
          <Option key={u.user_id} value={u.user_id}>
            {u.surname} {u.name}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Постановщик"
        value={filter.author || undefined}
        onChange={(value) => setFilter({ ...filter, author: value })}
      >
        {users.map((u) => (
          <Option key={u.user_id} value={u.user_id}>
            {u.surname} {u.name}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Команда"
        value={filter.team || undefined}
        onChange={(value) => setFilter({ ...filter, team: value })}
      >
        {teams.map((t) => (
          <Option key={t.id} value={t.id}>
            {t.name}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Направление"
        value={filter.specialization || undefined}
        onChange={(value) => setFilter({ ...filter, specialization: value })}
      >
        {specializations.map((s) => (
          <Option key={s.id} value={s.id}>
            {s.name}
          </Option>
        ))}
      </Select>

      <RangePicker
        onChange={(dates) => {
          setFilter({
            ...filter,
            created_after: dates ? dates[0].format('YYYY-MM-DD') : undefined,
            created_before: dates ? dates[1].format('YYYY-MM-DD') : undefined,
          });
        }}
      />
    </div>
  );

  return (
    <div className="task-filter-wrapper">
      <Input
        placeholder="Поиск по названию"
        value={filter.query}
        onChange={(e) => setFilter({ ...filter, query: e.target.value })}
        className="task-filter-search"
      />
      <Dropdown overlay={filterDropdown} trigger={['click']} placement="bottomLeft">
        <PlanButton className="">Фильтры</PlanButton>
      </Dropdown>
    </div>
  );
};

export default TaskFilter;
