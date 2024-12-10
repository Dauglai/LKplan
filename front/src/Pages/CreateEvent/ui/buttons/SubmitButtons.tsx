import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

import './SubmitButtons.scss';
import 'Styles/_buttons.scss';


export default function SubmitButtons({label} : {label: string}): JSX.Element {
  return (
    <div className="SubmitButtons">
      <button className="primary-button">
        {label}
        <ChevronRightIcon width="24" height="24" strokeWidth="1"/>
      </button>
    </div>
  );
}
