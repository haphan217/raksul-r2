import React from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
}

function SelectComponent({
  label,
  value,
  options,
  onChange,
  id,
  disabled,
}: SelectProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={styles.wrapper}>
      {label ? (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <div className={styles.selectContainer}>
        <select
          id={selectId}
          className={styles.select}
          value={value}
          onChange={handleChange}
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export const Select = React.memo(SelectComponent);
Select.displayName = 'Select';

export default Select;
