import React from "react";

const TextField = ({
  id,
  name,
  placeholder,
  type = "text",

  value,
  label,
  disabled = false,
  error,
  autoFocus = false,
  onChange,
  onBlur,
  touched,
  mandatory,
  style,
  maxlength,
  isAmount = 0,
  isTable = false,
  labelSize = 5,
  ...otherProps
}) => {
  return (
    <div
      className={isTable ? "row no-gutters" : "row no-gutters mt-1"}
      id={`c${id}`}
    >
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
          <input
            id={id}
            name={name}
            autoComplete="off"
            type="text"
            className={`form-control ${!mandatory && "non-mandatory-input"}`}
            onChange={(e) => {
              e.target.value = e.target.value < 0 ? 0 : e.target.value;
              e.target.value = e.target.value.slice(0, maxlength);
              onChange(e);
            }}
            placeholder={isAmount ? " " : placeholder ? placeholder : label}
            disabled={disabled}
            value={value}
            autoFocus={autoFocus}
            onBlur={onBlur}
            maxlength={maxlength}
            style={{
              textAlign: isAmount ? "right" : "",
              maxWidth: isAmount ? "100px" : "",
            }}
            {...otherProps}
          />
        </div>
        {error && touched && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default TextField;
