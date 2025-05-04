import { useNavigate } from 'react-router-dom';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import './BackButton.scss';



export default function BackButton({ onClick }: { onClick?: () => void }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) onClick();
    navigate(-1);
  };

  return (
    <button onClick={handleBack} className="BackButton lfp-btn">
      <ChevronRightIcon width="32" height="32" strokeWidth="2" className="ChevronLeft"/>
    </button>
  );
}
