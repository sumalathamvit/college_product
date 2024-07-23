import React, { useState } from "react";
import ReactSwitch from "react-switch";

const SwitchField = ({
  label,
  error,
  yesOption,
  noOption,
  touched,
  checked,
  onChange,
  id,
  labelSize = 5,
  ...otherProps
}) => {
  return (
    <div className="row no-gutters mt-2" id={`c${id}`}>
      {label && (
        <div className={`col-lg-${labelSize} text-right pe-3`}>
          <label>
            {document.getElementById(id)?.alt
              ? document.getElementById(id)?.alt
              : label}
          </label>
        </div>
      )}
      <div className={`col-lg-${12 - labelSize}`}>
        <ReactSwitch
          id={id}
          type="checkbox"
          className="switch"
          checked={checked}
          onChange={onChange}
          checkedIcon=""
          uncheckedIcon=""
          {...otherProps}
        />
        {checked ? yesOption : noOption}
        {error && touched && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default SwitchField;
