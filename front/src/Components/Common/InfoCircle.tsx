import { useState } from 'react';
import "Styles/components/Common/InfoCircle.scss"
import InfoIcon from 'assets/icons/alert-circle.svg?react';

/**
 * Компонент для отображения иконки с всплывающей подсказкой.
 * При наведении на иконку появляется текст с подсказкой.
 *
 * @component
 * @example
 * // Пример использования
 * <InfoCircle text="Это текст подсказки!" />
 * 
 * @param {Object} props - Свойства компонента.
 * @param {string} props.text - Текст, который будет отображаться в подсказке при наведении.
 * @returns {JSX.Element} Компонент иконки с подсказкой.
 */
export default function InfoCircle({ text } : { text : string}): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);

  return (
        <div
        className="InfoCircleContainer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >

      <InfoIcon 
          width="16" 
          height="16" 
          strokeWidth="1"
          className="InfoCircleIcon"
        />
      {isHovered && <div className="InfocircleTooltip">{text}</div>}
    </div>
  );
};

