import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import './Input.css';
import './Select.css';

interface SelectProps {
  label?: string;
  error?: string;
  id?: string;
  name?: string;
  className?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

function createChangeEvent(value: string): ChangeEvent<HTMLSelectElement> {
  return { target: { value } } as ChangeEvent<HTMLSelectElement>;
}

export function Select({
  label,
  error,
  id,
  options,
  placeholder = 'Select an option',
  className = '',
  value = '',
  onChange,
  required,
  disabled,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-') || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  const closeMenu = useCallback(() => {
    setOpen(false);
    setHighlightIndex(-1);
  }, []);

  const selectValue = useCallback(
    (nextValue: string) => {
      onChange?.(createChangeEvent(nextValue));
      closeMenu();
    },
    [closeMenu, onChange],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [closeMenu, open]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!open) {
          setOpen(true);
          const selectedIndex = options.findIndex((option) => option.value === value);
          setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
        } else {
          setHighlightIndex((current) => {
            if (event.key === 'ArrowDown') {
              return current < options.length - 1 ? current + 1 : 0;
            }
            return current > 0 ? current - 1 : options.length - 1;
          });
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open && highlightIndex >= 0) {
          selectValue(options[highlightIndex].value);
        } else {
          setOpen(true);
          const selectedIndex = options.findIndex((option) => option.value === value);
          setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
        }
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        closeMenu();
        break;
      default:
        break;
    }
  };

  return (
    <div className={`ui-field ${className}`} ref={containerRef}>
      {label && (
        <label id={`${selectId}-label`} htmlFor={selectId} className="section-label">
          {label}
        </label>
      )}
      <div className="ui-select-wrap">
        <button
          type="button"
          id={selectId}
          className={`ui-select-trigger ${error ? 'ui-input-error' : ''} ${
            !selectedOption ? 'ui-select-placeholder' : ''
          } ${open ? 'ui-select-open' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          disabled={disabled}
          onClick={() => {
            if (disabled) {
              return;
            }
            if (open) {
              closeMenu();
              return;
            }
            setOpen(true);
            const selectedIndex = options.findIndex((option) => option.value === value);
            setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className="ui-select-value">{displayLabel}</span>
          <ChevronDown size={16} className="ui-select-chevron" aria-hidden="true" />
        </button>

        {open && options.length > 0 && (
          <ul className="ui-select-menu" role="listbox" aria-labelledby={selectId}>
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightIndex;

              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`ui-select-option ${isSelected ? 'ui-select-option-selected' : ''} ${
                    isHighlighted ? 'ui-select-option-highlighted' : ''
                  }`}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => selectValue(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <Check size={16} className="ui-select-option-check" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {required && (
          <input
            type="text"
            className="ui-select-hidden-input"
            value={value}
            required
            tabIndex={-1}
            aria-hidden="true"
            onChange={() => {}}
          />
        )}
      </div>
      {error && <span className="ui-field-error">{error}</span>}
    </div>
  );
}
