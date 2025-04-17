import { Application } from 'Features/ApiSlices/applicationSlice';
import RequestDetailsModal from './RequestDetailsModal';
import RequestMessageModal from './RequestMessageModal';
import CloseIcon from 'assets/icons/close.svg?react';
import { Modal, Typography } from 'antd';
const { Title } = Typography;
import "Styles/components/Sections/ModalStyle.scss";

interface RequestDetailsProps {
    request: Application;
    open: boolean;
    onClose: () => void;
}

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
            <RequestDetailsModal request={request} />
          </div>
          {request.message && (
            <div className="ModalRight ModalSide">
              <RequestMessageModal request={request} />
            </div>
          )}
        </div>
      </Modal>
    );
  }
  
