import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect Component
 */
export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select Option",
  className = "",
  minWidth = "150px"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || { value, label: value || placeholder };

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div 
      className={`relative select-none`} 
      style={{ minWidth }}
      ref={containerRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[#f3f7f2] border ${isOpen ? 'border-[#8ac959] ring-2 ring-[#8ac959]/20' : 'border-[#e2ede4]/60'} text-xs font-bold text-[#1c221e] pl-4 pr-3.5 py-2.5 rounded-full hover:bg-[#edf2ec] active:scale-[0.98] transition-all cursor-pointer text-left ${className}`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-[#627267] transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-[#8ac959]' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute left-0 right-0 mt-1.5 bg-white border border-[#e2ede4] rounded-[18px] shadow-[0_12px_30px_rgba(28,34,30,0.08)] overflow-hidden z-[100]"
          >
            <div className="max-h-60 overflow-y-auto py-1.5 scrollbar-thin">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center justify-between text-left text-xs font-medium px-4 py-2.5 transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-[#e3f2dc] text-[#1c221e] font-bold' 
                        : 'text-[#2c3e2e] hover:bg-[#edf2ec] hover:text-[#1c221e]'
                    }`}
                  >
                    <span className="truncate pr-4">{option.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#436e22] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
