import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, maxLength, showCount = false, className = "", value, id, ...props }, ref) => {
    const reactId = React.useId();
    const areaId = id ?? reactId;
    const errorId = `${areaId}-error`;

    const [currentLength, setCurrentLength] = React.useState(
      typeof value === "string" ? value.length : 0
    );

    React.useEffect(() => {
      if (typeof value === "string") {
        setCurrentLength(value.length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentLength(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={areaId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`w-full px-3 py-2 border-2 rounded-2xl text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bai-blue/20 focus:border-bai-blue resize-none ${
            error ? "border-coral" : "border-gray-200"
          } ${className}`}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        <div className="flex justify-between mt-1">
          {error && <p id={errorId} role="alert" className="text-xs text-coral font-medium">{error}</p>}
          {showCount && maxLength && (
            <p className="text-xs text-gray-500 ml-auto">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
