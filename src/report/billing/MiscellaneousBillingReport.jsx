import React, { useContext, useRef, useState } from "react";
import moment from "moment";
import { Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import string from "../../string";
import { useSelector } from "react-redux";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import {
  boldStyle,
  topLineStyle,
  totStyle,
} from "../../component/common/CommonArray";

import AuthContext from "../../auth/context";

function MiscellaneousBillingReport() {
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const formikRef = useRef();

  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    fromDate: Yup.string().required("Please select From Date"),
    toDate: Yup.string().required("Please select To Date"),
  });

  const handleCSVData = async (dbValues, report) => {
    try {
      console.log("reportValues---", dbValues, report);
      if (report == 1) {
        let filterContent = [
          [
            {
              content:
                "From Date : " +
                moment(formikRef.current.values.fromDate).format("DD-MM-YYYY") +
                "       To Date : " +
                moment(formikRef.current.values.toDate).format("DD-MM-YYYY"),
              styles: boldStyle,
            },
          ],
        ];
        let head1 = [];
        head1 = [
          [
            { content: "No.", styles: topLineStyle },
            { content: "Bill No.", styles: topLineStyle },
            { content: "Bill Date", styles: topLineStyle },
            { content: "Particular", styles: topLineStyle },
            { content: "Pay Mode", styles: topLineStyle },
            {
              content: "Total Amt (Rs.)",
              styles: { ...topLineStyle, halign: "right" },
            },
          ],
        ];
        let pdfData = [];
        let totalAmt = 0;
        dbValues.map((item, index) => {
          totalAmt += parseInt(item.totalAmount);

          pdfData.push([
            {
              content: index + 1,
            },
            {
              content: item.id,
            },
            {
              content: moment(item.billDate).format("DD-MM-YYYY"),
            },
            {
              content: item.particular.substring(0, 25),
            },
            {
              content: item.paymentMode,
            },
            {
              content: item.totalAmount,
              styles: {
                halign: "right",
              },
            },
          ]);
        });
        pdfData.push([
          {
            content: "Total",
            colSpan: 5,
            styles: totStyle,
          },
          {
            content: totalAmt,
            styles: totStyle,
          },
        ]);

        let pdfHeadToPass = [[], [...head1]];
        let pdfDataToPass = [filterContent, [...pdfData]];
        let columnWidth = [6, 11, 15, 35, 15, 18];
        let colWidthToPass = [[], [...columnWidth]];

        preFunction.generatePDFContent(
          formikRef.current.values.college
            ? formikRef.current.values.college.collegeName
            : collegeName,
          "Miscelleneous Billing Report",
          pdfHeadToPass,
          pdfDataToPass,
          colWidthToPass
        );
        return;
      }
      let csvData = [
        [
          "No.",
          "Bill No.",
          "Bill Date",
          "Particular",
          "Payment Mode",
          "Total Amount",
        ],
      ];
      dbValues.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.id,
          moment(item.billDate).format("DD-MM-yyyy"),
          item.particular,
          item.paymentMode,
          item.totalAmount,
        ];
      });
      csvData.push(["", "", "", "", "Total", totalAmount]);
      if (report == 1) {
        preFunction.generatePDF(
          collegeName,
          "Miscellaneous Billing Report",
          csvData
        );
      } else {
        preFunction.downloadCSV(
          csvData,
          "Miscellaneous Billing Report" + ".csv"
        );
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleShow = async (values, showAll, report) => {
    if (load) return;
    setTotalAmount(0);
    try {
      console.log(values, "values");
      console.log("showAll---", showAll);
      if (showAll == 1 && report > 0) {
        handleCSVData(data, report);
        return;
      }

      setLoad(true);
      setShowRes(true);
      const MiscellaneousRes = await StudentApi.getMiscellaneousReport(
        collegeConfig.is_university ? values?.college?.collegeID : collegeId,
        moment(values.fromDate).format("yyyy-MM-DD"),
        moment(values.toDate).format("yyyy-MM-DD"),
        showAll
      );
      console.log("MiscellaneousRes---", MiscellaneousRes);
      let tot = 0;
      if (MiscellaneousRes.data.message.success) {
        for (
          let i = 0;
          i < MiscellaneousRes.data.message.miscellaneous_billing_report.length;
          i++
        ) {
          tot += parseInt(
            MiscellaneousRes.data.message.miscellaneous_billing_report[i]
              .totalAmount
          );
        }
      }
      setTotalAmount(tot);

      if (report > 0) {
        handleCSVData(
          MiscellaneousRes.data.message.miscellaneous_billing_report,
          report
        );
      } else {
        setData(MiscellaneousRes.data.message.miscellaneous_billing_report);
        setShowLoadMore(false);
        if (
          MiscellaneousRes.data.message.miscellaneous_billing_report.length >
            string.PAGE_LIMIT &&
          showAll == 0
        ) {
          setShowLoadMore(true);
        }
      }
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
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-4">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: "",
              fromDate: moment().subtract(7, "days").format("yyyy-MM-DD"),
              toDate: moment().format("yyyy-MM-DD"),
            }}
            validationSchema={reportSchema}
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
                  {collegeConfig.is_university && (
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={0}
                      labelSize={2}
                      clear={true}
                      label="College"
                      id="college"
                      mandatory={1}
                      options={collegeConfig.collegeList}
                      getOptionLabel={(option) => option.collegeName}
                      getOptionValue={(option) => option.collegeID}
                      style={{ width: "60%" }}
                      searchIcon={false}
                      onChange={(text) => {
                        setShowRes(false);
                        setFieldValue("college", text);
                      }}
                    />
                  )}
                  <DateFieldFormik
                    autoFocus
                    tabindex="1"
                    labelSize={2}
                    label="From Date"
                    id="fromDate"
                    mandatory={1}
                    maxDate={values.toDate}
                    minDate={moment().subtract(1, "years").format("yyyy-MM-DD")}
                    style={{ width: "20%" }}
                    onChange={(e) => {
                      setFieldValue("fromDate", e.target.value);
                    }}
                  />
                  <DateFieldFormik
                    tabindex="2"
                    labelSize={2}
                    label="To Date"
                    id="toDate"
                    mandatory={1}
                    maxDate={new Date()}
                    minDate={values.fromDate}
                    style={{ width: "20%" }}
                    onChange={(e) => {
                      setFieldValue("toDate", e.target.value);
                    }}
                  />

                  <Button tabindex="3" text="Show" isTable={true} />

                  {showRes ? (
                    <div className="row border p-3 mt-4">
                      <div className="row col-lg-6 totcntstyle p-0 mb-2"></div>
                      <>
                        {data.length > 0 && (
                          <div className=" col-lg-6 p-0 text-right mb-3">
                            <button
                              type="button"
                              className="btn"
                              onClick={(e) => {
                                handleShow(values, 1, 2);
                              }}
                            >
                              Export Excel
                            </button>
                            &nbsp; &nbsp;
                            <button
                              className="btn"
                              onClick={(e) => {
                                handleShow(values, 1, 1);
                              }}
                            >
                              Export PDF
                            </button>
                          </div>
                        )}

                        <div className="table-responsive p-0">
                          <table className="table table-bordered report-table table-bordered">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="5%">Bill No.</th>
                                <th width="5%">Bill Date</th>
                                <th>Particular</th>
                                <th width="5%">Payment Mode</th>
                                <th width="5%">Bill Amount (₹)</th>
                              </tr>
                            </thead>
                            {data.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td colSpan={10} align="center">
                                    No records found
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
                              <tbody>
                                {data.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{item.id}</td>
                                      <td>
                                        {moment(item.billDate).format(
                                          "DD-MM-YYYY"
                                        )}
                                      </td>
                                      <td>{item.particular}</td>
                                      <td>{item.paymentMode}</td>
                                      <td align="right">
                                        {preFunction.formatIndianNumber(
                                          item.totalAmount
                                        )}
                                      </td>
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
                                    {preFunction.formatIndianNumber(
                                      totalAmount
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            )}
                          </table>
                          {showLoadMore && (
                            <Button
                              text="Show All"
                              onClick={(e) => handleShow(values, 1)}
                            />
                          )}
                        </div>
                      </>
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
export default MiscellaneousBillingReport;
