import { useEffect, useRef, useState } from "react";
import "@/app/styles/ui/music-dropdown.scss";

export interface MusicOptionItem {
  file_name: string;
  url: string;
}

interface MusicDropdownProps {
  value: string; // selected url
  onChange: (value: string) => void; // returns selected url
  options: MusicOptionItem[];
  placeholder?: string;
  placement?: "up" | "down";
  isLoading?: boolean;
}

export const MusicDropdown: React.FC<MusicDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder,
  placement = "down",
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: MusicOptionItem) => {
    onChange(option.url);
    setIsOpen(false);
  };

  const selectedLabel =
    options.find((opt) => opt.url === value)?.file_name || placeholder || "";

  return (
    <div className="music-dropdown" ref={dropdownRef}>
      <button
        className="music-dropdown__trigger"
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        type="button"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="music-dropdown__loader">
            <div className="music-dropdown__spinner"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <>
            <span>{selectedLabel}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              className={`music-dropdown__icon ${
                isOpen ? "music-dropdown__icon--open" : ""
              }`}
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="m6 8 4 4 4-4"
              />
            </svg>
          </>
        )}
      </button>

      {isOpen && !isLoading && (
        <div
          className={`music-dropdown__menu ${
            placement === "up" ? "music-dropdown__menu--up" : ""
          }`}
        >
          {options.map((option, index) => (
            <button
              key={`${option.url}-${index}`}
              className={`music-dropdown__option ${
                option.url === value ? "music-dropdown__option--selected" : ""
              }`}
              onClick={() => handleSelect(option)}
              type="button"
            >
              {option.file_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
