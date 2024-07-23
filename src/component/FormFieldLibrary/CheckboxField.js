import React from "react";

const CheckboxField = ({
  id = "id",
  label,
  error,
  touched,
  checked,
  onChange,
  isTable = false,
  ...otherProps
}) => {
  return (
    <div className={isTable ? "" : "mt-2 mb-2"}>
      <input
        id={id}
        type="checkbox"
        className="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ cursor: "pointer" }}
        {...otherProps}
      />
      {label && (
        <>
          <span
            style={{ cursor: "pointer", paddingLeft: 4 }}
            onClick={(e) => {
              document.getElementById(id).checked =
                document.getElementById(id).checked == true ? false : true;
              onChange(e);
            }}
          >
            {label}
          </span>
        </>
      )}
      {error && touched && <div className="error-message">{error}</div>}
    </div>
  );
};

export default CheckboxField;
