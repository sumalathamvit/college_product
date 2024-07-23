import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import moment from "moment";

import employeeApi from "../../api/EmployeeApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ScreenTitle from "../../component/common/ScreenTitle";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import AuthContext from "../../auth/context";
import { boldStyle, topLineStyle } from "../../component/common/CommonArray";
import string from "../../string";

function EmployeeRelievingReport() {
  const formifRef = useRef();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const todyaDate = new Date();
  const oneWeekBefore = new Date();
  oneWeekBefore.setTime(todyaDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [dateError, setDateError] = useState(false);
  const [dateErrorMessage, setDateErrorMessage] = useState("");
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    fromDate: Yup.string().required("Please select From Date"),
    toDate: Yup.string().required("Please select To Date"),
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

      let head = [
        [
          { content: "No.", styles: topLineStyle },
          { content: "Employee No.", styles: topLineStyle },
          { content: "Employee Name", styles: topLineStyle },
          { content: "Designation", styles: topLineStyle },
          { content: "Relieving Date", styles: topLineStyle },
          { content: "Salary", styles: topLineStyle },
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
          { content: moment(item.relieving_date).format("DD-MM-YYYY") },
          { content: item.salary },
        ]);
      });

      let pdfHeadToPass = [[], [...head]];
      let pdfDataToPass = [filterContent, pdfData];
      let colWidthToPass = [[], [5, 15, 25, 30, 15, 10]];
      preFunction.generatePDFContent(
        collegeName,
        "Employee Relievers Report",
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
      "Relieving Date",
      "Salary",
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
        moment(item.relieving_date).format("DD-MM-YYYY"),
        item.salary,
      ]);
    });

    preFunction.downloadCSV(csvData, "Employee Relievers Report");
    return;
  };

  const handleShow = async (values, showAll = 0, report = 0) => {
    console.log("values---", values, showAll, report);
    setShowLoadMore(false);
    try {
      setLoad(true);
      const getRelievingListRes = await employeeApi.getRelivingReport(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        values.fromDate ? moment(values.fromDate).format("YYYY-MM-DD") : null,
        values.toDate ? moment(values.toDate).format("YYYY-MM-DD") : null,
        values.department ? values.department.department_id : null,
        values.designation ? values.designation.designation : null,
        showAll
      );
      console.log("getRelievingListRes---", getRelievingListRes);
      setData(getRelievingListRes.data.message.data.reliving_report);
      if (showAll === 0) {
        if (
          getRelievingListRes.data.message.data.reliving_report.length >
          string.PAGE_LIMIT
        )
          setShowLoadMore(true);
      }
      if (report == 1 || report == 2) {
        handleCSVData(
          getRelievingListRes.data.message.data.reliving_report,
          report,
          values
        );
      }
      setShowRes(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getAllMastersList = async (collegeId) => {
    try {
      const masterRes = await employeeApi.getAllMasters(2, collegeId);
      console.log("masterRes---", masterRes);
      setDesignationList(masterRes.data.message.data.designation);
      setDepartmentList(masterRes.data.message.data.department);
    } catch (error) {
      console.log("error----", error);
    }
  };

  const handleClear = () => {
    setData([]);
    setShowRes(false);
    formifRef.current.setFieldValue("department", "");
    formifRef.current.setFieldValue("designation", "");
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
          innerRef={formifRef}
          enableReinitialize={false}
          initialValues={{
            college: "",
            fromDate: moment().subtract(2, "months"),
            toDate: moment(),
            department: "",
            designation: "",
          }}
          validationSchema={FormSchema}
          onSubmit={(values) => {
            handleShow(values, 0, 0);
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
                  <DateFieldFormik
                    autoFocus={!collegeConfig.is_university}
                    label={"From Date"}
                    id="fromDate"
                    tabIndex={2}
                    mandatory={1}
                    onChange={(e) => {
                      setFieldValue("fromDate", e.target.value);
                      setShowRes(false);
                    }}
                    minDate={moment().subtract(10, "years")}
                    maxDate={moment()}
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
                    }}
                    minDate={values.fromDate}
                    maxDate={moment()}
                    style={{ width: "30%" }}
                  />
                  <SelectFieldFormik
                    label={"Department"}
                    id="department"
                    mandatory={0}
                    clear={true}
                    tabIndex={4}
                    options={departmentList}
                    getOptionLabel={(option) => option.department}
                    getOptionValue={(option) => option.department_id}
                    onChange={(text) => {
                      setFieldValue("department", text);
                      setShowRes(false);
                    }}
                  />
                  <SelectFieldFormik
                    label={"Designation"}
                    id="designation"
                    mandatory={0}
                    clear={true}
                    tabIndex={5}
                    options={designationList}
                    getOptionLabel={(option) => option.designation}
                    getOptionValue={(option) => option.designation}
                    onChange={(text) => {
                      setFieldValue("designation", text);
                      setShowRes(false);
                    }}
                  />
                </div>
                <div className="row no-gutters">
                  <div className="col-lg-6 text-right pe-1">
                    <Button
                      tabIndex={6}
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
                        handleClear();
                      }}
                    />
                  </div>
                </div>
                {showRes && (
                  <div className="row no-gutters mt-3 border p-3">
                    {data.length > 0 && (
                      <div className="text-right mb-2">
                        <Button
                          frmButton={false}
                          className={"btn me-3"}
                          type="button"
                          onClick={(e) => handleShow(values, 0, 2)}
                          text="Export Excel"
                        />
                        <Button
                          type="button"
                          frmButton={false}
                          onClick={(e) => {
                            handleShow(values, 0, 1);
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
                            <th width="10%">Relieving Date</th>
                            <th width="10%">Salary</th>
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
                                        {item.department.split("-")[0]}
                                      </td>
                                    </tr>
                                  ) : data[index - 1].department !==
                                    item.department ? (
                                    <tr>
                                      <td colSpan={7} className="table-total">
                                        Department :{" "}
                                        {item.department.split("-")[0]}
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
                                      {item.relieving_date
                                        ? moment(item.relieving_date).format(
                                            "DD-MM-YYYY"
                                          )
                                        : ""}
                                    </td>
                                    <td className="nowrapWhiteSpace">
                                      {item.salary ? item.salary : ""}
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
                          onClick={(e) => handleShow(values, 1)}
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
export default EmployeeRelievingReport;
