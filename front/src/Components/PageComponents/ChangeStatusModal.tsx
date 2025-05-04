import { Modal } from "antd";
import { usePartialUpdateApplicationMutation } from "Features/ApiSlices/applicationSlice";
import { useState } from "react";
import StatusAppSelector from "Widgets/Selectors/StatusAppSelector";

export function ChangeStatusModal({ open, onClose, selectedIds }: {
    open: boolean;
    onClose: () => void;
    selectedIds: number[];
  }) {
    const [status, setStatus] = useState<string | null>(null);
    const [updateApplication] = usePartialUpdateApplicationMutation();
  
    const handleSubmit = async () => {
      if (!status) return;
      await Promise.all(
        selectedIds.map(id =>
          updateApplication({ id, data: { status } })
        )
      );
      onClose();
    };
  
    return (
      <Modal open={open} onCancel={onClose} onOk={handleSubmit} title="Изменить статус заявок">
        <StatusAppSelector
          value={status}
          onChange={setStatus}
        />
      </Modal>
    );
  }
  