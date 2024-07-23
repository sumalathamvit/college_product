import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";
import moment from "moment";
import { useSelector } from "react-redux";
import { Tab, Tabs } from "react-bootstrap";
import $ from "jquery";

import academicApi from "../api/AcademicApi";
import AuthContext from "../auth/context";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../component/FormField/DateFieldFormik";
import ReactSelectField from "../component/FormField/ReactSelectField";
import TextField from "../component/FormField/TextField";
import ModalComponent from "../component/ModalComponent";
import ScreenTitle from "../component/common/ScreenTitle";

function StudentPerformanceUniv() {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [arrearData, setArrearData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [gradeList, setGradeList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [showStudent, setShowStudent] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState();
  const [overallData, setOverallData] = useState([]);
  const [isMark, setIsMark] = useState(false);
  const [entry, setEntry] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [missMatchData, setMissMatchData] = useState();
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [startYear, setStartYear] = useState();
  const { collegeId, setUnSavedChanges } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
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
  });

  const formikRef = useRef();

  const handleUnivMarkEntry = async (values, data) => {
    if (load) return;
    console.log("values---", values);
    console.log("data---", data);
    setUnSavedChanges(false);

    //array of object compare  same object field values entry mark1 and entry mark2

    let missMatchList = [];
    let missing = "";

    for (let i = 0; i < data.length; i++) {
      if (data[i].entryMark1 !== data[i].entryMark2) {
        missMatchList.push(data[i]);
        missing = missing + data[i].subjectName + ", ";
      }
    }
    console.log("missMatchList---", missMatchList);

    if (missMatchList.length > 0) {
      setMissMatchData(missing);
      setModalVisible(true);
      return;
    }

    if (!values.examDate) {
      setModalTitle("Exam Month-Year");
      setModalMessage("Please select Exam Month-Year");
      setModalErrorOpen(true);

      return;
    }
    let studentDetails = [];
    if (isMark) {
      for (let i = 0; i < data.length; i++) {
        console.log("data[i].entryMark1---", data[i].entryMark1);
        if (!data[i].entryMark1) {
          setModalTitle("Mark");
          setModalMessage(
            "Please enter mark for subject " + data[i].subjectName
          );
          setModalErrorOpen(true);

          return;
        }

        if (data[i].entryMark1 > data[i].maxMark) {
          setModalTitle("Mark");
          setModalMessage(
            `Please enter mark less than ${data[i].maxMark} for subject` +
              data[i].subjectName
          );
          setModalErrorOpen(true);
          return;
        }

        studentDetails[i] = {};
        studentDetails[i].subjectCourseID = data[i].subjectCourseID;
        studentDetails[i].mark = data[i].entryMark1;
        studentDetails[i].result = data[i].result1;
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        if (!data[i].gradeObj && !data[i].grade) {
          setModalTitle("Grade");
          setModalMessage(
            "Please select grade for subject " + data[i].subjectName
          );
          setModalErrorOpen(true);
          return;
        }

        studentDetails[i] = {};
        studentDetails[i].subjectCourseID = data[i].subjectCourseID;
        studentDetails[i].result = data[i].result;
        studentDetails[i].grade = data[i].gradeObj
          ? data[i].gradeObj.grade
          : data[i].grade;
      }
    }
    console.log(
      "studentDetails---",
      selectedStudent,
      selectedStudent.studentID,

      moment(values.examDate).format("MMM-yyyy"),
      studentDetails,
      isMark ? 1 : 0
    );
    try {
      setLoad(true);
      const insertUpdateUniversityPerformanceRes =
        await academicApi.insertUpdateUniversityPerformance(
          selectedStudent.studentID,
          moment(values.examDate).format("MMM-yyyy"),
          values.semester.semester,
          studentDetails,
          isMark ? 1 : 0,
          collegeConfig.institution_type
        );
      console.log(
        "insertUpdateUniversityPerformanceRes---",
        insertUpdateUniversityPerformanceRes
      );
      if (insertUpdateUniversityPerformanceRes.data.message.success) {
        toast.success(
          insertUpdateUniversityPerformanceRes.data.message.message
        );
        isMark
          ? getSubjectListMark(selectedStudent)
          : getSubjectListGrade(selectedStudent);

        // setData([]);
        // handleShowUnivPerformance(values);
      } else {
        setModalTitle("Message");
        setModalMessage(
          insertUpdateUniversityPerformanceRes.data.message.message
        );
        setModalErrorOpen(true);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const getSubjectStaff = async (course, semester) => {
    console.log("semester-semester---", course, semester);
    setShowStudent(false);
    setSectionList([]);
    if (semester) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "subject",
            course.courseID,
            semester.batchID,
            semester.semester
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSectionList(getMasterSubjectStaffRes.data.message.data.section);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getSemesterMaster = async (course) => {
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("section", "");
    // formikRef.current.setFieldValue("subject", "");
    // formikRef.current.setFieldValue("staff", "");
    console.log("text---", course);
    setSemesterList([]);
    if (course) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
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

  const getInitialList = async () => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getMasterSubjectStaff(
        collegeId,
        "course"
      );
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      console.log(error);
    }
  };

  // const handleShowUnivPerformance = async (values) => {
  //   console.log("values---", values);
  //   setData([]);

  //   const getUniversityPerformanceRes =
  //     await academicApi.getUniversityPerformance(
  //       values.semester.batchID,
  //       values.course.courseID,
  //       parseInt(values.semester.semester),
  //       values.section.classID,
  //       values.subject.subjectCourseID,
  //       values.subject.subjectID
  //     );
  //   console.log("getUniversityPerformanceRes---", getUniversityPerformanceRes);
  //   if (
  //     getUniversityPerformanceRes.data.message.data.staff.length === 0 ||
  //     getUniversityPerformanceRes.data.message.data.university_performance
  //       .length === 0
  //   ) {
  //     return;
  //   }
  //   setEmployeeList(getUniversityPerformanceRes.data.message.data.staff);
  //   setGradeList(getUniversityPerformanceRes.data.message.data.grade);
  //   formikRef?.current?.setFieldValue(
  //     "staff",
  //     getUniversityPerformanceRes.data.message.data.staff[0]
  //   );
  //   for (
  //     let i = 0;
  //     i <
  //     getUniversityPerformanceRes.data.message.data.university_performance
  //       .length;
  //     i++
  //   ) {
  //     if (
  //       getUniversityPerformanceRes.data.message.data.university_performance[i]
  //         .grade
  //     ) {
  //       for (
  //         let k = 0;
  //         k < getUniversityPerformanceRes.data.message.data.grade.length;
  //         k++
  //       ) {
  //         if (
  //           gradeList[k].grade ==
  //           getUniversityPerformanceRes.data.message.data
  //             .university_performance[i].grade
  //         )
  //           getUniversityPerformanceRes.data.message.data.university_performance[
  //             i
  //           ].gradeObj = gradeList[k];
  //       }
  //     }
  //   }
  //   setData(
  //     getUniversityPerformanceRes.data.message.data.university_performance
  //   );
  //   setShowStudent(true);
  // };

  const getStudentList = async (values) => {
    console.log("values---", values);
    setSelectedStudent();
    try {
      const getStudentListRes = await academicApi.getStudentByClass(
        values.section.classID
      );
      console.log("getStudentListRes---", getStudentListRes);

      setStudentList(getStudentListRes.data.message.data.student_details);
      setIsMark(getStudentListRes.data.message.data.isMark);
      // setIsMark(true);

      if (getStudentListRes.data.message.data.student_details.length > 0) {
        setSelectedStudent(
          getStudentListRes.data.message.data.student_details[0]
        );
        getStudentListRes.data.message.data.isMark
          ? // true
            getSubjectListMark(
              getStudentListRes.data.message.data.student_details[0]
            )
          : getSubjectListGrade(
              getStudentListRes.data.message.data.student_details[0]
            );
      }

      setData([]);
      setShowStudent(true);
    } catch (error) {
      console.log(error);
    }
  };

  const getSubjectListGrade = async (item) => {
    setUnSavedChanges(false);

    try {
      setData([]);
      const res = await academicApi.getUniversityPerformance(
        item.studentID,
        formikRef.current.values.semester.semester
      );
      console.log("res---", res);
      // return;
      setData(res.data.message.data.university_performance);
      // setEmployeeList(res.data.message.data.staff);
      setGradeList(res.data.message.data.grade);
      setArrearData(res.data.message.data.student_university_arrear);
      setOverallData(
        res.data.message.data.student_overall_university_performance
      );
      setShowStudent(true);
    } catch (error) {
      console.log(error);
    }
  };

  const getSubjectListMark = async (item) => {
    setUnSavedChanges(false);

    try {
      setData([]);
      const SubjectListMarkres =
        await academicApi.get_university_performance_mark_details(
          item.studentID,
          formikRef.current.values.semester.semester,
          collegeConfig.institution_type
        );
      console.log("SubjectListMarkres---", SubjectListMarkres);
      // return;

      //array of object filed values entry mark1 and entry mark2 set from same object university mark same as result
      for (
        let i = 0;
        i < SubjectListMarkres.data.message.data.university_performance.length;
        i++
      ) {
        SubjectListMarkres.data.message.data.university_performance[
          i
        ].entryMark1 = SubjectListMarkres.data.message.data
          .university_performance[i].absent
          ? "A"
          : SubjectListMarkres.data.message.data.university_performance[i]
              .universityMark;
        SubjectListMarkres.data.message.data.university_performance[
          i
        ].entryMark2 = SubjectListMarkres.data.message.data
          .university_performance[i].absent
          ? "A"
          : SubjectListMarkres.data.message.data.university_performance[i]
              .universityMark;
        SubjectListMarkres.data.message.data.university_performance[i].result1 =
          SubjectListMarkres.data.message.data.university_performance[i].result;
        SubjectListMarkres.data.message.data.university_performance[i].result2 =
          SubjectListMarkres.data.message.data.university_performance[i].result;
      }

      //array of object filed values entry mark1 and entry mark2 set from same object university mark same as result
      for (
        let i = 0;
        i <
        SubjectListMarkres.data.message.data.student_university_arrear.length;
        i++
      ) {
        SubjectListMarkres.data.message.data.student_university_arrear[
          i
        ].entryMark1 = SubjectListMarkres.data.message.data
          .student_university_arrear[i].absent
          ? "A"
          : SubjectListMarkres.data.message.data.student_university_arrear[i]
              .universityMark;
        SubjectListMarkres.data.message.data.student_university_arrear[
          i
        ].entryMark2 = SubjectListMarkres.data.message.data
          .student_university_arrear[i].absent
          ? "A"
          : SubjectListMarkres.data.message.data.student_university_arrear[i]
              .universityMark;
        SubjectListMarkres.data.message.data.student_university_arrear[
          i
        ].result1 =
          SubjectListMarkres.data.message.data.student_university_arrear[
            i
          ].result;
        SubjectListMarkres.data.message.data.student_university_arrear[
          i
        ].result2 =
          SubjectListMarkres.data.message.data.student_university_arrear[
            i
          ].result;
      }

      setData(SubjectListMarkres.data.message.data.university_performance);
      // setEmployeeList(SubjectListMarkres.data.message.data.staff);
      setGradeList(SubjectListMarkres.data.message.data.grade);
      setArrearData(
        SubjectListMarkres.data.message.data.student_university_arrear
      );
      setOverallData(
        SubjectListMarkres.data.message.data
          .student_overall_university_performance
      );
      setShowStudent(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTextChange = (e, item, index, type) => {
    console.log(data[index], "typeMark1");

    let value = e.target.value;
    // Regular expression to match only numbers (0-9) and the letter "A" (both uppercase and lowercase)
    const regex = /^[0-9Aa]*$/;
    value = value.replace(/A+/gi, "A");
    // console.log("---", data[index].universityMark, value);

    // if (isMark) {
    if (type === 1) {
      if (regex.test(value)) {
        if (value) {
          if (value.toUpperCase() === "A") {
            data[index].entryMark1 = value.toUpperCase();
            data[index].result1 = 0;
          } else {
            if (parseInt(value) > item.maxMark) {
              data[index].entryMark1 = item.maxMark;
            } else {
              data[index].entryMark1 = parseInt(value);
            }
            if (value >= item.minMark) data[index].result1 = 1;
            else data[index].result1 = 0;
          }
        } else {
          data[index].entryMark1 = "";
        }
        setData([...data]);
      } else {
        data[index].entryMark1 = "";
        setData([...data]);
      }
    } else {
      if (regex.test(value)) {
        console.log("value---", value);
        if (value) {
          if (value.toUpperCase() === "A") {
            data[index].entryMark2 = value.toUpperCase();

            data[index].result2 = 0;
          } else {
            if (parseInt(value) > item.maxMark) {
              data[index].entryMark2 = item.maxMark;
            } else {
              data[index].entryMark2 = parseInt(value);
            }
            if (value >= item.minMark) data[index].result2 = 1;
            else data[index].result2 = 0;
          }
        } else {
          data[index].entryMark2 = "";
        }

        setData([...data]);
      } else {
        data[index].entryMark2 = "";
        setData([...data]);
      }
    }
    // } else {
    //   if (regex.test(value)) {
    //     console.log("value---", value);
    //     if (value) {
    //       if (value.toUpperCase() === "A") {
    //         data[index].universityMark = value.toUpperCase();

    //         data[index].result = 0;
    //       } else {
    //         if (parseInt(value) > item.maxMark) {
    //           data[index].universityMark = item.maxMark;
    //         } else {
    //           data[index].universityMark = parseInt(value);
    //         }
    //         if (value >= item.minMark) data[index].result = 1;
    //         else data[index].result = 0;
    //       }
    //     } else {
    //       data[index].universityMark = "";
    //     }

    //     // setData([...data]);
    //   } else {
    //     data[index].universityMark = "";
    //     setData([...data]);
    //   }
    // }
  };

  const handleArrearTextChange = (e, item, index, type) => {
    let value = e.target.value;
    // Regular expression to match only numbers (0-9) and the letter "A" (both uppercase and lowercase)
    const regex = /^[0-9Aa]*$/;
    value = value.replace(/A+/gi, "A");
    if (type === 1) {
      if (regex.test(value)) {
        if (value) {
          if (value.toUpperCase() === "A") {
            arrearData[index].entryMark1 = value.toUpperCase();
            arrearData[index].result1 = 0;
          } else {
            if (parseInt(value) > item.maxMark) {
              arrearData[index].entryMark1 = item.maxMark;
            } else {
              arrearData[index].entryMark1 = parseInt(value);
            }
            if (value >= item.minMark) arrearData[index].result1 = 1;
            else arrearData[index].result1 = 0;
          }
        } else {
          arrearData[index].entryMark1 = "";
        }
        setArrearData([...arrearData]);
      } else {
        arrearData[index].entryMark1 = "";
        setArrearData([...arrearData]);
      }
    } else {
      if (regex.test(value)) {
        console.log("value---", value);
        if (value) {
          if (value.toUpperCase() === "A") {
            arrearData[index].entryMark2 = value.toUpperCase();

            arrearData[index].result2 = 0;
          } else {
            if (parseInt(value) > item.maxMark) {
              arrearData[index].entryMark2 = item.maxMark;
            } else {
              arrearData[index].entryMark2 = parseInt(value);
            }
            if (value >= item.minMark) arrearData[index].result2 = 1;
            else arrearData[index].result2 = 0;
          }
        } else {
          arrearData[index].entryMark2 = "";
        }

        setArrearData([...arrearData]);
      } else {
        data[index].entryMark2 = "";
        setArrearData([...arrearData]);
      }
    }
    // if (regex.test(value)) {
    //   console.log("value---", value);
    //   if (value) {
    //     if (value.toUpperCase() === "A") {
    //       arrearData[index].universityMark = value.toUpperCase();

    //       arrearData[index].result = 0;
    //     } else {
    //       if (parseInt(value) > item.maxMark) {
    //         arrearData[index].universityMark = item.maxMark;
    //       } else {
    //         arrearData[index].universityMark = parseInt(value);
    //       }
    //       if (value >= item.minMark) arrearData[index].result = 1;
    //       else arrearData[index].result = 0;
    //     }
    //   } else {
    //     arrearData[index].universityMark = "";
    //   }

    //   setData([...data]);
    // } else {
    //   arrearData[index].universityMark = "";
    //   setData([...data]);
    // }
  };

  useEffect(() => {
    getInitialList();
  }, []);

  const commonStyles = {
    textAlign: "center",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    border: "1px solid lightgray",
    cursor: "pointer",
  };

  const Entry = ({ entryNumber, currentEntry, setEntry }) => (
    <div
      className="col-3"
      style={{
        ...commonStyles,
        backgroundColor: entryNumber === currentEntry ? "#white" : "#f7f5f5 ",
        color: entryNumber === currentEntry ? "black" : "black",
        borderTopRightRadius: entryNumber === 1 ? 0 : 5,
        borderBottomRightRadius: entryNumber === 1 ? 0 : 5,
        borderTopLeftRadius: entryNumber === 2 ? 0 : 5,
        borderBottomLeftRadius: entryNumber === 2 ? 0 : 5,
      }}
      onClick={() => setEntry(entryNumber)}
    >
      {`Entry ${entryNumber}`}
    </div>
  );

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
      <div className="row no-gutters bg-white-report p-5">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters"></div>
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              course: null,
              semester: null,
              section: null,
              // semester: null,
              staff: null,
              examDate: "",
            }}
            validationSchema={FormSchema}
            onSubmit={getStudentList}
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
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={1}
                      label={RENAME?.course}
                      id="course"
                      mandatory={1}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      options={courseList}
                      onChange={(text) => {
                        setShowStudent(false);
                        setFieldValue("course", text);
                        setFieldTouched("course", false);
                        getSemesterMaster(text);
                      }}
                    />
                    <>
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
                          setFieldValue("section", null);
                          setStartYear(text.year.split("(")[1].split("-")[0]);
                        }}
                      />
                    </>
                    <>
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
                    </>
                  </div>
                  {!showStudent ? (
                    <Button
                      tabIndex={4}
                      isTable={true}
                      text={"Show"}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                      }}
                    />
                  ) : (
                    <>
                      <div className="row">
                        <div className="subhead-row p-0">
                          <div className="subhead">Mark Entry</div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="no-gutters col-5 pe-2">
                          <div className="row no-gutters mt-2 ">
                            <div style={{ overflow: "auto", height: "650px" }}>
                              <table className="univ-table table-bordered">
                                <thead>
                                  <tr>
                                    <th width="1%">No.</th>
                                    {collegeConfig.institution_type == 1 ? (
                                      <th width="15%">Student No.</th>
                                    ) : (
                                      <th width="15%">Registration No.</th>
                                    )}
                                    <th> Student Name</th>
                                  </tr>
                                </thead>
                                {studentList.length === 0 ? (
                                  <tbody>
                                    <tr>
                                      <td colspan={9} align="center">
                                        No Students found
                                      </td>
                                    </tr>
                                  </tbody>
                                ) : (
                                  <tbody>
                                    {studentList.map((item, index) => {
                                      return (
                                        <tr
                                          style={{
                                            cursor: "pointer",
                                          }}
                                          onClick={() => {
                                            setSelectedStudent(item);
                                            isMark
                                              ? getSubjectListMark(item)
                                              : getSubjectListGrade(item);
                                          }}
                                        >
                                          <td
                                            style={{
                                              backgroundColor:
                                                selectedStudent === item
                                                  ? "#2455b7"
                                                  : "white",
                                              color:
                                                selectedStudent === item
                                                  ? "white"
                                                  : null,
                                            }}
                                          >
                                            {index + 1}
                                          </td>
                                          <td
                                            style={{
                                              backgroundColor:
                                                selectedStudent === item
                                                  ? "#2455b7"
                                                  : "white",
                                              color:
                                                selectedStudent === item
                                                  ? "white"
                                                  : null,
                                            }}
                                          >
                                            {collegeConfig.institution_type == 1
                                              ? item.enrollNo
                                              : item.registrationNo}
                                          </td>
                                          <td
                                            style={{
                                              backgroundColor:
                                                selectedStudent === item
                                                  ? "#2455b7"
                                                  : "white",
                                              color:
                                                selectedStudent === item
                                                  ? "white"
                                                  : null,
                                            }}
                                          >
                                            {item.name}
                                          </td>
                                          {/* <td>
                                          <Button
                                            isTable={true}
                                            className={"btn-3"}
                                            text={"View"}
                                            type="button"
                                            onClick={() => getSubjectList(item)}
                                          />
                                        </td> */}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                )}
                              </table>
                            </div>
                          </div>
                        </div>
                        {isMark ? (
                          <div className="no-gutters col-7">
                            {selectedStudent && (
                              <Tabs id="uncontrolled-tab-example" fill>
                                <Tab
                                  eventKey={1}
                                  title="Current"
                                  className="p-2"
                                >
                                  <div className="mt-2 mb-1">
                                    Name : {selectedStudent.name}
                                  </div>
                                  {/* {data.length > 0 ? ( */}
                                  <div>
                                    <div
                                      style={{
                                        marginLeft: -30,
                                      }}
                                      className="mb-2"
                                    >
                                      <DateFieldFormik
                                        tabIndex={1}
                                        label="Exam Month :"
                                        id="examDate"
                                        labelSize={2}
                                        type="month"
                                        maxDate={moment().add(1, "years")}
                                        minDate={moment(startYear, "YYYY")}
                                        //minDate want compare semester start year

                                        mandatory={1}
                                        style={{
                                          width: "40%",
                                        }}
                                        monthCal={true}
                                        onChange={(e) => {
                                          setFieldValue(
                                            "examDate",
                                            e.target.value
                                          );
                                          setUnSavedChanges(true);
                                        }}
                                        showMonthYearPicker
                                      />
                                    </div>
                                    <div
                                      style={{
                                        overflow: "auto",
                                        // minHeight: 500,
                                      }}
                                    >
                                      <div className="row no-gutters mt-2">
                                        <Entry
                                          entryNumber={1}
                                          currentEntry={entry}
                                          setEntry={setEntry}
                                        />
                                        <Entry
                                          entryNumber={2}
                                          currentEntry={entry}
                                          setEntry={setEntry}
                                        />
                                      </div>
                                      {entry === 1 ? (
                                        <table className="table table-bordered ">
                                          <thead>
                                            <tr>
                                              <th width="1%">No.</th>
                                              <th>Subject</th>
                                              <th>{RENAME?.sem}</th>
                                              <th width="15%">Mark</th>
                                              <th>Result</th>
                                            </tr>
                                          </thead>
                                          {data.length === 0 ? (
                                            <tbody>
                                              <tr>
                                                <td colspan={9} align="center">
                                                  No data found
                                                </td>
                                              </tr>
                                            </tbody>
                                          ) : (
                                            <tbody>
                                              {data.map((item, index) => {
                                                return (
                                                  <tr>
                                                    <td className="text-center">
                                                      {index + 1}
                                                    </td>
                                                    <td>{item.subjectName}</td>
                                                    <td className="text-center">
                                                      {collegeConfig.institution_type ==
                                                      1
                                                        ? item.className
                                                        : item.semester}
                                                    </td>
                                                    <td align="center">
                                                      <TextField
                                                        tabIndex={index + 2}
                                                        isTable={true}
                                                        type="text"
                                                        id="mark"
                                                        maxlength={3}
                                                        value={
                                                          item.entryMark1
                                                            ? item.entryMark1
                                                            : ""
                                                        }
                                                        style={{
                                                          width: "60%",
                                                        }}
                                                        onChange={(e) => {
                                                          handleTextChange(
                                                            e,
                                                            item,
                                                            index,
                                                            1
                                                          );
                                                          setUnSavedChanges(
                                                            true
                                                          );
                                                        }}
                                                      />
                                                    </td>

                                                    <td className="text-center">
                                                      {data[index].result1
                                                        ? "PASS"
                                                        : data[index]
                                                            .result1 === 0
                                                        ? "FAIL"
                                                        : null}
                                                    </td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          )}
                                        </table>
                                      ) : (
                                        <table className="table table-bordered ">
                                          <thead>
                                            <tr>
                                              <th width="1%">No.</th>
                                              <th>Subject</th>
                                              <th>{RENAME?.sem}</th>
                                              <th width="15%">Mark</th>
                                              <th>Result</th>
                                            </tr>
                                          </thead>
                                          {data.length === 0 ? (
                                            <tbody>
                                              <tr>
                                                <td colspan={9} align="center">
                                                  No data found
                                                </td>
                                              </tr>
                                            </tbody>
                                          ) : (
                                            <tbody>
                                              {data.map((item, index) => {
                                                return (
                                                  <tr>
                                                    <td className="text-center">
                                                      {index + 1}
                                                    </td>
                                                    <td>{item.subjectName}</td>
                                                    <td className="text-center">
                                                      {collegeConfig.institution_type ==
                                                      1
                                                        ? item.className
                                                        : item.semester}
                                                    </td>
                                                    <td align="center">
                                                      <TextField
                                                        tabIndex={index + 2}
                                                        isTable={true}
                                                        type="text"
                                                        // id="mark"
                                                        maxlength={3}
                                                        value={
                                                          item.entryMark2
                                                            ? item.entryMark2
                                                            : ""
                                                        }
                                                        style={{
                                                          width: "60%",
                                                        }}
                                                        onChange={(e) => {
                                                          handleTextChange(
                                                            e,
                                                            item,
                                                            index,
                                                            2
                                                          );
                                                        }}
                                                      />
                                                    </td>

                                                    <td className="text-center">
                                                      {data[index].result2
                                                        ? "PASS"
                                                        : data[index]
                                                            .result2 === 0
                                                        ? "FAIL"
                                                        : null}
                                                    </td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          )}
                                        </table>
                                      )}
                                    </div>
                                    {data.length > 0 && (
                                      <Button
                                        tabIndex={data.length + 2}
                                        id="save"
                                        text="F4 - Save"
                                        type="button"
                                        isTable={true}
                                        onClick={(e) => {
                                          handleUnivMarkEntry(values, data);
                                        }}
                                      />
                                    )}
                                  </div>
                                  {/* ) : (
                                    <div className="text-center">
                                      No data found
                                    </div>
                                  )} */}
                                </Tab>
                                {collegeConfig.institution_type != 1 ? (
                                  <Tab
                                    eventKey={2}
                                    title="Arrear"
                                    className="p-2"
                                  >
                                    <div className="mt-2 mb-1">
                                      Name : {selectedStudent.name}
                                    </div>
                                    {arrearData.length > 0 ? (
                                      <div>
                                        <div
                                          style={{
                                            marginLeft: -30,
                                          }}
                                          className="mb-2"
                                        >
                                          <DateFieldFormik
                                            tabIndex={1}
                                            label="Exam Month :"
                                            id="examDate"
                                            labelSize={2}
                                            type="month"
                                            maxDate={moment().add(1, "years")}
                                            minDate={moment(startYear, "YYYY")}
                                            mandatory={1}
                                            style={{
                                              width: "40%",
                                            }}
                                            monthCal={true}
                                            onChange={(e) => {
                                              setFieldValue(
                                                "examDate",
                                                e.target.value
                                              );
                                              setUnSavedChanges(true);
                                            }}
                                            showMonthYearPicker
                                          />
                                        </div>
                                        <div className="row no-gutters mt-2">
                                          <Entry
                                            entryNumber={1}
                                            currentEntry={entry}
                                            setEntry={setEntry}
                                          />
                                          <Entry
                                            entryNumber={2}
                                            currentEntry={entry}
                                            setEntry={setEntry}
                                          />
                                        </div>
                                        {entry === 1 ? (
                                          <table className="table table-bordered">
                                            <thead>
                                              <tr>
                                                <th width="1%">No.</th>
                                                <th>Subject</th>
                                                <th>Sem</th>
                                                {isMark ? (
                                                  <th width="15%">Mark</th>
                                                ) : (
                                                  <th width="15%">Grade</th>
                                                )}
                                                <th>Result</th>
                                              </tr>
                                            </thead>
                                            {arrearData.length === 0 ? (
                                              <tbody>
                                                <tr>
                                                  <td
                                                    colspan={9}
                                                    align="center"
                                                  >
                                                    No data found
                                                  </td>
                                                </tr>
                                              </tbody>
                                            ) : (
                                              <tbody>
                                                {arrearData.map(
                                                  (item, index) => {
                                                    return (
                                                      <tr>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                          {item.subjectName}
                                                        </td>
                                                        <td className="text-center">
                                                          {item.semester}
                                                        </td>
                                                        <td align="center">
                                                          <TextField
                                                            tabIndex={index + 2}
                                                            isTable={true}
                                                            type="number"
                                                            id="mark"
                                                            value={
                                                              item.entryMark1
                                                                ? item.entryMark1
                                                                : ""
                                                            }
                                                            style={{
                                                              width: "60%",
                                                            }}
                                                            maxlength={3}
                                                            onChange={(e) => {
                                                              handleArrearTextChange(
                                                                e,
                                                                item,
                                                                index,
                                                                1
                                                              );
                                                              setUnSavedChanges(
                                                                true
                                                              );
                                                            }}
                                                          />
                                                        </td>

                                                        <td className="text-center">
                                                          {arrearData[index]
                                                            .result1
                                                            ? "PASS"
                                                            : arrearData[index]
                                                                .result1 ===
                                                              null
                                                            ? " "
                                                            : "FAIL"}
                                                        </td>
                                                      </tr>
                                                    );
                                                  }
                                                )}
                                              </tbody>
                                            )}
                                          </table>
                                        ) : (
                                          <table className="table table-bordered">
                                            <thead>
                                              <tr>
                                                <th width="1%">No.</th>
                                                <th>Subject</th>
                                                <th>Sem</th>
                                                {isMark ? (
                                                  <th width="15%">Mark</th>
                                                ) : (
                                                  <th width="15%">Grade</th>
                                                )}
                                                <th>Result</th>
                                              </tr>
                                            </thead>
                                            {arrearData.length === 0 ? (
                                              <tbody>
                                                <tr>
                                                  <td
                                                    colspan={9}
                                                    align="center"
                                                  >
                                                    No data found
                                                  </td>
                                                </tr>
                                              </tbody>
                                            ) : (
                                              <tbody>
                                                {arrearData.map(
                                                  (item, index) => {
                                                    return (
                                                      <tr>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                          {item.subjectName}
                                                        </td>
                                                        <td className="text-center">
                                                          {item.semester}
                                                        </td>
                                                        <td align="center">
                                                          <TextField
                                                            tabIndex={index + 2}
                                                            isTable={true}
                                                            type="number"
                                                            id="mark"
                                                            value={
                                                              item.entryMark2
                                                                ? item.entryMark2
                                                                : ""
                                                            }
                                                            style={{
                                                              width: "60%",
                                                            }}
                                                            maxlength={3}
                                                            onChange={(e) => {
                                                              handleArrearTextChange(
                                                                e,
                                                                item,
                                                                index,
                                                                2
                                                              );
                                                              setUnSavedChanges(
                                                                true
                                                              );
                                                            }}
                                                          />
                                                        </td>

                                                        <td className="text-center">
                                                          {arrearData[index]
                                                            .result2
                                                            ? "PASS"
                                                            : arrearData[index]
                                                                .result2 ===
                                                              null
                                                            ? " "
                                                            : "FAIL"}
                                                        </td>
                                                      </tr>
                                                    );
                                                  }
                                                )}
                                              </tbody>
                                            )}
                                          </table>
                                        )}

                                        <Button
                                          tabIndex={arrearData.length + 2}
                                          id="save"
                                          text="F4 - Save"
                                          type="button"
                                          isTable={true}
                                          onClick={(e) => {
                                            handleUnivMarkEntry(
                                              values,
                                              arrearData
                                            );
                                            setUnSavedChanges(true);
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="text-center">
                                        No data found
                                      </div>
                                    )}
                                  </Tab>
                                ) : null}
                                {collegeConfig.institution_type != 1 ? (
                                  <Tab
                                    eventKey={3}
                                    title="Result"
                                    className="p-2"
                                  >
                                    <div className="mt-2 mb-1 ">
                                      Name : {selectedStudent.name}
                                    </div>
                                    <table className="table table-bordered">
                                      <thead>
                                        <tr>
                                          <th width="1%">No.</th>
                                          <th>Subject</th>
                                          <th>Sem</th>
                                          <th width="10%">Mark</th>

                                          <th>Result</th>
                                        </tr>
                                      </thead>
                                      {overallData.length === 0 ? (
                                        <tbody>
                                          <tr>
                                            <td colspan={9} align="center">
                                              No data found
                                            </td>
                                          </tr>
                                        </tbody>
                                      ) : (
                                        <tbody>
                                          {overallData.map((item, index) => {
                                            return (
                                              <tr>
                                                <td>{index + 1}</td>
                                                <td>{item.subjectName}</td>
                                                <td className="text-center">
                                                  {item.semester}
                                                </td>
                                                <td align="center">
                                                  {item.universityMark}
                                                </td>
                                                <td className="text-center">
                                                  {overallData[index].result
                                                    ? "PASS"
                                                    : overallData[index]
                                                        .result === null
                                                    ? " "
                                                    : "FAIL"}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      )}
                                    </table>
                                  </Tab>
                                ) : null}
                              </Tabs>
                            )}
                          </div>
                        ) : (
                          selectedStudent && (
                            <div className="no-gutters col-7">
                              <div className="row no-gutters mt-2">
                                <Tabs id="uncontrolled-tab-example" fill>
                                  <Tab
                                    eventKey={1}
                                    title="Current"
                                    className="p-2"
                                  >
                                    <div className="mt-2 mb-1">
                                      Name : {selectedStudent.name}
                                    </div>
                                    <div
                                      style={{
                                        marginLeft: -30,
                                      }}
                                      className="mb-2"
                                    >
                                      <DateFieldFormik
                                        autoFocus
                                        tabIndex={1}
                                        label="Exam Month :"
                                        id="examDate"
                                        labelSize={2}
                                        type="month"
                                        maxDate={moment().add(1, "years")}
                                        minDate={moment(startYear, "YYYY")}
                                        mandatory={1}
                                        style={{
                                          width: "40%",
                                        }}
                                        monthCal={true}
                                        onChange={(e) => {
                                          setFieldValue(
                                            "examDate",
                                            e.target.value
                                          );
                                          setUnSavedChanges(true);
                                        }}
                                        showMonthYearPicker
                                      />
                                    </div>
                                    <div
                                    // style={{
                                    //   overflow: "auto",
                                    //   maxHeight: 500,
                                    //   minHeight: 300,
                                    // }}
                                    >
                                      <table className="table table-bordered ">
                                        <thead>
                                          <tr>
                                            <th width="1%">No.</th>
                                            <th>Subject</th>
                                            <th>Sem</th>
                                            {isMark ? (
                                              <th width="15%">Mark</th>
                                            ) : (
                                              <th width="15%">Grade</th>
                                            )}
                                            <th>Result</th>
                                          </tr>
                                        </thead>
                                        {data.length === 0 ? (
                                          <tbody>
                                            <tr>
                                              <td colspan={9} align="center">
                                                No data found
                                              </td>
                                            </tr>
                                          </tbody>
                                        ) : (
                                          <tbody>
                                            {data.map((item, index) => {
                                              return (
                                                <tr>
                                                  <td className="text-center">
                                                    {index + 1}
                                                  </td>
                                                  <td>{item.subjectName}</td>
                                                  <td className="text-center">
                                                    {item.semester}
                                                  </td>

                                                  <td align="center">
                                                    <ReactSelectField
                                                      tabIndex={index + 2}
                                                      placeholder="Grade"
                                                      options={gradeList}
                                                      getOptionLabel={(
                                                        option
                                                      ) => option.grade}
                                                      getOptionValue={(
                                                        option
                                                      ) => option.grade}
                                                      value={
                                                        item.gradeObj
                                                          ? item.gradeObj
                                                          : {
                                                              grade: item.grade,
                                                              id: null,
                                                            }
                                                      }
                                                      clear={false}
                                                      searchIcon={false}
                                                      isTable={true}
                                                      onChange={(txt) => {
                                                        console.log(
                                                          "txt---",
                                                          txt
                                                        );
                                                        data[index].gradeObj =
                                                          txt;
                                                        if (txt.gradePoint > 0)
                                                          data[
                                                            index
                                                          ].result = 1;
                                                        else
                                                          data[
                                                            index
                                                          ].result = 0;

                                                        console.log(
                                                          "data[index].result---",
                                                          data[index].result
                                                        );
                                                        setData([...data]);
                                                        setUnSavedChanges(true);
                                                      }}
                                                    />
                                                  </td>
                                                  <td className="text-center">
                                                    {data[index].result
                                                      ? "PASS"
                                                      : data[index].result ===
                                                        null
                                                      ? " "
                                                      : "FAIL"}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        )}
                                      </table>
                                    </div>
                                    {data.length > 0 && (
                                      <Button
                                        tabIndex={data.length + 2}
                                        id="save"
                                        text="F4 - Save"
                                        type="button"
                                        isTable={true}
                                        onClick={(e) => {
                                          handleUnivMarkEntry(values, data);
                                        }}
                                      />
                                    )}
                                  </Tab>
                                  {collegeConfig.institution_type != 1 ? (
                                    <Tab
                                      eventKey={2}
                                      title="Arrear"
                                      className="p-2"
                                    >
                                      <div className="mt-2 mb-1">
                                        Name : {selectedStudent.name}
                                      </div>
                                      <div
                                        style={{
                                          marginLeft: -30,
                                        }}
                                        className="mb-2"
                                      >
                                        <DateFieldFormik
                                          tabIndex={1}
                                          label="Exam Month :"
                                          id="examDate"
                                          labelSize={2}
                                          type="month"
                                          maxDate={moment().add(1, "years")}
                                          minDate={moment(startYear, "YYYY")}
                                          mandatory={1}
                                          style={{
                                            width: "40%",
                                          }}
                                          monthCal={true}
                                          onChange={(e) => {
                                            setFieldValue(
                                              "examDate",
                                              e.target.value
                                            );
                                            setUnSavedChanges(true);
                                          }}
                                          showMonthYearPicker
                                        />
                                      </div>
                                      <div
                                      // style={{
                                      //   overflow: "auto",
                                      //   maxHeight: 500,
                                      //   minHeight: 300,
                                      // }}
                                      >
                                        <table className="table table-bordered">
                                          <thead>
                                            <tr>
                                              <th width="1%">No.</th>
                                              <th>Subject</th>
                                              <th>Sem</th>
                                              {isMark ? (
                                                <th width="15%">Mark</th>
                                              ) : (
                                                <th width="15%">Grade</th>
                                              )}
                                              <th>Result</th>
                                            </tr>
                                          </thead>
                                          {arrearData.length === 0 ? (
                                            <tbody>
                                              <tr>
                                                <td colspan={9} align="center">
                                                  No data found
                                                </td>
                                              </tr>
                                            </tbody>
                                          ) : (
                                            <tbody>
                                              {arrearData.map((item, index) => {
                                                return (
                                                  <tr>
                                                    <td>{index + 1}</td>
                                                    <td>{item.subjectName}</td>
                                                    <td className="text-center">
                                                      {item.semester}
                                                    </td>

                                                    <td align="center">
                                                      <ReactSelectField
                                                        tabIndex={index + 2}
                                                        placeholder="Grade"
                                                        options={gradeList}
                                                        getOptionLabel={(
                                                          option
                                                        ) => option.grade}
                                                        getOptionValue={(
                                                          option
                                                        ) => option.grade}
                                                        value={
                                                          item.gradeObj
                                                            ? item.gradeObj
                                                            : {
                                                                grade:
                                                                  item.grade,
                                                                id: null,
                                                              }
                                                        }
                                                        clear={false}
                                                        searchIcon={false}
                                                        isTable={true}
                                                        onChange={(txt) => {
                                                          console.log(
                                                            "txt---",
                                                            txt
                                                          );
                                                          arrearData[
                                                            index
                                                          ].gradeObj = txt;
                                                          if (
                                                            txt.gradePoint > 0
                                                          )
                                                            arrearData[
                                                              index
                                                            ].result = 1;
                                                          else
                                                            arrearData[
                                                              index
                                                            ].result = 0;

                                                          console.log(
                                                            "data[index].result---",
                                                            arrearData[index]
                                                              .result
                                                          );
                                                          setArrearData([
                                                            ...arrearData,
                                                          ]);
                                                          setUnSavedChanges(
                                                            true
                                                          );
                                                        }}
                                                      />
                                                    </td>

                                                    <td className="text-center">
                                                      {arrearData[index].result
                                                        ? "PASS"
                                                        : arrearData[index]
                                                            .result === null
                                                        ? " "
                                                        : "FAIL"}
                                                    </td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          )}
                                        </table>
                                      </div>
                                      {arrearData.length > 0 && (
                                        <Button
                                          tabIndex={arrearData.length + 2}
                                          id="save"
                                          text="F4 - Save"
                                          type="button"
                                          isTable={true}
                                          onClick={(e) => {
                                            handleUnivMarkEntry(
                                              values,
                                              arrearData
                                            );
                                          }}
                                        />
                                      )}
                                    </Tab>
                                  ) : null}

                                  {collegeConfig.institution_type != 1 ? (
                                    <Tab
                                      eventKey={3}
                                      title="Result"
                                      className="p-2"
                                    >
                                      <div className="mt-2 mb-1 ">
                                        Name : {selectedStudent.name}
                                      </div>
                                      <table className="table table-bordered">
                                        <thead>
                                          <tr>
                                            <th width="1%">No.</th>
                                            <th>Subject</th>

                                            <th>{RENAME?.sem}</th>
                                            {isMark ? (
                                              <th width="10%">Mark</th>
                                            ) : (
                                              <th width="10%">Grade</th>
                                            )}
                                            <th>Result</th>
                                          </tr>
                                        </thead>
                                        {overallData.length === 0 ? (
                                          <tbody>
                                            <tr>
                                              <td colspan={9} align="center">
                                                No data found
                                              </td>
                                            </tr>
                                          </tbody>
                                        ) : (
                                          <tbody>
                                            {overallData.map((item, index) => {
                                              return (
                                                <tr>
                                                  <td>{index + 1}</td>
                                                  <td>{item.subjectName}</td>
                                                  <td className="text-center">
                                                    {item.semester}
                                                  </td>
                                                  <td align="center">
                                                    {isMark
                                                      ? item.universityMark
                                                      : item.grade}
                                                  </td>

                                                  <td className="text-center">
                                                    {overallData[index].result
                                                      ? "PASS"
                                                      : overallData[index]
                                                          .result === null
                                                      ? " "
                                                      : "FAIL"}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        )}
                                      </table>
                                    </Tab>
                                  ) : null}
                                </Tabs>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
      <ModalComponent
        title={"Mismatched Data"}
        isOpen={modalVisible}
        message={missMatchData}
        okClick={() => setModalVisible(false)}
      />
    </div>
  );
}

export default StudentPerformanceUniv;
