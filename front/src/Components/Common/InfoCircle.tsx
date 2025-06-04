import { Tooltip } from "antd";
import "Styles/components/Common/InfoCircleStyle.scss";
import InfoIcon from "assets/icons/alert-circle.svg?react";

/**
 * Компонент для отображения иконки с всплывающей подсказкой (Ant Design Tooltip).
 *
 * @component
 * @example
 * <InfoCircle text="Это текст подсказки!" />
 * 
 * @param {Object} props - Свойства компонента.
 * @param {string} props.text - Текст, который будет отображаться в подсказке при наведении.
 * @returns {JSX.Element} Компонент иконки с подсказкой.
 */
export default function InfoCircle({ text }: { text: string }): JSX.Element {
  return (
    <Tooltip title={text} className="CustomTooltip">
      <span className="InfoCircleContainer">
        <InfoIcon width="16" height="16" strokeWidth="1" className="InfoCircleIcon" stroke="gray"/>
      </span>
    </Tooltip>
  );
}


