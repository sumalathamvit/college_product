import React from "react";
import { useFormikContext } from "formik";

const TextAreaFieldFormik = ({
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
  abelSize = 5,
  isTable,
  handleBlur,
  labelSize = 5,
  rows = 3,
  areaStyle,
  ...otherProps
}) => {
  const { errors, touched, values } = useFormikContext();

  return (
    <div
      className={isTable ? "row no-gutters" : "row no-gutters mt-1"}
      id={`c${id}`}
    >
      {label && label !== "" && (
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
            rows={rows}
            autoComplete="off"
            maxLength={maxlength ? maxlength : null}
            handleBlur={handleBlur}
            onBlur={onBlur}
            value={values[id]}
            disabled={disabled}
            onChange={onChange}
            className={`textArea ${!mandatory ? "non-mandatory-input" : ""}`}
            style={areaStyle}
            placeholder={placeholder ?? label}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                event.stopPropagation();
              }
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

export default TextAreaFieldFormik;
