import { useNavigate } from 'react-router-dom';
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import './BackButton.scss';


/**
 * 
 * Кнопка для возврата на предыдущую страницу. При наличии `onClick` обработчика,
 * сначала выполняется этот обработчик, затем осуществляется навигация назад.
 * 
 * @component
 * @param {Object} props - Свойства компонента.
 * @param {() => void} [props.onClick] - Необязательный обработчик события клика.
 * 
 * @returns {JSX.Element} - Кнопка для возврата на предыдущую страницу.
 */
export default function BackButton({ onClick }: { onClick?: () => void }) {
  const navigate = useNavigate();

  /**
   * Обработчик клика по кнопке.
   * Выполняет переданный `onClick` обработчик (если он есть) и
   * осуществляет переход на предыдущую страницу.
   */
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
