import { useLocation, useNavigate } from 'react-router-dom';
import 'Styles/components/Sections/SideTabs.scss';

const steps = [
  { title: 'Настройка Мероприятия', path: '/event-setup' },
  { title: 'Настройка Направлений', path: '/directions-setup' },
  { title: 'Настройка Проектов', path: '/projects-setup' },
  { title: 'Выбранные настройки', path: '/event-setup-save' },
];

export default function SideTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate(path);
  };

  const isEventEdit = location.pathname.match(/^\/event\/\d+\/edit$/);

    return (
    <div className="SideTabs">
        {steps.map((step) => {
        const isActive =
            location.pathname === step.path ||
            (isEventEdit && step.path === '/event-setup');
        return (
            <div
            key={step.path}
            className={`SideTabItem ${isActive ? 'active' : ''}`}
            onClick={() => handleClick(step.path)}
            >
            {step.title}
            </div>
        );
        })}
    </div>
);
}


