import React from "react";

function CustomLabel({ icon, title, ...otherProps }) {
  return (
    <>
      {icon}
      <label {...otherProps}> {title} </label>
    </>
  );
}

export default CustomLabel;
