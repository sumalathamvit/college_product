import React from "react";

const DisplayText = ({
  id,
  value,
  label,
  style,
  isHTML = false,
  isTable,
  labelSize = 5,
}) => {
  return (
    <div className={isTable ? "row no-gutters" : "row no-gutters mt-1"}>
      {label && label !== "" && (
        <div
          className={`col-lg-${labelSize} ${
            window.innerWidth > 992 ? "text-right" : ""
          } pe-2 mt-2`}
        >
          <label>
            {document.getElementById(id)?.alt
              ? document.getElementById(id)?.alt
              : label}
            :
          </label>
        </div>
      )}
      <div
        className={`${label ? `col-lg-${12 - labelSize}` : "col-lg-12"} mt-2`}
      >
        <div style={style}>
          {isHTML ? (
            <div
              dangerouslySetInnerHTML={{
                __html: value,
              }}
            ></div>
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayText;
