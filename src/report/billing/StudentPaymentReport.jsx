import React, { useState, useRef, useContext } from "react";
import { Formik } from "formik";
import moment from "moment";
import * as Yup from "yup";
import { useSelector } from "react-redux";

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
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import StudentCard from "../../component/StudentCard";
import CommonApi from "../../component/common/CommonApi";

function StudentPaymentReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [dueData, setDueData] = useState([]);
  const [studentInfo, setStudentInfo] = useState();
  const [load, setLoad] = useState(false);
  const [studentList, setStudentList] = useState([]);

  const [showRes, setShowRes] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [totalAmount, setTotalAmount] = useState(0);
  const [refundTotalAmount, setRefundTotalAmount] = useState(0);
  const [openingTotal, setOpeningTotal] = useState(0);
  const [concessionTotal, setConcessionTotal] = useState(0);
  const [refundTotal, setRefundTotal] = useState(0);
  const [duePaidTotal, setDuePaidTotal] = useState(0);
  const [dueBalTotal, setDueBalTotal] = useState(0);

  const formikRef = useRef();

  const reportSchema = Yup.object().shape({
    enrollNumber: Yup.object().required("Please select Student No. / Name"),
  });

  const handleCSVData = async (values, type) => {
    setLoad(false);
    console.log("StudentPaymentReport------", values);
    if (type == 1) {
      let filterContent = [
        [
          {
            content: "Student No. : " + studentInfo?.enrollNo,
            styles: boldStyle,
          },
        ],
        [
          {
            content: RENAME?.course + " : " + studentInfo?.courseName,
            styles: boldStyle,
          },
        ],
        [
          {
            content: "Name. : " + studentInfo?.name,
            styles: boldStyle,
          },
        ],
        [
          {
            content: "Admission Type : " + studentInfo?.admissionType,
            styles: boldStyle,
          },
        ],
      ];
      let head = [
        [
          {
            content: "No.",
            styles: topLineStyle,
          },
          {
            content: "Bill Date",
            styles: topLineStyle,
          },
          {
            content: "Bill No.",
            styles: topLineStyle,
          },
          {
            content: "Pay Mode",
            styles: topLineStyle,
          },
          {
            content: RENAME?.sem,
            styles: topLineStyle,
          },
          {
            content: "Particular",
            styles: topLineStyle,
          },
          {
            content: "Refund (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
        ],
      ];
      let pdfData = [];
      if (values.length === 0) {
        pdfData.push([
          {
            content: "No records found",
            colSpan: 8,
            styles: {
              halign: "center",
            },
          },
        ]);
      } else {
        values.map((item, index) => {
          pdfData.push([
            {
              content: index + 1,
            },
            {
              content: moment(item.billDate).format("DD-MM-YYYY"),
            },
            {
              content: item.billingID,
            },
            {
              content: item.paymentMode,
            },
            {
              content: item.className,
            },
            {
              content: item.particular.substring(0, 27),
            },
            {
              content: item.refundAmount
                ? preFunction.formatIndianNumber(item.refundAmount)
                : 0,
              styles: {
                halign: "right",
              },
            },
            {
              content: preFunction.formatIndianNumber(item.amount),
              styles: {
                halign: "right",
              },
            },
          ]);
        });
        pdfData.push([
          {
            content: "Total",
            colSpan: 6,
            styles: totStyle,
          },
          {
            content: preFunction.formatIndianNumber(refundTotalAmount),
            styles: totStyle,
          },
          {
            content: preFunction.formatIndianNumber(totalAmount),
            styles: totStyle,
          },
        ]);
      }

      let pdfData12 = [
        [
          {
            content: "Due Details",
            colSpan: 6,
            styles: {
              ...boldStyle,
              halign: "center",
            },
          },
        ],
      ];
      let head1 = [
        [
          {
            content: "No.",
            styles: topLineStyle,
          },
          {
            content: "Particular",
            styles: topLineStyle,
          },
          {
            content: RENAME?.sem,
            styles: topLineStyle,
          },
          {
            content: "Opening (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Concession (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Paid (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Refund (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Due (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
        ],
      ];

      let pdfData1 = [];
      if (dueData.length > 0) {
        dueData.map((item, index) => {
          pdfData1[index] = [
            {
              content: index + 1,
            },
            {
              content: item.particular.substring(0, 20),
            },
            {
              content: item.className,
            },
            {
              content: item.openingBalance
                ? preFunction.formatIndianNumber(item.openingBalance)
                : 0,
              styles: {
                halign: "right",
              },
            },
            {
              content: item.concession
                ? preFunction.formatIndianNumber(item.concession)
                : 0,
              styles: {
                halign: "right",
              },
            },
            {
              content: preFunction.formatIndianNumber(item.paid),
              styles: {
                halign: "right",
              },
            },
            {
              content: item.refund
                ? preFunction.formatIndianNumber(item.refund)
                : 0,
              styles: {
                halign: "right",
              },
            },
            {
              content: preFunction.formatIndianNumber(item.balance),
              styles: {
                halign: "right",
              },
            },
          ];
        });
        pdfData1[pdfData1.length] = [
          {
            content: "Total",
            colSpan: 3,
            styles: totStyle,
          },
          {
            content: preFunction.formatIndianNumber(openingTotal),
            styles: totStyle,
          },
          {
            content: preFunction.formatIndianNumber(concessionTotal),
            styles: totStyle,
          },
          {
            content: preFunction.formatIndianNumber(duePaidTotal),
            styles: totStyle,
          },
          {
            content: preFunction.formatIndianNumber(refundTotal),
            styles: totStyle,
          },
          {
            content: preFunction.formatIndianNumber(dueBalTotal),
            styles: totStyle,
          },
        ];
        console.log("pdfData1", pdfData1);
      } else {
        pdfData1.push([
          {
            content: "No records found",
            colSpan: 6,
            styles: {
              halign: "center",
            },
          },
        ]);
      }

      var columnWidth = [6, 12, 10, 12, 8, 25, 15, 12];
      var columnWidth1 = [
        5,
        collegeConfig.institution_type === 1 ? 25 : 32,
        collegeConfig.institution_type === 1 ? 11 : 4,
        15,
        12,
        10,
        12,
        10,
      ];
      let colWidthToPass = [[], [...columnWidth], [], [...columnWidth1]];

      console.log("pdfData", pdfData);
      let pdfData2Pass = [filterContent, pdfData, pdfData12, pdfData1];

      let thead = [[], [...head], [], [...head1]];
      console.log("pdfData2", pdfData2Pass);
      preFunction.generatePDFContent(
        collegeName,
        "Student Payment Report",
        thead,
        pdfData2Pass,
        colWidthToPass
      );
      return;
    } else {
      let csvData = [
        [
          "Student No.",
          studentInfo?.enrollNo,
          RENAME?.course,
          studentInfo?.courseName,
          "Name",
          studentInfo?.name,
          "Admission Type",
          studentInfo?.admissionType,
        ],
      ];
      csvData.push([
        [
          "No.",
          "Bill Date",
          "Bill No.",
          "Pay Mode",
          RENAME?.sem,
          "Particular",
          "Refund Amount",
          "Bill Amount",
        ],
      ]);
      values.map((item, index) => {
        csvData[index + 3] = [
          index + 1,
          moment(item.billDate).format("DD-MM-YYYY"),
          item.billingID,
          item.paymentMode,
          item.className,
          item.particular,
          item.refundAmount ?? 0,
          item.amount,
        ];
      });
      csvData.push([, , , , , "Total", refundTotalAmount, totalAmount]);

      csvData.push([
        ["No.", "Particular", RENAME?.sem, "Opening Balance", "Paid", "Due"],
      ]);
      dueData.map((item, index) => {
        csvData.push([
          index + 1,
          item.particular,
          item.className,
          item.openingBalance ?? 0,
          item.paid,
          item.balance,
        ]);
      });
      csvData.push([, , "Total", openingTotal, duePaidTotal, dueBalTotal]);

      preFunction.downloadCSV(csvData, "Student Payment Report.csv");
    }
  };

  const handleShow = async (values, report) => {
    if (load) return;
    try {
      setLoad(true);

      if (report > 0) {
        console.log("here---");
        handleCSVData(data, report);
        return;
      }
      setData([]);
      setDueData([]);
      console.log("values-----", values);
      console.log("report-----", report);
      console.log("PaymentValues", values);
      const studentPaymentList = await StudentApi.studentPaymentReport(
        values.enrollNumber.enrollNo
      );
      console.log("PaymentList---", studentPaymentList);
      if (!studentPaymentList?.data?.message?.success) {
        setModalMessage(studentPaymentList?.data?.message?.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      let total = 0;
      let refundTot = 0;
      for (
        let i = 0;
        i < studentPaymentList?.data?.message?.data?.payment_report?.length;
        i++
      ) {
        total += parseInt(
          studentPaymentList?.data?.message?.data?.payment_report[i]?.amount
        );
        if (
          studentPaymentList?.data?.message?.data?.payment_report[i]
            ?.refundAmount
        )
          refundTot += parseInt(
            studentPaymentList?.data?.message?.data?.payment_report[i]
              ?.refundAmount
          );
      }
      setTotalAmount(total);
      setRefundTotalAmount(refundTot);
      setShowRes(true);
      setData(studentPaymentList?.data?.message?.data?.payment_report);
      let opening = 0;
      let duepaid = 0;
      let duebal = 0;
      let concession = 0;
      let refund = 0;

      for (
        let i = 0;
        i < studentPaymentList?.data?.message?.data?.fees_due_detail?.length;
        i++
      ) {
        if (
          studentPaymentList?.data?.message?.data?.fees_due_detail[i]
            ?.openingBalance
        )
          opening += parseInt(
            studentPaymentList?.data?.message?.data?.fees_due_detail[i]
              ?.openingBalance
          );
        if (
          studentPaymentList?.data?.message?.data?.fees_due_detail[i]
            ?.concession
        )
          concession += parseInt(
            studentPaymentList?.data?.message?.data?.fees_due_detail[i]
              ?.concession
          );
        if (studentPaymentList?.data?.message?.data?.fees_due_detail[i]?.paid)
          duepaid += parseInt(
            studentPaymentList?.data?.message?.data?.fees_due_detail[i]?.paid
          );
        if (studentPaymentList?.data?.message?.data?.fees_due_detail[i]?.refund)
          refund += parseInt(
            studentPaymentList?.data?.message?.data?.fees_due_detail[i]?.refund
          );
        if (
          studentPaymentList?.data?.message?.data?.fees_due_detail[i]?.balance
        ) {
          if (
            studentPaymentList?.data?.message?.data?.fees_due_detail[i]
              ?.particular == "Excess Fees"
          )
            duebal -= parseInt(
              studentPaymentList?.data?.message?.data?.fees_due_detail[i]
                ?.balance
            );
          else
            duebal += parseInt(
              studentPaymentList?.data?.message?.data?.fees_due_detail[i]
                ?.balance
            );
        }
      }
      setOpeningTotal(opening);
      setDuePaidTotal(duepaid);
      setDueBalTotal(duebal);
      setConcessionTotal(concession);
      setRefundTotal(refund);
      setDueData(studentPaymentList?.data?.message?.data?.fees_due_detail);

      setStudentInfo(
        studentPaymentList?.data?.message?.data?.student_detail[0]
      );

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
  };

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
              enrollNumber: "",
            }}
            validationSchema={reportSchema}
            onSubmit={(values) => {
              handleShow(values, 0);
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
                        <SelectFieldFormik
                          autoFocus
                          label="Student No. / Name"
                          labelSize={3}
                          mandatory={1}
                          tabIndex={1}
                          id="enrollNumber"
                          placeholder="Student No. / Name"
                          options={studentList}
                          getOptionLabel={(option) => option.name}
                          getOptionValue={(option) => option.id}
                          style={{ width: "90%" }}
                          searchIcon={true}
                          clear={true}
                          onInputChange={(inputValue) => {
                            searchStudent(inputValue);
                          }}
                          onChange={(text) => {
                            setFieldValue("enrollNumber", text);
                            setShowRes(false);
                          }}
                        />
                      </div>
                      <Button
                        text="Show"
                        type="submit"
                        tabIndex={2}
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
                          <div className="col-lg-12">
                            <div className="text-right">
                              <Button
                                type="button"
                                frmButton={false}
                                isTable={true}
                                className="btn me-2"
                                onClick={() => handleShow(values, 2)}
                                text="Export Excel"
                              />
                              <Button
                                type="button"
                                isTable={true}
                                frmButton={false}
                                className="btn ms-2"
                                onClick={(e) => handleShow(values, 1)}
                                text="Export PDF"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="table-responsive">
                            <div className="subhead-row">
                              <div className="subhead">Student Detail </div>
                              <div className="col line-div"></div>
                            </div>
                            <StudentCard studentInfo={studentInfo} />
                            <div className="subhead-row mt-3">
                              <div className="subhead">Payment Detail </div>
                              <div className="col line-div"></div>
                            </div>

                            <table
                              className="table table-bordered table-hover mt-1 report-table"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="5%">Bill Date</th>
                                  <th width="5%">Bill No.</th>
                                  <th width="5%">Pay Mode</th>
                                  <th width="5%">{RENAME?.sem}</th>
                                  <th>Particulars</th>
                                  <th width="5%">Refund Amount (₹)</th>
                                  <th width="5%">Bill Amount (₹)</th>
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
                                        <td>
                                          {item.billDate
                                            ? moment(item.billDate).format(
                                                "DD-MM-YYYY"
                                              )
                                            : ""}
                                        </td>
                                        <td>{item.billingID}</td>
                                        <td>{item.paymentMode}</td>
                                        <td>{item.className}</td>
                                        <td>{item.particular}</td>
                                        <td align="right">
                                          {item.refundAmount
                                            ? preFunction.formatIndianNumber(
                                                item.refundAmount
                                              )
                                            : 0}
                                        </td>
                                        <td align="right">
                                          {preFunction.formatIndianNumber(
                                            item.amount
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  <tr>
                                    <td
                                      colSpan={6}
                                      align="right"
                                      className="student-text"
                                    >
                                      Total
                                    </td>
                                    <td align="right" className="student-text">
                                      {refundTotalAmount}
                                    </td>
                                    <td align="right" className="student-text">
                                      {totalAmount}
                                    </td>
                                  </tr>
                                </tbody>
                              )}
                            </table>

                            <div className="col-lg-8">
                              <div className="subhead-row mt-4">
                                <div className="subhead">Due Detail </div>
                                <div className="col line-div"></div>
                              </div>
                              <table
                                className="table table-bordered table-hover mt-1 report-table"
                                id="pdf-table"
                              >
                                <thead>
                                  <tr>
                                    <th width="1%">No.</th>
                                    <th>Particulars</th>
                                    <th width="5%">{RENAME?.sem}</th>
                                    <th width="5%">Opening Balance (₹)</th>
                                    <th width="5%">Concession (₹)</th>
                                    <th width="5%">Paid (₹)</th>
                                    <th width="5%">Refund (₹)</th>
                                    <th width="5%">Due (₹)</th>
                                  </tr>
                                </thead>
                                {dueData.length === 0 ? (
                                  <tbody>
                                    <tr>
                                      <td colSpan={20} align="center">
                                        No records found
                                      </td>
                                    </tr>
                                  </tbody>
                                ) : (
                                  <tbody>
                                    {dueData.map((item, index) => {
                                      return (
                                        <tr key={index}>
                                          <td>{index + 1}</td>
                                          <td>{item.particular}</td>
                                          <td>{item.className}</td>
                                          <td align="right">
                                            {item.openingBalance ?? 0}
                                          </td>
                                          <td align="right">
                                            {item.concession ?? 0}
                                          </td>
                                          <td align="right">{item.paid}</td>
                                          <td align="right">
                                            {item.refund ?? 0}
                                          </td>
                                          <td align="right">
                                            {item.particular == "Excess Fees"
                                              ? "-" + item.balance
                                              : item.balance}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    <tr>
                                      <td
                                        colSpan={3}
                                        align="right"
                                        className="student-text"
                                      >
                                        Total
                                      </td>
                                      <td
                                        align="right"
                                        className="student-text"
                                      >
                                        {openingTotal}
                                      </td>
                                      <td
                                        align="right"
                                        className="student-text"
                                      >
                                        {concessionTotal}
                                      </td>
                                      <td
                                        align="right"
                                        className="student-text"
                                      >
                                        {duePaidTotal}
                                      </td>
                                      <td
                                        align="right"
                                        className="student-text"
                                      >
                                        {refundTotal}
                                      </td>
                                      <td
                                        align="right"
                                        className="student-text"
                                      >
                                        {dueBalTotal}
                                      </td>
                                    </tr>
                                  </tbody>
                                )}
                              </table>
                            </div>
                          </div>
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
export default StudentPaymentReport;
