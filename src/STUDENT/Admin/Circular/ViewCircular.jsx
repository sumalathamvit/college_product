import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import Button from "../../../component/FormField/Button";
import string from "../../../string";
import { useSelector } from "react-redux";
import ScreenTitle from "../../../component/common/ScreenTitle";
import DisplayText from "../../../component/FormField/DisplayText";

function ViewCircular() {
  const RENAME = useSelector((state) => state.web.rename);
  const location = useLocation();
  const navigate = useNavigate();
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
                <DisplayText
                  label="College"
                  value={location?.state?.item?.college}
                />
              ) : null}
              <DisplayText
                label={RENAME?.dept}
                value={location?.state?.item?.department}
              />
              <DisplayText
                label={RENAME?.course}
                value={location?.state?.item?.course}
              />
              <DisplayText
                label={RENAME?.sem}
                value={location?.state?.item?.className}
              />
              <DisplayText
                label={"Circular Topic"}
                value={location?.state?.item?.circularTopic}
              />
              <DisplayText
                label={"Description"}
                isHTML={true}
                value={location?.state?.item?.description.replace(
                  /\n/g,
                  "<br />"
                )}
              />
              <DisplayText
                label={"Circular For"}
                value={
                  location?.state?.item?.isStaffOnly
                    ? "Staff"
                    : "Staff and Student"
                }
              />
              {location?.state?.item?.filePath != "" ? (
                <DisplayText
                  label={"File"}
                  value={location?.state?.item?.filePath.split("/").pop()}
                />
              ) : null}
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
        <div className="row no-gutters mt-4 text-center">
          <Button
            type="button"
            text="Back"
            onClick={(e) => window.history.back()}
          />
          {location?.state?.item?.filePath != "" ? (
            <>
              &nbsp;&nbsp;
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
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ViewCircular;
