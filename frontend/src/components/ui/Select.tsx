import type { SelectHTMLAttributes } from 'react';
import './Input.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  id,
  options,
  placeholder,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`ui-field ${className}`}>
      {label && (
        <label htmlFor={selectId} className="section-label">
          {label}
        </label>
      )}
      <select id={selectId} className={`ui-select ${error ? 'ui-input-error' : ''}`} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="ui-field-error">{error}</span>}
    </div>
  );
}
