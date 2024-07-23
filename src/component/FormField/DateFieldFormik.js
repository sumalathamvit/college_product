import React from "react";
import { useFormikContext } from "formik";
import moment from "moment";

const DateFieldFormik = ({
  id,
  label,
  onBlur,
  mandatory = false,
  minDate,
  maxDate,
  onChange,
  style,
  type = "date",
  format = type == "month" ? "YYYY-MM" : "YYYY-MM-DD",
  isTable = false,
  labelSize = 5,
  bottom = false,
  error,
  ...otherProps
}) => {
  const { errors, touched, values } = useFormikContext();

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (type === "date" && value.length > 10) return;
    if (onChange) onChange(e);
  };

  return (
    <div className={`row no-gutters  mt-1 ${bottom && "mb-2"}`} id={`c${id}`}>
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
            type={type}
            className={`form-control ${!mandatory && "non-mandatory-input"}`}
            id={id}
            name={id}
            value={values[id] ? moment(values[id]).format(format) : ""}
            min={minDate && moment(minDate).format(format)}
            max={maxDate && moment(maxDate).format(format)}
            onChange={handleDateChange}
            onBlur={onBlur}
            {...otherProps}
            style={{ width: type == "month" ? "160px" : "140px" }}
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

export default DateFieldFormik;
