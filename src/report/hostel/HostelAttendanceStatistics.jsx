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
import { sessionList } from "../../component/common/CommonArray";
import CommonApi from "../../component/common/CommonApi";

import SwitchField from "../../component/FormField/SwitchField";

import ScreenTitle from "../../component/common/ScreenTitle";
import AuthContext from "../../auth/context";

const attendanceSchema = Yup.object().shape({
  buildingName: Yup.object().required("Please select building"),
});

function HostelAttendanceStatistics() {
  const RENAME = useSelector((state) => state.web.rename);
  const { collegeId, collegeName } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [batchList, setBatchList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [studentList, setStudentList] = useState([]);

  const [showRes, setShowRes] = useState(false);

  const handleCSVData = async (values, report) => {
    try {
      console.log("reportValues---", values);

      let csvData = [
        [
          "No",
          "Student No.",
          "Student Name",
          "Room No",
          "Present",
          "Absent",
          "No.of Without Permission",
          "Total",
        ],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.enrollNo,
          item.name,
          item.roomNo,
          item.present,
          item.leave,
          item.withoutPermission,
          item.present + item.leave,
        ];
      });
      if (report == 1) {
        preFunction.generatePDF(
          collegeName,
          "Hostel Attandance Statistics",
          csvData
        );
      } else {
        preFunction.downloadCSV(csvData, "Hostel Attandance Statistics.csv");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleShow = async (values, showAll, report) => {
    if (load) return;
    try {
      console.log(values, "values");
      setShowRes(true);
      if (report > 0) {
        handleCSVData(data, report);
        return;
      }

      setLoad(true);
      setData([]);
      setShowRes(true);

      const attendanceRes = await StudentApi.getHostelAttendanceStatistics(
        values.buildingName.id,
        values.batch ? values.batch.id : null,
        values.session ? values.session.value : null,
        values.enrollNumber ? values.enrollNumber.enrollNo : null,
        values.fromDate ? moment(values.fromDate).format("yyyy-MM-DD") : null,
        values.toDate ? moment(values.toDate).format("yyyy-MM-DD") : null,
        values.isEmployee ? values.isEmployee : null,
        showAll ? 1 : 0
      );
      console.log("attendanceRes---", attendanceRes);

      setData(attendanceRes.data.message.hostel_attendance_statistics_report);

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
                      label="Building Name"
                      id="buildingName"
                      tabIndex={1}
                      options={buildingList}
                      mandatory={1}
                      labelSize={3}
                      getOptionLabel={(option) => option.building}
                      getOptionValue={(option) => option.id}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("buildingName", text);
                      }}
                    />
                    <SelectFieldFormik
                      label={RENAME?.batch}
                      id="batch"
                      tabIndex={2}
                      options={batchList}
                      getOptionLabel={(option) => option.batch}
                      getOptionValue={(option) => option.batchID}
                      style={{ width: "40%" }}
                      clear={true}
                      labelSize={3}
                      onChange={(text) => {
                        setFieldValue("batch", text);
                      }}
                    />

                    <SelectFieldFormik
                      label="Session"
                      id="session"
                      tabIndex={3}
                      options={sessionList}
                      style={{ width: "30%" }}
                      clear={true}
                      labelSize={3}
                      onChange={(text) => {
                        setFieldValue("session", text);
                      }}
                    />

                    <SelectFieldFormik
                      label="Student No. / Name"
                      id="enrollNumber"
                      tabIndex={4}
                      labelSize={3}
                      searchIcon={true}
                      clear={true}
                      options={studentList}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id}
                      onInputChange={(text) => {
                        searchStudent(text);
                      }}
                      onChange={(text) => {
                        setFieldValue("enrollNumber", text);
                      }}
                    />
                    <DateFieldFormik
                      label="From Date"
                      id="fromDate"
                      tabIndex={5}
                      labelSize={3}
                      minDate={moment().subtract(1, "years")}
                      maxDate={new Date()}
                      style={{ width: "35%" }}
                      onChange={(e) => {
                        setFieldValue("fromDate", e.target.value);
                      }}
                    />

                    <DateFieldFormik
                      label="To Date"
                      id="toDate"
                      tabIndex={6}
                      labelSize={3}
                      maxDate={new Date()}
                      style={{ width: "35%" }}
                      minDate={values.fromDate}
                      onChange={(e) => {
                        setFieldValue("toDate", e.target.value);
                      }}
                    />

                    <SwitchField
                      label="Employee"
                      id="isEmployee"
                      tabIndex={7}
                      labelSize={3}
                      yesOption={"Yes"}
                      noOption={"No"}
                      checked={values.isEmployee}
                      onChange={(e) => {
                        setFieldValue("isEmployee", !values.isEmployee);
                      }}
                    />
                  </div>
                  <Button
                    text="Show"
                    tabIndex={8}
                    type="submit"
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />

                  {showRes ? (
                    <div className="row border mt-4 p-3">
                      <div className="row no-gutters totcntstyle">
                        {data.length > 0 && (
                          <div className=" col-lg-6 text-right">
                            <Button
                              type="button"
                              frmButton={false}
                              isTable={true}
                              onClick={(e) => {
                                handleShow(values, 1, 2);
                              }}
                              text={"Export Excel"}
                            />
                            &nbsp; &nbsp;
                            <Button
                              frmButton={false}
                              isTable={true}
                              type="button"
                              onClick={(e) => {
                                handleShow(values, 1, 1);
                              }}
                              text={"Export PDF"}
                            />
                          </div>
                        )}
                      </div>

                      <div className="row no-gutters">
                        <table
                          className="table report-table table-bordered"
                          id="pdf-table"
                        >
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th width="5%">Student No.</th>
                              <th>Student Name</th>
                              <th width="1%"> Room No.</th>
                              <th width="1%">Present</th>
                              <th width="1%">Absent</th>
                              <th width="1%">No.of Without Permission</th>
                              <th width="1%">Total</th>
                            </tr>
                          </thead>
                          {data.length == 0 ? (
                            <tbody>
                              <tr>
                                <td colSpan="8" className="text-center">
                                  No data found
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
                                    <td>{item.name}</td>
                                    <td>{item.roomNo}</td>
                                    <td>{item.present}</td>
                                    <td>{item.leave}</td>
                                    <td>{item.withoutPermission}</td>
                                    <td>{item.present + item.leave}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          )}
                        </table>
                      </div>
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
export default HostelAttendanceStatistics;
