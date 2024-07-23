import React from "react";
import ErrorMessage from "./ErrorMessage";

function RadioInput({ data, name, onchange, placeholder, ...otherProps }) {
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
                  onChange={onchange}
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
      </div>
    </>
  );
}

export default RadioInput;
