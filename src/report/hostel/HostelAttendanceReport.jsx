import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { Formik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import {
  sessionList,
  attendanceList,
} from "../../component/common/CommonArray";
import SwitchField from "../../component/FormField/SwitchField";
import ScreenTitle from "../../component/common/ScreenTitle";
import CommonApi from "../../component/common/CommonApi";

import AuthContext from "../../auth/context";

const attendanceSchema = Yup.object().shape({
  buildingName: Yup.object().required("Please select building"),
});

function HostelAttendanceReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [batchList, setBatchList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [studentList, setStudentList] = useState([]);

  const { collegeId, collegeName } = useContext(AuthContext);

  const [showRes, setShowRes] = useState(false);

  const handleCSVData = async (values, report) => {
    try {
      setLoad(true);
      console.log("reportValues---", values);

      let csvData = [
        [
          "No",
          "Date",
          "Student No.",
          "Student Name",
          "Room No",
          "Present",
          "Absent",
          "Permission",
        ],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          moment(item.attendanceDate).format("yyyy-MM-DD"),
          item.enrollNo,
          item.name,
          item.roomNo,
          item.present ? item.present : "-",
          item.leave ? item.leave : "-",
          item.withoutPermission ? "Yes" : "No",
        ];
      });
      if (report == 1) {
        preFunction.generatePDF(collegeName, "Hostel Attandance", csvData);
      } else {
        preFunction.downloadCSV(csvData, "Hostel Attandance.csv");
      }
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleShow = async (values, showAll, report) => {
    if (load) return;
    try {
      setLoad(true);
      console.log(values, "values");
      setShowRes(true);
      if (report == 0) {
        setData([]);
      }

      setShowRes(true);
      const attendanceRes = await StudentApi.getHostelAttendance(
        values.buildingName.id,
        values.batch ? values.batch.id : null,
        values.session ? values.session.value : null,
        values.attendance ? values.attendance.value : null,
        values.enrollNumber ? values.enrollNumber.enrollNo : null,
        values.fromDate ? moment(values.fromDate).format("yyyy-MM-DD") : null,
        values.toDate ? moment(values.toDate).format("yyyy-MM-DD") : null,
        values.isLeave ? values.isLeave : null,
        values.isEmployee ? values.isEmployee : null,
        showAll ? 1 : 0
      );
      console.log("attendanceRes---", attendanceRes);

      if (report) {
        handleCSVData(
          attendanceRes.data.message.hostel_attendance_detail_report,
          report
        );
      } else {
        setData(attendanceRes.data.message.hostel_attendance_detail_report);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
  };

  const getList = async () => {
    try {
      const masterRes = await StudentApi.getMaster(7);
      console.log("masterRes---", masterRes);
      setBatchList(masterRes.data.message.data.batch_data);
      setBuildingList(masterRes.data.message.data.building);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-4">
          <Formik
            enableReinitialize={false}
            initialValues={{
              buildingName: "",
              batch: "",
              session: "",
              attendance: "",
              enrollNumber: "",
              fromDate: moment().subtract(1, "weeks").format("yyyy-MM-DD"),
              toDate: moment(),
              isLeave: "",
              isEmployee: "",
            }}
            validationSchema={attendanceSchema}
            onSubmit={(values) => handleShow(values)}
          >
            {({
              errors,
              values,
              touched,
              setFieldTouched,
              handleSubmit,
              handleChange,
              handleBlur,
              setFieldValue,
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="col-lg-9 ">
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={1}
                      label="Building Name"
                      labelSize={3}
                      id="buildingName"
                      options={buildingList}
                      mandatory={1}
                      getOptionLabel={(option) => option.building}
                      getOptionValue={(option) => option.id}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setFieldValue("buildingName", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      label={RENAME?.batch}
                      labelSize={3}
                      id="batch"
                      tabIndex={2}
                      options={batchList}
                      getOptionLabel={(option) => option.batch}
                      getOptionValue={(option) => option.batchID}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setFieldValue("batch", text);
                        setShowRes(false);
                      }}
                    />

                    <SelectFieldFormik
                      label="Session"
                      labelSize={3}
                      id="session"
                      tabIndex={3}
                      options={sessionList}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("session", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      label="Attendance"
                      labelSize={3}
                      id="attendance"
                      tabIndex={4}
                      options={attendanceList}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("attendance", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      label="Student No."
                      labelSize={3}
                      id="enrollNumber"
                      searchIcon={true}
                      tabIndex={5}
                      options={studentList}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id}
                      onInputChange={(text) => {
                        searchStudent(text);
                      }}
                      onChange={(text) => {
                        setFieldValue("enrollNumber", text);
                        setShowRes(false);
                      }}
                    />
                    <DateFieldFormik
                      label="From Date"
                      labelSize={3}
                      id="fromDate"
                      tabIndex={6}
                      minDate={moment().subtract(1, "years")}
                      maxDate={new Date()}
                      style={{ width: "45%" }}
                      onChange={(e) => {
                        setFieldValue("fromDate", e.target.value);
                        setShowRes(false);
                      }}
                    />

                    <DateFieldFormik
                      label="To Date"
                      labelSize={3}
                      id="toDate"
                      tabIndex={7}
                      maxDate={new Date()}
                      style={{ width: "45%" }}
                      minDate={values.fromDate}
                      onChange={(e) => {
                        setFieldValue("toDate", e.target.value);
                        setShowRes(false);
                      }}
                    />
                    <SwitchField
                      label="Permission"
                      labelSize={3}
                      tabIndex={8}
                      yesOption={"Yes"}
                      noOption={"No"}
                      checked={values.isLeave}
                      onChange={(e) => {
                        setFieldValue("isLeave", !values.isLeave);
                        setShowRes(false);
                      }}
                    />
                    <SwitchField
                      label="Employee"
                      labelSize={3}
                      yesOption={"Yes"}
                      tabIndex={9}
                      noOption={"No"}
                      checked={values.isEmployee}
                      onChange={(e) => {
                        setFieldValue("isEmployee", !values.isEmployee);
                        setShowRes(false);
                      }}
                    />
                  </div>
                  <Button
                    text="Show"
                    isTable={true}
                    type="submit"
                    tabIndex={10}
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />

                  {showRes ? (
                    <div className="row border mt-4 p-3">
                      <div className="row no-gutters totcntstyle  mb-2">
                        {data.length > 0 && (
                          <div className="text-right">
                            <button
                              type="button"
                              className="btn"
                              onClick={(e) => {
                                handleShow(values, 1, 2);
                              }}
                            >
                              Export Excel
                            </button>
                            &nbsp; &nbsp;
                            <button
                              className="btn"
                              type="button"
                              onClick={(e) => {
                                handleShow(values, 1, 1);
                              }}
                            >
                              Export PDF
                            </button>
                          </div>
                        )}
                      </div>{" "}
                      <>
                        <table className="table table-bordered report-table">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th width="5%">Date</th>
                              <th width="10%">Student No.</th>
                              <th>Student Name</th>
                              <th width="5%">Room No.</th>
                              <th width="1%">Present</th>
                              <th width="1%">Absent</th>
                              <th width="1%">Permission</th>
                            </tr>
                          </thead>
                          {data.length === 0 ? (
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
                                    <td>
                                      {moment(item.attendanceDate).format(
                                        "yyyy-MM-DD"
                                      )}
                                    </td>
                                    <td>{item.enrollNo}</td>
                                    <td>{item.name}</td>
                                    <td>{item.roomNo}</td>
                                    <td>{item.present ? item.present : "-"}</td>
                                    <td>{item.absent ? item.absent : "-"}</td>
                                    <td>
                                      {item.absent && item.permission
                                        ? "Yes"
                                        : item.absent && !item.permission
                                        ? "No"
                                        : "-"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          )}
                        </table>
                      </>
                    </div>
                  ) : null}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
export default HostelAttendanceReport;
