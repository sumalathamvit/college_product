import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";
import AcademicApi from "../../api/AcademicApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import AuthContext from "../../auth/context";
import string from "../../string";
import {
  boldStyle,
  topLineStyle,
  totStyle,
} from "../../component/common/CommonArray";

function ConsolidatedDueCollegeHostelFees() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const [dueTotal, setDueTotal] = useState(0);
  const [collegeTotal, setCollegeTotal] = useState(0);
  const [hostelTotal, setHostelTotal] = useState(0);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const formSchema = Yup.object().shape({
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
              collegeConfig.institution_type === 1
                ? RENAME?.sem
                : RENAME?.batch,
            styles: topLineStyle,
          },
          {
            content: "College Fees (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Hostel Fees (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Total (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
        ],
      ];
      let pdfData = [];
      let collegeAmt = 0;
      let hostelAmt = 0;
      let total = 0;
      values.map((item, index) => {
        collegeAmt += parseInt(item.CollegeFees);
        hostelAmt += item.HostelFees ? parseInt(item.HostelFees) : 0;
        total += item.Total ? parseInt(item.Total) : 0;
        pdfData.push([
          {
            content: index + 1,
          },
          {
            content: item.courseName,
          },
          {
            content: item.batch,
          },
          {
            content: item.CollegeFees,
            styles: { halign: "right" },
          },
          {
            content: item.HostelFees,
            styles: { halign: "right" },
          },
          {
            content: item.Total,
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
          content: collegeAmt,
          styles: totStyle,
        },
        {
          content: hostelAmt,
          styles: totStyle,
        },
        {
          content: total,
          styles: totStyle,
        },
      ]);

      let pdfHeadToPass = [[], [...head1]];

      let pdfDataToPass = [filterContent, [...pdfData]];

      let columnWidth = [5, 40, 15, 15, 15, 10];
      let colWidthToPass = [[], [...columnWidth]];

      preFunction.generatePDFContent(
        formikRef.current.values.college
          ? formikRef.current.values.college.collegeName
          : collegeName,
        "Consolidated Due College and Hostel Fees",
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
          RENAME?.course,
          RENAME?.batch,
          "College Fees",
          "Hostel Fees",
          "Total",
        ],
      ];
      values.map((item, index) => {
        csvData[index + 1] = [
          index + 1,
          item.courseName,
          item.batch,
          item.CollegeFees,
          item.HostelFees,
          item.Total,
        ];
      });
      const rowArray = ["", "", "Total", collegeTotal, hostelTotal, dueTotal];
      csvData.push(rowArray);

      preFunction.downloadCSV(csvData, "Due College and Hostel Fees.csv");
    }
    setLoad(false);
  };

  const handleShow = async (values, showAll = 0, report = 0) => {
    if (load) return;
    setShowLoadMore(false);
    console.log("values--------", showAll, values);
    setCollegeTotal(0);
    setHostelTotal(0);
    setDueTotal(0);

    try {
      setLoad(true);
      setShowRes(true);
      if (report == 0) {
        setData([]);
      }
      if (showAll == 1) {
        setShowLoadMore(false);
      }
      const dueCollegeHostelRes =
        await StudentApi.getConsolidatedDueCollegeHostel(
          collegeConfig.is_university ? values?.college?.collegeID : collegeId,
          values.course ? values.course.id : null,
          values.batch ? values.batch.batchID : null,
          showAll
        );
      console.log("dueCollegeHostelRes ---", dueCollegeHostelRes);
      if (report) {
        handleDueAbstractCSVData(
          dueCollegeHostelRes.data.message.data.due_college_and_hostel_report,
          report
        );
      }
      setData(
        dueCollegeHostelRes.data.message.data.due_college_and_hostel_report
      );
      let collegeTotalSum = 0;
      let hostelTotalSum = 0;
      let totalSum = 0;

      dueCollegeHostelRes.data.message.data.due_college_and_hostel_report.map(
        (item, index) => {
          collegeTotalSum += item.CollegeFees;
          hostelTotalSum += item.HostelFees;
          totalSum += item.Total;
        }
      );
      setCollegeTotal(collegeTotalSum);
      setHostelTotal(hostelTotalSum);
      setDueTotal(totalSum);
      if (showAll == 0) {
        if (
          dueCollegeHostelRes.data.message.data.due_college_and_hostel_report
            .length >= string.PAGE_LIMIT
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
          setLoad(false);
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

  useEffect(() => {}, []);

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
              course: "",
            }}
            validationSchema={formSchema}
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
                        clear={true}
                        onChange={(text) => {
                          setShowRes(false);
                          setFieldValue("college", text);
                          getAllList(text?.collegeID);
                          setFieldValue("course", "");
                          setFieldValue("batch", "");
                          setFieldTouched("course", false);
                          setFieldTouched("batch", false);
                          setFieldTouched("college", false);
                        }}
                      />
                    )}
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
                        setShowRes(false);
                        handleCourseChange(text);
                      }}
                    />
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
                                <th>Course</th>
                                <th width="10%">Batch</th>
                                <th width="5%">College Fees (₹)</th>
                                <th width="5%">Hostel Fees (₹)</th>
                                <th width="5%">Total (₹)</th>
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
                                      <td>{item.batch}</td>
                                      <td align="right">{item.CollegeFees}</td>
                                      <td align="right">{item.HostelFees}</td>
                                      <td align="right">{item.Total}</td>
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
                                    {collegeTotal}
                                  </td>
                                  <td className="table-total" align="right">
                                    {hostelTotal}
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
export default ConsolidatedDueCollegeHostelFees;
