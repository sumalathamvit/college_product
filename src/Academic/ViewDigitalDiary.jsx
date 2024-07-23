import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import moment from "moment";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import string from "../string";
import { useSelector } from "react-redux";
import ScreenTitle from "../component/common/ScreenTitle";

function ViewDigitalDiary() {
  const RENAME = useSelector((state) => state.web.rename);
  const location = useLocation();
  const [load, setLoad] = useState(false);
  const collegeConfig = useSelector((state) => state.web.college);

  const getInitialList = async () => {
    if (!location.state || !location.state.item) {
      window.history.back();
      return;
    }
    console.log("location.state.item---", location.state.item);
  };

  useEffect(() => {
    getInitialList();
    console.log("location?.state?.id", location?.state?.item);
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters px-3">
          <div className="row no-gutters pt-2">
            <div className="col-lg-9 pe-2">
              {collegeConfig.is_university ? (
                <div className="row mt-1">
                  <label className="col-lg-5 text-right  pt-2">College :</label>
                  <div className="col-lg-7 pt-2 ps-1">
                    {location?.state?.item?.college}
                  </div>
                </div>
              ) : null}

              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">
                  {RENAME?.course} :
                </label>
                <div className="col-lg-7 pt-2 ps-1">
                  {location?.state?.item?.course}
                </div>
              </div>
              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">
                  {RENAME?.sem} :
                </label>
                <div className="col-lg-7 pt-2 ps-1">
                  {location?.state?.item?.className}
                </div>
              </div>
              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">
                  Diary Content :
                </label>
                <div className="col-lg-7 pt-2 ps-1">
                  {location?.state?.item?.classWork}
                </div>
              </div>

              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">Date :</label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {location?.state?.item?.date &&
                    moment(location?.state?.item?.date).format("DD-MM-YYYY")}
                </div>
              </div>

              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">File Name :</label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {location?.state?.item?.filePath.split("/").pop()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row no-gutters mt-4 text-center">
          <div>
            <Button
              type="button"
              text="Back"
              frmButton={false}
              onClick={(e) => window.history.back()}
            />
            {location?.state?.item?.filePath != "" && (
              <>
                &nbsp;&nbsp;
                <Button
                  type="button"
                  frmButton={false}
                  text={"Download"}
                  onClick={(e) =>
                    window.open(
                      string.FILEURL + location?.state?.item?.filePath,
                      "_blank"
                    )
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewDigitalDiary;
