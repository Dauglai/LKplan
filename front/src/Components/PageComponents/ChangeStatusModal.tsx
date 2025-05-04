import { Modal } from "antd";
import { Application, usePartialUpdateApplicationMutation } from "Features/ApiSlices/applicationSlice";
import { StatusApp } from "Features/ApiSlices/statusAppSlice";
import { useState } from "react";
import { useNotification } from 'Widgets/Notification/Notification';
import StatusAppSelector from "Widgets/Selectors/StatusAppSelector";

interface ChangeStatusModalProps {
  open: boolean;
  onClose: () => void;
  requests: Application[];
}

export function ChangeStatusModal({ open, onClose, requests }: ChangeStatusModalProps) {
    const [status, setStatus] = useState<StatusApp | null>(null);
    const [updateApplication] = usePartialUpdateApplicationMutation();
    const { showNotification } = useNotification();
  
    const handleSubmit = async () => {
      if (!status) return;
    
      try {
        await Promise.all(
          requests.map(request =>
            updateApplication({ id: request.id, data: { status: status.id } })
          )
        );
        showNotification(`Выбранные заявки (${requests.length}) успешно перешли в статус ${status.name}`, 'success');
        onClose();
      } catch (error) {
        console.error("Ошибка при обновлении заявок:", error);
        showNotification(`Ошибка при обновлении заявок: ${error.status} ${error.data[0]}`, 'error');
      }
    };

    console.log(requests)
    
  
    return (
      <Modal open={open} onCancel={onClose} onOk={handleSubmit} title="Изменить статус заявок" okButtonProps={{ disabled: !status }}>
        <StatusAppSelector
          selectedStatusApp={status}
          onChange={setStatus}
        />
      </Modal>
    );
}
  