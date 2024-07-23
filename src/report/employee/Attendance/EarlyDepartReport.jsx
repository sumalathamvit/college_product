import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import moment from "moment";
import { Formik } from "formik";

import AuthContext from "../../../auth/context";

import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import ScreenTitle from "../../../component/common/ScreenTitle";
import DateFieldFormik from "../../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import { boldStyle, topLineStyle } from "../../../component/common/CommonArray";

import employeeApi from "../../../api/EmployeeApi";
import CommonApi from "../../../component/common/CommonApi";

function EarlyDepartReport() {
  const formifRef = useRef();
  const [empCodeList, setEmpCodeList] = useState([]);
  const [data, setData] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);

  const { collegeName, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.object().nullable(),
    fromDate: Yup.string().required("Please select From Date"),
    toDate: Yup.string().required("Please select To Date"),
  });

  const handleSearchEmployee = async (text) => {
    console.log("text---", text);
    const empList = await CommonApi.searchEmployee(text);
    console.log("empList", empList);
    setEmpCodeList(empList);
  };

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
              (values.department ? values.department.department : "") +
              " Designation : " +
              (values.designation ? values.designation.designation : ""),
            styles: boldStyle,
          },
        ]);
      values.empCode &&
        filterContent.push([
          {
            content: "Employee : " + values.empCode.custom_employeeid,
            styles: boldStyle,
          },
        ]);

      let head = [
        [
          { content: "No.", styles: topLineStyle },
          { content: "Employee No.", styles: topLineStyle },
          { content: "Employee Name", styles: topLineStyle },
          { content: "Designation", styles: topLineStyle },
          { content: "In Time", styles: topLineStyle },
          { content: "Out Time", styles: topLineStyle },
          { content: "Early Depature", styles: topLineStyle },
        ],
      ];

      let pdfData = [];
      exportData.map((item, index) => {
        if (index === 0)
          pdfData.push([
            {
              content: moment(item.attendance_date).format("DD-MM-yyyy"),
              colSpan: 7,
              styles: boldStyle,
            },
          ]);
        else if (exportData[index - 1].attendance_date !== item.attendance_date)
          pdfData.push([
            {
              content: moment(item.attendance_date).format("DD-MM-yyyy"),
              colSpan: 7,
              styles: boldStyle,
            },
          ]);

        pdfData.push([
          { content: index + 1 },
          { content: item.custom_employeeid },
          { content: item.employee_name },
          { content: item.designation },
          { content: moment(item.in_time).format("HH:mm") },
          { content: moment(item.out_time).format("HH:mm") },
          { content: -item.custom_short_excess },
        ]);
      });

      let pdfHeadToPass = [[], [...head]];
      let pdfDataToPass = [filterContent, pdfData];
      let colWidthToPass = [[], [5, 15, 20, 25, 10, 10, 10]];
      preFunction.generatePDFContent(
        collegeName,
        "Early Depature Report",
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
      "In Time",
      "Out Time",
      "Early Depature",
    ]);
    exportData.map((item, index) => {
      if (index === 0)
        csvData.push([moment(item.attendance_date).format("DD-MM-yyyy")]);
      else if (exportData[index - 1].attendance_date !== item.attendance_date)
        csvData.push([moment(item.attendance_date).format("DD-MM-yyyy")]);

      csvData.push([
        index + 1,
        item.custom_employeeid,
        item.employee_name,
        item.designation,
        moment(item.in_time).format("HH:mm"),
        moment(item.out_time).format("HH:mm"),
        -item.custom_short_excess,
      ]);
    });

    preFunction.downloadCSV(csvData, "Early Depature Report");
    return;
  };
  const handleShow = async (values, report) => {
    if (load) return;
    console.log("values---", values);
    if (report) {
      handleCSVData(data, report, values);
      return;
    }
    try {
      setLoad(true);
      setShowRes(true);
      const getEarlyDepartListRes = await employeeApi.getEarlyDepartList(
        collegeConfig.is_university ? values?.college?.collegeID : collegeId,
        moment(values.fromDate).format("yyyy-MM-DD"),
        moment(values.toDate).format("yyyy-MM-DD"),
        values?.department?.department_id,
        values?.designation?.designation,
        values?.empCode?.custom_employeeid
      );
      console.log("getEarlyDepartListRes---", getEarlyDepartListRes);

      setData(getEarlyDepartListRes.data.message.data.early_departure_detail);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getDepartmentList = async (college = null) => {
    const masterRes = await employeeApi.getAllMasters(
      2,
      collegeConfig.is_university ? college?.collegeID : collegeId
    );
    console.log("masterRes---", masterRes);
    setDepartmentList(masterRes?.data?.message?.data?.department);
    setDesignationList(masterRes?.data?.message?.data?.designation);
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getDepartmentList();
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
            college: null,
            fromDate: moment().subtract(1, "months"),
            toDate: moment(),
            department: null,
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
                    label={"From Date"}
                    id="fromDate"
                    mandatory={1}
                    tabIndex={1}
                    onChange={(e) => {
                      setFieldValue("fromDate", e.target.value);
                      setShowRes(false);
                    }}
                    minDate={moment().subtract(1, "year")}
                    maxDate={values.toDate}
                    style={{ width: "30%" }}
                  />
                  <DateFieldFormik
                    label={"To Date"}
                    id="toDate"
                    tabIndex={2}
                    mandatory={1}
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
                    tabIndex={3}
                    mandatory={0}
                    clear={true}
                    getOptionLabel={(option) => option.department}
                    getOptionValue={(option) => option.department_id}
                    onChange={(e) => {
                      setFieldValue("department", e);
                      setShowRes(false);
                    }}
                    options={departmentList}
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
                </div>
                <div className="text-center">
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
                    }}
                    tabIndex={6}
                    text="Clear"
                  />
                </div>
                {showRes && (
                  <div className="row no-gutters mt-3 border p-3">
                    {data.length > 0 && (
                      <div className="text-right mb-2">
                        <Button
                          frmButton={false}
                          className={"btn me-3"}
                          type="button"
                          onClick={(e) => handleShow(values, 2)}
                          text="Export Excel"
                        />
                        <Button
                          type="button"
                          frmButton={false}
                          onClick={(e) => {
                            handleShow(values, 1);
                          }}
                          text="Export PDF"
                        />
                      </div>
                    )}
                    <div className="table-responsive mt-2">
                      <table className="table table-bordered table-hover report-table">
                        <thead>
                          <tr>
                            <th width="1%">No.</th>
                            <th width="5%">Employee No.</th>
                            <th width="25%">Employee Name</th>
                            <th>Designation</th>
                            {/* <th width="3%">Shift</th> */}
                            <th width="5%">In Time</th>
                            <th width="5%">Out Time</th>
                            <th width="5%">Early Depature</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.length == 0 ? (
                            <tr>
                              <td colspan={9} align="center">
                                No data found
                              </td>
                            </tr>
                          ) : (
                            data.map((item, index) => {
                              return (
                                <>
                                  {index === 0 ? (
                                    <tr>
                                      <td colSpan={8} className="table-total">
                                        {moment(item.attendance_date).format(
                                          "DD-MM-yyyy"
                                        )}
                                      </td>
                                    </tr>
                                  ) : data[index - 1].attendance_date !==
                                    item.attendance_date ? (
                                    <tr>
                                      <td colSpan={8} className="table-total">
                                        {moment(item.attendance_date).format(
                                          "DD-MM-yyyy"
                                        )}
                                      </td>
                                    </tr>
                                  ) : null}
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.custom_employeeid}</td>
                                    <td>{item.employee_name}</td>
                                    <td>{item.designation}</td>
                                    {/* <td>
                                      {item.shift}
                                    </td> */}
                                    <td>
                                      {moment(item.in_time).format("HH:mm")}
                                    </td>
                                    <td>
                                      {moment(item.out_time).format("HH:mm")}
                                    </td>
                                    <td align="right">
                                      {-item.custom_short_excess}
                                    </td>
                                  </tr>
                                </>
                              );
                            })
                          )}
                        </tbody>
                      </table>
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
export default EarlyDepartReport;
