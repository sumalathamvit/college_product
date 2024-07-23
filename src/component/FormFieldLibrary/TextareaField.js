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
  style,
  maxlength,
  onBlur,
  title = false,
}) => {
  return (
    <div className="row mt-2">
      {label && label != "" && (
        <div className={title ? "row no-gutters mt-1" : "row no-gutters mt-3"}>
          <label>{label && label}</label>
        </div>
      )}
      {/* <label className="control-label col-lg-5">
        {label && <b>{label}</b>} :
      </label> */}
      <div className="col-lg-10 ps-1">
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
            onChange={onChange}
            className={`textArea ${!mandatory ? "non-mandatory-input" : ""}`}
            placeholder={placeholder}
          />
        </div>
        {error && touched && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default TextAreaField;
