import { useState, useRef, MouseEvent, useEffect } from 'react';
import MoreIcon from 'assets/icons/more.svg?react';

interface ActionMenuProps {
  actions: { label: string, onClick: () => void, requiredRole?: string }[];
  onClose: () => void;
  role?: string;
}

export default function ActionMenu({ actions, onClose, role }: ActionMenuProps): JSX.Element {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLUListElement | null>(null);

    const filteredActions = actions.filter(action => 
        !action.requiredRole || action.requiredRole === role
    );

    const toggleMenu = () => {
        setOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpen(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <MoreIcon 
                        width="16" 
                        height="16" 
                        strokeWidth="1"
                        onClick={() => toggleMenu()}
                        className="ThreeDotsButton"
                />
            {open && (
                <ul ref={menuRef} className="ActionsMenu">
                {filteredActions.map((action, index) => (
                    <li key={index} onClick={() => { action.onClick(); onClose(); }}>
                    {action.label}
                    </li>
                ))}
                </ul>
            )}
        </>
    );
};
