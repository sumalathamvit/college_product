import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import moment from "moment";

import Button from "../../component/FormField/Button";
import DateField from "../../component/FormField/DateField";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ScreenTitle from "../../component/common/ScreenTitle";

import employeeApi from "../../api/EmployeeApi";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import AuthContext from "../../auth/context";
import {
  boldStyle,
  lineWhiteStyle,
  topLineStyle,
  totStyle,
} from "../../component/common/CommonArray";
import string from "../../string";
import { get } from "jquery";

function CurrentlyWorkingEmployeesReport() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const todyaDate = new Date();
  const oneWeekBefore = new Date();
  oneWeekBefore.setTime(todyaDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [departmentList, setDepartmentList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
  });

  const handleCSVData = async (exportData, type, values) => {
    if (type === 1) {
      let filterContent = [];
      collegeConfig.is_university &&
        filterContent.push([
          {
            content: "College : " + values.college.collegeName,
            styles: boldStyle,
          },
        ]);

      values.department &&
        filterContent.push([
          {
            content:
              "Department : " +
              (values.department ? values.department.department : "All"),
            styles: boldStyle,
          },
        ]);

      let head = [
        [
          { content: "No.", styles: topLineStyle },
          { content: "Employee No.", styles: topLineStyle },
          { content: "Employee Name", styles: topLineStyle },
          { content: "Designation", styles: topLineStyle },
          { content: "DOJ", styles: topLineStyle },
          { content: "Years/Month", styles: topLineStyle },
          { content: "Mobile No.", styles: topLineStyle },
        ],
      ];

      let pdfData = [];
      exportData.map((item, index) => {
        if (index === 0)
          pdfData.push([
            {
              content: "Department" + " : " + item.department.split("-")[0],
              colSpan: 7,
              styles: boldStyle,
            },
          ]);
        else if (exportData[index - 1].department !== item.department)
          pdfData.push([
            {
              content: "Department" + " : " + item.department.split("-")[0],
              colSpan: 7,
              styles: boldStyle,
            },
          ]);

        pdfData.push([
          { content: index + 1 },
          { content: item.custom_employeeid },
          { content: item.employee_name },
          { content: item.designation },
          { content: moment(item.date_of_joining).format("DD-MM-YYYY") },
          { content: item.experience },
          { content: item.cell_number },
        ]);
      });

      let pdfHeadToPass = [[], [...head]];
      let pdfDataToPass = [filterContent, pdfData];
      let colWidthToPass = [[], [5, 15, 20, 20, 15, 13, 12]];
      preFunction.generatePDFContent(
        collegeName,
        "Currently Working Employees Report",
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass
      );
      return;
    }

    let csvData = [];
    csvData.push([
      "No.",
      "Employee No.",
      "Employee Name",
      "Designation",
      "DOJ",
      "Years/Month",
      "Mobile No.",
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
        moment(item.date_of_joining).format("DD-MM-YYYY"),
        item.experience,
        item.cell_number,
      ]);
    });

    preFunction.downloadCSV(csvData, "Currently Working Employees Report.csv");
    return;
  };

  const getExperience = (startDate, currentDate) => {
    const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
    let monthsDiff = currentDate.getMonth() - startDate.getMonth();
    if (monthsDiff < 0) {
      monthsDiff += 12;
    }
    console.log("yearsDiff---", yearsDiff, monthsDiff);
    return yearsDiff + "." + monthsDiff;
  };

  const handleShow = async (
    values,
    showAll = string.PAGE_LIMIT,
    report = 0
  ) => {
    console.log("values---", values, showAll);

    let searchStringArr = [];
    searchStringArr.push(`["status","=","Active"]`);
    searchStringArr.push(
      `["custom_college_id","=","${
        collegeConfig.is_university ? values.college.collegeID : collegeId
      }"]`
    );
    if (values.department != "" && values.department != null) {
      searchStringArr.push(
        `["department","=","${values.department.department_id}"]`
      );
    }
    const searchstr = searchStringArr.join(",");
    console.log(searchstr, "string");
    try {
      setLoad(true);
      const getCurrentWorkEmpRes = await employeeApi.getCurrentWorkingEmployee(
        searchstr,
        showAll
      );
      console.log("getCurrentWorkingEmployeesRes---", getCurrentWorkEmpRes);

      for (let i = 0; i < getCurrentWorkEmpRes.data.data.length; i++) {
        const startDate = new Date(
          getCurrentWorkEmpRes.data.data[i].date_of_joining
        );
        const currentDate = new Date();
        getCurrentWorkEmpRes.data.data[i].experience = getExperience(
          startDate,
          currentDate
        );
      }
      if (showAll === string.PAGE_LIMIT) {
        if (getCurrentWorkEmpRes.data.data.length > string.PAGE_LIMIT)
          setShowLoadMore(true);
      }
      if (report == 1 || report == 2) {
        handleCSVData(getCurrentWorkEmpRes.data.data, report, values);
      }
      setShowRes(true);
      setData(getCurrentWorkEmpRes.data.data);
      setLoad(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllMastersList = async (collegeId) => {
    try {
      const masterRes = await employeeApi.getAllMasters(2, collegeId);
      console.log("masterRes---", masterRes);
      setDepartmentList(masterRes.data.message.data.department);
    } catch (error) {
      console.log("error----", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllMastersList(collegeId);
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
        <Formik
          // innerRef={formifRef}
          enableReinitialize={false}
          initialValues={{
            college: "",
            department: "",
          }}
          validationSchema={FormSchema}
          onSubmit={(values) => {
            handleShow(values, string.PAGE_LIMIT, 0);
          }}
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
                      tabIndex={1}
                      label="College"
                      id="college"
                      mandatory={1}
                      options={collegeConfig.collegeList}
                      getOptionLabel={(option) => option.collegeName}
                      getOptionValue={(option) => option.collegeID}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setShowRes(false);
                        setFieldValue("college", text);
                        getAllMastersList(text.collegeID);
                        setFieldTouched("college", false);
                      }}
                    />
                  )}

                  <SelectFieldFormik
                    autoFocus={!collegeConfig.is_university}
                    label={"Department"}
                    id="department"
                    mandatory={0}
                    clear={true}
                    tabIndex={2}
                    style={{ width: "80%" }}
                    options={departmentList}
                    getOptionLabel={(option) => option.department}
                    getOptionValue={(option) => option.department_id}
                    onChange={(text) => {
                      setFieldValue("department", text);
                      setShowRes(false);
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  tabIndex={3}
                  onClick={() => {
                    preFunction.handleErrorFocus(errors);
                  }}
                  text="Show"
                />
                {showRes && (
                  <div className="row no-gutters mt-3 border p-3">
                    {data.length > 0 && (
                      <div className="text-right mb-2">
                        <Button
                          frmButton={false}
                          className={"btn me-3"}
                          type="button"
                          onClick={(e) =>
                            handleShow(values, string.PAGE_LIMIT, 2)
                          }
                          text="Export Excel"
                        />
                        <Button
                          type="button"
                          frmButton={false}
                          onClick={(e) => {
                            handleShow(values, string.PAGE_LIMIT, 1);
                          }}
                          text="Export PDF"
                        />
                      </div>
                    )}
                    <div className="table-responsive mt-2">
                      <table className="table table-bordered table-hover">
                        <thead>
                          <tr>
                            <th width="1%">No.</th>
                            <th width="5%">Employee No.</th>
                            <th width="20%">Employee Name</th>
                            <th>Designation</th>
                            <th width="10%">DOJ</th>
                            <th width="10%">Years/Month</th>
                            <th width="10%">Mobile No.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.length == 0 ? (
                            <tr>
                              <td colspan={7} align="center">
                                No data found
                              </td>
                            </tr>
                          ) : (
                            data.map((item, index) => {
                              return (
                                <>
                                  {index === 0 ? (
                                    <tr>
                                      <td colSpan={7} className="table-total">
                                        Department :{" "}
                                        {item?.department?.split("-")[0]}
                                      </td>
                                    </tr>
                                  ) : data[index - 1].department !==
                                    item.department ? (
                                    <tr>
                                      <td colSpan={7} className="table-total">
                                        Department :{" "}
                                        {item?.department?.split("-")[0]}
                                      </td>
                                    </tr>
                                  ) : null}
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="nowrapWhiteSpace">
                                      {item.custom_employeeid}
                                    </td>
                                    <td className="nowrapWhiteSpace">
                                      {item.employee_name}
                                    </td>
                                    <td className="nowrapWhiteSpace">
                                      {item.designation}
                                    </td>
                                    <td className="nowrapWhiteSpace">
                                      {item.date_of_joining
                                        ? moment(item.date_of_joining).format(
                                            "DD-MM-YYYY"
                                          )
                                        : ""}
                                    </td>
                                    <td className="nowrapWhiteSpace">
                                      {item.experience}
                                    </td>
                                    <td className="nowrapWhiteSpace">
                                      {item.cell_number}
                                    </td>
                                  </tr>
                                </>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                      {showLoadMore ? (
                        <Button
                          text="Show All"
                          type="button"
                          onClick={(e) => handleShow(values, "None", 0)}
                        />
                      ) : null}
                    </div>
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
export default CurrentlyWorkingEmployeesReport;
