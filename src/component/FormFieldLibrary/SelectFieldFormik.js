import React from "react";
import ReactSelect, { createFilter } from "react-select";
import string from "../../string";
import searchIcon from "../../assests/svg/search.svg";
import arrowIcon from "../../assests/svg/react-select-down-arrow.svg";
import { useFormikContext } from "formik";

const customSearchIndicator = (props) => {
  return (
    <div
      {...props.innerProps}
      className="m-1"
      style={{
        padding: "5px",
        borderRadius: "5px",
        background: "#E4EAF8",
      }}
    >
      <img alt="College" src={searchIcon} />
    </div>
  );
};

const customDropdownIndicator = (props) => {
  return (
    <div
      {...props.innerProps}
      className="m-1"
      style={{
        padding: "5px",
        borderRadius: "5px",
        background: "#E4EAF8",
      }}
    >
      <img alt="College" src={arrowIcon} />
    </div>
  );
};
const consoleBlur = (e) => {
  // console.log("blur");
};

const SelectFieldFormik = ({
  id,
  placeholder,
  label,
  onChange,
  onBlur,
  mandatory,
  options,
  value,
  style,
  isTable = false,
  onInputChange,
  disabled = false,
  search = true,
  clear = true,
  searchIcon = false,
  maxlength,
  title = false,
  error,
  matchFrom = "",
  ...otherProps
}) => {
  const { values, errors, touched } = useFormikContext();

  return (
    <div className={`row no-gutters`}>
      {label && label != "" && (
        <div className={title ? "row no-gutters mt-1" : "row no-gutters mt-3"}>
          <label>{label && label}</label>
        </div>
      )}
      <div className="row no-gutters">
        <div style={style}>
          <ReactSelect
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: !mandatory ? string.MANDATORYCOLOR : "",
                border: state.isFocused
                  ? "1px solid #67a9ff"
                  : "1px solid #60a9c3",
                outline: state.isFocused
                  ? "2px solid #67a9ff"
                  : "2px solid #fff",
              }),
            }}
            className="custom-select" // Apply the control class
            classNamePrefix="custom-select"
            inputId={id}
            placeholder={placeholder ? placeholder : label}
            options={options}
            error={errors[id]}
            touched={touched[id]}
            onBlur={(e) => {
              onBlur ? onBlur(e) : consoleBlur(e);
            }}
            onChange={onChange}
            value={values[id]}
            isDisabled={disabled}
            onInputChange={onInputChange}
            filterOption={createFilter({ matchFrom: matchFrom })}
            {...otherProps}
            isClearable={clear ? true : false}
            isSearchable={search ? true : false}
            components={{
              DropdownIndicator: searchIcon
                ? customSearchIndicator
                : customDropdownIndicator,
            }}
          />
          {document
            .getElementById(`${id}`)
            ?.setAttribute("maxlength", maxlength ?? 40)}
        </div>
        {touched[id] && errors[id] && (
          <div className="error-message">{touched[id] && errors[id]}</div>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default SelectFieldFormik;
