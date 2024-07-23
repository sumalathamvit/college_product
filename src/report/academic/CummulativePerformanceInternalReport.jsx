import React, { useEffect, useState, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { Formik } from "formik";
import academicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import AuthContext from "../../auth/context";
import ScreenTitle from "../../component/common/ScreenTitle";
import $ from "jquery";
import {
  boldStyle,
  topLineStyleWithBorder,
} from "../../component/common/CommonArray";
import moment from "moment";

function CummulativePerformanceInternalReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [showStudent, setShowStudent] = useState(false);
  const formikRef = useRef();
  const [testNameList, setTestNameList] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [InternalTestDetails, setInternalTestDetails] = useState([]);
  const [gradeData, setGradeData] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.object().notRequired(),
    course: $("#course").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#course").attr("alt") ?? RENAME?.course}`
        ),
    semester: $("#semester").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#semester").attr("alt") ?? RENAME?.sem}`
        ),
    section: $("#section").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#section").attr("alt") ?? RENAME?.section}`
        ),
    testName: Yup.object().required("Please select Test Name"),
  });

  const handleExport = async (data, type, values) => {
    console.log("data---", data, "type---", type, values);

    if (type === 1) {
      var filterContent = [];
      var filterContent1 = [];

      if (collegeConfig.is_university) {
        filterContent.push([
          {
            content: "College: " + values.college.collegeName,
            styles: boldStyle,
          },
        ]);
      }

      filterContent.push([
        {
          content:
            RENAME?.course +
            ": " +
            values.course.courseName +
            "    " +
            RENAME?.sem +
            ": " +
            values.semester.className +
            "    " +
            RENAME?.section +
            ": " +
            values.section.section,
          styles: { halign: "center", ...boldStyle },
          colSpan: 2,
        },
      ]);
      filterContent1.push([
        {
          content: "EXAM: " + values.testName.test,
          styles: boldStyle,
        },
        {
          content: "GRADE: " + InternalTestDetails?.classGrade,
          styles: boldStyle,
        },
      ]);
      filterContent1.push([
        {
          content:
            "NAME OF THE CLASS TEACHER: " + InternalTestDetails?.staffName,
          styles: boldStyle,
        },
        {
          content:
            "DATE OF EXAMINATION: " +
            moment(InternalTestDetails?.firstDate).format("DD/MM/YYYY"),
          styles: boldStyle,
        },
      ]);
      var head1 = [
        [
          { content: "No.", rowSpan: 3, styles: topLineStyleWithBorder },
          {
            content: "Student No.",
            rowSpan: 3,
            styles: topLineStyleWithBorder,
          },
          { content: "Name", rowSpan: 3, styles: topLineStyleWithBorder },
          {
            content: "Subject",
            colSpan: subjectData.length * 4,
            styles: { ...topLineStyleWithBorder, halign: "center" },
          },
          // { content: "Total", rowSpan: 2, styles: topLineStyleWithBorder },
          { content: "", styles: topLineStyleWithBorder },
          { content: "Grade", rowSpan: 3, styles: topLineStyleWithBorder },
          {
            content: "Attendance",
            rowSpan: 3,
            styles: { ...topLineStyleWithBorder, verticalText: 1 },
          },
          { content: "Rank", rowSpan: 3, styles: topLineStyleWithBorder },
        ],
      ];

      head1.push([
        ...subjectData.map((item) => ({
          content: item.subjectName.split(" ")[0],
          colSpan: 4,
          styles: { ...topLineStyleWithBorder, halign: "center" },
        })),
        {
          content: "Total",
          styles: { ...topLineStyleWithBorder, halign: "center" },
        },
      ]);

      let th = subjectData.map((item, index) => [
        {
          content: "20",
          styles: { ...topLineStyleWithBorder, halign: "right" },
        },
        {
          content: "80",
          styles: { ...topLineStyleWithBorder, halign: "right" },
        },
        {
          content: "100",
          styles: { ...topLineStyleWithBorder, halign: "right" },
        },
        {
          content: "G",
          styles: { ...topLineStyleWithBorder, halign: "center" },
        },
      ]);
      console.log("th---", th, ...th.map((item) => item).flat());

      head1.push([
        ...th.map((item) => item).flat(),

        {
          content: subjectData?.length * 100,
          styles: { ...topLineStyleWithBorder, halign: "right" },
        },
      ]);
      console.log("head1---", head1);
      var pdfData = [];

      data.map((item, index) => {
        pdfData.push([
          { content: index + 1, styles: { halign: "right" } },
          { content: item.enrollNo },
          { content: item.name },
          ...subjectData
            .map((item1, index) => [
              {
                content: item[item1.subjectCode + "_assignmentMark"],
                styles: { halign: "right" },
              },
              {
                content: item[item1.subjectCode + "_mark"],
                styles: { halign: "right" },
              },
              {
                content:
                  parseInt(item[item1.subjectCode + "_assignmentMark"]) +
                  parseInt(item[item1.subjectCode + "_mark"]),
                styles: { halign: "right" },
              },
              {
                content: item[item1.subjectCode + "_grade"],
                styles: { halign: "center" },
              },
            ])
            .flat(),
          { content: item.total, styles: { halign: "right" } },
          { content: item.grade, styles: { halign: "center" } },
          {
            content: Math.round(item.percentage) + "%",
            styles: { halign: "right" },
          },
          { content: item.rank, styles: { halign: "right" } },
        ]);
      });

      let pdfHeadToPass = [[], [], [...head1]];
      let pdfDataToPass = [filterContent, [...filterContent1], [...pdfData]];

      console.log("pdfHeadToPass---", pdfHeadToPass);
      console.log("pdfDataToPass---", pdfDataToPass);
      var columnWidth = [
        3,
        8,
        [],
        ...Array(4 * subjectData.length).fill(3),
        4,
        5,
        8,
        4,
      ];

      var colWidthToPass = [[], [77, 23], columnWidth];

      preFunction.generatePDFContent(
        collegeName,
        "CUMULATIVE MARKS " + InternalTestDetails?.yearData,
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass,
        "Portrait",
        "a3",
        true
        // "left"
      );
    }
  };

  const getSubjectStaff = async (course, semester) => {
    console.log("semester---", course, semester);
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldTouched("testName", false);
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("testName", "");
    setShowStudent(false);
    setSectionList([]);
    if (semester) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
            "subject",
            course.courseID,
            semester.batchID,
            semester.semester
          );
        console.log("Response---", getMasterSubjectStaffRes);
        setSectionList(getMasterSubjectStaffRes.data.message.data.section);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getBatchMaster = async (course) => {
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("testName", "");
    formikRef.current.setFieldTouched("course", false);
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldTouched("testName", false);
    console.log("text---", course);
    setSemesterList([]);
    if (course) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
            "batch",
            course.courseID
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSemesterList(getMasterSubjectStaffRes.data.message.data.batch);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleShowInternalMarks = async (values) => {
    console.log("values---", values);
    setData([]);

    const internalRes = await academicApi.getStudentCummulativeInternal(
      values.testName.testID,
      values.section.classID,
      values.semester.semester
    );
    console.log("internalRes---", internalRes);

    if (!internalRes.data.message.success) {
      setModalTitle("Message");
      setModalMessage(internalRes.data.message.message);
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }

    setSubjectData(internalRes.data.message.data.subjects);
    console.log(
      "internalRes.data.message.data.internal_performance_report---",
      internalRes.data.message.data.subjects
    );
    // To calculate total from assignment and marks
    internalRes.data.message.data.commutative_internal_performance_report.map(
      (item) => {
        let subjectTotal = 0;
        internalRes.data.message.data.subjects.map((item1) => {
          subjectTotal +=
            (item[item1.subjectCode + "_assignmentMark"] === "A"
              ? 0
              : parseInt(item[item1.subjectCode + "_assignmentMark"])) +
            parseInt(item[item1.subjectCode + "_mark"]);
        });
        item.subjectTotal = subjectTotal;
      }
    );

    // To calculate rank
    let numbers =
      internalRes.data.message.data.commutative_internal_performance_report.map(
        (item) => item.total
      );
    let ranks = calculateRanks(numbers);
    console.log(ranks);
    internalRes.data.message.data.commutative_internal_performance_report.map(
      (item, index) => {
        item.rank = ranks[index];
      }
    );
    // grade data calculation
    internalRes.data.message.data.commutative_internal_performance_report.map(
      (item) => {
        let avgMark = item.avg;
        let grade = gradeData.find(
          (grade) => grade.minMark <= avgMark && grade.maxMark >= avgMark
        );
        item.grade = grade?.grade;
      }
    );
    // calculate total Grade for Class
    let avgTotal = 0;
    internalRes.data.message.data.commutative_internal_performance_report.map(
      (item) => {
        avgTotal += item.avg;
      }
    );
    avgTotal =
      avgTotal /
      internalRes.data.message.data.commutative_internal_performance_report
        .length;
    console.log("avgTotal---", Math.round(avgTotal));
    let grade = gradeData.find(
      (grade) =>
        grade.minMark <= Math.round(avgTotal) &&
        grade.maxMark >= Math.round(avgTotal)
    );
    internalRes.data.message.data.testData.classGrade = grade?.grade;

    setData(
      internalRes.data.message.data.commutative_internal_performance_report
    );
    setInternalTestDetails(internalRes.data.message.data.testData);
    setShowStudent(true);
    setLoad(false);
  };

  const getCourseList = async (collegeID) => {
    console.log("collegeID---", collegeID);
    formikRef.current.setFieldValue("course", "");
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("subject", "");
    formikRef.current.setFieldValue("testName", "");
    formikRef.current.setFieldTouched("course", false);
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldTouched("testName", false);

    try {
      const getMasterSubjectStaffRes = await academicApi.getMasterSubjectStaff(
        collegeID,
        "course"
      );
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
      if (getMasterSubjectStaffRes.data.message.data.course.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          getMasterSubjectStaffRes.data.message.data.course[0]
        );
        getBatchMaster(getMasterSubjectStaffRes.data.message.data.course[0]);
      }

      const getAllTestRes = await academicApi.getAllTest(collegeID);
      console.log("getAllTestRes---", getAllTestRes);
      if (getAllTestRes.data.message.data.test.length > 0)
        setTestNameList(getAllTestRes.data.message.data.test);
      setGradeData(getAllTestRes.data.message.data.gradeData);
    } catch (error) {
      console.log(error);
    }
  };

  // Function to calculate ranks
  function calculateRanks(arr) {
    // Create an array of the numbers and their original indices
    let sorted = arr
      .map((num, idx) => ({ num, idx }))
      .sort((a, b) => b.num - a.num);

    // Assign ranks, handling ties by assigning the same rank to equal numbers
    let rank = 1;
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i].num !== sorted[i - 1].num) {
        rank = i + 1;
      }
      sorted[i].rank = rank;
    }

    // Map the ranks back to the original array
    let ranks = new Array(arr.length);
    for (let { idx, rank } of sorted) {
      ranks[idx] = rank;
    }
    return ranks;
  }

  useEffect(() => {
    // getCourseList(collegeId);
    if (!collegeConfig.is_university) getCourseList(collegeId);
    else {
      setCourseList([]);
      setTestNameList([]);
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
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              college: null,
              course: null,
              semester: null,
              section: null,
              subject: null,
              testName: null,
            }}
            validationSchema={FormSchema}
            onSubmit={handleShowInternalMarks}
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
                  <div className="col-lg-8">
                    {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={0}
                        label="College"
                        id="college"
                        mandatory={1}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setFieldTouched("college", false);
                          getCourseList(text.collegeID);
                          setFieldValue("course", "");
                          setFieldValue("semester", "");
                          setFieldValue("section", "");
                          setFieldValue("testName", "");
                          setShowStudent(false);
                        }}
                      />
                    )}
                    {courseList.length > 1 && (
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        tabIndex={1}
                        label={RENAME?.course}
                        id="course"
                        mandatory={1}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.courseID}
                        options={courseList}
                        onChange={(text) => {
                          setShowStudent(false);
                          setFieldTouched("course", false);
                          setFieldValue("course", text);
                          getBatchMaster(text);
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      tabIndex={2}
                      label={RENAME?.sem}
                      id="semester"
                      mandatory={1}
                      maxlength={10}
                      getOptionLabel={(option) => option.className}
                      getOptionValue={(option) => option.semester}
                      options={semesterList}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setShowStudent(false);
                        setFieldValue("semester", text);
                        setFieldTouched("semester", false);
                        getSubjectStaff(values?.course, text);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={3}
                      label={RENAME?.section}
                      id="section"
                      mandatory={1}
                      maxlength={1}
                      getOptionLabel={(option) => option.section}
                      getOptionValue={(option) => option.classID}
                      options={sectionList}
                      style={{ width: "30%" }}
                      onChange={(text) => {
                        setShowStudent(false);
                        setFieldTouched("section", false);
                        setFieldValue("section", text);
                      }}
                    />

                    <SelectFieldFormik
                      tabIndex={4}
                      label="Test Name"
                      id="testName"
                      mandatory={1}
                      maxlength={15}
                      getOptionLabel={(option) => option.test}
                      getOptionValue={(option) => option.testID}
                      options={testNameList}
                      style={{ width: "50%" }}
                      searchIcon={false}
                      onChange={(text) => {
                        setFieldValue("testName", text);
                      }}
                    />
                  </div>
                  <Button
                    tabIndex={5}
                    text={"Show"}
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />
                </form>
              );
            }}
          </Formik>
          {showStudent && (
            <>
              <div className="row">
                <div className="subhead-row p-0">
                  <div className="subhead">Student List</div>
                  <div className="col line-div"></div>
                </div>
                {data.length > 0 && (
                  <div className="mb-2 text-right">
                    {/* <button
                    type="button"
                    className="btn"
                    onClick={() => handleExport(data, 2, formikRef?.current?.values)}
                  >
                    Export Excel
                  </button> */}
                    &nbsp; &nbsp;
                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        handleExport(data, 1, formikRef?.current?.values)
                      }
                    >
                      Export PDF
                    </button>
                  </div>
                )}

                <div className="row no-gutters mt-2">
                  <div className="table-responsive p-0">
                    {data.length > 0 ? (
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th width="1%" rowSpan={3}>
                              No.
                            </th>
                            <th width="8%" rowSpan={3}>
                              Student No.
                            </th>
                            <th rowSpan={3}>Student Name</th>
                            <th
                              colSpan={subjectData?.length * 4}
                              style={{ textAlign: "center" }}
                            >
                              Subject
                            </th>
                            <th></th>
                            <th
                              rowSpan={3}
                              // className="vertical-text"
                            >
                              Grade
                            </th>
                            <th
                              rowSpan={3}
                              width="5%"
                              // className="vertical-text"
                            >
                              Attendance
                            </th>
                            <th
                              rowSpan={3}
                              width="3%"
                              // className="vertical-text"
                            >
                              Rank
                            </th>
                          </tr>
                          <tr>
                            {subjectData.map((item, index) => (
                              <th colSpan={4} style={{ textAlign: "center" }}>
                                {item.subjectName.split(" ")[0]}
                              </th>
                            ))}
                            <th>Total</th>
                          </tr>
                          <tr>
                            {subjectData.map((item, index) => (
                              <>
                                <th style={{ textAlign: "center" }}>20</th>
                                <th style={{ textAlign: "center" }}>80</th>
                                <th style={{ textAlign: "center" }}>100</th>
                                <th style={{ textAlign: "center" }}>G</th>
                              </>
                            ))}
                            <th style={{ textAlign: "right" }}>
                              {subjectData?.length * 100}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((item, index) => {
                            return (
                              <tr>
                                <td>{index + 1}</td>
                                <td>{item.enrollNo}</td>
                                <td>{item.name}</td>
                                {subjectData.map((item1, index) => {
                                  return (
                                    <>
                                      <td class="text-center">
                                        {item[
                                          item1.subjectCode + "_assignmentMark"
                                        ] === null
                                          ? "NA"
                                          : item[
                                              item1.subjectCode +
                                                "_assignmentMark"
                                            ]}
                                      </td>
                                      <td class="text-center">
                                        {item[item1.subjectCode + "_mark"] ===
                                        null
                                          ? "NA"
                                          : item[item1.subjectCode + "_mark"]}
                                      </td>
                                      <td class="text-center">
                                        {item[
                                          item1.subjectCode + "_assignmentMark"
                                        ] === "A"
                                          ? "0"
                                          : parseInt(
                                              item[
                                                item1.subjectCode +
                                                  "_assignmentMark"
                                              ]
                                            ) +
                                            parseInt(
                                              item[item1.subjectCode + "_mark"]
                                            )}
                                      </td>
                                      <td class="text-center">
                                        {item[item1.subjectCode + "_grade"] ===
                                        null
                                          ? ""
                                          : item[item1.subjectCode + "_grade"]}
                                      </td>
                                    </>
                                  );
                                })}
                                {/* <td align="right">{item.total}</td> */}
                                <td align="right">{item.subjectTotal}</td>
                                <td>{item.grade}</td>
                                <td align="right">
                                  {Math.round(item.percentage) + "%"}
                                </td>
                                <td align="right">{item.rank}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th width="1%" rowSpan={3}>
                              No.
                            </th>
                            <th width="15%">Student No.</th>
                            <th>Student Name</th>
                            <th>Subject</th>
                            <th>Total</th>
                            <th>Grade</th>
                            <th>Attendance</th>
                            <th>Rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={8} align="center">
                              No data found
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
                <div className="row no-gutters">
                  {subjectData.map((item, index) => (
                    <div className="p-1">{item.subjectName}</div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CummulativePerformanceInternalReport;
