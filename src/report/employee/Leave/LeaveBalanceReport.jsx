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

function LeaveBalanceReport() {
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
  const [columnData, setColumnData] = useState([]);

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
      // setLoad(true);

      var pdfData = [];

      if (type == 2) {
        pdfData.push(["No.", "Emp. No.", "Emp. Name"]);
        columnData.map((item) => {
          pdfData[0].push("Availed - " + item);
        });
        columnData.map((item) => {
          pdfData[0].push("Balance - " + item);
        });
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

        (values.department || values.employeeNumber) &&
          filterContent.push([
            {
              content:
                (values.department
                  ? `Department : ${values.department.department}`
                  : "") +
                (values.employeeNumber
                  ? `   Emp. No./Name : ${values.employeeNumber.custom_employeeid}`
                  : ""),
              styles: boldStyle,
            },
          ]);

        var head1 = [
          [
            { content: "No.", rowSpan: 2, styles: topLineStyle },
            { content: "Emp. No.", rowSpan: 2, styles: topLineStyle },
            { content: "Emp. Name", rowSpan: 2, styles: topLineStyle },
            {
              content: "Availed Leaves",
              colSpan: columnData.length,
              styles: { ...topLineStyle, halign: "center" },
            },
            {
              content: "Balance Leaves",
              colSpan: columnData.length,
              styles: { ...topLineStyle, halign: "center" },
            },
          ],
        ];

        head1.push([
          ...columnData.map((item) => ({
            content: item,
            styles: topLineStyle,
          })),
          ...columnData.map((item) => ({
            content: item,
            styles: topLineStyle,
          })),
        ]);
      }

      exportData.map((item, index) => {
        if (index === 0 || exportData[index - 1].employee !== item.employee) {
          const availedData = columnData
            .map((leaveType) => {
              const leaveRes = exportData.find(
                (student) =>
                  student.leave_type === leaveType &&
                  student.employee === item.employee
              );
              return [
                {
                  content: leaveRes ? leaveRes.leaves_taken : "",
                  styles: { halign: "right" },
                },
              ];
            })
            .flat();
          const balanceData = columnData
            .map((leaveType) => {
              const leaveRes = exportData.find(
                (student) =>
                  student.leave_type === leaveType &&
                  student.employee === item.employee
              );
              return [
                {
                  content: leaveRes ? leaveRes.closing_balance : "",
                  styles: { halign: "right" },
                },
              ];
            })
            .flat();

          pdfData.push([
            { content: item.showIndex, styles: { halign: "right" } },
            { content: item.custom_employeeid },
            { content: item.employee_name },
            ...availedData,
            ...balanceData,
          ]);
        }
      });

      console.log("pdfData", pdfData);

      if (type === 2) {
        preFunction.downloadCSV(pdfData, "EmploLeave Balance Report.csv");
      } else {
        let pdfHeadToPass = [[], [...head1]];
        let pdfDataToPass = [filterContent, [...pdfData]];

        // var columnWidth = [3, 10, 20, 20, 10, 10, 10, 10, 7];

        // let colWidthToPass = [[], [...columnWidth]];

        preFunction.generatePDFContent(
          collegeName,
          "EmploLeave Balance Report",
          pdfHeadToPass,
          pdfDataToPass,
          [],
          "landscape",
          "a3",
          true
        );
      }

      // setLoad(false);
    } catch (error) {
      // setLoad(false);
      console.log("error", error);
    }
  };

  function sortByEmployeeName(data) {
    data.sort((a, b) => {
      const nameA = a.employee_name.toUpperCase();
      const nameB = b.employee_name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    const uniqueLeaveTypes = Array.from(
      new Set(data.map((item) => item.leave_type))
    );
    console.log("uniqueLeaveTypes", uniqueLeaveTypes);
    setColumnData(uniqueLeaveTypes);
    return data;
  }

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

      const leaveRes = await empApi.getLeaveBalanceReport(
        collegeConfig.is_university ? values.college.collegeName : collegeName,
        fromDateRes,
        toDateRes,
        values.department ? values.department.department_id : "",
        values.employeeNumber ? values.employeeNumber.name : ""
      );
      console.log("studentRes", leaveRes);
      let empArr = [];
      for (let i = 0; i < leaveRes.data.message.result.length; i++) {
        if (empArr.indexOf(leaveRes.data.message.result[i].employee) === -1) {
          empArr.push(leaveRes.data.message.result[i].employee);
        }
      }

      // const getDataForCustomFieldRes = await empApi.getDataForCustomField(
      //   "custom_employeeid",
      //   "Employee",
      //   empArr
      // );
      // console.log("getDataForCustomFieldRes", getDataForCustomFieldRes);
      // for (let i = 0; i < leaveRes.data.message.result.length; i++) {
      //   Object.keys(getDataForCustomFieldRes.data.message).map((key, index) => {
      //     if (key === leaveRes.data.message.result[i].employee) {
      //       leaveRes.data.message.result[i].custom_employeeid =
      //         getDataForCustomFieldRes.data.message[key];
      //     }
      //   });
      // }
      // console.log("leaveRes---", leaveRes);
      setData(leaveRes.data.message.result);
      let leaveData = leaveRes?.data?.message?.result;
      const sortedData = sortByEmployeeName(leaveData);
      let index = 0;
      let empId = "";
      let custom_employeeid = "";
      for (let i = 0; i < sortedData.length; i++) {
        if (empId != sortedData[i].employee) {
          const empIDRes = await empApi.getEmployeeID(sortedData[i].employee);
          console.log("empIDRes", empIDRes);
          empId = sortedData[i].employee;
          custom_employeeid = empIDRes.data.data[0].custom_employeeid;
        }
        sortedData[i].custom_employeeid = custom_employeeid;

        if (i == 0) {
          sortedData[i].showIndex = index + 1;
          index++;
        } else if (
          i !== 0 &&
          sortedData[i - 1].custom_employeeid !==
            sortedData[i].custom_employeeid
        ) {
          console.log("index", sortedData[i - 1]);
          sortedData[i].showIndex = index + 1;
          index++;
        }
      }
      console.log("sortedData", sortedData);
      if (report) {
        handleCSVData(sortedData, report, values);
      } else {
        setData(sortedData);
        setShowLoadMore(false);
        if (sortedData.length === string.PAGE_LIMIT) {
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
        // setDesignationList(masterList.data.message.data.designation);
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
              fromDate: new Date(moment().subtract(1, "months").format()),
              toDate: new Date(),
              department: "",
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
                          <table className="table table-bordered report-table">
                            <thead>
                              <tr>
                                <th rowSpan={2}>No.</th>
                                <th rowSpan={2}>Emp. No.</th>
                                <th rowSpan={2}>Emp. Name</th>
                                <th
                                  colSpan={columnData?.length}
                                  className="text-center"
                                >
                                  Availed Leaves
                                </th>
                                <th
                                  colSpan={columnData?.length}
                                  className="text-center"
                                >
                                  Balance Leaves
                                </th>
                              </tr>
                              <tr>
                                {columnData &&
                                  columnData.map((item, index) => {
                                    return <th key={index}>{item}</th>;
                                  })}

                                {columnData &&
                                  columnData.map((item, index) => {
                                    return <th key={index}>{item}</th>;
                                  })}
                              </tr>
                            </thead>
                            <tbody>
                              {data.length === 0 ? (
                                <tr>
                                  <td align="center" colSpan={50}>
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                data.map((item, index) => {
                                  if (
                                    index === 0 ||
                                    data[index - 1].employee !== item.employee
                                  ) {
                                    return (
                                      <>
                                        <tr key={index}>
                                          <td>{item.showIndex}</td>
                                          <td>{item.custom_employeeid}</td>
                                          <td>{item.employee_name}</td>
                                          {columnData.map(
                                            (leaveType, columnIndex) => {
                                              const leaveRes = data.find(
                                                (student) =>
                                                  student.leave_type ===
                                                    leaveType &&
                                                  student.employee ===
                                                    item.employee
                                              );
                                              return leaveRes ? (
                                                <td key={columnIndex}>
                                                  {leaveRes.leaves_taken}
                                                </td>
                                              ) : null;
                                            }
                                          )}
                                          {columnData.map(
                                            (leaveType, columnIndex) => {
                                              const leaveRes = data.find(
                                                (student) =>
                                                  student.leave_type ===
                                                    leaveType &&
                                                  student.employee ===
                                                    item.employee
                                              );
                                              return leaveRes ? (
                                                <td key={columnIndex}>
                                                  {leaveRes.closing_balance}
                                                </td>
                                              ) : null;
                                            }
                                          )}
                                        </tr>
                                      </>
                                    );
                                  }
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
export default LeaveBalanceReport;
