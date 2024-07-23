import React from "react";
import ReactSelect, { createFilter } from "react-select";
import string from "../../string";
import searchIcon from "../../assests/svg/search.svg";
import arrowIcon from "../../assests/svg/react-select-down-arrow.svg";

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
      <img src={searchIcon} />
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
      <img src={arrowIcon} />
    </div>
  );
};
const consoleBlur = (e) => {
  // console.log("blur");
};

const ReactSelectField = ({
  id,
  placeholder,
  label,
  error,
  onChange,
  onBlur,
  touched,
  mandatory,
  options,
  errors,
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
  matchFrom = "",

  ...otherProps
}) => {
  return (
    <div className={`row no-gutters`}>
      {label && label != "" && (
        <div className={`row no-gutters ${title ? "mt-1" : "mt-3"}`}>
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
            // filterOption={createFilter({ matchFrom: "start" })}
            placeholder={placeholder ?? label}
            options={options}
            error={errors}
            touched={touched}
            onBlur={(e) => {
              onBlur ? onBlur(e) : consoleBlur(e);
            }}
            onChange={onChange}
            value={value}
            isDisabled={disabled}
            onInputChange={onInputChange}
            {...otherProps}
            filterOption={createFilter({ matchFrom: matchFrom })}
            isClearable={clear ? true : false}
            isSearchable={search ? true : false}
            components={{
              DropdownIndicator: searchIcon
                ? customSearchIndicator
                : customDropdownIndicator,
            }}
          />
          {maxlength
            ? document.getElementById(id)?.setAttribute("maxlength", maxlength)
            : document.getElementById(id)?.setAttribute("maxlength", 40)}
        </div>
        {error && touched && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default ReactSelectField;
