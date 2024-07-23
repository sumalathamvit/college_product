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
  dateStyle = false,
  style,
  type = "date",
  format = type == "month" ? "YYYY-MM" : "YYYY-MM-DD",
  isTable = false,
  ...otherProps
}) => {
  const { errors, touched, values } = useFormikContext();

  return (
    <div className={`row no-gutters`}>
      {label && label != "" && (
        <div className="row no-gutters mt-3">
          <label>{label && label}</label>
        </div>
      )}
      <div className="row no-gutters" style={style}>
        <input
          type={type}
          className={`form-control ${!mandatory && "non-mandatory-input"}`}
          id={id}
          name={id}
          value={moment(values[id]).format(format)}
          min={moment(minDate).format(format)}
          max={moment(maxDate).format(format)}
          onChange={onChange}
          onBlur={onBlur}
          {...otherProps}
          style={
            dateStyle
              ? { width: "100%" }
              : { width: type == "month" ? "160px" : "140px" }
          }
        />
      </div>
      {touched[id] && errors[id] && (
        <div className="error-message">{touched[id] && errors[id]}</div>
      )}
    </div>
  );
};

export default DateFieldFormik;
