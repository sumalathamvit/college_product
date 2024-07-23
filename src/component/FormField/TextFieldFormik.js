import React from "react";
import { useFormikContext } from "formik";
import $ from "jquery";

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
  labelSize = 5,
  isTable = false,
  error,
  ...otherProps
}) => {
  const { errors, touched, values } = useFormikContext();

  return (
    <div
      className={isTable ? "row no-gutters" : "row no-gutters mt-1"}
      id={"c" + id}
    >
      {label && label != "" ? (
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
      ) : null}
      <div
        className={
          label && label != "" ? `col-lg-${12 - labelSize}` : "col-lg-12"
        }
      >
        <div style={style}>
          <input
            id={id}
            name={id}
            autoComplete="off"
            type={type == "password" ? "password" : "text"}
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
            // onKeyPress={(e) => handleKeyPress(e, type)}
            style={{
              textAlign: isAmount ? "right" : "",
              maxWidth: isAmount ? "100px" : "",
            }}
            {...otherProps}
          />
        </div>
        {touched[id] && errors[id] && (
          <div className="error-message">{errors[id]}</div>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default TextFieldFormik;
