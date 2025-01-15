import { Link } from 'react-router-dom';
import './PageSwitcher.scss';
import { useLocation } from 'react-router-dom';

interface PageOption {
  label: string;
  link: string;
}

interface PageSwitcherProps {
  options: PageOption[];
}

export default function PageSwitcher({ options }: PageSwitcherProps): JSX.Element {
    const location = useLocation();

    return (
        <div className="PageSwitcher">
        {options.map(option => (
            <Link
            key={option.link}
            to={option.link}
            className={`PageSwitcherButton ${location.pathname === option.link ? 'active' : ''}`}
            >
            {option.label}
            </Link>
        ))}
        </div>
    );
}
