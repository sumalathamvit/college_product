import React, { useEffect, useState, useContext } from "react";
import moment from "moment";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

import empApi from "../api/EmployeeApi";

import Button from "../component/FormField/Button";
import DateFieldFormik from "../component/FormField/DateFieldFormik";

import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import { reportTypeList } from "../component/common/CommonArray";
import ScreenTitle from "../component/common/ScreenTitle";
import { useSelector } from "react-redux";
import AuthContext from "../auth/context";
import string from "../string";

function AttendanceReport() {
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [attendanceArr, setAttendanceArr] = useState([]);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  // const [designationCategoryList, setDesignationCategoryList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  // const [category, setCategory] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showAllButton, setShowAllButton] = useState(false);

  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    fromDate: Yup.date().required("Please select From Date"),
    toDate: Yup.date().required("Please select To Date"),
  });

  // const getDesignationCategory = async (value) => {
  //   console.log("value", value);
  //   if (value) {
  //     const filterDesignation = await empApi.filterDesignation(
  //       value.designationCategory
  //     );
  //     console.log("filterDesignation", filterDesignation);
  //     setCategory(filterDesignation.data.data);
  //   }
  // };

  const handleExport = async (value, type) => {
    console.log("value", value, type);
    try {
      setLoad(true);
      if (value.length > 0) {
        let csvData = [
          [
            "No.",
            "Name",
            "Department",
            "Designation",
            "Shift",
            "Date",
            "InTime",
            "OutTime",
            "Status",
          ],
        ];
        value.map((item, index) => {
          csvData[index + 1] = [
            index + 1,
            item.employee_name,
            item.department.split("-")[0],
            item.custom_designation,
            item.shift,
            item.attendance_date
              ? moment(item.attendance_date).format("DD-MM-YYYY")
              : "",
            item.in_time ? moment(item.in_time).format("HH:mm") : "",
            item.out_time ? moment(item.out_time).format("HH:mm") : "",
            item.status,
          ];
        });
        if (type == 1)
          preFunction.generatePDF(
            collegeName,
            "Attendance Report" +
              "-" +
              moment(new Date()).format("DD-MM-yyyy HH:mm:SS"),
            csvData
          );
        else {
          preFunction.downloadCSV(
            csvData,
            "Attendance Report" +
              "-" +
              moment(new Date()).format("DD-MM-yyyy HH:mm:SS") +
              ".csv"
          );
        }
      }
      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  const handleShow = async (values, showAll, report) => {
    if (load) return;
    setShowRes(true);
    console.log("values---", values);
    // if (report == 1 && !showAllButton) {
    //   handleExport(attendanceArr, report);
    //   return;
    // }
    try {
      setLoad(true);
      const attendanceDetail = await empApi.getEmployeeAttendanceDetail(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        values.reportType ? values.reportType.value : "",
        moment(values.fromDate).format("YYYY-MM-DD"),
        moment(values.toDate).format("YYYY-MM-DD"),
        values?.department ? values?.department.department_id : null,
        values?.designation ? values?.designation.designation : null,
        // values.designationCategory.designationCategory,
        values.employeeCode ? values.employeeCode.name : null,
        showAll ? 1 : 0
      );
      console.log("attendanceDetail", attendanceDetail);
      if (report) {
        handleExport(attendanceDetail.data.message.data, report);
      } else {
        setAttendanceArr(attendanceDetail.data.message.data);
        setShowAllButton(false);
        if (attendanceDetail.data.message.data.length === string.PAGE_LIMIT) {
          setShowAllButton(true);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async (collegeId) => {
    try {
      const masterRes = await empApi.getAllMasters(2, collegeId);
      console.log("masterRes---", masterRes);
      setDesignationList(masterRes.data.message.data.designation);
      setDepartmentList(masterRes.data.message.data.department);
      // setDesignationCategoryList(
      //   masterRes.data.message.data.designationCategory
      // );
    } catch (error) {
      console.log("error----", error);
    }
  };

  const employeeSearch = async (value) => {
    try {
      if (value.length > 1) {
        const employeeRes = await empApi.employeeSearch(value);
        console.log("employeeRes", employeeRes.data.message.employee_data);
        setEmpCodeList(employeeRes.data.message.employee_data);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            // innerRef={formikRef}
            initialValues={{
              college: "",
              reportType: "",
              fromDate: new Date(moment().startOf("month")),
              toDate: new Date(),
              department: "",
              designation: "",
              // designationCategory: "",
              employeeCode: "",
            }}
            validationSchema={FormSchema}
            onSubmit={(values) => handleShow(values, 0)}
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
                  <div className="col-lg-10">
                    {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        searchIcon={false}
                        clear={false}
                        style={{ width: "70%" }}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          console.log("text", text);
                          setShowRes(false);
                          getAllList(text?.collegeID);
                        }}
                      />
                    )}
                    <DateFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      tabIndex={2}
                      label="From Date"
                      id="fromDate"
                      style={{ width: "26%" }}
                      maxDate={new Date()}
                      minDate={new Date(moment().subtract(2, "years"))}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("fromDate", e.target.value);
                        setShowRes(false);
                      }}
                    />
                    <DateFieldFormik
                      tabIndex={3}
                      label="To Date"
                      id="toDate"
                      style={{ width: "26%" }}
                      maxDate={new Date()}
                      minDate={new Date(values.fromDate)}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("toDate", e.target.value);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      label="Status"
                      id="reportType"
                      // mandatory={1}
                      clear={true}
                      tabIndex={4}
                      options={reportTypeList}
                      getOptionLabel={(option) => option.value}
                      getOptionValue={(option) => option.value}
                      style={{ width: "45%" }}
                      onChange={(text) => {
                        setFieldValue("reportType", text);
                        setShowRes(false);
                      }}
                    />

                    <SelectFieldFormik
                      tabIndex={5}
                      label="Department"
                      id="department"
                      style={{ width: "45%" }}
                      options={departmentList}
                      clear={true}
                      getOptionLabel={(option) => option.department}
                      getOptionValue={(option) => option.department}
                      onChange={(text) => {
                        setFieldValue("department", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={6}
                      label="Designation"
                      id="designation"
                      style={{ width: "45%" }}
                      options={designationList}
                      clear={true}
                      getOptionLabel={(option) => option.designation}
                      getOptionValue={(option) => option.designation}
                      onChange={(text) => {
                        setFieldValue("designation", text);
                        setShowRes(false);
                      }}
                    />
                    {/* <SelectFieldFormik
                      tabIndex={6}
                      label="Designation Category"
                      id="designationCategory"
                      style={{ width: "50%" }}
                      options={designationCategoryList}
                      clear={true}
                      getOptionLabel={(option) => option.designationCategory}
                      getOptionValue={(option) => option.designationCategory}
                      onChange={(text) => {
                        setFieldValue("designationCategory", text);
                        // text &&
                        //   text.designationCategory != "All" &&
                        getDesignationCategory(text);
                      }}
                    /> */}
                    <SelectFieldFormik
                      tabIndex={7}
                      label="Employee No. / Name"
                      id="employeeNumber"
                      style={{ width: "60%" }}
                      options={empCodeList}
                      searchIcon={true}
                      clear={true}
                      getOptionLabel={(option) =>
                        option.custom_employeeid + " - " + option.employee_name
                      }
                      getOptionValue={(option) => option.name}
                      onInputChange={(inputValue) => {
                        employeeSearch(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("employeeCode", text);
                        setShowRes(false);
                      }}
                    />
                  </div>
                  <Button
                    text="Show"
                    type="submit"
                    tabIndex={8}
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />

                  {showRes ? (
                    <div className="row no-gutters mt-2">
                      {attendanceArr.length > 0 ? (
                        <>
                          <div className="col-lg-6"></div>
                          <div className="col-lg-6">
                            <div className="text-right">
                              <button
                                type="button"
                                className="btn"
                                onClick={() => handleShow(values, 1, 2)}
                              >
                                Export Excel
                              </button>
                              <button
                                type="button"
                                className="btn ms-3"
                                onClick={(e) => handleShow(values, 1, 1)}
                              >
                                Export PDF
                              </button>
                            </div>
                          </div>
                        </>
                      ) : null}
                      <div className="row mt-3 p-0">
                        <div className="table-responsive p-0">
                          <table className="table table-bordered table-hover report-table">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="10%">Date</th>
                                {/* <th>Employee No.</th> */}
                                <th>Employee Name</th>
                                <th width="20%">Department</th>
                                <th width="20%">Designation</th>
                                {/* <th>Designation Category</th> */}
                                {/* <th>Shift</th> */}
                                <th width="10%">In Time</th>
                                <th width="10%">Out Time</th>
                                <th width="10%">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendanceArr.length === 0 ? (
                                <tr>
                                  <td colspan={9} align="center">
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                attendanceArr.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>
                                        {item.attendance_date
                                          ? moment(item.attendance_date).format(
                                              "DD-MM-YYYY"
                                            )
                                          : ""}
                                      </td>
                                      {/* <td>{item.employee}</td> */}
                                      <td>{item.employee_name}</td>
                                      <td>{item.department.split("-")[0]}</td>
                                      <td>{item.custom_designation}</td>
                                      {/* <td>
                                        {item.custom_designation_category}
                                      </td>
                                      <td>{item.shift}</td> */}
                                      <td>
                                        {item.in_time
                                          ? moment(item.in_time).format("HH:mm")
                                          : "-"}
                                      </td>
                                      <td>
                                        {item.out_time
                                          ? moment(item.out_time).format(
                                              "HH:mm"
                                            )
                                          : "-"}
                                      </td>
                                      <td
                                        style={{
                                          fontWeight: "bold",
                                          color:
                                            item.status == "Present"
                                              ? "green"
                                              : item.status == "On Leave"
                                              ? item.status == "Absent"
                                                ? "red"
                                                : "orange"
                                              : "grey",
                                        }}
                                      >
                                        {item.status}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                          {showAllButton && (
                            <Button
                              text="Show All"
                              className={"btn mt-3"}
                              isTable={true}
                              type="button"
                              onClick={(e) => {
                                handleShow(values, 1);
                              }}
                            />
                          )}
                        </div>
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

export default AttendanceReport;
