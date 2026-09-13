import React from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, maxLength, showCount = false, className = "", value, ...props }, ref) => {
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7298C7]/20 focus:border-[#7298C7] resize-none ${
            error ? "border-[#e8634a]" : "border-gray-300"
          } ${className}`}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        <div className="flex justify-between mt-1">
          {error && <p className="text-xs text-[#e8634a]">{error}</p>}
          {showCount && maxLength && (
            <p className="text-xs text-gray-400 ml-auto">
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
