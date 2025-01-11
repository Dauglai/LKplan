import PaperclipIcon from "assets/icons/paperclip.svg?react"
import './FileUploader.scss';

interface FileUploaderProps {
  label: string;
}

export default function FileUploader({ label }: FileUploaderProps): JSX.Element {
  return (
    <div className="FileUploader">
      <h3>{label}</h3>
      <button>
        <PaperclipIcon width="12" height="12" strokeWidth="1"/>
        Прикрепить файл
      </button>
    </div>
  );
}
