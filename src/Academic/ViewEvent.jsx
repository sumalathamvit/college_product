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

function ViewEvent() {
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
                  Department :
                </label>
                <div className="col-lg-7 pt-2 ps-1">
                  {location?.state?.item?.department}
                </div>
              </div>
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
                  Event Topic :
                </label>
                <div className="col-lg-7 pt-2 ps-1">
                  {location?.state?.item?.eventTopic}
                </div>
              </div>
              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">
                  Description :
                </label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {location?.state?.item?.description}
                </div>
              </div>
              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">
                  Event Date :
                </label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {location?.state?.item?.eventDate &&
                    moment(location?.state?.item?.eventDate).format(
                      "DD-MM-YYYY"
                    )}
                </div>
              </div>
              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">
                  {" "}
                  Event For :
                </label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {location?.state?.item?.isStaffOnly
                    ? "Staff"
                    : "Staff and Student"}
                </div>
              </div>
              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">File Name :</label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {location?.state?.item?.filePath.split("/").pop()}
                </div>
              </div>
            </div>
            {/* <div className="row no-gutters mt-4">
              <iframe
                title="PDF Viewer"
                width="100%"
                height="500px"
                src={string.FILEURL + location?.state?.item?.filePath}
                allowFullScreen
              >
                This browser does not support PDFs. Please download the PDF to
                view it.
              </iframe>
            </div> */}
          </div>
        </div>
        <div className="row no-gutters mt-4">
          <div className="col-lg-4"></div>
          <div className="col-lg-1">
            <Button
              type="button"
              text="Back"
              onClick={(e) => window.history.back()}
            />
          </div>
          <div className="col-lg-2">
            <Button
              type="button"
              text={"Download"}
              onClick={(e) =>
                window.open(
                  string.FILEURL + location?.state?.item?.filePath,
                  "_blank"
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewEvent;
