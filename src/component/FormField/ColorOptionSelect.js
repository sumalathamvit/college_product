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

const ColorOptionSelect = ({
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
  clear = false,
  searchIcon = true,
  maxlength,
  labelSize = 5,
  matchFrom = "",
  ...otherProps
}) => {
  return (
    <div className={isTable ? "row no-gutters" : "row no-gutters mt-1"}>
      {label && label != "" && (
        <div
          className={`col-lg-${labelSize} ${
            window.innerWidth > 992 ? "text-right" : ""
          } pe-3 mt-2`}
        >
          <label>{label && label}</label>
        </div>
      )}
      <div className={label ? `col-lg-${12 - labelSize}` : "col-lg-12"}>
        <div style={style}>
          <ReactSelect
            styles={{
              option: (styles, { data }) => {
                return {
                  ...styles,
                  backgroundColor: data.bgcolor,
                  color: "#000",
                };
              },
              control: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: "#ccffcc",
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
            error={errors}
            touched={touched}
            onBlur={(e) => {
              onBlur ? onBlur(e) : consoleBlur(e);
            }}
            onChange={(e) => {
              document.getElementById(
                `${id}`
              ).parentNode.parentNode.style.backgroundColor = e.bgcolor;
              document.getElementById(`${id}`).previousSibling.style.color =
                e.color;

              onChange(e);
            }}
            value={value}
            isDisabled={disabled}
            onInputChange={onInputChange}
            {...otherProps}
            isClearable={clear ? true : false}
            isSearchable={search ? true : false}
            filterOption={createFilter({ matchFrom: matchFrom })}
            components={{
              DropdownIndicator:
                search && searchIcon
                  ? customSearchIndicator
                  : customDropdownIndicator,
            }}
          />
          {document
            .getElementById(`${id}`)
            ?.setAttribute("maxlength", maxlength ?? 40)}
        </div>
        {error && touched && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default ColorOptionSelect;
