import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { Formik } from "formik";
import { useSelector } from "react-redux";

import academicApi from "../api/AcademicApi";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";

import StudentApi from "../api/StudentApi";

import AuthContext from "../auth/context";
import { topLineStyle } from "../component/common/CommonArray";
import ScreenTitle from "../component/common/ScreenTitle";

function ExamFeesReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);
  const [subjectArr, setSubjectArr] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [sectionList, setSectionList] = useState([]);

  const [showRes, setShowRes] = useState(false);

  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.object().nullable(),
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required("Please select " + RENAME?.batch),
    section: Yup.object().required("Please select " + RENAME?.section),
  });
  const handleExport = async (data, type) => {
    if (load) return;
    try {
      setLoad(true);
      console.log("type", type, "data---", data);
      if (type == 1) {
        var head1 = [
          [
            {
              content: "No.",
              rowSpan: 2,
              styles: topLineStyle,
            },
            {
              content: "Univ. Reg. No.",
              rowSpan: 2,
              styles: topLineStyle,
            },
            {
              content: "Name",
              rowSpan: 2,
              styles: topLineStyle,
            },
            { content: "Arrear", colSpan: 2, styles: topLineStyle },
            { content: "Current", colSpan: 4, styles: topLineStyle },
            { content: "Amount (Rs.)", colSpan: 4, styles: topLineStyle },
          ],
        ];
        head1.push([
          {
            content: "Theory",
            styles: topLineStyle,
          },
          {
            content: "Practical",
            styles: topLineStyle,
          },
          {
            content: "Theory",
            styles: topLineStyle,
          },
          {
            content: "Practical",
            styles: topLineStyle,
          },
          {
            content: "Project",
            styles: topLineStyle,
          },
          {
            content: "VivaVoce",
            styles: topLineStyle,
          },
          {
            content: "Theory (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Practical (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Others (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
          {
            content: "Total (Rs.)",
            styles: { ...topLineStyle, halign: "right" },
          },
        ]);
        let pdfData = [];
        data.map((item, index) => {
          pdfData.push([
            { content: index + 1 },
            { content: item.registrationNo ?? " " },
            { content: item.name },
            { content: item.ArrTheoryCount ?? 0 },
            {
              content: item.ArrPracticalCount ?? 0,
            },
            { content: item.TheoryCount ?? 0 },
            {
              content: item.PracticalCount ?? 0,
            },
            { content: item.ProjectCount ?? 0 },
            { content: item.VivaCount ?? 0 },
            {
              content: item.theory
                ? (item.TheoryCount + item.ArrTheoryCount) * item.theory
                : 0,
              styles: { halign: "right" },
            },
            {
              content: item.practical
                ? (item.ArrPracticalCount + item.PracticalCount) *
                  item.practical
                : 0,
              styles: { halign: "right" },
            },
            { content: item.otherFees ?? 0, styles: { halign: "right" } },
            {
              content:
                (item.ArrPracticalCount + item.PracticalCount) *
                  item.practical +
                (item.TheoryCount + item.ArrTheoryCount) * item.theory +
                item.otherFees,
              styles: { halign: "right" },
            },
          ]);
        });
        var columnWidth = [5, 10, 15, 6, 6, 6, 6, 6, 6, 8, 10, 8, 8];
        console.log("pdfData---", pdfData);

        preFunction.generatePDFContent(
          collegeName,
          "Exam Fees Report",
          [head1],
          [pdfData],
          [columnWidth],
          "landscape"
        );
      } else {
        var csvData = [
          [
            "No.",
            "University Reg.No",
            "Name",
            "Arrea-Theory",
            "Arrea-Practical",
            "Curren-Theory",
            "Curren-Practical",
            "Curren-Project",
            "Curren-Viva Voce",
            "Amount-Theory",
            "Amount-Practical",
            "Amount-Others",
            "Amount-Total",
          ],
        ];

        data.map((item, index) => {
          csvData.push([
            index + 1,
            item.registrationNo,
            item.name,
            item.ArrTheoryCount === null ? 0 : item.ArrTheoryCount,
            item.ArrPracticalCount === null ? 0 : item.ArrPracticalCount,
            item.TheoryCount === null ? 0 : item.TheoryCount,
            item.PracticalCount === null ? 0 : item.PracticalCount,
            item.ProjectCount === null ? 0 : item.ProjectCount,
            item.VivaCount === null ? 0 : item.VivaCount,
            item.theory === null ? 0 : item.theory,
            item.practical === null ? 0 : item.practical,
            item.otherFees === null ? 0 : item.otherFees,
            item.theory + item.practical + item.otherFees,
          ]);
        });

        console.log("csvData---", csvData);
        preFunction.downloadCSV(csvData, "Exam Fees Report" + ".csv");
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleCourseChange = async (values) => {
    try {
      formikRef.current.setFieldValue("batch", null);
      formikRef.current.setFieldTouched("course", false);
      formikRef.current.setFieldTouched("batch", false);
      if (values) {
        const batchRes = await academicApi.getMasterSubjectStaff(
          collegeConfig?.is_university ? values?.college?.collegeID : collegeId,
          "batch",
          values.id
        );
        console.log("batchRes", batchRes);
        setBatchList(batchRes.data.message.data.batch);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleShowAllocation = async (values) => {
    if (load) return;
    console.log("values---", values);
    setSubjectArr([]);
    try {
      setLoad(true);
      const getStaffSubjectRes = await academicApi.getExamFeesReportExport(
        values.batch.batchID,
        values.course.id,
        values.batch.semester
      );
      console.log("getStaffSubjectRes---", getStaffSubjectRes);
      // return;
      setSubjectArr(getStaffSubjectRes.data.message.data);
      setShowRes(true);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleCourse = async (values, course) => {
    formikRef.current.setFieldValue("batch", null);
    if (values) {
      let batchRes;
      if (collegeConfig.institution_type === 1) {
        batchRes = await StudentApi.getMaster(
          8,
          collegeConfig.is_university ? values.collegeID : collegeId,
          course.id
        );
        setBatchList(batchRes.data.message.data.semester_data);
      } else {
        batchRes = await StudentApi.getMaster(
          5,
          collegeConfig.is_university ? values.collegeID : collegeId,
          course.id
        );
        setBatchList(batchRes.data.message.data.batch_data);
      }
      console.log("batchRes----", batchRes);
    }
  };

  const getMasterList = async (college_id) => {
    try {
      let masterList;
      if (collegeConfig.institution_type === 1) {
        masterList = await StudentApi.getMaster(8, college_id);
      } else {
        masterList = await StudentApi.getMaster(5, college_id);
      }
      console.log("masterList", masterList);
      setCourseList(masterList?.data?.message?.data?.course_data);

      if (masterList?.data?.message?.data?.course_data.length === 1) {
        formikRef?.current?.setFieldValue(
          "course",
          masterList?.data?.message?.data?.course_data[0]
        );
        handleCourse(
          formikRef.current.values,
          masterList?.data?.message?.data?.course_data[0]
        );
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const handleBatchChange = async (values, batch) => {
    formikRef.current.setFieldTouched("batch", false);
    try {
      if (values) {
        const batchRes = await academicApi.getMasterSubjectStaff(
          collegeConfig?.is_university ? values?.college?.collegeID : collegeId,
          "subject",
          values.course.id,
          batch.batchID,
          batch.semester
        );
        console.log("batchRes", batchRes);

        setSectionList(batchRes.data.message.data.section);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig?.is_university) {
      getMasterList(collegeId);
    }
  }, [collegeConfig?.is_university]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: null,
              course: null,
              batch: null,
              section: null,
              semester: null,
            }}
            validationSchema={FormSchema}
            onSubmit={handleShowAllocation}
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
                  <div className="col-lg-10">
                    {collegeConfig?.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={0}
                        labelSize={2}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig?.collegeList}
                        getOptionLabel={(option) => option?.collegeName}
                        getOptionValue={(option) => option?.collegeID}
                        style={{ width: "60%" }}
                        searchIcon={false}
                        clear={false}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setFieldValue("course", null);
                          setFieldValue("batch", null);
                          getMasterList(text?.collegeID);
                          setShowRes(false);
                        }}
                      />
                    ) : null}
                    {courseList.length > 1 && (
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        label={RENAME?.course}
                        labelSize={2}
                        id="course"
                        tabIndex={1}
                        options={courseList}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.id}
                        style={{ width: "60%" }}
                        matchFrom="start"
                        mandatory={1}
                        maxlength={40}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setFieldValue("section", null);
                          setShowRes(false);
                          handleCourseChange(text);
                        }}
                      />
                    )}
                    {collegeConfig.institution_type === 1 ? (
                      <SelectFieldFormik
                        label={RENAME?.sem}
                        labelSize={2}
                        tabIndex={2}
                        id="batch"
                        options={batchList}
                        maxlength={10}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        matchFrom="start"
                        mandatory={1}
                        style={{ width: "40%" }}
                        onChange={(text) => {
                          setFieldValue("batch", text);
                          setFieldValue("section", null);
                          setShowRes(false);
                          handleBatchChange(values, text);
                        }}
                      />
                    ) : (
                      <SelectFieldFormik
                        label={RENAME?.batch}
                        labelSize={2}
                        tabIndex={2}
                        id="batch"
                        options={batchList}
                        maxlength={10}
                        getOptionLabel={(option) => option.batch}
                        getOptionValue={(option) => option.batchID}
                        matchFrom="start"
                        mandatory={1}
                        style={{ width: "40%" }}
                        onChange={(text) => {
                          setFieldValue("batch", text);
                          setFieldValue("section", null);
                          setShowRes(false);
                          handleBatchChange(values, text);
                        }}
                      />
                    )}

                    <SelectFieldFormik
                      label={RENAME?.section}
                      labelSize={2}
                      tabIndex={3}
                      maxlength={2}
                      id="section"
                      options={sectionList}
                      mandatory={1}
                      getOptionLabel={(option) => option.section}
                      getOptionValue={(option) => option.classID}
                      style={{ width: "20%" }}
                      matchFrom="start"
                      onChange={(text) => {
                        setFieldValue("section", text);
                        setShowRes(false);
                      }}
                    />
                    <Button
                      isTable={true}
                      text={"Show"}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                      }}
                    />
                  </div>
                </form>
              );
            }}
          </Formik>

          {showRes && (
            <>
              <div className="row no-gutters border p-3 mt-3">
                {subjectArr.length > 0 && (
                  <div className="mb-3 text-right">
                    <button
                      type="button"
                      className="btn"
                      onClick={(e) => {
                        handleExport(subjectArr, 2);
                      }}
                    >
                      Export Excel
                    </button>
                    &nbsp; &nbsp;
                    <button
                      className="btn"
                      onClick={(e) => {
                        handleExport(subjectArr, 1);
                      }}
                    >
                      Export PDF
                    </button>
                  </div>
                )}
                <div className="table-responsive p-0">
                  <table
                    className="table table-bordered report-table table-bordered"
                    id="pdf-table"
                  >
                    <thead>
                      <tr>
                        <th rowspan="2">No.</th>
                        <th rowspan="2">Univ. Reg. No.</th>
                        <th rowspan="2" width="20%">
                          Name
                        </th>
                        <th width="15%" colspan="2" class="text-center">
                          Arrear
                        </th>
                        <th width="15%" colspan="4" class="text-center">
                          Current
                        </th>
                        <th width="15%" colspan="4" class="text-center">
                          Amount (₹)
                        </th>
                      </tr>
                      <tr>
                        <th width="7.5%" class="text-center">
                          Theory
                        </th>
                        <th width="7.5%" class="text-center">
                          Practical
                        </th>
                        <th width="7.5%" class="text-center">
                          Theory
                        </th>
                        <th width="7.5%" class="text-center">
                          Practical
                        </th>
                        <th width="7.5%" class="text-center">
                          Project
                        </th>
                        <th width="7.5%" class="text-center">
                          Viva Voce
                        </th>
                        <th width="5%" class="text-center">
                          Theory (₹)
                        </th>
                        <th width="5%" class="text-center">
                          Practical (₹)
                        </th>
                        <th width="5%" class="text-center">
                          Others (₹)
                        </th>
                        <th width="5%" class="text-center">
                          Total (₹)
                        </th>
                      </tr>
                    </thead>
                    {subjectArr.length === 0 ? (
                      <tr>
                        <td colspan={13} align="center">
                          No data found
                        </td>
                      </tr>
                    ) : (
                      <tbody>
                        {subjectArr.map((item, index) => {
                          return (
                            <tr>
                              <td class="text-center">{index + 1}</td>
                              <td>{item.registrationNo}</td>
                              <td>{item.name}</td>
                              <td class="text-center">
                                {item.ArrTheoryCount ?? 0}
                              </td>
                              <td class="text-center">
                                {item.ArrPracticalCount ?? 0}
                              </td>
                              <td class="text-center">
                                {item.TheoryCount ?? 0}
                              </td>
                              <td class="text-center">
                                {item.PracticalCount ?? 0}
                              </td>
                              <td class="text-center">
                                {item.ProjectCount ?? 0}
                              </td>
                              <td class="text-center">{item.VivaCount ?? 0}</td>
                              <td class="text-right">
                                {item.theory === null
                                  ? 0
                                  : (item.TheoryCount + item.ArrTheoryCount) *
                                    item.theory}
                              </td>
                              <td class="text-right">
                                {item.practical === null
                                  ? 0
                                  : (item.ArrPracticalCount +
                                      item.PracticalCount) *
                                    item.practical}
                              </td>
                              <td class="text-right">
                                {item.otherFees === null ? 0 : item.otherFees}
                              </td>
                              <td class="text-right">
                                {(item.ArrPracticalCount +
                                  item.PracticalCount) *
                                  item.practical +
                                  (item.TheoryCount + item.ArrTheoryCount) *
                                    item.theory +
                                  item.otherFees}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExamFeesReport;
