import React from "react";

const FileField = (
  {
    id,
    name,
    marginTopReduce = false,
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
    labelSize = 5,
    ...defaultProps
  },
  ref
) => (
  <div
    className={marginTopReduce ? "row no-gutters" : "row no-gutters mt-1"}
    id={`c${id}`}
  >
    {label && label != "" && (
      <div className={`col-lg-${labelSize} text-right pe-3 mt-2`}>
        <label>
          {document.getElementById(id)?.alt
            ? document.getElementById(id)?.alt
            : label}
        </label>
      </div>
    )}
    <div className={label ? `col-lg-${12 - labelSize}` : "col-lg-12"}>
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
