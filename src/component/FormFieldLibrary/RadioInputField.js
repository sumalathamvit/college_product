import React from "react";

const RadioInputField = ({
  id,
  name,
  value,
  label,
  error,
  touched,
  style,
  findBook = false,
  labelSize = 11,
  ...otherProps
}) => {
  return (
    <div className={"row no-gutters"}>
      {label && label != "" && (
        <div className={`col-${labelSize} text-right pe-2 mt-3`}>
          <label>{label}</label>
        </div>
      )}
      <div className={label ? `col-${12 - labelSize} mt-3` : "col-12"}>
        <div style={style}>
          <input
            type="radio"
            id={id}
            name={name}
            className="radio-input"
            value={value}
            onChange={onchange}
            {...otherProps}
          />

          {error && touched && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default RadioInputField;
