import React, { useContext, useState } from "react";
import moment from "moment";
import * as Yup from "yup";
import { Formik } from "formik";
import { useSelector } from "react-redux";

import employeeapi from "../../../api/EmployeeApi";

import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import Button from "../../../component/FormField/Button";
import ScreenTitle from "../../../component/common/ScreenTitle";
import DateFieldFormik from "../../../component/FormField/DateFieldFormik";
import { boldStyle, totStyle } from "../../../component/common/CommonArray";

import AuthContext from "../../../auth/context";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
let totalAmount = 0;
function ArrearReport() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [showRes, setShowRes] = useState(false);

  const { collegeName, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.object().nullable(),
    fromDate: Yup.string().required("Please select Payroll Month"),
  });

  const handleCsvExport = async (values, type) => {
    console.log("values", values, type);
    if (type === 1) {
      let filterContent = [];
      filterContent.push([
        {
          content:
            "Payroll Month : " + moment(values.fromDate).format("MMM-yyyy"),
          styles: boldStyle,
        },
      ]);
      let head = [
        [
          { content: "No.", styles: boldStyle },
          { content: "Employee No.", styles: boldStyle },
          { content: "Name", styles: boldStyle },
          { content: "Designation", styles: boldStyle },
          { content: "Reason", styles: boldStyle },
          {
            content: "Amount (Rs.)",
            styles: { ...boldStyle, halign: "right" },
          },
        ],
      ];
      let pdfData = [];
      data.map((item, index) => {
        pdfData.push([
          { content: index + 1 },
          { content: item.custom_employeeid },
          { content: item.employee_name },
          { content: item.designation },
          { content: item.custom_reason },
          {
            content: item.amount,
            styles: {
              halign: "right",
            },
          },
        ]);
      });
      pdfData.push([
        { colSpan: 5, content: "Total", styles: totStyle },
        {
          content: totalAmount,
          styles: totStyle,
        },
      ]);
      let pdfHeadToPass = [[], [...head]];
      let pdfDataToPass = [filterContent, pdfData];
      let colWidthToPass = [[], [5, 15, 20, 25, 20, 15]];
      preFunction.generatePDFContent(
        collegeName,
        "Arrear Report",
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
      "Name",
      "Designation",
      "Reason",
      "Amount (Rs.)",
    ]);
    data.map((item, index) => {
      csvData.push([
        index + 1,
        item.custom_employeeid,
        item.employee_name,
        item.designation,
        item.custom_reason,
        item.amount,
      ]);
    });
    csvData.push(["", "", "", "", "Total", totalAmount]);
    preFunction.downloadCSV(csvData, "Arrear Report");
    return;
  };

  const handleShow = async (values, report) => {
    if (load) return;
    if (report > 0) {
      handleCsvExport(values, report);
      return;
    }
    try {
      setLoad(true);
      const getArrearReportRes = await employeeapi.getArrearReport(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        moment(values.fromDate).startOf("month").format("yyyy-MM-DD"),
        moment(values.fromDate).endOf("month").format("yyyy-MM-DD")
      );
      console.log("getArrearReportRes---", getArrearReportRes);
      setShowRes(true);
      setData(getArrearReportRes.data.message.data.arrear_report);

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
          enableReinitialize={false}
          initialValues={{
            college: "",
            fromDate: moment().subtract(1, "months").format("yyyy-MM"),
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
                <div className="col-lg-9">
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
                    autoFocus
                    label={"Payroll Month"}
                    labelSize={5}
                    id="fromDate"
                    type="month"
                    tabindex={1}
                    mandatory={1}
                    onChange={(e) => {
                      setFieldValue("fromDate", e.target.value);
                      setShowRes(false);
                    }}
                    maxDate={new Date()}
                    minDate={moment().subtract(2, "years")}
                    style={{ width: "30%" }}
                  />
                </div>
                <Button
                  tabindex={2}
                  text="Show"
                  type="submit"
                  onClick={(e) => preFunction.handleErrorFocus(errors)}
                />

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
                    <div className="table-responsive mt-3">
                      <table className="table table-bordered table-hover">
                        <thead>
                          <tr>
                            <th width="1%">No.</th>
                            <th width="1%">Employee No.</th>
                            <th>Name</th>
                            <th width="25%">Designation</th>
                            <th width="20%">Reason</th>
                            <th width="10%" style={{ textAlign: "right" }}>
                              Amount (र)
                            </th>
                          </tr>
                        </thead>
                        {data.length > 0 ? (
                          <tbody>
                            {data.map((item, index) => {
                              if (index === 0)
                                totalAmount = parseInt(item.amount);
                              else totalAmount += parseInt(item.amount);
                              return (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>{item.custom_employeeid}</td>
                                  <td>{item.employee_name}</td>
                                  <td>{item.designation}</td>
                                  <td>{item.custom_reason}</td>
                                  <td align="right">{item.amount}</td>
                                </tr>
                              );
                            })}
                            <tr>
                              <td
                                colSpan={5}
                                align="right"
                                className="student-text"
                              >
                                Total
                              </td>
                              <td align="right" className="student-text">
                                {totalAmount}
                              </td>
                            </tr>
                          </tbody>
                        ) : (
                          <tbody>
                            <tr>
                              <td align="center" colSpan={6}>
                                No data found
                              </td>
                            </tr>
                          </tbody>
                        )}
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
export default ArrearReport;
