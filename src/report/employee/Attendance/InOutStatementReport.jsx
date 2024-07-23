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
import string from "../../../string";

function InOutStatementReport() {
  const formifRef = useRef();
  const [data, setData] = useState([]);
  const [showAllButton, setShowAllButton] = useState(false);
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

  const handleCSVData = async (exportData, type, values) => {
    if (type === 1) {
      let filterContent = [];
      filterContent.push([
        {
          content:
            "From Date : " +
            moment(values.fromDate).format("DD-MM-yyyy") +
            "    To Date : " +
            moment(values.toDate).format("DD-MM-yyyy"),
          styles: boldStyle,
        },
      ]);

      let head = [
        [
          { content: "No.", styles: topLineStyle },
          { content: "Employee No.", styles: topLineStyle },
          { content: "Employee Name", styles: topLineStyle },
          { content: "Designation", styles: topLineStyle },
          { content: "Department", styles: topLineStyle },
          { content: "Date", styles: topLineStyle },
          { content: "In Time", styles: topLineStyle },
          { content: "Out Time", styles: topLineStyle },
          { content: "Remarks", styles: topLineStyle },
        ],
      ];

      let pdfData = [];
      exportData.map((item, index) => {
        pdfData.push([
          { content: index + 1 },
          { content: item.custom_employeeid },
          { content: item.employee_name },
          { content: item.designation },
          { content: item.department },
          { content: moment(item.attendance_date).format("DD-MM-yyyy") },
          { content: item.in_time ? moment(item.in_time).format("HH:mm") : "" },
          {
            content: item.out_time ? moment(item.out_time).format("HH:mm") : "",
          },
          { content: item.remarks },
        ]);
      });

      let pdfHeadToPass = [[], [...head]];
      let pdfDataToPass = [filterContent, pdfData];
      let colWidthToPass = [[], [5, 10, 15, 15, 23, 8, 6, 8, 10]];
      preFunction.generatePDFContent(
        collegeName,
        "Attendance In & Out Statement",
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass,
        "landscape"
      );
      return;
    }

    let csvData = [];
    csvData.push([
      "No.",
      "Employee No.",
      "Employee Name",
      "Designation",
      "Department",
      "Date",
      "In Time",
      "Out Time",
      "Remarks",
    ]);
    exportData.map((item, index) => {
      csvData.push([
        index + 1,
        item.custom_employeeid,
        item.employee_name,
        item.designation,
        item.department,
        moment(item.attendance_date).format("DD-MM-yyyy"),
        item.in_time ? moment(item.in_time).format("HH:mm") : "",
        item.out_time ? moment(item.out_time).format("HH:mm") : "",
        item.remarks,
      ]);
    });

    preFunction.downloadCSV(csvData, "Attendance In & Out Statement");
    return;
  };
  const handleShow = async (values, showAll, report) => {
    if (load) return;
    setShowAllButton(false);
    console.log("values---", values);
    console.log("showAll---", showAll);
    if (report && !showAllButton) {
      handleCSVData(data, report, values);
      return;
    }
    try {
      setLoad(true);
      setShowRes(true);
      const inOutStatementRes = await employeeApi.inOutStatement(
        collegeConfig.is_university ? values?.college?.collegeID : collegeId,
        moment(values.fromDate).format("yyyy-MM-DD"),
        moment(values.toDate).format("yyyy-MM-DD"),
        showAll
      );
      console.log("inOutStatementRes---", inOutStatementRes);

      setData(
        inOutStatementRes.data.message.data.attendance_in_out_statement_report
      );
      if (report) {
        handleCSVData(
          inOutStatementRes.data.message.data
            .attendance_in_out_statement_report,
          report,
          values
        );
        return;
      }
      if (showAll) setShowAllButton(false);
      else if (
        inOutStatementRes.data.message.data.attendance_in_out_statement_report
          .length > string.PAGE_LIMIT
      )
        setShowAllButton(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

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
          onSubmit={(values) => handleShow(values, 0, 0)}
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
                </div>
                <Button
                  onClick={() => {
                    preFunction.handleErrorFocus(errors);
                  }}
                  tabIndex={3}
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
                      <table className="table table-bordered table-hover report-table">
                        <thead>
                          <tr>
                            <th width="1%">No.</th>
                            <th width="5%">Employee No.</th>
                            <th width="15%">Employee Name</th>
                            <th width="10%">Department</th>
                            <th width="10%">Designation</th>
                            <th width="3%">Date</th>
                            <th width="5%">In Time</th>
                            <th width="5%">Out Time</th>
                            <th width="5%">Remarks</th>
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
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.custom_employeeid}</td>
                                    <td>{item.employee_name}</td>
                                    <td>{item.department}</td>
                                    <td>{item.designation}</td>
                                    <td>
                                      {moment(item.attendance_date).format(
                                        "DD-MM-yyyy"
                                      )}
                                    </td>
                                    <td>
                                      {item.in_time
                                        ? moment(item.in_time).format("HH:mm")
                                        : ""}
                                    </td>
                                    <td>
                                      {item.out_time
                                        ? moment(item.out_time).format("HH:mm")
                                        : ""}
                                    </td>
                                    <td>{item.remarks}</td>
                                  </tr>
                                </>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    {showAllButton && (
                      <div className="text-center">
                        <Button
                          isTable={true}
                          onClick={() => {
                            handleShow(values, 1, 0);
                          }}
                          text="Show All"
                        />
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
export default InOutStatementReport;
