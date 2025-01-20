import { useState, useEffect, useRef } from "react";
import "./FiltersSelectorStyle.scss";
import ChevronRightIcon from 'assets/icons/chevron-right.svg?react';

interface FilterOption {
    id: number | string;
    name: string;
}

interface CustomDropdownProps {
    options: FilterOption[];
    placeholder: string;
    onSelect: (value: number | string) => void;
}

export function FiltersSelector({ options, placeholder, onSelect }: CustomDropdownProps): JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (option: FilterOption | null) => {
        setSelectedValue(option?.name || null);
        setIsOpen(false);
        onSelect(option ? option.id : null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="FilterSelect"  ref={dropdownRef}>
            <div className="DropdownHeader" onClick={toggleDropdown}>
                <p>{selectedValue || placeholder}</p>
                <ChevronRightIcon width="20" height="20" strokeWidth="1" className={`ChevronDown ${isOpen ? 'open' : ''}`} />
            </div>
            {isOpen && (
                <div className="DropdownList">
                    <div
                        className="DropdownItem ClearSelection"
                        onClick={() => handleSelect(null)}
                    >
                        {placeholder}
                    </div>
                    {options.map((option) => (
                        <div
                            key={option.id}
                            className="DropdownItem"
                            title={option.name}
                            onClick={() => handleSelect(option)}
                        >
                            {option.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}