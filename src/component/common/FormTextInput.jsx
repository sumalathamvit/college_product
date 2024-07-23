import React, { useState } from "react";
import { useFormikContext } from "formik";
import ErrorMessage from "./ErrorMessage";

function FormTextInput({ name, icon, onChange, placeholder, ...otherProps }) {
  const [hasFocus, setHasFocus] = useState(false);

  const { setFieldTouched, values, errors, touched, handleChange } =
    useFormikContext();

  return (
    <>
      {icon}
      <input
        onBlur={() => {
          setFieldTouched(name);
          setHasFocus(false);
        }}
        onFocus={() => setHasFocus(true)}
        name={name}
        value={values[name]}
        onChange={handleChange(name)}
        placeholder={placeholder}
        {...otherProps}
      />
      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </>
  );
}

export default FormTextInput;
