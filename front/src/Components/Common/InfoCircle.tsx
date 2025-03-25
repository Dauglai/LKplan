import { useState } from 'react';
import "Styles/components/Common/InfoCircle.scss"
import InfoIcon from 'assets/icons/alert-circle.svg?react';


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

