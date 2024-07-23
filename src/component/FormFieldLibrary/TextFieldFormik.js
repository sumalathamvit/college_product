import React from "react";
import { useFormikContext } from "formik";

const handleKeyPress = (e, type) => {
  if (type === "number") {
    const input = e.key;
    const regex = /[0-9]/;
    if (input !== "Enter" && !regex.test(input)) {
      e.preventDefault();
    }
  }
};

const TextFieldFormik = ({
  id,
  type = "text",
  label,
  placeholder,
  disabled = false,
  autoFocus = false,
  onChange,
  onBlur,
  mandatory,
  style,
  maxlength,
  isAmount = 0,
  isTable,
  title = false,
  ...otherProps
}) => {
  const { errors, touched, values } = useFormikContext();

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
            name={id}
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
            value={values[id]}
            autoFocus={autoFocus}
            onBlur={onBlur}
            maxLength={maxlength ? maxlength : 140}
            onKeyPress={(e) => handleKeyPress(e, type)}
            style={{
              textAlign: isAmount ? "right" : "",
              height: isTable ? "30%" : "",
              maxWidth: isAmount ? "100px" : "",
            }}
            {...otherProps}
          />
        </div>
        {touched[id] && errors[id] && (
          <div className="error-message">{errors[id]}</div>
        )}
      </div>
    </div>
  );
};

export default TextFieldFormik;
