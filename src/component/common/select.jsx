import React from "react";
import ErrorMessage from "./ErrorMessage";

const Select = ({
  name,
  placeholder,
  options,
  onChange,
  error,
  visible,
  icon,
  ...rest
}) => {
  // console.log(options[0].value);
  return (
    <div>
      {icon}
      <select
        name={name}
        id={name}
        onChange={onChange}
        {...rest}
        // className="form-control"
      >
        <option hidden value="">
          {placeholder}
        </option>
        {options.map((option, index) => {
          return (
            <option
              key={index}
              value={option.name}
              style={{ color: "black" }}
            >
              {option.name}
            </option>
          );
        })}
      </select>
      <ErrorMessage error={error} visible={visible} />
    </div>
  );
};

export default Select;
