import { Application } from 'Features/ApiSlices/applicationSlice'; // Тип заявки
import RequestDetailsModal from './RequestDetailsModal'; // Модальное окно деталей заявки
import RequestMessageModal from './RequestMessageModal'; // Модальное окно сообщений заявки
import CloseIcon from 'assets/icons/close.svg?react'; // Иконка закрытия
import { Modal, Typography } from 'antd'; // Компоненты Ant Design
const { Title } = Typography; // Компонент заголовка
import "Styles/components/Sections/ModalStyle.scss"; // Стили модального окна

interface RequestDetailsProps {
    request: Application; // Объект заявки для отображения
    open: boolean; // Флаг видимости модального окна
    onClose: () => void; // Функция закрытия модального окна
}

/**
 * Обертка для модальных окон деталей заявки.
 * Управляет отображением модальных окон с деталями заявки и сообщениями.
 * Содержит общий UI для всех модальных окон заявки (заголовок, кнопка закрытия).
 * 
 * @component
 * @example
 * // Пример использования:
 * <RequestDetailsWrapper 
 *   request={selectedRequest}
 *   open={isModalOpen}
 *   onClose={handleCloseModal}
 * />
 *
 * @param {RequestDetailsProps} props - Свойства компонента
 * @param {Application} props.request - Данные заявки
 * @param {boolean} props.open - Флаг видимости модального окна
 * @param {function} props.onClose - Обработчик закрытия модального окна
 * @returns {JSX.Element} Обертка модальных окон заявки
 */
export default function RequestDetailsWrapper({ request, open, onClose }: RequestDetailsProps) {
    return (
      <Modal
        open={open}
        footer={null}
        onCancel={onClose}
        closable
        maskClosable={true}
        width={request.message ? 900 : 500}
        style={{ top: 100 }}
        closeIcon={<CloseIcon  width={24} height={24} strokeWidth={1}/>}
        title={
            <Title level={4}>
                {request.user.surname} {request.user.name} {request.user.patronymic} {request.user.course ? `${request.user.course} Курс` : ''}
            </Title>
        }
      >
        <div className="ModalContent">
          <div className="ModalLeft ModalSide">
            <RequestDetailsModal request={request} onClose={onClose}/>
          </div>
          {request.message && (
            <div className="ModalRight ModalSide">
              <RequestMessageModal request={request} onClose={onClose}/>
            </div>
          )}
        </div>
      </Modal>
    );
  }
  
