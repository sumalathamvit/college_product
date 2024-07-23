import React, { useState } from "react";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ScreenTitle from "../component/common/ScreenTitle";
import SupplierComponent from "../component/SupplierComponent";

function AddSupplier() {
  const [load, setLoad] = useState(false);
  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position" />
        <div className="row no-gutters">
          <SupplierComponent />
        </div>
      </div>
    </div>
  );
}

export default AddSupplier;
