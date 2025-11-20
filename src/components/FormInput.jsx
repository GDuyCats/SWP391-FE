import React from "react";

/**
 * Reusable form input component with error handling
 */
const FormInput = ({
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  required = false,
  className = "",
  ...props
}) => {
  const baseClassName = `w-full px-4 py-2 border rounded-md focus:ring-2 focus:border-transparent transition-colors ${
    error
      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
      : "border-gray-300 focus:ring-gray-500 focus:border-gray-500"
  } ${className}`;

  return (
    <div className="w-full">
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className={baseClassName}
        required={required}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;

