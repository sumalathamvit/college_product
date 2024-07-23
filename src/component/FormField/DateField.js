import React from "react";
import moment from "moment";

const DateField = ({
  id,
  label,
  error,
  minDate,
  maxDate,
  value,
  isTable = false,
  mandatory = false,
  onBlur,
  onChange,
  onKeyUp,
  style = { width: "100%" },
  type = "date",
  format = type == "month" ? "YYYY-MM" : "YYYY-MM-DD",
  dateBottom = false,
  labelSize = 5,
  ...otherProps
}) => {
  const handleDateChange = (e) => {
    const value = e.target.value;
    if (type === "date" && value.length > 10) return;
    if (onChange) onChange(e);
  };
  return (
    <div
      className={`row no-gutters ${!isTable && "mt-1"} ${dateBottom && "mb-2"}`}
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
            type={type}
            className={`form-control ${!mandatory && "non-mandatory-input"}`}
            id={id}
            name={id}
            value={moment(value).format(format)}
            min={moment(minDate).format(format)}
            max={moment(maxDate).format(format)}
            onChange={handleDateChange}
            onBlur={onBlur}
            onKeyUp={onKeyUp}
            {...otherProps}
            style={{ width: type == "month" ? "160px" : "140px" }}
          />
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default DateField;
