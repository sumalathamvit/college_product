import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import moment from "moment";
import { Formik } from "formik";

import employeeApi from "../../../api/EmployeeApi";
import CommonApi from "../../../component/common/CommonApi";

import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import ScreenTitle from "../../../component/common/ScreenTitle";
import DateFieldFormik from "../../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import {
  boldStyle,
  bottomLineStyle,
  topLineStyle,
} from "../../../component/common/CommonArray";

import AuthContext from "../../../auth/context";
import string from "../../../string";

function SalaryReport() {
  const formifRef = useRef();

  const [empCodeList, setEmpCodeList] = useState([]);
  const [data, setData] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [headerList, setHeaderList] = useState([]);
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [totalList, setTotalList] = useState([]);

  const { collegeName, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.object().nullable(),
    salaryMonth: Yup.string().required("Please select Payroll Month"),
  });

  const handleSearchEmployee = async (text) => {
    console.log("text---", text);
    const empList = await CommonApi.searchEmployee(text);
    console.log("empList", empList);
    setEmpCodeList(empList);
  };

  //Export PDF and Excel
  const handleCSVData = async (exportData, type, values) => {
    if (type === 1) {
      let filterContent = [];

      values.Designation &&
        filterContent.push([
          {
            content: "Designation : " + values.designation.designation,
            styles: boldStyle,
          },
        ]);
      values.empCode &&
        filterContent.push([
          {
            content:
              "Employee No. / Name : " +
              values.empCode.custom_employeeid +
              " - " +
              values.empCode.employee_name,
            styles: boldStyle,
          },
        ]);

      let head1 = [
        headerList.map((keys, index) => {
          console.log("keys", keys, index);
          return {
            content: preFunction.capitalizeFirst(keys),
            styles: topLineStyle,
          };
        }),
      ];
      console.log("head1", head1);
      let pdfData = [];

      exportData.map((item, index) => {
        if (index === 0)
          pdfData.push([
            {
              content: "Department :" + item.Department.split("-")[0],
              colSpan: 7,
              styles: boldStyle,
            },
          ]);
        else if (exportData[index - 1].Department !== item.Department)
          pdfData.push([
            {
              content: "Department :" + item.Department.split("-")[0],
              colSpan: 7,
              styles: boldStyle,
            },
          ]);

        let pdfData1 = [];
        headerList.map((itemList, keys) => {
          pdfData1.push({
            content: item[itemList] ?? "0",
          });
        });
        pdfData.push(pdfData1);
      });

      // add total row in pdf data array
      let totalArray = {};
      for (let i = 0; i < headerList.length; i++) {
        let values = 0;
        for (let j = 0; j < exportData.length; j++) {
          if (
            headerList[i] !== "Department" &&
            headerList[i] !== "Employee No" &&
            headerList[i] !== "Employee Name" &&
            headerList[i] !== "Designation"
          ) {
            values += exportData[j][headerList[i]];
          }
        }
        totalArray[headerList[i]] = values;
      }
      pdfData.push([
        {
          content: "Total",
          styles: boldStyle,
        },
        ...headerList.map((item) => {
          return {
            content: totalArray[item],
            styles: boldStyle,
          };
        }),
      ]);

      var footerContent = [];

      footerContent.push([
        {
          content: "Prepared By HR",
          // add padding top,
          styles: { ...bottomLineStyle, halign: "left" },
        },
        {
          content: "Accountant",
          styles: { ...bottomLineStyle, halign: "left" },
        },
        {
          content: "Accounts Officer",
          styles: bottomLineStyle,
        },
        {
          content: "Manager",
          styles: bottomLineStyle,
        },
        {
          content: "Administrative Officer",
          styles: bottomLineStyle,
        },
        {
          content: "Director",
          styles: bottomLineStyle,
        },
        {
          content: "Chairman",
          styles: { ...bottomLineStyle, halign: "right" },
        },
      ]);

      let pdfHeadToPass = [[], [...head1]];
      let pdfDataToPass = [filterContent, pdfData, footerContent];
      preFunction.generatePDFContent(
        collegeName,
        "Employee Payroll Register for the Month of " +
          moment(values.salaryMonth).format("MMMM-yyyy"),
        pdfHeadToPass,
        pdfDataToPass,
        [],
        "landscape",
        "a3"
      );
      return;
    }

    let csvData = [["No."]];
    headerList.map((item) => {
      csvData[0].push(item.substr(0));
    });
    console.log("csvData-------------------", csvData);
    data.map((student, index) => {
      const rowArray = [index + 1, ...headerList.map((item) => student[item])];
      csvData.push(rowArray);
    });

    totalList.map((student, index) => {
      const filteredHeaderList = headerList.filter(
        (item) =>
          item !== "Designation" &&
          item !== "Employee Name	" &&
          item !== "Employee No" &&
          item !== "Department"
      );

      const rowArray = [
        "",
        "",
        "Total",
        ...filteredHeaderList.map((item) => student[item] ?? " "),
      ];
      csvData.push(rowArray);
      console.log("filterHeader", filteredHeaderList);
    });

    console.log(csvData);

    console.log("csvData-------------------", csvData);
    preFunction.downloadCSV(
      csvData,
      "Employee Payroll Register for the Month of " +
        moment(values.salaryMonth).format("MMMM-yyyy") +
        ".csv"
    );

    return;
  };

  // Show data in table
  const handleShow = async (values, showAll = 0, report) => {
    if (load) return;
    console.log("values---", values);
    try {
      setLoad(true);

      const getEmployeeSalaryRes = await employeeApi.getEmployeeSalaryReport(
        collegeConfig.is_university ? values?.college?.collegeID : collegeId,
        values?.salaryMonth
          ? moment(values?.salaryMonth).startOf("month").format("yyyy-MM-DD")
          : null,
        values?.salaryMonth
          ? moment(values?.salaryMonth).endOf("month").format("yyyy-MM-DD")
          : null,
        values?.designation ? values?.designation?.designation : null,
        values?.empCode ? values?.empCode?.custom_employeeid : null,
        showAll
      );
      console.log("getEmployeeSalaryRes---", getEmployeeSalaryRes);
      setShowRes(true);
      let empSalaryData =
        getEmployeeSalaryRes.data.message.data.employee_salary_register_report;

      for (let i = 0; i < empSalaryData.length; i++) {
        empSalaryData[i]["Net Salary"] =
          empSalaryData[i]["Earnings Total"] -
          empSalaryData[i]["Deduction Total"];
      }
      setData(empSalaryData);
      console.log("empSalaryData---", empSalaryData);

      const headers = Object.keys(empSalaryData[0]);
      headers.map((item) => {
        if (item === "Department") {
          headers.splice(headers.indexOf(item), 1);
        }
      });
      setHeaderList(headers);
      console.log("headers---", headers);

      let totalArray = {};
      for (let i = 0; i < headers.length; i++) {
        let values = 0;
        for (let j = 0; j < empSalaryData.length; j++) {
          if (
            headers[i] !== "Department" &&
            headers[i] !== "Employee No" &&
            headers[i] !== "Employee Name" &&
            headers[i] !== "Designation"
          ) {
            values += Math.round(empSalaryData[j][headers[i]]);
          }
        }
        totalArray[headers[i]] = values;
      }
      console.log("TotalArray --- ", totalArray);
      setTotalList([totalArray]);

      if (showAll === 0) {
        if (empSalaryData.length > string.PAGE_LIMIT) setShowLoadMore(true);
      }
      if (report == 1 || report == 2) {
        handleCSVData(empSalaryData, report, values);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  // Get Department List
  const getDepartmentList = async (college = null) => {
    const masterRes = await employeeApi.getAllMasters(
      2,
      collegeConfig.is_university ? college?.collegeID : collegeId
    );
    console.log("masterRes---", masterRes);
    setDesignationList(masterRes?.data?.message?.data?.designation);
  };

  // Get College List
  useEffect(() => {
    if (!collegeConfig.is_university) {
      getDepartmentList();
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <Formik
          innerRef={formifRef}
          enableReinitialize={false}
          initialValues={{
            college: null,
            salaryMonth: moment().subtract(1, "months").format("yyyy-MM"),
            designation: null,
            empCode: null,
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
                <div className={"col-lg-9"}>
                  {collegeConfig.is_university && (
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={0}
                      label="College"
                      id="college"
                      mandatory={1}
                      matchFrom="start"
                      options={collegeConfig?.collegeList}
                      getOptionLabel={(option) => option?.collegeName}
                      getOptionValue={(option) => option?.collegeID}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setFieldValue("college", text);
                        getDepartmentList(text);
                        setShowRes(false);
                      }}
                    />
                  )}
                  <DateFieldFormik
                    autoFocus={!collegeConfig.is_university}
                    type="month"
                    label="Payroll Month"
                    id="salaryMonth"
                    tabIndex={2}
                    style={{ width: "30%" }}
                    mandatory={1}
                    onChange={(e) => {
                      setFieldValue("salaryMonth", e.target.value);
                    }}
                    minDate={moment().subtract(5, "years")}
                    maxDate={moment().add(2, "years")}
                  />
                  <SelectFieldFormik
                    label="Employee No. / Name"
                    id="empCode"
                    tabIndex={5}
                    clear={true}
                    searchIcon={true}
                    options={empCodeList}
                    getOptionLabel={(option) =>
                      option.custom_employeeid + " - " + option.employee_name
                    }
                    getOptionValue={(option) => option.name}
                    onInputChange={(inputValue) => {
                      handleSearchEmployee(inputValue);
                    }}
                    onChange={(text) => {
                      setFieldValue("empCode", text);
                      setShowRes(false);
                    }}
                  />
                  <SelectFieldFormik
                    label={"Designation"}
                    id="designation"
                    tabIndex={4}
                    mandatory={0}
                    clear={true}
                    getOptionLabel={(option) => option.designation}
                    getOptionValue={(option) => option.designation}
                    onChange={(e) => {
                      setFieldValue("designation", e);
                      setShowRes(false);
                    }}
                    options={designationList}
                  />
                </div>
                <div className="text-center mt-3">
                  <Button
                    frmButton={false}
                    className={"btn me-3"}
                    onClick={() => {
                      preFunction.handleErrorFocus(errors);
                    }}
                    tabIndex={6}
                    text="Show"
                  />
                  <Button
                    type="button"
                    className={"btn ms-3"}
                    frmButton={false}
                    onClick={() => {
                      formifRef.current.resetForm();
                      setShowRes(false);
                      setData([]);
                      setHeaderList([]);
                    }}
                    tabIndex={6}
                    text="Clear"
                  />
                </div>
                {showRes && (
                  <div className="row no-gutters mt-5 border p-3">
                    {data.length > 0 && (
                      <div className="text-right mb-2">
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
                    {data.length > 0 ? (
                      <div className="table-responsive mt-2">
                        <table className="table table-bordered table-hover report-table">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              {headerList.map((item) => {
                                return <th width="5%">{item}</th>;
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {data.length == 0 ? (
                              <tr>
                                <td colSpan={45} align="center">
                                  No data found
                                </td>
                              </tr>
                            ) : (
                              <>
                                {data.map((employee, index) => {
                                  return (
                                    <>
                                      {index === 0 ? (
                                        <tr>
                                          <td
                                            colSpan={45}
                                            className="table-total"
                                          >
                                            Department :{" "}
                                            {employee.Department?.split("-")[0]}
                                          </td>
                                        </tr>
                                      ) : data[index - 1].Department !==
                                        employee.Department ? (
                                        <tr>
                                          <td
                                            colSpan={45}
                                            className="table-total"
                                          >
                                            Department :{" "}
                                            {employee.Department.split("-")[0]}
                                          </td>
                                        </tr>
                                      ) : null}

                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        {headerList.map((item, idx) => (
                                          <td key={idx}>{employee[item]}</td>
                                        ))}
                                      </tr>
                                    </>
                                  );
                                })}
                                <tr
                                  style={{
                                    lineHeight: "32px",
                                  }}
                                  colspan={45}
                                >
                                  <td
                                    className="table-total"
                                    align="right"
                                    colSpan={4}
                                  >
                                    Total
                                  </td>
                                  {totalList.map((student, index) =>
                                    headerList.map((item, idx) =>
                                      item !== "Department" &&
                                      item !== "Employee No" &&
                                      item !== "Employee Name" &&
                                      item !== "Designation" ? (
                                        <td className="table-total" key={idx}>
                                          {student[item]}
                                        </td>
                                      ) : null
                                    )
                                  )}
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                        {showLoadMore ? (
                          <Button
                            text="Show All"
                            type="button"
                            onClick={(e) => handleShow(values, 1, 0)}
                          />
                        ) : null}
                      </div>
                    ) : (
                      <div className="table-responsive mt-2">
                        <table className="table table-bordered table-hover report-table">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th width="5%">Employee No.</th>
                              <th width="10%">Employee Name</th>
                              <th width="10%">Department</th>
                              <th width="10%">Designation</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td colSpan={45} align="center">
                                No data found
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
export default SalaryReport;
