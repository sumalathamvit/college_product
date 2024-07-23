import React from "react";
import moment from "moment";

import string from "../string";

const PageFooter = () => {
  return (
    <>
      <div className="row no-gutters">
        <div className="text-center pb-5" style={{ backgroundColor: "#fff" }}>
          Copyright © {moment().format("yyyy")} {string.COPYRIGHT} (
          {string.VERSION})
        </div>
      </div>
    </>
  );
};

export default PageFooter;
