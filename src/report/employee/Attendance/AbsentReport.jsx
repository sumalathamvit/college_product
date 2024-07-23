import React, { useEffect, useState, useContext, useRef } from "react";
import moment from "moment";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import empApi from "../../../api/EmployeeApi";

import Button from "../../../component/FormField/Button";
import DateFieldFormik from "../../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import ScreenTitle from "../../../component/common/ScreenTitle";
import {
  absentOptions,
  boldStyle,
  topLineStyle,
} from "../../../component/common/CommonArray";

import AuthContext from "../../../auth/context";

import string from "../../../string";

function AbsentReport() {
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [attendanceArr, setAttendanceArr] = useState([]);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showAllButton, setShowAllButton] = useState(false);

  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    fromDate: Yup.date().required("Please select From Date"),
    toDate: Yup.date().required("Please select To Date"),
  });

  const handleExport = async (values, type) => {
    try {
      console.log("csvDataList-----", values);
      if (type == 1) {
        let filterContent = [];

        if (
          formikRef?.current?.values?.fromDate ||
          formikRef?.current?.values?.toDate
        ) {
          filterContent.push([
            {
              content:
                (formikRef?.current?.values?.fromDate
                  ? "From Date : " +
                    moment(formikRef?.current?.values?.fromDate).format(
                      "DD-MM-YYYY"
                    )
                  : "") +
                (formikRef?.current?.values?.toDate
                  ? "    To Date : " +
                    moment(formikRef?.current?.values?.toDate).format(
                      "DD-MM-YYYY"
                    )
                  : ""),
              styles: boldStyle,
            },
          ]);
        }
        if (
          formikRef?.current?.values?.department ||
          formikRef?.current?.values?.designation ||
          formikRef?.current?.values?.reportType
        ) {
          filterContent.push([
            {
              content:
                (formikRef?.current?.values?.reportType
                  ? "Leave Type : " +
                    formikRef?.current?.values?.reportType?.value
                  : "") +
                (formikRef?.current?.values?.department
                  ? "    Department : " +
                    formikRef?.current?.values?.department?.department
                  : "") +
                (formikRef?.current?.values?.designation
                  ? "    Designation : " +
                    formikRef?.current?.values?.designation?.designation
                  : ""),
              styles: boldStyle,
            },
          ]);
        }
        if (formikRef?.current?.values?.employeeCode) {
          filterContent.push([
            {
              content: formikRef?.current?.values?.employeeCode
                ? "Employee No. / Name : " +
                  formikRef?.current?.values?.employeeCode?.custom_employeeid +
                  " - " +
                  formikRef?.current?.values?.employeeCode?.employee_name
                : "",
              styles: boldStyle,
            },
          ]);
        }

        let head1 = [
          [
            { content: "No.", styles: topLineStyle },
            { content: "Emp. Code", styles: topLineStyle },
            { content: "Employee Name", styles: topLineStyle },
            { content: "Designation", styles: topLineStyle },
            { content: "Absent Date", styles: topLineStyle },
            { content: "Mobile No.", styles: topLineStyle },
            { content: "Leave Type", styles: topLineStyle },
            { content: "Remarks", styles: topLineStyle },
          ],
        ];

        let pdfData = [];
        values.map((item, index) => {
          if (
            index === 0 ||
            values[index - 1].department?.split("-")[0] !==
              item.department?.split("-")[0]
          ) {
            pdfData.push([
              {
                content: `Department : ${item.department?.split("-")[0]}`,
                styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                colSpan: 8,
              },
            ]);
          }
          pdfData.push([
            {
              content: index + 1,
            },
            {
              content: item.custom_employeeid,
            },
            {
              content: preFunction
                .capitalizeFirstLowerOther(item.employee_name)
                .substring(0, 37),
            },
            {
              content: preFunction
                .capitalizeFirstLowerOther(item.designation)
                .substring(0, 30),
            },
            {
              content: item.attendance_date
                ? moment(item.attendance_date).format("DD-MM-YYYY")
                : "",
            },
            {
              content: item.mobile_number ? item.mobile_number : "",
            },
            {
              content: item.leave_type ? item.leave_type : "",
            },
            {
              content: item.description
                ? preFunction
                    .capitalizeFirstLowerOther(item.description)
                    .substring(0, 28)
                : "",
            },
          ]);
        });
        let pdfHeadToPass = [[]];
        pdfHeadToPass.push(head1);

        let pdfDataToPass = [filterContent];
        pdfDataToPass.push(pdfData);

        let columnWidth = [3, 8, 22, 17, 9, 9, 14, 18];

        let colWidthToPass = [[], [...columnWidth]];
        console.log("----test", pdfHeadToPass, pdfDataToPass);

        preFunction.generatePDFContent(
          collegeConfig.is_university
            ? formikRef.current.values.college
              ? formikRef.current.values.college.collegeName
              : collegeName
            : collegeName,
          "Absent Attendance Report",
          pdfHeadToPass,
          pdfDataToPass,
          colWidthToPass,
          "Landcape"
        );
      } else {
        var csvData = [
          [
            "No.",
            "Employee Code",
            "Employee Name",
            "Designation",
            "Absent Date",
            "Mobile No.",
            "Leave Type",
            "Remarks",
          ],
        ];
        values.map((item, index) => {
          if (
            index === 0 ||
            values[index - 1].department?.split("-")[0] !==
              item.department?.split("-")[0]
          ) {
            csvData.push([
              "Department : " + item.department?.split("-")[0] + ", , , , ,",
            ]);
          }
          csvData.push([
            index + 1,
            item.custom_employeeid,
            item.employee_name,
            item.designation,
            item.attendance_date
              ? moment(item.attendance_date).format("DD-MM-YYYY")
              : "",
            item.mobile_number,
            item.leave_type,
            item.description,
          ]);
        });
        preFunction.downloadCSV(csvData, "Absent Attendance Report");
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
    try {
      setLoad(true);
      const attendanceDetail = await empApi.getAbsentAttendanceReport(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        values.reportType ? values.reportType.value : "",
        moment(values.fromDate).format("YYYY-MM-DD"),
        moment(values.toDate).format("YYYY-MM-DD"),
        values?.department ? values?.department.department_id : null,
        values?.designation ? values?.designation.designation : null,
        values.employeeCode ? values.employeeCode.custom_employeeid : null,
        showAll ? 1 : 0
      );
      console.log("attendanceDetail", attendanceDetail);
      if (report) {
        handleExport(attendanceDetail.data.message.data.absent_detail, report);
      } else {
        setAttendanceArr(attendanceDetail.data.message.data.absent_detail);
        setShowAllButton(false);
        if (
          attendanceDetail.data.message.data.absent_detail.length ===
          string.PAGE_LIMIT
        ) {
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
            innerRef={formikRef}
            initialValues={{
              college: "",
              reportType: "",
              fromDate: new Date(moment().startOf("month")),
              toDate: new Date(),
              department: "",
              designation: "",
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
                      maxDate={moment().add(1, "months")}
                      minDate={new Date(values.fromDate)}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("toDate", e.target.value);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      label="Leave Type"
                      id="reportType"
                      clear={true}
                      tabIndex={4}
                      options={absentOptions}
                      getOptionLabel={(option) => option.label}
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
                      style={{ width: "70%" }}
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
                      style={{ width: "70%" }}
                      options={designationList}
                      clear={true}
                      getOptionLabel={(option) => option.designation}
                      getOptionValue={(option) => option.designation}
                      onChange={(text) => {
                        setFieldValue("designation", text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={7}
                      label="Employee No. / Name"
                      id="employeeNumber"
                      style={{ width: "70%" }}
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
                    <div className="row no-gutters border p-3 mt-3">
                      {attendanceArr.length > 0 && (
                        <div className="mb-3 text-right">
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
                      )}
                      <div className="row mt-3 p-0">
                        <div className="table-responsive p-0">
                          <table className="table table-bordered table-hover report-table">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="10%">Employee Code</th>
                                <th>Employee Name</th>
                                <th width="20%">Designation</th>
                                <th width="10%">Absent Date</th>
                                <th width="10%">Mobile No.</th>
                                <th width="10%">Leave Type</th>
                                <th width="20%">Remarks</th>
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
                                    <>
                                      {index === 0 ||
                                      attendanceArr[
                                        index - 1
                                      ].department?.split("-")[0] !==
                                        item.department?.split("-")[0] ? (
                                        <tr key={index}>
                                          <td
                                            colSpan={8}
                                            className="table-total"
                                          >
                                            {"Department : " +
                                              item.department?.split("-")[0]}
                                          </td>
                                        </tr>
                                      ) : null}
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.custom_employeeid}</td>
                                        <td>{item.employee_name}</td>
                                        <td>{item.designation}</td>
                                        {/* <td>{item.department.split("-")[0]}</td> */}
                                        <td>
                                          {item.attendance_date
                                            ? moment(
                                                item.attendance_date
                                              ).format("DD-MM-YYYY")
                                            : ""}
                                        </td>
                                        <td>{item.mobile_number}</td>
                                        <td
                                        //   style={{
                                        //     fontWeight: "bold",
                                        //     color:
                                        //       item.leave_type == "Present"
                                        //         ? "green"
                                        //         : item.leave_type == "On Leave"
                                        //         ? item.leave_type == "Absent"
                                        //           ? "red"
                                        //           : "orange"
                                        //         : "grey",
                                        //   }}
                                        >
                                          {item.leave_type}
                                        </td>
                                        <td>{item.description}</td>
                                      </tr>
                                    </>
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

export default AbsentReport;
