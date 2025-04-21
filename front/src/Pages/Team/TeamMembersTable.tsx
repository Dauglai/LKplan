import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, Form, Space, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './TeamMembersTable.scss';

interface Student {
  user_id: number;
  surname: string;
  name: string;
  patronymic: string;
  job?: string;       // ← используется как заглушка для role
  telegram: string;
  group?: string;     // ← может быть временно пустым
}

interface EditableCellProps {
  editable?: boolean;
  children: React.ReactNode;
  dataIndex: keyof Student;
  record: Student;
  inputType: 'text';
  editing: boolean;
}

interface TeamMembersTableProps {
  students: Student[];
  isCurator: boolean;
  isEditing: boolean;
  onUpdate: (updatedStudents: Student[]) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
                                                     children,
                                                     dataIndex,
                                                     inputType,
                                                     editing,
                                                     ...restProps
                                                   }) => {
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Введите ${dataIndex}` }]}
        >
          <Input />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const TeamMembersTable: React.FC<TeamMembersTableProps> = ({
                                                             students,
                                                             isCurator,
                                                             isEditing,
                                                             onUpdate,
                                                           }) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [data, setData] = useState<Student[]>(students);

  const isEditingRow = (record: Student) => record.user_id === editingKey;

  const edit = (record: Student) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.user_id);
  };

  useEffect(() => {
    setData(students);
  }, [students]);

  const cancel = () => setEditingKey(null);

  const save = async (id: number) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => id === item.user_id);
      if (index > -1) {
        newData[index] = { ...newData[index], ...row };
        setData(newData);
        setEditingKey(null);
        onUpdate(newData);
      }
    } catch (err) {
      console.log('Validation Failed:', err);
    }
  };

  const handleDelete = (id: number) => {
    const updated = students.filter((student) => student.user_id !== id); // не item.id!
    onUpdate(updated); // возвращаем в родителя
  };

  const columns: ColumnsType<Student> = [
    {
      title: 'Фамилия',
      dataIndex: 'surname',
    },
    {
      title: 'Имя',
      dataIndex: 'name',
    },
    {
      title: 'Отчество',
      dataIndex: 'patronymic',
    },
    {
      title: 'Роль', // ← Заглушка: используем job
      dataIndex: 'job', // ← было role
      key: 'job',
      render: (text: string) => text || '—', // ← если нет job, показываем прочерк
    },
    {
      title: 'Телеграм',
      dataIndex: 'telegram',
    },
    {
      title: 'Группа', // ← пока может отсутствовать
      dataIndex: 'group',
      render: (text: string) => text || '—',
    },
  ];


  if (isCurator && isEditing) {
    columns.push({
      title: 'Действия',
      dataIndex: 'actions',
      render: (_, record) => {
        const editable = isEditingRow(record);
        return editable ? (
          <Space>
            <Button type="link" onClick={() => save(record.user_id)}>Сохранить</Button>
            <Button type="link" onClick={cancel}>Отмена</Button>
          </Space>
        ) : (
          <Space>
            <Button type="link" onClick={() => edit(record)}>✏</Button>
            <Popconfirm title="Удалить студента?" onConfirm={() => handleDelete(record.user_id)}>
              <Button type="link" danger>Удалить</Button>
            </Popconfirm>
          </Space>
        );
      },
    });
  }

  const mergedColumns = columns.map((col) => {
    if (!isEditing || !['surname', 'name', 'patronymic', 'job', 'telegram', 'group'].includes(col.dataIndex as string)) {
      return col;
    }

    return {
      ...col,
      onCell: (record: Student) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditingRow(record),
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Table
        className="team-members-table"
        bordered
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        dataSource={data}
        columns={mergedColumns}
        rowKey="user_id"
        pagination={false}
      />
    </Form>
  );
};

export default TeamMembersTable;
