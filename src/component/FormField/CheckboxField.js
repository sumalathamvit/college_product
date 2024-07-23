import React, { useState } from "react";

const CheckboxField = ({
  id = "checkBoxId",
  label,
  error,
  touched,
  checked,
  onChange,
  isTable = false,
  leftLabel = false,
  labelSize = 5,
  ...otherProps
}) => {
  return (
    <>
      {leftLabel ? (
        <div className={`row col-lg-12 ${isTable ? "" : "mt-1 mb-2"}`}>
          <>
            {label && (
              <div
                className={`col-lg-${labelSize} ${
                  window.innerWidth > 992 ? "text-right" : ""
                } pe-3 mt-2`}
              >
                <span
                  style={{ cursor: "pointer", paddingLeft: 4 }}
                  onClick={(e) => {
                    document.getElementById(id).checked =
                      document.getElementById(id).checked == true
                        ? false
                        : true;
                    onChange(e);
                  }}
                >
                  {label + " "}
                </span>
              </div>
            )}
            <div
              className={`${
                label ? `p-0 col-lg-${12 - labelSize}` : "col-lg-12"
              } mt-2`}
            >
              <input
                id={id}
                type="checkbox"
                className="checkbox"
                checked={checked}
                onChange={onChange}
                style={{ cursor: "pointer" }}
                {...otherProps}
              />
            </div>
            {error && touched && <div className="error-message">{error}</div>}
          </>
        </div>
      ) : (
        <div className={`col-lg-12 ${isTable ? "" : "mt-2"}`}>
          <input
            id={id}
            type="checkbox"
            className="checkbox"
            checked={checked}
            onChange={onChange}
          />{" "}
          <span
            className="underline-on-hover"
            style={{
              cursor: "pointer",
              paddingLeft: 4,
            }}
            onClick={(e) => {
              document.getElementById(id).checked =
                document.getElementById(id).checked == true ? false : true;
              onChange(e);
            }}
          >
            {label}
          </span>
          {error && touched && <div className="error-message">{error}</div>}
        </div>
      )}
    </>
  );
};

export default CheckboxField;
