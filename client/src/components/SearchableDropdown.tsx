import { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface SearchableDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  searchPlaceholder?: string;
  itemType?: string; // "courses", "countries", etc.
}

const SearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  icon, 
  disabled = false,
  searchPlaceholder = "Search...",
  itemType = "items"
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className={`flex items-center border border-[#CBD5E1] rounded-lg px-4 py-2 gap-2 bg-white relative w-full shadow-sm cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#94A3B8]'
        }`}
        onClick={handleToggle}
      >
        {icon}
        <div className="flex-1">
          {value ? (
            <span className="text-sm text-[#1E293B] font-sora-regular">
              {value}
            </span>
          ) : (
            <span className="text-sm text-[#64748B] font-sora-regular">
              {placeholder}
            </span>
          )}
        </div>
        <IoIosArrowDown 
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
          size={20} 
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#CBD5E1] rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-[#E2E8F0]">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#3B82F6]"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#F1F5F9] ${
                    value === option ? 'bg-[#E0F2FE] text-[#0C4A6E]' : 'text-[#1E293B]'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-[#64748B]">
                No {itemType} found matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Show total count */}
          <div className="px-4 py-2 text-xs text-[#64748B] border-t border-[#E2E8F0] bg-[#F8FAFC]">
            {filteredOptions.length} of {options.length} {itemType}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown; 