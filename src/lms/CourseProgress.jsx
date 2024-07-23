import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import StudentApi from "../api/StudentApi";
import AcademicApi from "../api/AcademicApi";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ReactSelectField from "../component/FormField/ReactSelectField";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextField from "../component/FormField/TextField";
import ScreenTitle from "../component/common/ScreenTitle";
import ModalComponent from "../component/ModalComponent";
import { sectionList } from "../component/common/CommonArray";
import AuthContext from "../auth/context";
import { useSelector } from "react-redux";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import DateFieldFormik from "../component/FormField/DateFieldFormik";
import moment from "moment";
import LMSApi from "../api/LMSApi";
import EmployeeApi from "../api/EmployeeApi";
import DisplayText from "../component/FormField/DisplayText";

function CourseProgress() {
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [code, setCode] = useState("");
  const [empCodeList, setEmpCodeList] = useState([]);
  const [empCode, setEmpCode] = useState("");
  const formikRef = useRef();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [basicdata, setBasicData] = useState([]);
  const { setUnSavedChanges, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const employeeSearch = async (inputValue) => {
    console.log("searchValue---", inputValue);
    setEmpCodeList([]);
    try {
      // setLoad(true);
      if (inputValue.length > 2) {
        const batchListRes = await LMSApi.batchListing(inputValue);
        console.log("batchListRes", batchListRes);
        setEmpCodeList(batchListRes.data.message.data);
      }
      setLoad(false);
    } catch (error) {
      console.log("error----", error);
    }
  };

  const handleGetEmployeeDetails = async (employeeDetail) => {
    setData([]);

    try {
      setLoad(true);
      console.log("employeeDetail---", employeeDetail);
      setEmpCode(employeeDetail);
      // const studentbatchListRes = await LMSApi.getStudentBatchList(
      //   employeeDetail.name
      // );
      // console.log("studentbatchListRes---", studentbatchListRes);
      const studentbatchListRes = await LMSApi.getStudentBatchListdata(
        employeeDetail.batchName
      );
      console.log(
        "studentbatchListRes---",
        studentbatchListRes.data.message.data
      );
      setBasicData(studentbatchListRes.data.message.data.batch_data);
      setData(studentbatchListRes.data.message.data.student_progress);
      //   setCode(employeeDetail.name);
      setShowRes(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const getAllBacthList = async () => {
    try {
      const batchListRes = await LMSApi.batchListing("");
      console.log("batchListRes", batchListRes);
      setEmpCodeList(batchListRes.data.message.data);
    } catch (error) {
      console.log("error----", error);
    }
  };

  useEffect(() => {
    getAllBacthList();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        title={modalTitle}
        isOpen={modalErrorOpen}
        message={modalMessage}
        okClick={() => setModalErrorOpen(false)}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="col-lg-9 mt-1">
          {/* <ReactSelectField
            autoFocus
            label="Batch Name"
            id="empCode"
            mandatory={1}
            labelSize={3}
            tabIndex={7}
            value={empCode}
            clear={false}
            style={{ width: "90%" }}
            options={empCodeList}
            getOptionLabel={(option) =>
              option.batchTitle + " - " + option.courseTitle
            }
            getOptionValue={(option) => option.batchName}
            onInputChange={(inputValue) => {
              employeeSearch(inputValue);
            }}
            onChange={(text) => {
              setEmpCode(text);
              console.log("text---", text);
              handleGetEmployeeDetails(text);
            }}
          /> */}
          <ReactSelectField
            autoFocus
            label="Batch Name"
            id="empCode"
            mandatory={1}
            labelSize={3}
            tabIndex={7}
            value={empCode}
            clear={false}
            searchIcon={false}
            style={{ width: "90%" }}
            options={empCodeList}
            getOptionLabel={(option) =>
              option.batchTitle + " - " + option.courseTitle
            }
            getOptionValue={(option) => option.batchName}
            // onInputChange={(inputValue) => {
            //   employeeSearch(inputValue);
            // }}
            onChange={(text) => {
              setEmpCode(text);
              console.log("text---", text);
              handleGetEmployeeDetails(text);
            }}
          />

          {data.length > 0 ? (
            <>
              <DisplayText
                label="Course Name"
                labelSize={3}
                value={basicdata.courseTitle}
              />
              <DisplayText
                label="Start Date"
                labelSize={3}
                value={preFunction.convertDateFormat(basicdata.start_date)}
              />
              <DisplayText
                label="End Date"
                labelSize={3}
                value={preFunction.convertDateFormat(basicdata.end_date)}
              />
              <DisplayText
                label="Mentor Name"
                labelSize={3}
                value={basicdata.employee_name}
              />
            </>
          ) : null}
        </div>

        <div className="row no-gutters mt-1">
          {showRes && (
            <>
              <div className="row no-gutters">
                <div className="col-lg-10"></div>
              </div>
              <div className="row no-gutters">
                <div className="subhead-row">
                  <div className="subhead">Student Details</div>
                  <div className="col line-div"></div>
                </div>

                <div className="table-responsive mt-2 p-0">
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th width="10%">Student No.</th>
                        <th>Student Name</th>
                        <th>Progress</th>
                      </tr>
                    </thead>

                    {data.length == 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan={10} align="center">
                            No records found
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody>
                        {data.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.enrollNo}</td>
                              <td>{item.studentName}</td>
                              <td>
                                {Math.round(item.progress)} {"%"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
              {/* <Button
                isTable={true}
                text="F4 - Save"
                id="save"
                type="button"
                // onClick={() => {
                //   handleSave(values);
                // }}
              /> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseProgress;
