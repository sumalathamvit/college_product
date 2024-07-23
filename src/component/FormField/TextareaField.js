import React from "react";

const TextAreaField = ({
  id,
  placeholder,
  value,
  label,
  error,
  onChange,
  handleBlur,
  touched,
  mandatory,
  disabled,
  style,
  maxlength,
  onBlur,
  labelSize = 5,
  ...otherProps
}) => {
  return (
    <div className="row no-gutters mt-2" id={`c${id}`}>
      {label && label != "" && (
        <div
          className={`col-lg-${labelSize} ${
            window.innerWidth > 992 ? "text-right" : ""
          } pe-3 mt-2`}
        >
          <label>
            {document.getElementById(id)?.alt
              ? document.getElementById(id)?.alt
              : label}
          </label>
        </div>
      )}
      <div className={label ? `col-lg-${12 - labelSize}` : "col-lg-12"}>
        <div style={style}>
          <textarea
            id={id}
            name={id}
            rows="3"
            cols="10"
            maxLength={maxlength}
            handleBlur={handleBlur}
            onBlur={onBlur}
            value={value}
            disabled={disabled}
            onChange={onChange}
            className={`textArea ${!mandatory ? "non-mandatory-input" : ""}`}
            placeholder={placeholder ? placeholder : label}
            {...otherProps}
          />
        </div>
        {error && touched && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default TextAreaField;
