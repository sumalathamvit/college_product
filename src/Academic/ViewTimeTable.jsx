import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeadingIcon from "@mui/icons-material/ManageAccounts";

import AcademicApi from "../api/AcademicApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import string from "../string";
import { useDispatch, useSelector } from "react-redux";
import ScreenTitle from "../component/common/ScreenTitle";

function ViewTimeTable() {
  const RENAME = useSelector((state) => state.web.rename);
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [files, setFiles] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);

  const getViewTimeTable = async () => {
    try {
      if (!location.state || !location.state.id) {
        navigate("/employee-list");
        return;
      }
      console.log("location.state.id--", location.state.id);
      setLoad(true);
      const tableId = location.state.id;
      console.log("tableId----", tableId);

      const viewTimeTable = await AcademicApi.viewTimeTableDetail(tableId);
      console.log("viewTimeTable----", viewTimeTable);
      setData(viewTimeTable.data.message.data.time_table[0]);
      setFiles(viewTimeTable.data.message.data.time_table[0].filePath);

      console.log(
        "data",
        data,
        viewTimeTable.data.message.data.time_table[0].filePath
      );
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const getFileUrl = (file_name) => {
    // const file = files.find((file) => file.file_name === file_name);
    // return file ? string.FILEURL + file.file_url : "";
  };

  const getInitialList = async () => {
    if (!location.state || !location.state.item) {
      window.history.back();
      return;
    }
    console.log("location.state.item---", location.state.item);
  };

  useEffect(() => {
    getInitialList();
    // getViewTimeTable();
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
        <div className="row no-gutters">
          <div className="subhead-row">
            <div className="subhead">Time Table Detail</div>
            <div className="col line-div"></div>
          </div>
          <div className="row no-gutters pt-2">
            <div className="col-lg-9 pe-2">
              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">
                  {RENAME?.course} :
                </label>
                <div className="col-lg-7 pt-2 ps-1">
                  {location?.state?.item?.courseName}
                </div>
              </div>
              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">Batch :</label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {location?.state?.item?.batch}
                </div>
              </div>
              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">
                  {RENAME?.sem} :
                </label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {collegeConfig.institution_type !== 1
                    ? location?.state?.item?.semester
                    : location?.state?.item?.className}
                </div>
              </div>
              <div className="row mt-1">
                <label className="col-lg-5 text-right  pt-2">Section :</label>
                <div className=" col-lg-5 pt-2 ps-1">
                  {location?.state?.item?.section}
                </div>
              </div>
              {/* {location?.state?.item?.description && (
                <div className="row mt-1">
                  <label className="col-lg-5 text-right  pt-2">
                    Description :
                  </label>
                  <div className=" col-lg-5 pt-2 ps-1">
                    {location?.state?.item?.description}
                  </div>
                </div>
              )} */}
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

export default ViewTimeTable;
