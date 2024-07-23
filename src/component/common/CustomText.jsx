import React from "react";

function CustomText({ iconfront, icon, onClick, children, ...otherProps }) {
  return (
    <label onClick={onClick} {...otherProps}>
      {iconfront}
      {children}
      {icon}
    </label>
  );
}

export default CustomText;
