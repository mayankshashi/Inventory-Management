import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`ui-field ${className}`}>
      {label && (
        <label htmlFor={inputId} className="section-label">
          {label}
        </label>
      )}
      <input id={inputId} className={`ui-input ${error ? 'ui-input-error' : ''}`} {...props} />
      {error && <span className="ui-field-error">{error}</span>}
    </div>
  );
}
