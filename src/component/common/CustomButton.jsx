import React from "react";

function CustomButton({ title, type, onClick, ...otherProps }) {
  return (
    <button onClick={onClick} {...otherProps}>
      {title}
    </button>
  );
}

export default CustomButton;
