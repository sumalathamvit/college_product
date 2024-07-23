import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
const Button = ({
  text,
  textColor,
  bgColor,
  width,
  disabled,
  className,
  isTable = false,
  label,
  ...defaultProps
}) => {
  const StyledButton = styled.button``;

  return (
    <div className={`text-right p-0`}>
      {!isTable && (
        <div className="row mt-3">
          <label>&nbsp;</label>
        </div>
      )}
      <div className="row no-gutters">
        <div>
          <StyledButton
            disabled={disabled}
            className={className ? className : "btn"}
            {...defaultProps}
          >
            {text}
          </StyledButton>
        </div>
      </div>
    </div>
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
};
export default Button;
