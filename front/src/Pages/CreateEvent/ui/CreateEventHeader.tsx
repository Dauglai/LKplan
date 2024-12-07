import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';
import TemplateSelector from './elements/TemplateSelector';
import './CreateEventHeader.scss';

export default function CreateEventHeader(): JSX.Element {
  return (
    <div className="CreateEventHeader">
        <div className="LeftHeaderPanel">
            <button className="BackButton">
              <ChevronRightIcon width="32" height="32" strokeWidth="2" className="ChevronLeft"/>
            </button>
            <h1 className="HeaderTitle">Новое мероприятие</h1>
        </div>
      <TemplateSelector />
    </div>
  );
}
