import React from "react";
import DatePicker from "react-datepicker";
import DateCustomInput from "../common/CommonFunction";
import moment from "moment";

const DateField = ({
  inputId,
  label,
  error,
  handleBlur,
  touched,
  errors,
  setFieldValue,
  mandatory = false,
  minDate,
  maxDate,
  value,
  customInput,
  selected,
  onChange,
  onBlur,
  type = "date",
  format = type == "month" ? "YYYY-MM" : "YYYY-MM-DD",
  isTable = false,
  title = false,
  ...otherProps
}) => {
  return (
    <div className={`row no-gutters`}>
      {label && label != "" && (
        <div className={title ? "row no-gutters mt-1" : "row no-gutters mt-3"}>
          <label>{label && label}</label>
        </div>
      )}
      <div className="row no-gutters">
        {/* <DatePicker
          id={inputId}
          name={inputId}
          minDate={minDate}
          maxDate={maxDate}
          selected={selected}
          onChange={onChange}
          handleBlur={handleBlur}
          dateFormat="dd-MM-yyyy"
          customInput={customInput}
          error={errors}
          touched={touched}
          showMonthDropdown
          showYearDropdown
          scrollableYearDropdown
          {...otherProps}
        /> */}
        <input
          type={type}
          className={`form-control ${!mandatory && "non-mandatory-input"}`}
          id={inputId}
          name={inputId}
          value={moment(value).format(format)}
          min={moment(minDate).format(format)}
          max={moment(maxDate).format(format)}
          onChange={onChange}
          clear={false}
          onBlur={onBlur}
          {...otherProps}
          style={{ width: type == "month" ? "160px" : "140px" }}
        />
        {error && touched && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default DateField;
