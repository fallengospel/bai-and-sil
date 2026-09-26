import React from 'react';

interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", ...props }, ref) => {
    const groups = new Map<string, SelectOption[]>();
    const ungrouped: SelectOption[] = [];
    for (const opt of options) {
      if (opt.group) {
        if (!groups.has(opt.group)) groups.set(opt.group, []);
        groups.get(opt.group)!.push(opt);
      } else {
        ungrouped.push(opt);
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3 py-2 border-2 rounded-2xl text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bai-blue/20 focus:border-bai-blue bg-white ${
            error ? "border-coral" : "border-gray-200"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {ungrouped.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {Array.from(groups.entries()).map(([groupName, groupOptions]) => (
            <optgroup key={groupName} label={groupName}>
              {groupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-coral font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
