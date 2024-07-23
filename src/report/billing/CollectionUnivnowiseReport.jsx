import React, { useEffect, useState, useRef, useContext } from "react";
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
import ReactSelectField from "../../component/FormField/ReactSelectField";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";

import string from "../../string";

function CollectionUnivnowiseReport() {
  const RENAME = useSelector((state) => state.web.rename);

  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [dueData, setDueData] = useState([]);
  const [load, setLoad] = useState(false);
  const [batchError, setBatchError] = useState(false);

  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [particularList, setParticularList] = useState([]);

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
    if (type == 1) {
      let filterContent = [];
      formikRef.current.values.course &&
        filterContent.push([
          {
            content:
              formikRef.current.values.course &&
              RENAME?.course +
                " : " +
                formikRef.current.values.course.courseName,
            styles: boldStyle,
          },
        ]);
      (formikRef.current.values.batch || formikRef.current.values.particular) &&
        filterContent.push([
          {
            content:
              (formikRef.current.values.batch &&
                (collegeConfig.institution_type === 1
                  ? RENAME?.sem + " : "
                  : RENAME?.batch + " : ") +
                  (collegeConfig.institution_type === 1
                    ? formikRef.current.values.batch.className
                    : formikRef.current.values.batch.batch)) +
              (formikRef.current.values.particular
                ? "    Particular: " +
                  formikRef.current.values.particular.particular
                : ""),
            styles: boldStyle,
          },
        ]);
      filterContent.push([
        {
          content:
            "From Date : " +
            moment(formikRef.current.values.fromDate).format("DD-MM-YYYY") +
            "    To Date : " +
            moment(formikRef.current.values.toDate).format("DD-MM-YYYY"),
          styles: boldStyle,
        },
      ]);
      let head1 = [];
      head1 = [
        [
          { content: "No.", styles: topLineStyle },
          { content: "University No.", styles: topLineStyle },
          { content: "Bill No.", styles: topLineStyle },
          { content: "Bill Date", styles: topLineStyle },
          { content: "Name", styles: topLineStyle },
          { content: "Particular", styles: topLineStyle },
          {
            content: RENAME?.course,
            styles: topLineStyle,
          },
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
        totalAmt += parseInt(item.amount);
        refundTot += item.refundAmount ? parseInt(item.refundAmount) : 0;

        pdfData.push([
          {
            content: index + 1,
          },

          {
            content: item.registrationNo ?? "",
          },
          {
            content: item.billingID,
          },
          {
            content: moment(item.billDate).format("DD-MM-YYYY"),
          },
          {
            content: item.name.substring(0, 20),
          },
          {
            content: item.particular.substring(0, 25),
          },
          {
            content: item.courseName.substring(0, 22),
          },
          {
            content: preFunction.formatIndianNumber(item.amount),
            styles: {
              halign: "right",
            },
          },
          {
            content: item.refundAmount
              ? preFunction.formatIndianNumber(item.refundAmount)
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
      let columnWidth = [5, 10, 6, 10, 17, 17, 15, 10, 10];
      let colWidthToPass = [[], [...columnWidth]];

      preFunction.generatePDFContent(
        formikRef.current.values.college
          ? formikRef.current.values.college.collegeName
          : collegeName,
        "Collection Univ. No. Wise Report",
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass,
        "Landcape"
      );
      setLoad(false);
      return;
    }
    console.log("reportValues---", values);
    const csvData = [];

    csvData.push([
      [
        "No.",
        "Bill No.",
        "Bill Date",
        "Student No.",
        "Name",
        "Particular",
        RENAME?.course,
        "Amount",
        "Refund Amount",
      ],
    ]);

    let totalAmt = 0;
    let refundTot = 0;

    values.map((item, index) => {
      totalAmt += parseInt(item.amount);
      refundTot += item.refundAmount ? parseInt(item.refundAmount) : 0;
      csvData.push([
        [
          index + 1,
          item.registrationNo,
          item.billingID,
          moment(item.billDate).format("DD-MM-YYYY"),
          item.name,
          item.particular,
          item.courseName,
          item.amount,
          item.refundAmount ? item.refundAmount : 0,
        ],
      ]);
    });

    csvData.push([, , , , , , "Total", totalAmt, refundTot]);
    preFunction.downloadCSV(csvData, "Bill Collection Report.csv");
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

    setBatchError(false);

    try {
      setShowRes(true);
      setLoad(true);
      if (report > 0 && (showAll == 1 || data.length < string.PAGE_LIMIT)) {
        handleCSVData(data, report);
        return;
      }
      const billCollectionReportRes = await StudentApi.billCollectionReport(
        collegeConfig.is_university ? values?.college?.collegeID : collegeId,
        values.fromDate ? moment(values.fromDate).format("yyyy-MM-DD") : null,
        values.toDate ? moment(values.toDate).format("yyyy-MM-DD") : null,
        values?.paymentMode?.id,
        values.particular.id,
        values?.batch?.batchID,
        values?.course?.id,
        report === 0 ? showFull : 1,
        1,
        0
      );
      console.log("billCollectionReportRes", billCollectionReportRes);
      if (!billCollectionReportRes.data.message.success) {
        setModalMessage(billCollectionReportRes.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      if (report > 0) {
        handleCSVData(
          billCollectionReportRes.data.message.collection_report,
          report
        );
        return;
      }
      let total = 0;
      let refundTot = 0;
      for (
        let i = 0;
        i < billCollectionReportRes.data.message.collection_report.length;
        i++
      ) {
        total += parseInt(
          billCollectionReportRes.data.message.collection_report[i].amount
        );
        refundTot += billCollectionReportRes.data.message.collection_report[i]
          .refundAmount
          ? parseInt(
              billCollectionReportRes.data.message.collection_report[i]
                .refundAmount
            )
          : 0;
      }
      setTotalAmount(total);
      setRefundTotalAmount(refundTot);
      setData(billCollectionReportRes.data.message.collection_report);
      if (report === 0 && showFull) {
        setShowAllButton(false);
      } else if (
        billCollectionReportRes.data.message.collection_report.length >=
        string.PAGE_LIMIT
      ) {
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
      const masterList = await StudentApi.getMaster(
        collegeConfig.institution_type === 1 ? 8 : 5,
        college_id
      );
      console.log("----------------------MasterList", masterList);
      if (masterList.data.message.success) {
        if (masterList.data.message.data.course_data.length === 1) {
          formikRef.current.setFieldValue(
            "course",
            masterList.data.message.data.course_data[0]
          );
        }
        setCourseList(masterList.data.message.data.course_data);
        setBatchList(
          collegeConfig.institution_type === 1
            ? masterList.data.message.data.class_data
            : masterList.data.message.data.batch_data
        );
      }

      const particularMasterList = await StudentApi.getMaster(4, college_id);
      console.log("particularMasterList", particularMasterList);
      if (particularMasterList.data.message.success) {
        setParticularList(
          particularMasterList.data.message.data.particular_data
        );
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getClassData = async (course) => {
    try {
      const masterList = await StudentApi.getMaster(2, collegeId, course.id);
      console.log("masterList---", masterList);
      setBatchList(masterList.data.message.data.batch_data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCourseList = async (college_id) => {
    try {
      const masterList = await StudentApi.getMaster(2, college_id);
      console.log("masterList---", masterList);
      if (!masterList.data.message.success) {
        setModalMessage(masterList.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(masterList.data.message.data.course_data);
      if (masterList.data.message.data.course_data.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          masterList.data.message.data.course_data[0]
        );
        if (collegeConfig.institution_type === 1)
          getClassData(masterList.data.message.data.course_data[0]);
      }
      if (masterList.data.message.data.admission_type_data.length === 1) {
        formikRef.current.setFieldValue(
          "admissionType",
          masterList.data.message.data.admission_type_data[0]
        );
      }
    } catch (error) {
      setLoad(false);
      console.log(error);
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
              course: null,
              batch: null,
              particular: null,
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
                              getCourseList(text?.collegeID);
                            }}
                          />
                        )}

                        <ReactSelectField
                          autoFocus={!collegeConfig.is_university}
                          label={RENAME?.course}
                          labelSize={3}
                          tabIndex={1}
                          style={{ width: "80%" }}
                          id="course"
                          error={errors.course}
                          touched={touched.course}
                          value={values.course}
                          clear={true}
                          options={courseList}
                          getOptionLabel={(option) => option.courseName}
                          getOptionValue={(option) => option.id}
                          searchIcon={false}
                          onChange={(text) => {
                            setShowRes(false);
                            setFieldValue("course", text);
                          }}
                        />
                        {collegeConfig.institution_type === 1 ? (
                          <ReactSelectField
                            label={RENAME?.sem}
                            labelSize={3}
                            tabIndex={2}
                            id="batch"
                            value={values.batch}
                            searchIcon={false}
                            clear={true}
                            options={batchList}
                            getOptionLabel={(option) => option.className}
                            getOptionValue={(option) => option.semester}
                            style={{ width: "30%" }}
                            onChange={(text) => {
                              setFieldValue("batch", text);
                              setShowRes(false);
                            }}
                          />
                        ) : (
                          <ReactSelectField
                            label={RENAME?.batch}
                            labelSize={3}
                            tabIndex={2}
                            id="batch"
                            value={values.batch}
                            searchIcon={false}
                            clear={true}
                            options={batchList}
                            getOptionLabel={(option) => option.batch}
                            getOptionValue={(option) => option.batchID}
                            style={{ width: "30%" }}
                            onChange={(text) => {
                              setFieldValue("batch", text);
                              setShowRes(false);
                            }}
                          />
                        )}

                        <ReactSelectField
                          label="Particular"
                          labelSize={3}
                          tabIndex={3}
                          id="particular"
                          value={values.particular}
                          searchIcon={false}
                          clear={true}
                          style={{ width: "80%" }}
                          options={particularList}
                          getOptionLabel={(option) => option.particular}
                          getOptionValue={(option) => option.id}
                          onChange={(text) => {
                            setShowRes(false);
                            setFieldValue("particular", text);
                          }}
                        />

                        <div className="row no-gutters">
                          <DateFieldFormik
                            label="From Date"
                            labelSize={3}
                            tabIndex={4}
                            id="fromDate"
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
                            tabIndex={5}
                            maxDate={new Date()}
                            minDate={values.fromDate}
                            onChange={(e) => {
                              setFieldValue("toDate", e.target.value);
                              setShowRes(false);
                            }}
                            style={{ width: "20%" }}
                          />
                        </div>
                      </div>
                      <Button
                        text="Show"
                        type="submit"
                        tabIndex={6}
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
                                  <th width="5%">Univ. No.</th>

                                  <th width="5%">Bill No.</th>
                                  <th width="5%">Bill Date</th>
                                  <th width="15%">Name</th>
                                  <th>Particulars</th>
                                  <th width="25%">{RENAME?.course}</th>
                                  <th width="5%">Amount (₹)</th>
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
                                        <td>{item.registrationNo}</td>

                                        <td>{item.billingID}</td>
                                        <td>
                                          {item.billDate
                                            ? moment(item.billDate).format(
                                                "DD-MM-YYYY"
                                              )
                                            : ""}
                                        </td>
                                        <td>{item.name}</td>
                                        <td>{item.particular}</td>
                                        <td>{item.courseName}</td>
                                        <td align="right">
                                          {preFunction.formatIndianNumber(
                                            item.amount
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
                                      colSpan={7}
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
export default CollectionUnivnowiseReport;
