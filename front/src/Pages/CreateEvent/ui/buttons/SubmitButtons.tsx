import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

import './SubmitButtons.scss';
import 'Styles/_buttons.scss';


export default function SubmitButtons(): JSX.Element {
  return (
    <div className="SubmitButtons">
      <button className="primary-button">
        Добавить мероприятие
        <ChevronRightIcon width="24" height="24" strokeWidth="1"/>
      </button>
    </div>
  );
}
