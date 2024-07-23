import React from "react";
import { useFormikContext } from "formik";
import ErrorMessage from "./ErrorMessage";

function FormRadioInput({ data, name, onchange, placeholder, ...otherProps }) {
  const { errors, touched, handleChange } = useFormikContext();

  return (
    <>
      <div>
        {data.map((item) => {
          return (
            <>
              <label for={item.id} className="radio-wrapper">
                {/* <span className="radio"> */}
                <input
                  type="radio"
                  id={item.id}
                  name={name}
                  className="radio-input"
                  value={item.id}
                  onChange={handleChange(name)}
                  placeholder={placeholder}
                  {...otherProps}
                />
                {/* <span className="radio-inner"></span>
                </span> */}
                <span>{item.value}</span>
              </label>
            </>
          );
        })}
        <ErrorMessage error={errors[name]} visible={touched[name]} />
      </div>
    </>
  );
}

export default FormRadioInput;
