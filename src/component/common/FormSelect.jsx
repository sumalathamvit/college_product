import React, { useState } from "react";
import { useFormikContext } from "formik";
import ErrorMessage from "./ErrorMessage";

function Select({
  name,
  icon,
  onChange,
  placeholder,
  options,
  error,
  ...otherProps
}) {
  const { setFieldTouched, values, errors, touched, handleChange } =
    useFormikContext();
  const [hasFocus, setHasFocus] = useState(false);
  return (
    <div>
      {icon}
      <select
        name={name}
        id={name}
        value={values[name]}
        onChange={handleChange(name)}
        {...otherProps}
        onBlur={() => {
          setFieldTouched(name);
          setHasFocus(false);
        }}
      >
        <option hidden value="">
          {placeholder}
        </option>
        {options.map((option, index) => {
          return (
            <option key={index} value={option.owner || option.name}>
              {option.patient_name || option.name}
            </option>
          );
        })}
      </select>

      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </div>
  );
}
export default Select;
