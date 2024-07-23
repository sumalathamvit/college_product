import React, { useEffect, useState, useContext, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";

import { useSelector } from "react-redux";

import AuthContext from "../../../auth/context";

import StudentApi from "../../../api/StudentApi";
import empApi from "../../../api/EmployeeApi";

import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import Button from "../../../component/FormField/Button";
import DateFieldFormik from "../../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../../component/common/ScreenTitle";
import ErrorMessage from "../../../component/common/ErrorMessage";

import {
  boldStyle,
  lineWhiteStyle,
  topLineStyle,
  totStyle,
} from "../../../component/common/CommonArray";

import string from "../../../string";

function LeaveDetailReport() {
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [filterError, setFilterError] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [dateErrorMessage, setDateErrorMessage] = useState("");

  const [empCodeList, setEmpCodeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),

    fromDate: Yup.date()
      .required("Please select From Date")
      .max(
        moment().toDate(),
        `To Date must be before ${moment().format("DD-MM-YYYY")}`
      )
      .min(
        moment().subtract(1, "years").toDate(),
        `From Date must be after ${moment()
          .subtract(1, "years")
          .format("DD-MM-YYYY")}`
      )
      .required("Please select From Date"),
    toDate: Yup.date()
      .required("Please select To Date")
      .max(
        moment().toDate(),
        `To Date must be before ${moment().format("DD-MM-YYYY")}`
      )
      .min(
        moment().subtract(1, "years").toDate(),
        `From Date must be after ${moment()
          .subtract(1, "years")
          .format("DD-MM-YYYY")}`
      )
      .required("Please select To Date"),
  });

  const handleCSVData = async (exportData, type, values) => {
    console.log("exportData", exportData);
    try {
      setLoad(true);

      var pdfData = [];

      if (type == 2) {
        pdfData.push([
          "No.",
          "Emp. No.",
          "Emp. Name",
          "Designation",
          "From Date",
          "To Date",
          "No. of Days",
          "Leave Type",
        ]);
      } else {
        var filterContent = [];

        filterContent.push([
          {
            content: `Leave Date From : ${
              moment(values.fromDate).format("DD-MM-YYYY") +
              " Leave Date To : " +
              moment(values.toDate).format("DD-MM-YYYY")
            }`,
            styles: boldStyle,
          },
        ]);

        (values.department || values.designation || values.employeeNumber) &&
          filterContent.push([
            {
              content:
                (values.department
                  ? `Department : ${values.department.department}`
                  : "") +
                (values.designation
                  ? `   Designation : ${values.designation.designation}`
                  : "") +
                (values.employeeNumber
                  ? `   Emp. No./Name : ${values.employeeNumber.custom_employeeid}`
                  : ""),
              styles: boldStyle,
            },
          ]);

        var head1 = [
          [
            { content: "No.", styles: topLineStyle },
            { content: "Emp. No.", styles: topLineStyle },
            { content: "Emp. Name", styles: topLineStyle },
            { content: "Designation", styles: topLineStyle },
            { content: "From Date", styles: topLineStyle },
            { content: "To Date", styles: topLineStyle },
            { content: "No. of Days", styles: topLineStyle },
            { content: "Leave Type", styles: topLineStyle },
            // { content: "Session", styles: topLineStyle },
          ],
        ];
      }

      exportData.map((item, index) => {
        if (
          index == 0 ||
          exportData[index - 1].department !== item.department
        ) {
          if (type === 1) {
            pdfData.push([
              {
                content: `${"Department: " + item.department.split(" - ")[0]} `,
                styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                colSpan: 9,
              },
            ]);
          } else {
            pdfData.push([`Department: ${item.department.split(" - ")[0]}`]);
          }
        }

        pdfData.push([
          index + 1,
          item.custom_employeeid,
          item.employee_name,
          item.designation,
          moment(item.from_date).format("DD-MM-YYYY"),
          moment(item.to_date).format("DD-MM-YYYY"),
          item.total_leave_days,
          item.leave_type,
          //   item.session,
        ]);
      });

      if (type === 2) {
        preFunction.downloadCSV(pdfData, "Employee Leave Detail Report.csv");
      } else {
        let pdfHeadToPass = [[], [...head1]];
        let pdfDataToPass = [filterContent, [...pdfData]];

        var columnWidth = [3, 10, 18, 19, 10, 10, 10, 10, 10];

        let colWidthToPass = [[], [...columnWidth]];

        preFunction.generatePDFContent(
          collegeName,
          "Employee Leave Detail Report",
          pdfHeadToPass,
          pdfDataToPass,
          colWidthToPass,
          "Portrait",
          "a3"
        );
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleShow = async (values, showAll, report) => {
    // if (load) return;
    console.log("values", values);

    let fromDateRes = "";
    let toDateRes = "";

    if (moment(values.fromDate).isAfter(values.toDate)) {
      setDateError(true);
      setDateErrorMessage("From Date should be less than To Date");
      setShowRes(false);
      setData([]);
      return;
    }
    fromDateRes = moment(values.fromDate).format("YYYY-MM-DD");
    toDateRes = moment(values.toDate).format("YYYY-MM-DD");

    setShowRes(true);

    try {
      setLoad(true);
      setShowRes(true);

      const leaveRes = await empApi.getLeaveDetailReport(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        fromDateRes,
        toDateRes,
        values.department ? values.department.department_id : "",
        values.designation ? values.designation.designation : "",
        values.employeeNumber ? values.employeeNumber.custom_employeeid : "",
        showAll == 1 ? 1 : 0
      );

      console.log("studentRes", leaveRes);

      let leaveData = leaveRes?.data?.message?.data?.employee_leave_details;

      if (report) {
        handleCSVData(leaveData, report, values);
      } else {
        setData(leaveData);
        setShowLoadMore(false);
        if (leaveData.length === string.PAGE_LIMIT) {
          setShowLoadMore(true);
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
    setFilterError(false);
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
              fromDate: new Date(),
              toDate: new Date(),
              department: "",
              designation: "",
              employeeNumber: "",
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
                    tabIndex={collegeConfig.institution_type === 1 ? 1 : 2}
                    id="fromDate"
                    label="Leave Date From"
                    minDate={null}
                    maxDate={null}
                    clear={true}
                    mandatory={1}
                    onChange={(e) => {
                      setFieldValue("fromDate", e.target.value);
                      setDateError(false);
                      handleClear();
                    }}
                    style={{ width: "20%" }}
                  />
                  <DateFieldFormik
                    tabIndex={collegeConfig.institution_type === 1 ? 2 : 3}
                    id="toDate"
                    label="Leave Date To"
                    minDate={null}
                    maxDate={null}
                    clear={true}
                    mandatory={1}
                    onChange={(e) => {
                      setFieldValue("toDate", e.target.value);
                      setDateError(false);
                      handleClear();
                    }}
                    style={{ width: "20%" }}
                  />
                  <SelectFieldFormik
                    tabIndex={collegeConfig.institution_type === 1 ? 3 : 4}
                    label="Department"
                    id="department"
                    style={{ width: "40%" }}
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
                    tabIndex={collegeConfig.institution_type === 1 ? 4 : 5}
                    label="Designation"
                    id="designation"
                    style={{ width: "40%" }}
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
                    tabIndex={collegeConfig.institution_type === 1 ? 5 : 6}
                    label="Employee No. / Name"
                    id="employeeNumber"
                    style={{ width: "40%" }}
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
                  {dateError && (
                    <div className="row no-gutters text-center mt-3">
                      <ErrorMessage
                        Message={dateErrorMessage}
                        view={dateError}
                      />
                    </div>
                  )}
                  <div className="row no-gutters">
                    <div className="col-lg-6 text-right pe-1">
                      <Button
                        tabIndex={collegeConfig.institution_type === 1 ? 6 : 7}
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
                                <th width="5%">Emp. No.</th>
                                <th width="20%">Emp. Name</th>
                                <th width="10%">Designation</th>
                                <th width="10%">From Date</th>
                                <th width="10%">To Date</th>
                                <th width="10%">No. of Days</th>
                                <th width="10%">Leave Type</th>
                                {/* <th width="10%">Session</th> */}
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
                                          {moment(item.from_date).format(
                                            "DD-MM-YYYY"
                                          )}
                                        </td>
                                        <td>
                                          {moment(item.to_date).format(
                                            "DD-MM-YYYY"
                                          )}
                                        </td>
                                        <td>{item.total_leave_days}</td>
                                        <td>{item.leave_type}</td>
                                        {/* <td>{item.session}</td> */}
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
export default LeaveDetailReport;
