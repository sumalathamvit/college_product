import React, { useState } from "react";
import ReactSwitch from "react-switch";

const SwitchField = ({
  label,
  isTable = false,
  error,
  yesOption,
  noOption,
  touched,
  checked,
  onChange,
  id,
  ...otherProps
}) => {
  const [status, setStatus] = useState(checked);
  return (
    <div className={`row no-gutters ${isTable ? "mt-1" : "mt-3"}`}>
      {label && label != "" && (
        <div className="row no-gutters mt-3">
          <label>{label && label}</label>
        </div>
      )}
      <div className="">
        <ReactSwitch
          id={id}
          type="checkbox"
          className="switch"
          checked={status}
          onChange={(e) => {
            setStatus(!status);
            onChange(e);
          }}
          checkedIcon=""
          uncheckedIcon=""
          onClick={(e) => {}}
          {...otherProps}
        />
        {status ? yesOption : noOption}
        {error && touched && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default SwitchField;
