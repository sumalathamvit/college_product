import React, { useEffect, useState, useContext, useRef } from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";

import empApi from "../../../api/EmployeeApi";

import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import Button from "../../../component/FormField/Button";
import DateFieldFormik from "../../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../../component/common/ScreenTitle";

import {
  boldStyle,
  permissionStatusList,
  topLineStyle,
} from "../../../component/common/CommonArray";
import AuthContext from "../../../auth/context";
import string from "../../../string";

function PermissionEntryReport() {
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [dateError, setDateError] = useState(false);

  const [empCodeList, setEmpCodeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),

    fromDate: Yup.date().required("Please select From Date"),
    toDate: Yup.date().required("Please select To Date"),
  });

  const handleCSVData = async (exportData, type, values) => {
    if (type === 1) {
      let filterContent = [];
      filterContent.push([
        {
          content:
            "From Date : " +
            moment(values.fromDate).format("DD-MM-yyyy") +
            " To Date : " +
            moment(values.toDate).format("DD-MM-yyyy"),
          styles: boldStyle,
        },
      ]);
      values.status &&
        filterContent.push([
          {
            content: "Status : " + values.status.label,
            styles: boldStyle,
          },
        ]);
      (values.department || values.designation) &&
        filterContent.push([
          {
            content:
              "Department : " +
              (values.department ? values.department.department : "All") +
              " Designation : " +
              (values.designation ? values.designation.designation : "All"),
            styles: boldStyle,
          },
        ]);
      values.employeeNumber &&
        filterContent.push([
          {
            content:
              "Employee No. / Name : " +
              values.employeeNumber.custom_employeeid +
              " - " +
              values.employeeNumber.employee_name,
            styles: boldStyle,
          },
        ]);

      let head = [
        [
          { content: "No.", styles: topLineStyle },
          { content: "Emp No.", styles: topLineStyle },
          { content: "Name", styles: topLineStyle },
          { content: "Designation", styles: topLineStyle },
          { content: "Permission Date", styles: topLineStyle },
          { content: "Status", styles: topLineStyle },
          { content: "From Time", styles: topLineStyle },
          { content: "To Time", styles: topLineStyle },
          { content: "Reason", styles: topLineStyle },
        ],
      ];

      let pdfData = [];
      exportData.map((item, index) => {
        if (index === 0)
          pdfData.push([
            {
              content: "Department" + " : " + item.department.split("-")[0],
              colSpan: 9,
              styles: boldStyle,
            },
          ]);
        else if (exportData[index - 1].department !== item.department)
          pdfData.push([
            {
              content: "Department" + " : " + item.department.split("-")[0],
              colSpan: 9,
              styles: boldStyle,
            },
          ]);

        pdfData.push([
          { content: index + 1 },
          { content: item.custom_employeeid },
          { content: item.employee_name },
          { content: item.designation },
          { content: moment(item.date).format("DD-MM-YYYY") },
          { content: item.status },
          { content: item.from_time },
          { content: item.to_time },
          { content: item.reason },
        ]);
      });

      let pdfHeadToPass = [[], [...head]];
      let pdfDataToPass = [filterContent, pdfData];
      let colWidthToPass = [[], [5, 10, 10, 15, 15, 10, 10, 10, 15]];
      preFunction.generatePDFContent(
        collegeName,
        "Employee Permission Report",
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass
      );
      return;
    }

    let csvData = [];
    csvData.push([
      "No.",
      "Emp No.",
      "Employee Name",
      "Designation",
      "Permission Date",
      "Status",
      "From Time",
      "To Time",
      "Reason",
    ]);
    exportData.map((item, index) => {
      if (index === 0)
        csvData.push(["Department : " + item.department.split("-")[0]]);
      else if (exportData[index - 1].department !== item.department)
        csvData.push(["Department : " + item.department.split("-")[0]]);

      csvData.push([
        index + 1,
        item.custom_employeeid,
        item.employee_name,
        item.designation,
        moment(item.date).format("DD-MM-YYYY"),
        item.status,
        item.from_time,
        item.to_time,
        item.reason,
      ]);
    });

    preFunction.downloadCSV(csvData, "Employee Permission Report.csv");
    return;
  };

  const handleShow = async (values, showAll = 0, report = 0) => {
    // if (load) return;
    console.log("values", values);
    let fromDateRes = "";
    let toDateRes = "";

    if (moment(values.fromDate).isAfter(values.toDate)) {
      setDateError(true);
      setShowRes(false);
      setData([]);
      return;
    }
    fromDateRes = moment(values.fromDate).format("YYYY-MM-DD");
    toDateRes = moment(values.toDate).format("YYYY-MM-DD");

    try {
      setLoad(true);

      const permissionRes = await empApi.getEmployeePermissionReport(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        fromDateRes,
        toDateRes,
        values.status ? values.status.value : null,
        values.department ? values.department.department_id : null,
        values.designation ? values.designation.designation : null,
        values.employeeNumber ? values.employeeNumber.custom_employeeid : null,
        showAll
      );
      console.log("permissionEntry", permissionRes);

      let permissionData =
        permissionRes?.data?.message?.data?.employee_permission_report;
      setShowRes(true);

      if (report) {
        handleCSVData(permissionData, report, values);
      }
      setData(permissionData);
      setShowLoadMore(false);
      if (permissionData.length === string.PAGE_LIMIT) {
        setShowLoadMore(true);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async (collegeId) => {
    try {
      if (collegeId) {
        const masterList = await empApi.getAllMasters(2, collegeId);
        console.log("MasterList5", masterList);
        setDepartmentList(masterList.data.message.data.department);
        setDesignationList(masterList.data.message.data.designation);
      }
    } catch (error) {
      console.log("error", error);
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

  const handleClear = () => {
    setData([]);
    setShowRes(false);
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              college: "",
              fromDate: moment().startOf("month").format("YYYY-MM-DD"),
              toDate: moment().endOf("month").format("YYYY-MM-DD"),
              department: "",
              designation: "",
              employeeNumber: "",
              status: "",
            }}
            validationSchema={reportSchema}
            onSubmit={handleShow}
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
              resetForm,
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className={"col-lg-10"}>
                    {collegeConfig.institution_type !== 1 ? (
                      <>
                        {collegeConfig.is_university ? (
                          <SelectFieldFormik
                            autoFocus
                            tabIndex={1}
                            label="College"
                            id="college"
                            mandatory={1}
                            options={collegeConfig.collegeList}
                            getOptionLabel={(option) => option.collegeName}
                            getOptionValue={(option) => option.collegeID}
                            style={{ width: "60%" }}
                            searchIcon={false}
                            clear={false}
                            onChange={(text) => {
                              setFieldValue("college", text);
                              getAllList(text ? text.collegeID : null);
                            }}
                          />
                        ) : null}
                      </>
                    ) : null}
                    <DateFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      label={"From Date"}
                      id="fromDate"
                      tabIndex={2}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("fromDate", e.target.value);
                        setShowRes(false);
                        setDateError(false);
                      }}
                      minDate={moment().subtract(10, "years")}
                      maxDate={moment().add(2, "years")}
                      style={{ width: "30%" }}
                    />
                    <DateFieldFormik
                      label={"To Date"}
                      id="toDate"
                      mandatory={1}
                      tabIndex={3}
                      onChange={(e) => {
                        setFieldValue("toDate", e.target.value);
                        setShowRes(false);
                        setDateError(false);
                      }}
                      error={
                        dateError ? "From Date should be less than To Date" : ""
                      }
                      minDate={values.fromDate}
                      maxDate={moment().add(2, "years")}
                      style={{ width: "30%" }}
                    />
                    <SelectFieldFormik
                      tabIndex={4}
                      label="Status"
                      id="status"
                      style={{ width: "35%" }}
                      options={permissionStatusList}
                      clear={true}
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      onChange={(text) => {
                        setFieldValue("status", text);
                        handleClear();
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={5}
                      label="Department"
                      id="department"
                      style={{ width: "50%" }}
                      options={departmentList}
                      clear={true}
                      getOptionLabel={(option) => option.department}
                      getOptionValue={(option) => option.department_id}
                      onChange={(text) => {
                        console.log("text", text);
                        setFieldValue("department", text);
                        handleClear();
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={6}
                      label="Designation"
                      id="designation"
                      style={{ width: "50%" }}
                      options={designationList}
                      clear={true}
                      getOptionLabel={(option) => option.designation}
                      getOptionValue={(option) => option.designation}
                      onChange={(text) => {
                        setFieldValue("designation", text);
                        handleClear();
                      }}
                    />

                    <SelectFieldFormik
                      tabIndex={7}
                      label="Employee No. / Name"
                      id="employeeNumber"
                      style={{ width: "50%" }}
                      options={empCodeList}
                      searchIcon={true}
                      clear={true}
                      getOptionLabel={(option) =>
                        option.custom_employeeid + " - " + option.employee_name
                      }
                      getOptionValue={(option) => option.name}
                      onInputChange={(inputValue) => {
                        employeeSearch(inputValue);
                        handleClear();
                      }}
                      onChange={(text) => {
                        setFieldValue("employeeNumber", text);
                      }}
                    />
                  </div>
                  <div className="row no-gutters">
                    <div className="col-lg-6 text-right pe-1">
                      <Button
                        tabIndex={8}
                        type="submit"
                        text="Show"
                        isCenter={false}
                        onClick={(e) => preFunction.handleErrorFocus(errors)}
                      />
                    </div>
                    <div className="col-lg-5 ms-2">
                      <Button
                        type="button"
                        text="Clear"
                        isCenter={false}
                        onClick={() => {
                          resetForm();
                          handleClear();
                        }}
                      />
                    </div>
                  </div>
                  {showRes ? (
                    <>
                      <div className="row mt-4 border p-3">
                        <div className="row no-gutters">
                          <div className="col-lg-6"></div>
                          {data.length > 0 && (
                            <div className="col-lg-6">
                              <div className="text-right">
                                <Button
                                  frmButton={false}
                                  className={"btn me-3"}
                                  type="button"
                                  onClick={(e) => handleShow(values, 1, 2)}
                                  text="Export Excel"
                                />
                                <Button
                                  type="button"
                                  frmButton={false}
                                  onClick={(e) => {
                                    handleShow(values, 1, 1);
                                  }}
                                  text="Export PDF"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="table-responsive mt-4 p-0">
                          <table
                            className="table table-bordered report-table"
                            // id="pdf-table"
                          >
                            <thead>
                              <tr>
                                <th width="5%">No.</th>
                                <th width="5%">Emp No.</th>
                                <th>Name</th>
                                <th width="20%">Designation</th>
                                <th width="10%">Permission Date</th>
                                <th width="10%">Status</th>
                                <th width="10%">From Time</th>
                                <th width="10%">To Time</th>
                                <th width="15%">Reason</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.length === 0 ? (
                                <tr>
                                  <td align="center" colSpan={10}>
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                data.map((item, index) => {
                                  return (
                                    <>
                                      {index === 0 ||
                                      data[index - 1].department !==
                                        item.department ? (
                                        <tr>
                                          <td
                                            colSpan={10}
                                            className="table-total"
                                          >
                                            {`Department: ${
                                              item.department.split(" - ")[0]
                                            }`}
                                          </td>
                                        </tr>
                                      ) : null}

                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.custom_employeeid}</td>
                                        <td>{item.employee_name}</td>
                                        <td>{item.designation}</td>
                                        <td>
                                          {moment(item.date).format(
                                            "DD-MM-YYYY"
                                          )}
                                        </td>
                                        <td>{item.status}</td>
                                        <td>{item.from_time.slice()}</td>
                                        <td>{item.to_time}</td>
                                        <td>{item.reason}</td>
                                      </tr>
                                    </>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                        {showLoadMore && (
                          <div className="row text-right">
                            <Button
                              text="Show All"
                              type="button"
                              onClick={(e) => handleShow(values, 1)}
                            />
                          </div>
                        )}
                      </div>
                    </>
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
export default PermissionEntryReport;
