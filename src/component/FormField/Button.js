import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import Spinner from "../Spinner";
const Button = ({
  text,
  textColor,
  bgColor,
  width,
  disabled,
  className,
  isTable = false,
  isCenter = true,
  label = false,
  load = false,
  frmButton = true,
  ...defaultProps
}) => {
  return frmButton ? (
    <>
      {label && (
        <div className={"row no-gutters mt-3"}>
          <label> &nbsp;</label>
        </div>
      )}
      <div className={`${isCenter && "text-center"} ${!isTable && "mt-3"}`}>
        <div className="p-1">
          <button
            disabled={disabled}
            className={className ? className : "btn"}
            {...defaultProps}
          >
            {text}
          </button>
        </div>
      </div>
    </>
  ) : (
    <button
      disabled={disabled}
      className={`${className ? className : "btn"} ${!isTable && "mt-3"}`}
      {...defaultProps}
    >
      {text}
    </button>
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
};
export default Button;
