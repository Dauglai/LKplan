import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import './CreateFormHeader.scss';

export default function CreateEventHeader({label} : {label:string}): JSX.Element {
  return (
    <div className="CreateEventHeader">
        <div className="LeftHeaderPanel">
            <button className="BackButton">
              <ChevronRightIcon width="32" height="32" strokeWidth="2" className="ChevronLeft"/>
            </button>
            <h1 className="HeaderTitle">{label}</h1>
        </div>
    </div>
  );
}
