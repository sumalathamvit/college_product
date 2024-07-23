import React from "react";

function CustomTextInput({ icon, endicon, ...otherProps }) {
  return (
    <>
      {icon}
      <input autoComplete="off" {...otherProps} />
      {endicon}
    </>
  );
}

export default CustomTextInput;
