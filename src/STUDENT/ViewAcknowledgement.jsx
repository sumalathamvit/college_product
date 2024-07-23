import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TransferWithinAStationIcon from "@mui/icons-material/TransferWithinAStation";
import moment from "moment";

import api from "../api/StudentApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";

import blankProfile from "../assests/png/blank-profile-picture.png";
import string from "../string";
import StudentCard from "../component/StudentCard";
import ScreenTitle from "../component/common/ScreenTitle";
import { useSelector } from "react-redux";

function ViewAcknowledgement() {
  //#region const
  const RENAME = useSelector((state) => state["rename"]["data"]);
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [studentInfo, setStudentInfo] = useState([]);
  const [qualificationHistory, setQualificationHistory] = useState([]);
  //#endregion

  const viewStudent = async () => {
    try {
      if (!location.state || !location.state.item) {
        navigate("/student-list");
        return;
      }
      console.log("location.state.id--", location.state.id);
      setLoad(true);

      const viewStudent = await api.viewStudent(
        location?.state?.item?.studentID
      );
      console.log("---viewStudent", viewStudent);
      setStudentInfo(viewStudent.data.message.data.student);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    viewStudent();
    console.log("Test.item", location?.state?.item);
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row mt-3 no-gutters">
          <div className="row no-gutters">
            <div className="subhead-row">
              <div className="subhead">Student Detail</div>
              <div className="col line-div"></div>
            </div>
          </div>
          <StudentCard studentInfo={studentInfo} />
          <div className="subhead-row">
            <div className="subhead">Authorization Detail</div>
            <div className="col line-div"></div>
          </div>
          <div className="row no-gutters pt-2">
            <div className="col-lg-9 pe-2">
              <div className="row mt-1">
                <label className="control-label col-lg-6">Category :</label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {location?.state?.item?.studentCategory}
                </div>
              </div>
              {location?.state?.item?.admissionMode ? (
                <div className="row mt-1">
                  <label className="control-label col-lg-6">
                    New Admission Type :
                  </label>
                  <div className=" col-lg-5 pt-2 ps-1">
                    {location?.state?.item?.admissionMode}
                  </div>
                </div>
              ) : null}
              {location?.state?.item?.newCourseName ? (
                <div className="row mt-1">
                  <label className="control-label col-lg-6">
                    New {RENAME?.course} :
                  </label>
                  <div className=" col-lg-5 pt-2 ps-1">
                    {location?.state?.item?.newCourseName}
                  </div>
                </div>
              ) : null}
              {location?.state?.item?.newBatch ? (
                <div className="row mt-1">
                  <label className="control-label col-lg-6">
                    New {RENAME?.batch} :
                  </label>
                  <div className=" col-lg-5 pt-2 ps-1">
                    {location?.state?.item?.newBatch}
                  </div>
                </div>
              ) : null}
              <div className="row mt-1">
                <label className="control-label col-lg-6">
                  Refund Amount :
                </label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {location?.state?.item?.refundAmount ?? "-"}
                </div>
              </div>
              <div className="row mt-1">
                <label className="control-label col-lg-6">Note :</label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {location?.state?.item?.remarks}
                </div>
              </div>
            </div>
          </div>
          <div className="row no-gutters mt-4">
            <iframe
              title="PDF Viewer"
              width="100%"
              height="500px"
              src={string.FILEURL + location?.state?.item?.filepath}
              allowFullScreen
            >
              This browser does not support PDFs. Please download the PDF to
              view it.
            </iframe>
          </div>
          <div className="row no-gutters mt-4">
            <div className="col-lg-9"></div>
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
                    string.FILEURL + location?.state?.item?.filepath,
                    "_blank"
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewAcknowledgement;
