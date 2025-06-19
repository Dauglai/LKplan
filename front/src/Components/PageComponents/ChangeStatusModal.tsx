import { Modal } from "antd"; // Компонент модального окна Ant Design
import { Application, usePartialUpdateApplicationMutation } from "Features/ApiSlices/applicationSlice"; // Типы и API для заявок
import { StatusApp } from "Features/ApiSlices/statusAppSlice"; // Тип статуса заявки
import { useState } from "react"; // React хуки
import { useNotification } from 'Components/Common/Notification/Notification'; // Хук уведомлений
import StatusAppSelector from "Components/Selectors/StatusAppSelector"; // Селектор статусов заявок

/**
 * Пропсы компонента модального окна изменения статуса
 * @property {boolean} open - Флаг видимости модального окна
 * @property {function} onClose - Функция закрытия модального окна
 * @property {Application[]} requests - Массив заявок для изменения статуса
 */
interface ChangeStatusModalProps {
  open: boolean;
  onClose: () => void;
  requests: Application[];
}

/**
 * Компонент модального окна для изменения статуса заявок
 * @component
 * @param {ChangeStatusModalProps} props - Пропсы компонента
 * 
 * @example
 * <ChangeStatusModal 
 *   open={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   requests={selectedRequests}
 * />
 */
export function ChangeStatusModal({ open, onClose, requests }: ChangeStatusModalProps) {
    const [status, setStatus] = useState<StatusApp | null>(null); // Выбранный статус
    const [updateApplication] = usePartialUpdateApplicationMutation(); // Мутация для обновления заявки
    const { showNotification } = useNotification(); // Хук для показа уведомлений
  
    /**
     * Обработчик подтверждения изменения статуса
     * @async
     */
    const handleSubmit = async () => {
      if (!status) return; // Если статус не выбран - выходим
    
      try {
        // Массовое обновление статусов для всех выбранных заявок
        await Promise.all(
          requests.map(request =>
            updateApplication({ id: request.id, data: { status: status.id } })
          )
        );
        // Показываем уведомление об успехе
        showNotification(`Выбранные заявки (${requests.length}) успешно перешли в статус ${status.name}`, 'success');
        onClose(); // Закрываем модальное окно
      } catch (error) {
        console.error("Ошибка при обновлении заявок:", error);
        // Показываем уведомление об ошибке
        showNotification(`Ошибка при обновлении заявок: ${error.status} ${error.data[0]}`, 'error');
      }
    };
    
    return (
      <Modal open={open} onCancel={onClose} onOk={handleSubmit} title="Изменить статус заявок" okButtonProps={{ disabled: !status }}>
        <StatusAppSelector
          selectedStatusApp={status}
          onChange={setStatus}
        />
      </Modal>
    );
}
  