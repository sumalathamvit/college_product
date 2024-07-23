import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";
import AcademicApi from "../../api/AcademicApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import string from "../../string";
import AuthContext from "../../auth/context";
import {
  boldStyle,
  topLineStyle,
  totStyle,
} from "../../component/common/CommonArray";

function DueSummary() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const [openingTotal, setOpeningTotal] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);
  const [dueTotal, setDueTotal] = useState(0);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
  });

  const handleDueAbstractCSVData = async (values, report) => {
    setLoad(true);
    console.log("reportValues---", values);
    if (report === 1) {
      let filterContent = [];
      if (formikRef.current.values.course) {
        filterContent.push([
          {
            content: formikRef.current.values.course
              ? RENAME?.course +
                " : " +
                formikRef.current.values.course.courseName
              : "",
            styles: boldStyle,
          },
        ]);
      }
      if (formikRef.current.values.batch || formikRef.current.values.class) {
        filterContent.push([
          {
            content:
              collegeConfig.institution_type === 1
                ? RENAME?.sem + " : "
                : RENAME?.batch +
                  " : " +
                  (formikRef.current.values.batch
                    ? formikRef.current.values.batch.batch
                    : formikRef.current.values.class
                    ? formikRef.current.values.class.className
                    : ""),
            styles: boldStyle,
          },
        ]);
      }
      let head1 = [
        [
          { content: "No.", styles: topLineStyle },
          {
            content: RENAME?.course,
            styles: topLineStyle,
          },
          {
            content:
              collegeConfig.institution_type === 1 ? RENAME?.sem : "Study Year",
            styles: topLineStyle,
          },
          {
            content: "Opening (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Paid (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Balance (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
        ],
      ];
      let pdfData = [];
      let openingAmt = 0;
      let paidAmt = 0;
      let balAmt = 0;
      values.map((item, index) => {
        openingAmt += parseInt(item.openingBalance);
        paidAmt += item.paid ? parseInt(item.paid) : 0;
        balAmt += item.balance ? parseInt(item.balance) : 0;
        pdfData.push([
          {
            content: index + 1,
          },
          {
            content: item.courseName,
          },
          {
            content:
              collegeConfig.institution_type === 1
                ? item.className
                : item.studyYear,
          },
          {
            content: item.openingBalance,
            styles: { halign: "right" },
          },

          {
            content: item.paid,
            styles: { halign: "right" },
          },
          {
            content: item.balance,
            styles: { halign: "right" },
          },
        ]);
      });
      pdfData.push([
        {
          content: "Total",
          colSpan: 3,
          styles: totStyle,
        },
        {
          content: openingAmt,
          styles: totStyle,
        },
        {
          content: paidAmt,
          styles: totStyle,
        },
        {
          content: balAmt,
          styles: totStyle,
        },
      ]);

      let pdfHeadToPass = [[], [...head1]];

      let pdfDataToPass = [filterContent, [...pdfData]];

      let columnWidth = [5, 45, 10, 15, 10, 15];
      let colWidthToPass = [[], [...columnWidth]];

      preFunction.generatePDFContent(
        formikRef.current.values.college
          ? formikRef.current.values.college.collegeName
          : collegeName,
        "Due Summary Report",
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass
      );

      setLoad(false);
      return;
    } else {
      var csvData = [
        [
          "No.",
          RENAME?.course,
          collegeConfig.institution_type === 1 ? RENAME?.sem : "Study Year",
          "Opening (Rs.)",
          "Paid (Rs.)",
          "Balance (Rs.)",
        ],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.courseName,
          collegeConfig.institution_type === 1
            ? item.className
            : item.studyYear,
          item.openingBalance,
          item.paid,
          item.balance,
        ];
      });
      const rowArray = ["", "", "Total", openingTotal, paidTotal, dueTotal];
      csvData.push(rowArray);

      preFunction.downloadCSV(csvData, "Due Summary.csv");
    }
    setLoad(false);
  };

  const handleShow = async (values, showAll = 0, report = 0) => {
    if (load) return;
    console.log("values--------", showAll, values);
    setShowLoadMore(false);
    setOpeningTotal(0);
    setDueTotal(0);
    setPaidTotal(0);

    try {
      setLoad(true);
      setShowRes(true);
      if (report === 0) {
        setData([]);
      }
      if (showAll === 1) {
        setShowLoadMore(false);
      }

      const getDueSummaryRes = await StudentApi.getDueSummaryReport(
        values.course ? values.course.id : null,
        values.batch ? values.batch.batchID : null,
        collegeConfig.institution_type === 1 && values.class
          ? values.class.semester
          : null,
        showAll,
        collegeConfig.is_university ? values?.college?.collegeID : collegeId
      );
      console.log("getDueSummaryReport ---", getDueSummaryRes);
      if (report) {
        handleDueAbstractCSVData(
          getDueSummaryRes.data.message.data.summary_report,
          report
        );
      }
      setData(getDueSummaryRes.data.message.data.summary_report);
      let openingTotalSum = 0;
      let paidTotalSum = 0;
      let dueTotalSum = 0;

      getDueSummaryRes.data.message.data.summary_report.map((item, index) => {
        openingTotalSum += item.openingBalance;
        paidTotalSum += item.paid;
        dueTotalSum += item.balance;
      });
      setOpeningTotal(openingTotalSum);
      setPaidTotal(paidTotalSum);
      setDueTotal(dueTotalSum);
      if (showAll === 0) {
        if (
          getDueSummaryRes.data.message.data.summary_report.length >=
          string.PAGE_LIMIT
        )
          setShowLoadMore(true);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleCourseChange = async (values) => {
    setBatchList([]);
    setClassList([]);
    try {
      formikRef.current.setFieldValue("batch", null);
      formikRef.current.setFieldTouched("course", false);
      formikRef.current.setFieldTouched("batch", false);
      if (values) {
        const batchRes = await AcademicApi.getMasterSubjectStaff(
          collegeConfig.is_university
            ? formikRef.current.values.college.collegeID
            : collegeId,
          "batch",
          values.id
        );
        console.log("batchRes", batchRes);
        if (!batchRes.data.message.success) {
          return;
        }
        setBatchList(batchRes.data.message.data.batch);
        setClassList(batchRes.data.message.data.batch);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getAllList = async (college_id) => {
    try {
      const masterRes = await StudentApi.getMaster(
        collegeConfig.institution_type === 1 ? 8 : 5,
        college_id
      );
      console.log("MasterRes----", masterRes);
      if (masterRes.data.message.data.course_data.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          masterRes.data.message.data.course_data[0]
        );
        handleCourseChange(masterRes.data.message.data.course_data[0]);
      }
      setCourseList(masterRes.data.message.data.course_data);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-3">
          <Formik
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={{
              college: "",
              batch: "",
              class: "",
              course: "",
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
                  <div className="row no-gutters col-lg-8">
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
                          getAllList(text.collegeID);
                          setFieldValue("course", "");
                          setFieldValue("batch", "");
                          setFieldTouched("course", false);
                          setFieldTouched("batch", false);
                          setFieldTouched("college", false);
                        }}
                      />
                    )}
                    {courseList.length > 1 && (
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        tabIndex={2}
                        label={RENAME?.course}
                        id="course"
                        clear={true}
                        options={courseList}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.id}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setFieldValue("batch", "");
                          setFieldValue("class", "");
                          setShowRes(false);
                          handleCourseChange(text);
                        }}
                      />
                    )}
                    {collegeConfig.institution_type !== 1 ? (
                      <SelectFieldFormik
                        label={RENAME?.batch}
                        id="batch"
                        tabIndex={3}
                        clear={true}
                        options={batchList}
                        getOptionLabel={(option) => option.batch}
                        getOptionValue={(option) => option.batchID}
                        style={{ width: "50%" }}
                        onChange={(text) => {
                          setFieldValue("batch", text);
                          setShowRes(false);
                        }}
                      />
                    ) : (
                      <SelectFieldFormik
                        tabIndex={3}
                        label={RENAME?.sem}
                        id="class"
                        clear={true}
                        maxlength={10}
                        options={classList}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        style={{ width: "50%" }}
                        onChange={(text) => {
                          setFieldValue("class", text);
                          setFieldTouched("class", false);
                        }}
                      />
                    )}
                  </div>
                  <Button
                    text="Show"
                    tabIndex={4}
                    onClick={() => preFunction.handleErrorFocus(errors)}
                    type="submit"
                  />
                  {showRes ? (
                    <div className="row no-gutters border p-3 mt-3">
                      {data.length > 0 && (
                        <div className="mb-3 text-right">
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
                      <>
                        <div className="table-responsive p-0">
                          <table
                            className="table table-bordered report-table table-bordered"
                            id="pdf-table"
                          >
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th>{RENAME?.course}</th>
                                <th>
                                  {collegeConfig.institution_type === 1
                                    ? RENAME?.sem
                                    : "Study Year"}
                                </th>
                                <th width="5%">Opening (₹)</th>
                                <th width="5%">Paid (₹)</th>
                                <th width="5%">Balance (₹)</th>
                              </tr>
                            </thead>
                            {data.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td colSpan={9} align="center">
                                    No Student found
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
                              <tbody>
                                {data.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{item.courseName}</td>
                                      <td>
                                        {collegeConfig.institution_type === 1
                                          ? item.className
                                          : item.studyYear}
                                      </td>
                                      <td align="right">
                                        {item.openingBalance}
                                      </td>
                                      <td align="right">{item.paid}</td>
                                      <td align="right">{item.balance}</td>
                                    </tr>
                                  );
                                })}
                                <tr
                                  style={{
                                    lineHeight: "32px",
                                  }}
                                >
                                  <td
                                    className="table-total"
                                    align="right"
                                    colSpan={3}
                                  >
                                    Total
                                  </td>
                                  <td className="table-total" align="right">
                                    {openingTotal}
                                  </td>
                                  <td className="table-total" align="right">
                                    {paidTotal}
                                  </td>
                                  <td className="table-total" align="right">
                                    {dueTotal}
                                  </td>
                                </tr>
                              </tbody>
                            )}
                          </table>

                          {showLoadMore ? (
                            <Button
                              text="Show All"
                              type="button"
                              onClick={(e) => handleShow(values, 1)}
                            />
                          ) : null}
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
export default DueSummary;
