import React, { useEffect, useState, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";

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

function TermWiseDue() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [termList, setTermList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [openingTotal, setOpeningTotal] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);
  const [dueTotal, setDueTotal] = useState(0);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const reportSchema = Yup.object().shape({
    course: Yup.object().required("Please select " + RENAME?.course),
  });

  const handleTermDueCSVData = async (values, report) => {
    setLoad(true);
    console.log("reportValues---", values);
    if (report === 1) {
      let filterContent = [];
      if (
        formikRef.current.values.course ||
        formikRef.current.values.term ||
        formikRef.current.values.class
      ) {
        filterContent.push([
          {
            content:
              (formikRef.current.values.course
                ? RENAME?.course +
                  ": " +
                  formikRef.current.values.course.courseName
                : "") +
              (formikRef.current.values.term
                ? "  Term: " + formikRef.current.values.term.term
                : "") +
              (formikRef.current.values.class
                ? RENAME?.sem + " : " + formikRef.current.values.class.className
                : ""),
            styles: boldStyle,
          },
        ]);
      }
      let head1 = [
        [
          { content: "No.", styles: topLineStyle },
          { content: "Student No.", styles: topLineStyle },
          { content: "Student Name", styles: topLineStyle },
          { content: "Particular", styles: topLineStyle },
          {
            content: "Opening Bal (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Paid Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Due Amt (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
        ],
      ];
      let pdfData = [];
      let openingAmt = 0;
      let paidAmt = 0;
      let dueAmt = 0;
      values.map((item, index) => {
        openingAmt += parseInt(item.OpeningBalance);
        paidAmt += item.Paid ? parseInt(item.Paid) : 0;
        dueAmt += item.Balance ? parseInt(item.Balance) : 0;
        pdfData.push([
          {
            content: index + 1,
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
            content: item.OpeningBalance,
            styles: { halign: "right" },
          },
          {
            content: item.Paid,
            styles: { halign: "right" },
          },
          {
            content: item.Balance,
            styles: { halign: "right" },
          },
        ]);
      });
      pdfData.push([
        {
          content: "Total",
          colSpan: 4,
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
          content: dueAmt,
          styles: totStyle,
        },
      ]);

      let pdfHeadToPass = [[], [...head1]];

      let pdfDataToPass = [filterContent, [...pdfData]];

      let columnWidth = [5, 10, 24, 28, 13, 10, 10];
      let colWidthToPass = [[], [...columnWidth]];

      preFunction.generatePDFContent(
        collegeName,
        "Term Wise Due Report",
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass,
        "landscape"
      );

      setLoad(false);
      return;
    } else {
      var csvData = [
        [
          "No.",
          "Student Number",
          "Student Name",
          "Particular",
          "Opening Balance (Rs.)",
          "Paid Amount (Rs.)",
          "Due Amount (Rs.)",
        ],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.enrollNo,
          item.name,
          item.particular,
          item.OpeningBalance,
          item.Paid,
          item.Balance,
        ];
      });
      const rowArray = ["", "", "", "Total", openingTotal, paidTotal, dueTotal];
      csvData.push(rowArray);

      preFunction.downloadCSV(csvData, "Term wise Due Report.csv");
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
      const dueParticularWiseRes = await StudentApi.getTermWiseDueReport(
        values.course ? values.course.id : null,
        values.term ? values.term.term : null,
        values.class ? values.class.semester : null,
        showAll
      );
      console.log("Due ParticularWise ---", dueParticularWiseRes);
      if (report) {
        handleTermDueCSVData(
          dueParticularWiseRes.data.message.data.term_wise_report,
          report
        );
      }
      setData(dueParticularWiseRes.data.message.data.term_wise_report);
      let openingTotalSum = 0;
      let paidTotalSum = 0;
      let dueTotalSum = 0;

      dueParticularWiseRes.data.message.data.term_wise_report.map(
        (item, index) => {
          openingTotalSum += item.OpeningBalance;
          paidTotalSum += item.Paid;
          dueTotalSum += item.Balance;
        }
      );
      setOpeningTotal(openingTotalSum);
      setPaidTotal(paidTotalSum);
      setDueTotal(dueTotalSum);
      if (showAll === 0) {
        if (
          dueParticularWiseRes.data.message.data.term_wise_report.length >=
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

  const getAllList = async (college_id, course) => {
    try {
      const masterRes = await StudentApi.getMaster(5, college_id);
      console.log("MasterRes----", masterRes);
      if (masterRes.data.message.data.course_data.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          masterRes.data.message.data.course_data[0]
        );
      }
      setTermList(masterRes.data.message.data.term_data);

      const classRes = await StudentApi.getMaster(
        8,
        college_id,
        course ? course.id : null
      );
      console.log("classRes----", classRes);
      setCourseList(classRes.data.message.data.course_data);
      setClassList(classRes.data.message.data.semester_data);
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
              class: "",
              course: "",
              term: "",
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
                    {courseList.length > 1 && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label={RENAME?.course}
                        id="course"
                        mandatory={1}
                        options={courseList}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.id}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setFieldValue("batch", "");
                          setFieldValue("class", "");
                          getAllList(collegeId, text);
                          setShowRes(false);
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      autoFocus={courseList.length <= 1}
                      label="Term"
                      id="term"
                      clear={true}
                      tabIndex={2}
                      options={termList}
                      getOptionLabel={(option) => option.term}
                      getOptionValue={(option) => option.id}
                      onChange={(text) => {
                        setShowRes(false);
                        setFieldValue("term", text);
                      }}
                    />
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
                        setShowRes(false);
                      }}
                    />
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
                                <th width="5%">Student No.</th>
                                <th width="15%">Student Name</th>
                                <th>Particular</th>
                                <th width="5%">Opening Balance (₹)</th>
                                <th width="5%">Paid Amount (₹)</th>
                                <th width="5%">Due Amount (₹)</th>
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
                                      <td>{item.enrollNo}</td>
                                      <td>{item.name}</td>
                                      <td>{item.particular}</td>
                                      <td align="right">
                                        {item.OpeningBalance}
                                      </td>
                                      <td align="right">{item.Paid}</td>
                                      <td align="right">{item.Balance}</td>
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
                                    colSpan={4}
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
export default TermWiseDue;
