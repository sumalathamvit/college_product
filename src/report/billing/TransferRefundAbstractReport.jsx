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

function TransferRefundAbstractReport() {
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [dueData, setDueData] = useState([]);
  const [load, setLoad] = useState(false);

  const [billTypeList, setBillTypeList] = useState([]);
  const [cashierList, setCashierList] = useState([]);

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
    console.log("billCancelRefundReport------", values);
    if (type == 1) {
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
      formikRef.current.values.cashier &&
        filterContent.push([
          {
            content: "Cashier : " + formikRef.current.values.cashier.cashier,
            styles: boldStyle,
          },
        ]);
      formikRef.current.values.billType &&
        filterContent.push([
          {
            content:
              "Bill Type : " + formikRef.current.values.billType.billType,
            styles: boldStyle,
          },
        ]);
      let head1 = [
        [
          { content: "Bill No.", styles: topLineStyle },
          { content: "Bill Date", styles: topLineStyle },
          { content: "Student No.", styles: topLineStyle },
          { content: "Name", styles: topLineStyle },
          { content: "Particular", styles: topLineStyle },
          { content: "Cashier", styles: topLineStyle },
          { content: "Trans/Ref No.", styles: topLineStyle },
          { content: "Trans/Ref Date", styles: topLineStyle },
          { content: "Type", styles: topLineStyle },
          {
            content: "Amount (Rs.)",
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
      let refundTot = 0;
      values.map((item, index) => {
        totalAmt += parseInt(item.totalAmount);
        refundTot += item.ReFundAmount ? parseInt(item.ReFundAmount) : 0;
        pdfData.push([
          {
            content: item.billingID,
          },
          {
            content: item.billDate,
          },
          {
            content: item.enrollNo,
          },
          {
            content: item.name,
          },
          {
            content: item.particular,
          },
          {
            content: item.custom_employeeid + " - " + item.employee_name,
          },
          {
            content: item.BillCRNo,
          },
          {
            content: item.cancelRefundDate,
          },
          {
            content: item.billType,
          },
          {
            content: preFunction.formatIndianNumber(item.totalAmount),
            styles: {
              halign: "right",
            },
          },
          {
            content: item.ReFundAmount
              ? preFunction.formatIndianNumber(item.ReFundAmount)
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
          colSpan: 7,
          styles: totStyle,
        },
        {
          content: preFunction.formatIndianNumber(totalAmt),
          styles: totStyle,
        },
        {
          content: preFunction.formatIndianNumber(refundTot),
          styles: totStyle,
        },
      ]);

      let pdfHeadToPass = [[], head1];
      let pdfDataToPass = [filterContent, pdfData];
      let columnWidth = [8, 10, 10, 22, 10, 12, 8, 10, 10];
      let colWidthToPass = [[], columnWidth];

      preFunction.generatePDFContent(
        formikRef.current.values.college
          ? formikRef.current.values.college.collegeName
          : collegeName,
        "Bill Transfer & Refund Abstract Report",
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass,
        "landscape"
      );

      setLoad(false);
      return;
    }
    const csvData = [
      [
        "No.",
        "Student No.",
        "Name",
        "Transder/Refund Number",
        "Transder/Refund Date",
        "Bill Number",
        "Bill Date",
        "Bill Type",
        "Bill Amount",
        "Refund Amount",
      ],
    ];

    let totalAmt = 0;
    let refundTot = 0;
    values.map((item, index) => {
      totalAmt += parseInt(item.totalAmount);
      refundTot += item.ReFundAmount ? parseInt(item.ReFundAmount) : 0;
      csvData[index + 1] = [
        index + 1,
        item.enrollNo,
        item.name,
        item.BillCRNo,
        item.cancelRefundDate,
        item.billingID,
        item.billDate,
        item.billType,
        item.totalAmount,
        item.ReFundAmount ? item.ReFundAmount : 0,
      ];
    });
    csvData.push([, , , , , , , "Total", totalAmt, refundTot]);
    preFunction.downloadCSV(csvData, "Bill Transder/Refund Report.csv");
    setLoad(false);
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
      console.log("billcancel Value----------------s", values);
      if (report > 0 && (showAll == 1 || data.length < string.PAGE_LIMIT)) {
        handleCSVData(data, report);
        return;
      }
      const billCancelRefund = await StudentApi.cancelRefundReport(
        collegeConfig.is_university ? values?.college?.collegeID : collegeId,
        values.cashier ? values.cashier.userID : null,
        values.fromDate ? moment(values.fromDate).format("yyyy-MM-DD") : null,
        values.toDate ? moment(values.toDate).format("yyyy-MM-DD") : null,
        values.billType ? values.billType.id : null,
        report === 0 ? showFull : 1
      );
      console.log("billCancelRefundList---", billCancelRefund);
      if (!billCancelRefund.data.message.success) {
        setModalMessage(billCancelRefund.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      if (report > 0) {
        handleCSVData(
          billCancelRefund.data.message.cancel_refund_report,
          report
        );
        return;
      }
      let total = 0;
      let refundTotal = 0;
      for (
        let i = 0;
        i < billCancelRefund.data.message.cancel_refund_report.length;
        i++
      ) {
        total += parseInt(
          billCancelRefund.data.message.cancel_refund_report[i].totalAmount
        );
        if (billCancelRefund.data.message.cancel_refund_report[i].refundAmount)
          refundTotal += parseInt(
            billCancelRefund.data.message.cancel_refund_report[i].refundAmount
          );
      }
      setTotalAmount(total);
      setRefundTotalAmount(refundTotal);

      setData(billCancelRefund.data.message.cancel_refund_report);
      if (report === 0 && showFull) {
        setShowAllButton(false);
      } else if (
        billCancelRefund.data.message.cancel_refund_report.length >=
        string.PAGE_LIMIT
      )
        setShowAllButton(true);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllMasterList = async (college_id) => {
    try {
      const masterList = await StudentApi.getMaster(5, college_id);
      console.log("---MasterList", masterList);
      if (masterList.data.message.success) {
        setBillTypeList(masterList.data.message.data.bill_type_data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getCashierList = async () => {
    try {
      const cashierListRes = await StudentApi.getCashierList();
      console.log("cashierListRes", cashierListRes);
      if (!cashierListRes.data.message.success) {
        setModalMessage(cashierListRes.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setCashierList(cashierListRes.data.message.data.cashier_list);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllMasterList(collegeId);
    }
    getCashierList();
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
              cashier: null,
              fromDate: moment().subtract(1, "years").toDate(),
              toDate: moment(),
              billType: null,
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
                              getAllMasterList(
                                text ? text.collegeID : collegeId
                              );
                            }}
                          />
                        )}
                        <SelectFieldFormik
                          autoFocus={!collegeConfig.is_university}
                          searchIcon={false}
                          label="Cashier"
                          labelSize={3}
                          tabIndex={1}
                          id="cashier"
                          options={cashierList}
                          getOptionLabel={(option) =>
                            option.custom_employeeid +
                            " - " +
                            option.employee_name
                          }
                          getOptionValue={(option) => option.userID}
                          clear={true}
                          style={{ width: "60%" }}
                          onChange={(text) => {
                            setShowRes(false);
                            setFieldValue("cashier", text);
                          }}
                        />
                        <ReactSelectField
                          autoFocus={!collegeConfig.is_university}
                          placeholder="Bill Type"
                          label="Bill Type"
                          labelSize={3}
                          tabIndex={1}
                          id="billType"
                          value={values.billType}
                          searchIcon={false}
                          clear={true}
                          options={billTypeList}
                          getOptionLabel={(option) => option.billType}
                          getOptionValue={(option) => option.id}
                          style={{ width: "30%" }}
                          onChange={(text) => {
                            setShowRes(false);

                            setFieldValue("billType", text);
                          }}
                        />
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
                          style={{ width: "20%" }}
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
                          style={{ width: "20%" }}
                        />
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
                                  <th width="5%">Student No.</th>
                                  <th>Name</th>
                                  <th width="5%">Date</th>
                                  <th width="5%">Particular</th>
                                  <th width="5%">Cashier</th>
                                  <th width="10%">Transfer / Refund No.</th>
                                  <th width="10%">Transfer / Refund Date</th>
                                  <th width="5%">Bill Type</th>
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
                                        <td>{item.billingID}</td>
                                        <td>{item.enrollNo}</td>
                                        <td>{item.name}</td>
                                        <td>
                                          {item.billDate
                                            ? moment(item.billDate).format(
                                                "DD-MM-YYYY"
                                              )
                                            : ""}
                                        </td>
                                        <td>{item.particular}</td>
                                        <td>
                                          {item.custom_employeeid +
                                            " - " +
                                            item.employee_name}
                                        </td>
                                        <td>{item.BillCRNo}</td>
                                        <td>
                                          {item.cancelRefundDate
                                            ? moment(
                                                item.cancelRefundDate
                                              ).format("DD-MM-YYYY")
                                            : ""}
                                        </td>
                                        <td>{item.billType}</td>
                                        <td align="right">
                                          {preFunction.formatIndianNumber(
                                            item.totalAmount
                                          )}
                                        </td>
                                        <td align="right">
                                          {preFunction.formatIndianNumber(
                                            item.refundAmount
                                          )}
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
export default TransferRefundAbstractReport;
