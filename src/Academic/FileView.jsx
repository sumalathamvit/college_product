import React, { useEffect, useState } from "react";
import HeadingIcon from "@mui/icons-material/School";
import { useLocation } from "react-router-dom";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import { toast } from "react-toastify";
import string from "../string";
import ModalComponent from "../component/ModalComponent";
import { useDispatch, useSelector } from "react-redux";
import ScreenTitle from "../component/common/ScreenTitle";
import DisplayText from "../component/FormField/DisplayText";

// const pdfUrl = "https://www.africau.edu/images/default/sample.pdf";

function FileView() {
  const RENAME = useSelector((state) => state.web.rename);

  const location = useLocation();
  const [modalErrorOpen, setModalErrorOpen] = useState(false); // Line 1
  const [modalTitle, setModalTitle] = useState(""); // Line 2
  const [modalMessage, setModalMessage] = useState(""); // Line 3
  const collegeConfig = useSelector((state) => state.web.college);

  const getInitialList = async () => {
    if (!location.state || !location.state.item) {
      // setModalErrorOpen(true); // Line 4
      // setModalTitle("Error"); // Line 5
      // setModalMessage("Something went wrong"); // Line 6
      window.history.back();
      return;
    }
    console.log("location.state---", location.state);
  };

  useEffect(() => {
    getInitialList();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <ModalComponent
        title={modalTitle}
        isOpen={modalErrorOpen}
        message={modalMessage}
        okClick={() => setModalErrorOpen(false)}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="col-lg-10">
          {location?.state?.courseName && (
            <div className="row no-gutters mt-2">
              <DisplayText
                label={RENAME?.course}
                value={location?.state?.courseName}
              />
            </div>
          )}
          {location?.state?.regulation && (
            <div className="row no-gutters mt-2">
              <div className="col-lg-5 text-right pe-3 mt-2">
                <label>Regulation :</label>
              </div>

              <div className="col-lg-7 mt-2">{location?.state?.regulation}</div>
            </div>
          )}
          {location?.state?.batch && (
            <div className="row no-gutters mt-2">
              <div className="col-lg-5 text-right pe-3 mt-2">
                <label>Batch :</label>
              </div>

              <div className="col-lg-7 mt-2">{location?.state?.batch}</div>
            </div>
          )}
          {location?.state?.semester && (
            <div className="row no-gutters mt-2">
              <div className="col-lg-5 text-right pe-3 mt-2">
                <label>{RENAME?.sem}</label>
              </div>

              <div className="col-lg-7 mt-2">{location?.state?.semester}</div>
            </div>
          )}

          <div className="row no-gutters mt-2">
            <div className="col-lg-5 text-right pe-3 mt-2">
              <label>Subject :</label>
            </div>

            <div className="col-lg-7 mt-2">{location?.state?.subjectName}</div>
          </div>

          <div className="row no-gutters mt-1">
            <div className="col-lg-5 text-right pe-3 mt-2">
              <label>Description :</label>
            </div>
            <div className="col-lg-7 mt-2">
              {location?.state?.item?.description}
            </div>
          </div>
          <div className="row no-gutters mt-1">
            <div className="col-lg-5 text-right pe-3 mt-2">
              <label>File Name :</label>
            </div>
            <div className="col-lg-7 mt-2">
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
            This browser does not support PDFs. Please download the PDF to view
            it.
          </iframe>
        </div> */}
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

export default FileView;
