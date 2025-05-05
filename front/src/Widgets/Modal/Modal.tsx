import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import 'Styles/components/Sections/ModalStyle.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="ModalOverlay" onClick={handleOverlayClick}>
      <div className="ModalContent" ref={modalContentRef}>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root") as HTMLElement
  );
}