import React from "react";

const ReadOnlyField = ({ label, value, style, title }) => {
  return (
    <div className={title ? "row mt-1" : "row mt-3"}>
      <div className={"row no-gutters "}>
        <label>{label}</label>
      </div>
      <div className={"form-display-box"}>{value}</div>
    </div>
  );
};

export default ReadOnlyField;
