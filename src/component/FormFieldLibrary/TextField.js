import React from "react";

const handleKeyPress = (e, type) => {
  if (type === "number") {
    const input = e.key;
    const regex = /[0-9]/;
    if (input != "Enter" && !regex.test(input)) {
      e.preventDefault();
    }
  }
};

const TextField = ({
  id,
  name,
  type = "text",
  placeholder,
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
  title = false,
  isAmount = 0,
  ...otherProps
}) => {
  return (
    <div className="row">
      {label && label != "" && (
        <div className={title ? "row no-gutters mt-1" : "row no-gutters mt-3"}>
          <label>{label && label}</label>
        </div>
      )}
      <div className="row no-gutters">
        <div style={style}>
          <input
            id={id}
            name={name}
            autoComplete="off"
            type={type}
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
            maxlength={maxlength ?? 140}
            onKeyPress={(e) => handleKeyPress(e, type)}
            style={{
              textAlign: isAmount ? "right" : "",
              maxWidth: isAmount ? "100px" : "",
            }}
            {...otherProps}
          />
          {error && touched && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default TextField;
