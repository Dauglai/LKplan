import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button, Space } from 'antd';
import './TaskDescriptionEditor.scss'

interface TaskDescriptionEditorProps {
  description: string;
  onSave: (newDescription: string) => void;
}

const TaskDescriptionEditor: React.FC<TaskDescriptionEditorProps> = ({
                                                                       description,
                                                                       onSave,
                                                                     }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(description);

  const handleSave = () => {
    onSave(value);
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(description);
    setEditing(false);
  };

  return (
    <div className="task-block">
      <label>Описание</label>
      {editing ? (
        <>
          <ReactQuill
            theme="snow"
            value={value}
            onChange={setValue}
            modules={{
              toolbar: [
                [{ font: [] }, { size: [] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ script: 'sub' }, { script: 'super' }],
                [{ align: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
              ],
            }}
            style={{ minHeight: 140 }}
          />
          <Space style={{ marginTop: 8 }}>
            <Button type="primary" onClick={handleSave}>
              Сохранить
            </Button>
            <Button onClick={handleCancel}>Отмена</Button>
          </Space>
        </>
      ) : (
        <div
          className="task-border"
          dangerouslySetInnerHTML={{
            __html: description || '<p>Без описания</p>',
          }}
          onClick={() => {
            setValue(description);
            setEditing(true);
          }}
        />
      )}
    </div>
  );
};

export default TaskDescriptionEditor;
