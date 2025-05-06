import React, { useRef, useState } from 'react';
import './GanttChart.scss';
import moment from 'moment';

const GanttChart = ({ tasks }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const dayWidth = 32;
  const visibleDays = 32; // пример: 3 месяца
  const startDate = moment(); // сегодня

  const renderHeader = () => {
    const headers = [];
    let current = moment(startDate);
    let currentMonth = '';

    for (let i = 0; i < visibleDays; i++) {
      const day = current.clone().add(i, 'days');
      const dayNumber = day.date();
      const monthName = day.format('MMMM');

      const showMonth = monthName !== currentMonth;
      if (showMonth) currentMonth = monthName;

      headers.push(
        <div key={i} className="gantt-day">
          {showMonth && <div className="month-label">{monthName}</div>}
          {dayNumber}
        </div>
      );
    }
    return headers;
  };

  const renderTasks = (taskList, level = 0) => {
    return taskList.map((task) => {
      const start = moment(task.start);
      const end = moment(task.end);
      const left = Math.max(0, start.diff(startDate, 'days')) * dayWidth;
      const width = Math.max(dayWidth, end.diff(start, 'days') * dayWidth);

      const handleMouseDown = (e, type: 'left' | 'right') => {
        e.stopPropagation();
        const startX = e.clientX;
        const originalStart = moment(task.start);
        const originalEnd = moment(task.end);

        const onMouseMove = (moveEvent) => {
          const deltaX = moveEvent.clientX - startX;
          const deltaDays = Math.round(deltaX / dayWidth);

          let newStart = originalStart.clone();
          let newEnd = originalEnd.clone();

          if (type === 'left') newStart.add(deltaDays, 'days');
          if (type === 'right') newEnd.add(deltaDays, 'days');

          if (newEnd.isAfter(newStart)) {
            // избегаем мутации оригинального task (ошибка: readonly)
            task.start = newStart.format('YYYY-MM-DD');
            task.end = newEnd.format('YYYY-MM-DD');
          }
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };

      return (
        <div key={task.key} className="gantt-task-row">
          <div className="gantt-task-label" style={{ paddingLeft: `${level * 16}px` }}>
            {task.name}
          </div>
          <div
            className={`gantt-task-bar ${selectedTask === task.key ? 'selected' : ''}`}
            style={{ left, width }}
            onClick={() => setSelectedTask(task.key)}
          >
            <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'left')} />
            <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'right')} />
          </div>
          {task.children?.length > 0 && renderTasks(task.children, level + 1)}
        </div>
      );
    });
  };

  return (
    <div>
      <div className="gantt-container" ref={chartRef}>
        <div className="gantt-grid">{renderHeader()}</div>
      </div>
      <div className="gantt-tasks">{renderTasks(tasks)}</div>
    </div>

  );
};

export default GanttChart;
