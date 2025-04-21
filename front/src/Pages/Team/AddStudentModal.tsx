import { Modal, Select } from 'antd';
import { useGetUsersQuery, User } from 'Features/ApiSlices/userSlice.ts';
import { useState } from 'react';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (students: User[]) => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ visible, onClose, onAdd }) => {
  const { data: students = [] } = useGetUsersQuery();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleOk = () => {
    const selectedStudents = students.filter((s) => selectedIds.includes(s.user_id));
    onAdd(selectedStudents);
    setSelectedIds([]);
    onClose();
  };

  return (
    <Modal
      title="Добавить участника"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      okText="Добавить"
      cancelText="Отмена"
    >
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Выберите студентов"
        value={selectedIds}
        onChange={setSelectedIds}
        options={students.map((s) => ({
          label: `${s.surname} ${s.name}`,
          value: s.user_id,
        }))}
      />
    </Modal>
  );
};

export default AddStudentModal;
