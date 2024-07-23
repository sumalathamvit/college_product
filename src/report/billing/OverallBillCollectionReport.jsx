import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import moment from "moment";
import * as Yup from "yup";

import AuthContext from "../../auth/context";

import StudentApi from "../../api/StudentApi";

import {
  boldStyle,
  topLineStyle,
  totStyle,
} from "../../component/common/CommonArray";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import string from "../../string";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import { useSelector } from "react-redux";

function OverallBillCollectionReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [dueData, setDueData] = useState([]);
  const [load, setLoad] = useState(false);
  const [paymentModeList, setPaymentModeList] = useState([]);

  const [showAllButton, setShowAllButton] = useState(false);
  const [showRes, setShowRes] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [refundTotalAmount, setRefundTotalAmount] = useState(0);
  const [showAll, setShowAll] = useState(0);

  const formikRef = useRef();

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    fromDate: Yup.string().required("Please select From Date"),
    toDate: Yup.string().required("Please select To Date"),
  });

  const handleCSVData = async (values, type) => {
    console.log("values------", values);
    if (type == 1) {
      let filterContent = [
        [
          {
            content:
              "From Date : " +
              moment(formikRef.current.values.fromDate).format("DD-MM-YYYY") +
              "     To Date : " +
              moment(formikRef.current.values.toDate).format("DD-MM-YYYY"),
            styles: boldStyle,
          },
        ],
      ];
      formikRef.current.values.paymentMode &&
        filterContent.push([
          {
            content:
              "Payment Mode : " +
              formikRef.current.values.paymentMode.paymentMode,
            styles: boldStyle,
          },
        ]);

      console.log("filterContent---", filterContent);
      let head1 = [
        [
          { content: "No.", styles: topLineStyle },
          { content: "Bill No.", styles: topLineStyle },
          { content: "Bill Date", styles: topLineStyle },
          { content: "Student No.", styles: topLineStyle },
          { content: "Name", styles: topLineStyle },
          { content: "Particular", styles: topLineStyle },
          {
            content: RENAME?.course,
            styles: topLineStyle,
          },
          {
            content: RENAME?.sem,
            styles: topLineStyle,
          },
          { content: "Pay Mode", styles: topLineStyle },
          {
            content: "Bill Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Refund (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
        ],
      ];
      let pdfData = [];
      let totalAmt = 0;
      let totalRefundAmt = 0;
      values.map((item, index) => {
        totalAmt += parseInt(item.Amount);
        totalRefundAmt += item.RefundAmount ? parseInt(item.RefundAmount) : 0;
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
            content: item.enrollNo,
          },
          {
            content: item.name.substring(0, 12),
          },
          {
            content: item.particular.substring(0, 15),
          },
          {
            content: item.courseName.substring(0, 10),
          },
          {
            content: item.className,
          },
          {
            content: item.paymentMode,
          },
          {
            content: preFunction.formatIndianNumber(item.Amount),
            styles: {
              halign: "right",
            },
          },
          {
            content: item.RefundAmount
              ? preFunction.formatIndianNumber(item.RefundAmount)
              : 0,
            styles: {
              halign: "right",
            },
          },
        ]);
      });
      pdfData.push([
        {
          content: "Total",
          colSpan: 9,
          styles: totStyle,
        },
        {
          content: preFunction.formatIndianNumber(totalAmt),
          styles: totStyle,
        },
        {
          content: preFunction.formatIndianNumber(totalRefundAmt),
          styles: totStyle,
        },
      ]);

      let pdfHeadToPass = [[], [...head1]];
      let pdfDataToPass = [filterContent, [...pdfData]];
      let columnWidth = [
        5,
        6,
        8,
        9,
        collegeConfig.institution_type === 1 ? 9 : 14,
        12,
        10,
        collegeConfig.institution_type === 1 ? 10 : 5,
        8,
        10,
        13,
      ];
      let colWidthToPass = [[], [...columnWidth]];

      console.log("pdfDataToPass---", pdfDataToPass);
      console.log("pdfHeadToPass---", pdfHeadToPass);
      console.log("colWidthToPass---", colWidthToPass);
      preFunction.generatePDFContent(
        formikRef.current.values.college
          ? formikRef.current.values.college.collegeName
          : collegeName,
        "OverAll Bill Collection Report",
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass,
        "LandScape"
      );

      setLoad(false);
      return;
    } else {
      const csvData = [
        [
          "No.",
          "Bill No.",
          "Bill Date",
          "Student No.",
          "Name",
          "Particular",
          RENAME?.dept,
          RENAME?.sem,
          "Pay Mode",
          "Bill Amount",
          "Refund Amount",
        ],
      ];
      let totalAmt = 0;
      let totalRefundAmt = 0;
      values.map((item, index) => {
        totalAmt += parseInt(item.Amount);
        totalRefundAmt += item.RefundAmount ? parseInt(item.RefundAmount) : 0;
        csvData[index + 1] = [
          index + 1,
          item.id,
          moment(item.billDate).format("DD-MM-YYYY"),
          item.enrollNo,
          item.name,
          item.particular,
          item.department,
          item.className,
          item.paymentMode,
          item.Amount,
          item.RefundAmount ? item.RefundAmount : 0,
        ];
      });
      csvData.push([, , , , , , , , "Total", totalAmt, totalRefundAmt]);
      preFunction.downloadCSV(csvData, "OverAll Bill Collection Report.csv");
      setLoad(false);
    }
  };

  const handleShow = async (values, report, showFull = 0) => {
    if (load) return;
    setDueData([]);
    if (report === 0 && showFull) {
      setShowAll(showFull);
    } else {
      setShowAll(0);
    }
    console.log("values-----", values);
    console.log("report-----", report);
    console.log("showAll-----", showFull);

    try {
      setShowRes(true);
      setLoad(true);

      console.log("overall Values", values);
      console.log("showAll---", showAll);
      if (report > 0 && (showAll == 1 || data.length < string.PAGE_LIMIT)) {
        handleCSVData(data, report);
        return;
      }
      const billOverallCollection =
        await StudentApi.overallBillCollectionReport(
          collegeConfig.is_university ? values?.college?.collegeID : collegeId,
          values.fromDate ? moment(values.fromDate).format("yyyy-MM-DD") : null,
          values.toDate ? moment(values.toDate).format("yyyy-MM-DD") : null,
          values.paymentMode ? values?.paymentMode?.id : null,
          report === 0 ? showFull : 1
        );
      console.log("billoverallList---", billOverallCollection);
      if (!billOverallCollection.data.message.success) {
        setModalMessage(billOverallCollection.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      if (report > 0) {
        handleCSVData(
          billOverallCollection.data.message.overall_collection_report,
          report
        );
        return;
      }
      let total = 0,
        refundTotal = 0;
      for (
        let i = 0;
        i < billOverallCollection.data.message.overall_collection_report.length;
        i++
      ) {
        total += parseInt(
          billOverallCollection.data.message.overall_collection_report[i].Amount
        );
        refundTotal +=
          billOverallCollection.data.message.overall_collection_report[i]
            .RefundAmount != ""
            ? parseInt(
                billOverallCollection.data.message.overall_collection_report[i]
                  .RefundAmount
              )
            : 0;
      }
      setTotalAmount(total);
      setRefundTotalAmount(refundTotal);
      setData(billOverallCollection.data.message.overall_collection_report);
      if (report === 0 && showFull) {
        setShowAllButton(false);
      } else {
        if (
          billOverallCollection.data.message.overall_collection_report.length >=
          string.PAGE_LIMIT
        )
          setShowAllButton(true);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllMasterList = async (college_id) => {
    try {
      if (!college_id) {
        return;
      }
      const masterList = await StudentApi.getMaster(5, college_id);
      console.log("MasterList--", masterList);
      if (!masterList.data.message.success) {
        setModalMessage(masterList.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setPaymentModeList(masterList.data.message.data.payment_mode_data);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllMasterList(collegeId);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        title={modalTitle}
        isOpen={modalErrorOpen}
        message={modalMessage}
        okClick={() => setModalErrorOpen(false)}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            innerRef={formikRef}
            enableReinitialize={false}
            initialValues={{
              college: null,
              paymentMode: null,
              fromDate: moment().subtract(1, "years").toDate(),
              toDate: moment(),
            }}
            validationSchema={reportSchema}
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
                  <div className="row no-gutters mb-2">
                    <div className="col-lg-2"></div>
                    <div className="col-lg-8 border p-3">
                      <div className="ps-3">
                        {collegeConfig.is_university && (
                          <SelectFieldFormik
                            autoFocus
                            tabIndex={0}
                            labelSize={3}
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
                              getAllMasterList(text?.collegeID);
                            }}
                          />
                        )}

                        <ReactSelectField
                          autoFocus={!collegeConfig.is_university}
                          searchIcon={false}
                          label="Payment Mode"
                          labelSize={3}
                          tabIndex={1}
                          id="paymentMode"
                          value={values.paymentMode}
                          options={paymentModeList}
                          getOptionLabel={(option) => option.paymentMode}
                          getOptionValue={(option) => option.id}
                          clear={true}
                          style={{ width: "35%" }}
                          onChange={(text) => {
                            setShowRes(false);
                            setFieldValue("paymentMode", text);
                          }}
                        />

                        <div className="row no-gutters">
                          <DateFieldFormik
                            label="From Date"
                            labelSize={3}
                            tabIndex={2}
                            id="fromDate"
                            mandatory={1}
                            onChange={(e) => {
                              setFieldValue("fromDate", e.target.value);
                              setShowRes(false);
                            }}
                            minDate={new Date(moment().subtract(6, "years"))}
                            maxDate={new Date()}
                            style={{ width: "27%" }}
                          />

                          <DateFieldFormik
                            label="To Date"
                            id="toDate"
                            labelSize={3}
                            tabIndex={3}
                            mandatory={1}
                            maxDate={new Date()}
                            minDate={values.fromDate}
                            onChange={(e) => {
                              setFieldValue("toDate", e.target.value);
                              setShowRes(false);
                            }}
                            style={{ width: "27%" }}
                          />
                        </div>
                      </div>
                      <Button
                        text="Show"
                        type="submit"
                        tabIndex={4}
                        onClick={() => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                    </div>
                  </div>
                  {showRes && (
                    <>
                      <div className="row no-gutters border p-3 mt-3">
                        <div className="row no-gutters totcntstyle">
                          {data.length > 0 || dueData.length > 0 ? (
                            <>
                              <div className="col-lg-12">
                                <div className="text-right">
                                  <Button
                                    type="button"
                                    frmButton={false}
                                    isTable={true}
                                    className="btn me-2"
                                    onClick={() => handleShow(values, 2, 1)}
                                    text="Export Excel"
                                  />
                                  <Button
                                    type="button"
                                    isTable={true}
                                    frmButton={false}
                                    className="btn ms-2"
                                    onClick={(e) => handleShow(values, 1, 1)}
                                    text="Export PDF"
                                  />
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                        <div>
                          <div className="table-responsive">
                            <table
                              className="table table-bordered table-hover report-table"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="5%">Bill No.</th>
                                  <th width="5%">Bill Date</th>
                                  <th width="5%">Student No.</th>
                                  <th>Name</th>
                                  <th width="15%">Particulars</th>
                                  <th width="20%">{RENAME?.course}</th>
                                  <th width="5%">{RENAME?.sem}</th>
                                  <th width="5%">Pay Mode</th>
                                  <th width="5%">Bill Amount (₹)</th>
                                  <th width="5%">Refund Amount (₹)</th>
                                </tr>
                              </thead>
                              {data.length === 0 ? (
                                <tbody>
                                  <tr>
                                    <td colSpan={20} align="center">
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
                                          {item.billDate
                                            ? moment(item.billDate).format(
                                                "DD-MM-YYYY"
                                              )
                                            : ""}
                                        </td>
                                        <td>{item.enrollNo}</td>
                                        <td>{item.name}</td>
                                        <td>{item.particular}</td>
                                        <td>{item.courseName}</td>
                                        <td>{item.className}</td>
                                        <td>{item.paymentMode}</td>
                                        <td align="right">
                                          {preFunction.formatIndianNumber(
                                            item.Amount
                                          )}
                                        </td>
                                        <td align="right">
                                          {item.RefundAmount
                                            ? preFunction.formatIndianNumber(
                                                item.RefundAmount
                                              )
                                            : 0}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  <tr>
                                    <td
                                      colSpan={9}
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
                                    <td align="right" className="student-text">
                                      {preFunction.formatIndianNumber(
                                        refundTotalAmount
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              )}
                            </table>
                          </div>
                          {showAllButton && (
                            <>
                              <div className="row text-right mt-2">
                                <Button
                                  text="Show All"
                                  type="button"
                                  isTable={true}
                                  onClick={(e) => {
                                    handleShow(values, 0, 1);
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default OverallBillCollectionReport;
