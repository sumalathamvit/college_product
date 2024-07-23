import React from "react";

const FileField = (
  {
    id,
    name,
    placeholder,
    value,
    label,
    disabled = false,
    error,
    autoFocus = false,
    onChange,
    handleBlur,
    touched,
    mandatory,
    style,
    maxlength,
    ref1,
    ...defaultProps
  },
  ref
) => (
  <div className={`row no-gutters`}>
    {label && label != "" && (
      <div className={`row no-gutters mt-3`}>
        <label>{label && label}</label>
      </div>
    )}
    <div className="row no-gutters">
      <div style={style}>
        <input
          id={id}
          type="file"
          className={`form-control ${!mandatory && "non-mandatory-input"}`}
          onChange={onChange}
          disabled={disabled}
          autoFocus={autoFocus}
          ref={ref}
          {...defaultProps}
        />
        {error && touched && <div className="error-message">{error}</div>}
      </div>
    </div>
  </div>
);

export default React.forwardRef(FileField);
