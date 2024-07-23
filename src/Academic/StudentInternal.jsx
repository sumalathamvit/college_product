import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";
import moment from "moment";
import { Checkbox } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useSelector } from "react-redux";
import $ from "jquery";

import academicApi from "../api/AcademicApi";

import AuthContext from "../auth/context";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextField from "../component/FormField/TextField";
import DisplayText from "../component/FormField/DisplayText";
import ModalComponent from "../component/ModalComponent";
import ScreenTitle from "../component/common/ScreenTitle";

import string from "../string";

function StudentInternal() {
  //#region Const
  const RENAME = useSelector((state) => state.web.rename);
  const collegeConfig = useSelector((state) => state.web.college);
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [testNameList, setTestNameList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [retestData, setRetestData] = useState([]);
  const [staffClass, setStaffClass] = useState([]);

  const [showStudent, setShowStudent] = useState(false);
  const [retestmark, setRetestMark] = useState(false);
  const [retestShow, setRetestShow] = useState(false);
  const [retest, setRetest] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const { role, employeeId, collegeId, setUnSavedChanges } =
    useContext(AuthContext);
  //#endregion

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
    testName: $("#testName").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#testName").attr("alt") ?? "Test Name"}`
        ),
    subject: $("#subject").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#subject").attr("alt") ?? "Subject"}`
        ),
  });

  const formikRef = useRef();
  let tabIndex = 7;
  let finalTabIndex = 7;

  const handleMark = async () => {
    if (load) return;
    console.log("data---", data);
    // console.log(formikRef.current.values.subject.maxMark, "check");
    setUnSavedChanges(false);

    if (data.some((item) => !item.mark)) {
      setModalTitle("Mark");
      setModalMessage("Please enter the Mark");
      setModalErrorOpen(true);
      return;
    }

    if (
      data.some(
        (item) =>
          parseInt(item.mark) >
          parseInt(formikRef.current.values.subject.maxMark)
      )
    ) {
      setModalTitle("Mark");
      setModalMessage(
        "Please enter the Mark Less than " +
          parseInt(formikRef.current.values.subject.maxMark)
      );
      setModalErrorOpen(true);
      return;
    }
    try {
      setLoad(true);
      let internalMarks = [];
      if (retest) {
        internalMarks = data.map(({ studentID, mark, absent, reTest }) => ({
          studentID,
          mark: mark === null ? 0 : mark,
          assignmentMark: 0,
          reTest: 1,
        }));
      } else {
        internalMarks = data.map(({ studentID, mark, absent, reTest }) => ({
          studentID,
          mark: mark === null ? 0 : mark,
          assignmentMark: 0,
        }));
      }

      const markRes = await academicApi.addInternalMarks(
        formikRef.current.values.subject.testDetailID,
        formikRef.current.values.subject.minMark,
        internalMarks
      );
      console.log("markRes---", markRes);

      if (!markRes.data.message.success) {
        setModalTitle("Mark");
        setModalMessage(markRes.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      toast.success(markRes.data.message.message);
      formikRef.current.setFieldValue("course", "");
      formikRef.current.setFieldTouched("course", false);
      formikRef.current.setFieldValue("semester", "");
      formikRef.current.setFieldTouched("semester", false);
      formikRef.current.setFieldValue("section", "");
      formikRef.current.setFieldTouched("section", false);
      formikRef.current.setFieldValue("subject", "");
      formikRef.current.setFieldTouched("subject", false);
      formikRef.current.setFieldValue("testName", "");
      formikRef.current.setFieldTouched("testName", false);
      formikRef.current.setFieldValue("staff", "");
      formikRef.current.setFieldTouched("staff", false);
      setShowStudent(false);
      await getCourseList(
        collegeConfig.is_university
          ? formikRef.current.values.college.collegeID
          : collegeId
      );
      collegeConfig.is_university
        ? document.getElementById("college").focus()
        : document.getElementById("course").focus();
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const handleRetestMark = async () => {
    if (load) return;
    console.log("Retestdata---", retestData);
    setUnSavedChanges(false);

    if (retestData.some((item) => !item.mark)) {
      setModalTitle("Mark");
      setModalMessage("Please enter the Retest Mark");
      setModalErrorOpen(true);
      return;
    }
    // if (
    //   retestData.some(
    //     (item) =>
    //       parseInt(item.mark) + parseInt(item.assignmentMark) >
    //       parseInt(formikRef.current.values.subject.maxMark)
    //   )
    // ) {
    //   setModalTitle("Mark");
    //   setModalMessage("Please enter the Mark Less than Maximum Mark");
    //   setModalErrorOpen(true);
    //   return;
    // }
    try {
      setLoad(true);
      let retestinternalMarks = retestData.map(
        ({ studentID, mark, absent, reTest }) => ({
          studentID,
          mark: mark === null ? 0 : mark,
          assignmentMark: 0,
          reTest: 1,
        })
      );

      console.log(
        "retestinternalMarks",
        formikRef.current.values.subject.testDetailID,
        formikRef.current.values.subject.minMark,
        retestinternalMarks
      );

      const markRes = await academicApi.addInternalMarks(
        formikRef.current.values.subject.testDetailID,
        formikRef.current.values.subject.minMark,
        retestinternalMarks
      );
      console.log("markRes---", markRes);

      if (markRes.data.message.success == true) {
        toast.success(markRes.data.message.message);
        formikRef.current.setFieldValue("course", "");
        // formikRef.current.setFieldValue("batch", "");
        formikRef.current.setFieldValue("semester", "");
        formikRef.current.setFieldValue("section", "");
        formikRef.current.setFieldValue("subject", "");
        formikRef.current.setFieldValue("testName", "");
        formikRef.current.setFieldValue("staff", "");
        setShowStudent(false);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const getSubjectStaff = async (course, batch) => {
    console.log("batch-", course, batch);
    console.log("batch check", course.courseID, batch.BatchID, batch.semester);
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldTouched("semester", false);
    setShowStudent(false);
    setSectionList([]);
    if (batch) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "subject",
            course.courseID,
            batch.batchID,
            batch.semester
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        if (role === string.STAFF_ROLE) {
          let secList = [];
          for (
            let i = 0;
            i < getMasterSubjectStaffRes.data.message.data.section.length;
            i++
          ) {
            if (
              staffClass.findIndex(
                (item) =>
                  item.classID ===
                  getMasterSubjectStaffRes.data.message.data.section[i].classID
              ) !== -1
            ) {
              secList.push(
                getMasterSubjectStaffRes.data.message.data.section[i]
              );
            }
          }
          console.log("secList", secList);
          setSectionList(secList);
          if (secList.length === 1) {
            formikRef.current.setFieldValue("section", secList[0]);
            getSubject(
              secList[0],
              formikRef?.current?.values?.semester,
              formikRef?.current?.values?.testName
            );
          }
        } else {
          setSectionList(getMasterSubjectStaffRes.data.message.data.section);
          if (getMasterSubjectStaffRes.data.message.data.section.length === 1) {
            formikRef.current.setFieldValue(
              "section",
              getMasterSubjectStaffRes.data.message.data.section[0]
            );
            getSubject(
              getMasterSubjectStaffRes.data.message.data.section[0],
              formikRef?.current?.values?.semester,
              formikRef?.current?.values?.testName
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getBatchMaster = async (course) => {
    formikRef.current.setFieldValue("batch", "");
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("subject", "");
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("batch", false);
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldTouched("subject", false);
    formikRef.current.setFieldTouched("testName", false);

    console.log("text---", course);
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

  const handleShowPerformance = async (values) => {
    setRetest(false);
    console.log("values---", values);
    setData([]);
    setRetestData([]);

    setShowStudent(false);

    const performanceRes = await academicApi.getStudentPerformance(
      values.subject.subjectCourseID,
      values.section.classID,
      values.semester.semester,
      values.subject.subjectID,
      // values.testName.testID
      values.subject.testDetailID
    );
    console.log("performanceRes---", performanceRes);

    if (!performanceRes.data.message.success) {
      setModalTitle("Message");
      setModalMessage(performanceRes.data.message.message);
      setModalErrorOpen(true);
      setLoad(false);
      return;
    }

    if (performanceRes?.data?.message?.data?.staff) {
      // for (
      //   let i = 0;
      //   i < performanceRes.data.message.data.student_performance_mark.length;
      //   i++
      // ) {
      //   performanceRes.data.message.data.student_performance_mark[i].mark = 60;
      //   performanceRes.data.message.data.student_performance_mark[
      //     i
      //   ].assignmentMark = 20;
      // }
      setData(performanceRes.data.message.data.student_performance_mark);
      setRetestShow(false);
      formikRef?.current?.setFieldValue(
        "staff",
        performanceRes.data.message.data.staff[0]
      );

      if (
        performanceRes?.data?.message?.data?.student_performance_mark[0].mark
      ) {
        setRetestMark(true);
        handleRetestPerformance();
      } else {
        setRetestMark(false);
      }
      setShowStudent(true);
    } else {
      setModalTitle("Message");
      setModalMessage("Please assign Staff");
      setModalErrorOpen(true);
    }
  };

  const handleRetestPerformance = async () => {
    // console.log("values---", values);
    // setData([]);
    setShowStudent(false);
    const performanceRes = await academicApi.getStudentPerformance(
      formikRef.current.values.subject.subjectCourseID,
      formikRef.current.values.section.classID,
      formikRef.current.values.semester.semester,
      formikRef.current.values.subject.subjectID,
      formikRef.current.values.subject.testDetailID,
      1
    );
    console.log("checking retest values", performanceRes);
    // setRetestData(performanceRes.data.message.data.student_performance_mark);
    // setRetestShow(true);

    // if (performanceRes.data.message.success == false) {
    //   setModalTitle("Message");
    //   setModalMessage(performanceRes.data.message.message);
    //   setModalErrorOpen(true);
    //   setLoad(false);
    //   return;
    // }

    if (performanceRes?.data?.message?.data?.staff) {
      // setData(performanceRes.data.message.data.student_performance_mark);
      setRetestData(performanceRes.data.message.data.student_performance_mark);
      formikRef?.current?.setFieldValue(
        "staff",
        performanceRes.data.message.data.staff[0]
      );
      // setShowStudent(true);
      // setRetest(true);
    }
    // else {
    //   setModalTitle("Message");
    //   setModalMessage("Please assign Staff");
    //   setModalErrorOpen(true);
    // }
    document.getElementById("mark0").focus();
  };

  const getSubject = async (section, semester, testName) => {
    console.log("Values new---", section, semester, testName);
    formikRef.current.setFieldValue("subject", "");
    formikRef.current.setFieldValue("staff", "");
    if (section && testName) {
      const subjectRes = await academicApi.getTestDetailList(
        section.classID,
        semester.semester,
        testName.testID,
        null,
        0
      );
      console.log("subjectRes---", subjectRes);
      // return;

      if (!subjectRes.data.message.success) {
        setModalMessage(subjectRes.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      if (role.toUpperCase() == string.SUPER_ADMIN_ROLE) {
        setSubjectList(subjectRes.data.message.data.testDetail);
        subjectRes.data.message.data.testDetail.length === 1 &&
          formikRef.current.setFieldValue(
            "subject",
            subjectRes.data.message.data.testDetail[0]
          );
      } else if (role === string.STAFF_ROLE) {
        let subList = [];
        let classIncharge = false;
        for (let i = 0; i < staffClass.length; i++) {
          if (staffClass[i].classID === section.classID) {
            if (staffClass[i].isClassIncharge) {
              classIncharge = true;

              setSubjectList(subjectRes.data.message.data.testDetail);
              break;
            } else {
              subList.push(subjectRes.data.message.data.testDetail[i]);
            }
          }
        }
        if (!classIncharge) {
          setSubjectList(subList);
          subList.length === 1 &&
            formikRef.current.setFieldValue("subject", subList[0]);
        }
      }
    }
  };

  const handleTextChange = (e, item, index) => {
    let value = e.target.value;
    // Regular expression to match only numbers (0-9) and the letter "A" (both uppercase and lowercase)
    const regex = /^[0-9Aa]*$/;
    value = value.replace(/A+/gi, "A");
    console.log("---", data[index].mark, value);
    if (regex.test(value)) {
      console.log("value---", value);
      if (value) {
        if (value.toUpperCase() === "A") {
          data[index].mark = value.toUpperCase();
          data[index].markError = false;
        } else {
          const enteredMark = parseInt(e.target.value);
          if (enteredMark > 100) {
            // If entered mark is more than 80, set an error
            data[index].markError = true;
          } else {
            // Otherwise, update the mark and clear any previous error
            data[index].mark = isNaN(enteredMark) ? null : enteredMark;
            data[index].markError = false;
          }
        }
      } else {
        data[index].mark = "";
      }

      setData([...data]);
      setUnSavedChanges(true);
    } else {
      data[index].mark = "";
      setData([...data]);
    }
  };

  const handleTextChangeFailed = (e, item, index) => {
    let value = e.target.value;
    // Regular expression to match only numbers (0-9) and the letter "A" (both uppercase and lowercase)
    const regex = /^[0-9Aa]*$/;
    value = value.replace(/A+/gi, "A");
    console.log("---", retestData[index].mark, value);
    if (regex.test(value)) {
      console.log("value---", value);
      if (value) {
        if (value.toUpperCase() === "A") {
          retestData[index].mark = value.toUpperCase();
          retestData[index].markError = false;
        } else {
          const enteredMark = parseInt(e.target.value);
          if (enteredMark > 100) {
            // If entered mark is more than 80, set an error
            retestData[index].markError = true;
          } else {
            // Otherwise, update the mark and clear any previous error
            retestData[index].mark = isNaN(enteredMark) ? null : enteredMark;
            retestData[index].markError = false;
          }
        }
      } else {
        retestData[index].mark = "";
      }

      setRetestData([...retestData]);
      setUnSavedChanges(true);
    } else {
      retestData[index].mark = "";
      setRetestData([...retestData]);
    }
  };

  const getCourseList = async (collegeId) => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getCourseList(
        collegeId
      );
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      if (!getMasterSubjectStaffRes.data.message.success) {
        setModalMessage(getMasterSubjectStaffRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
      if (getMasterSubjectStaffRes.data.message.data.course.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          getMasterSubjectStaffRes.data.message.data.course[0]
        );
        await getBatchMaster(
          getMasterSubjectStaffRes.data.message.data.course[0]
        );
      }
      const getAllTestRes = await academicApi.getAllTest(collegeId);
      console.log("getAllTestRes---", getAllTestRes);
      if (getAllTestRes.data.message.data.test.length > 0) {
        if (getAllTestRes.data.message.data.test.length === 1)
          formikRef.current.setFieldValue(
            "testName",
            getAllTestRes.data.message.data.test[0]
          );
        getSubject(null, null, getAllTestRes.data.message.data.test[0]);
        if (sectionList.length == 1 && semesterList.length == 1) {
          getSubject(
            sectionList[0],
            semesterList[0],
            getAllTestRes.data.message.data.test[0]
          );
        }
        setTestNameList(getAllTestRes.data.message.data.test);
      }
      if (role === string.STAFF_ROLE) {
        const getClassbyStaffRes = await academicApi.getClassbyStaff(
          employeeId
        );
        console.log("getClassbyStaffRes", getClassbyStaffRes);
        if (getClassbyStaffRes.data.message.success) {
          let courseList = [];
          let semList = [];
          let secList = [];
          for (
            let i = 0;
            i < getClassbyStaffRes.data.message.data.staff.length;
            i++
          ) {
            if (
              getClassbyStaffRes.data.message.data.staff[i].primaryTeacher ==
                getClassbyStaffRes.data.message.data.staff[i].staffID ||
              getClassbyStaffRes.data.message.data.staff[i].secondaryTeacher ==
                getClassbyStaffRes.data.message.data.staff[i].staffID
            ) {
              getClassbyStaffRes.data.message.data.staff[
                i
              ].isClassIncharge = true;
            } else {
              getClassbyStaffRes.data.message.data.staff[
                i
              ].isClassIncharge = false;
            }
            let course = {
              courseID: getClassbyStaffRes.data.message.data.staff[i].courseID,
              courseName:
                getClassbyStaffRes.data.message.data.staff[i].courseName,
            };
            if (
              courseList.findIndex(
                (item) => item.courseID === course.courseID
              ) === -1
            ) {
              courseList.push(course);
            }
            let semester = {
              className:
                getClassbyStaffRes.data.message.data.staff[i].className,
              semester: getClassbyStaffRes.data.message.data.staff[i].semester,
              batchID: getClassbyStaffRes.data.message.data.staff[i].batchID,
            };
            if (
              semList.findIndex(
                (item) => item.semester === semester.semester
              ) === -1
            ) {
              semList.push(semester);
            }
            if (i == 0) {
              let sec = {
                section: getClassbyStaffRes.data.message.data.staff[i].section,
                classID: getClassbyStaffRes.data.message.data.staff[i].classID,
              };
              secList.push(sec);
            }
          }
          console.log("courseList", courseList);
          console.log("semesterList", semList);
          console.log("sectionList", secList);
          setCourseList(courseList);
          setSemesterList(semList);
          if (courseList.length === 1) {
            formikRef.current.setFieldValue("course", courseList[0]);
          }
          if (semList.length === 1) {
            formikRef.current.setFieldValue("semester", semList[0]);
          }
          if (secList.length === 1) {
            formikRef.current.setFieldValue("section", secList[0]);
          }
          setStaffClass(getClassbyStaffRes.data.message.data.staff);
        }
      }
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  // useEffect(() => {
  //   getInitialList();
  // }, []);

  useEffect(() => {
    if (
      !collegeConfig.is_university ||
      role.toUpperCase() !== string.SUPER_ADMIN_ROLE
    ) {
      getCourseList(collegeId);
    } else {
      setCourseList([]);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
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
              course: null,
              batch: null,
              semester: null,
              section: null,
              subject: null,
              testName: null,
              staff: null,
            }}
            validationSchema={FormSchema}
            onSubmit={handleShowPerformance}
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
                    {collegeConfig.is_university &&
                    role.toUpperCase() == string.SUPER_ADMIN_ROLE ? (
                      <SelectFieldFormik
                        tabIndex={1}
                        autoFocus
                        label="College"
                        labelSize={3}
                        id="college"
                        mandatory={1}
                        style={{ width: "90%" }}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          setFieldValue("testName", "");
                          if (text) getCourseList(text.collegeID);
                        }}
                      />
                    ) : null}
                    {courseList.length > 1 && (
                      <SelectFieldFormik
                        autoFocus
                        label={RENAME?.course}
                        id="course"
                        tabIndex={1}
                        mandatory={1}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.courseID}
                        options={courseList}
                        onChange={(text) => {
                          setShowStudent(false);
                          setFieldValue("course", text);
                          getBatchMaster(text);
                          setFieldTouched("course", false);
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      tabIndex={2}
                      label={RENAME?.sem}
                      id="semester"
                      mandatory={1}
                      // labelSize={3}
                      getOptionLabel={(option) => option.className}
                      getOptionValue={(option) => option.semester}
                      options={semesterList}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setFieldValue("semester", text);
                        setFieldValue("section", "");
                        setFieldValue("subject", "");
                        setSubjectList([]);
                        getSubjectStaff(values?.course, text);
                      }}
                    />

                    <SelectFieldFormik
                      label={RENAME?.section}
                      id="section"
                      mandatory={1}
                      maxlength={1}
                      tabIndex={3}
                      getOptionLabel={(option) => option.section}
                      getOptionValue={(option) => option.classID}
                      options={sectionList}
                      style={{ width: "30%" }}
                      onChange={(text) => {
                        setShowStudent(false);
                        setFieldValue("section", text);
                        setFieldTouched("section", false);
                        getSubject(text, values.semester, values.testName);
                      }}
                    />
                    <SelectFieldFormik
                      label="Test Name"
                      id="testName"
                      mandatory={1}
                      maxlength={15}
                      tabIndex={4}
                      getOptionLabel={(option) => option.test}
                      getOptionValue={(option) => option.testID}
                      options={testNameList}
                      style={{ width: "50%" }}
                      searchIcon={false}
                      onChange={(text) => {
                        setFieldValue("testName", text);
                        setFieldTouched("testName", false);
                        getSubject(values.section, values.semester, text);
                        // handleTest(values.text);
                      }}
                    />
                    <SelectFieldFormik
                      label="Subject"
                      id="subject"
                      mandatory={1}
                      tabIndex={5}
                      getOptionLabel={(option) => option.subjectName}
                      getOptionValue={(option) => option.subjectID}
                      options={subjectList}
                      value={values.subject}
                      searchIcon={false}
                      onChange={(text) => {
                        setShowStudent(false);
                        setFieldValue("subject", text);
                        console.log(text, "test");
                      }}
                    />
                  </div>
                  <Button
                    tabIndex={6}
                    text={"Show"}
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />
                  {showStudent && (
                    <div className="col-lg-8">
                      <DisplayText
                        label="Staff"
                        value={
                          values.staff.employeeID +
                          " - " +
                          values.staff.employee_name
                        }
                      />
                      <div className="row mt-1">
                        <label className="col-lg-5 text-right pe-3 mt-2">
                          Test Date
                        </label>
                        <div className="col-lg-7 pt-2 ps-1">
                          {values.subject
                            ? moment(values.subject.testDate).format(
                                "DD-MM-yyyy"
                              )
                            : ""}
                        </div>
                      </div>
                    </div>
                  )}
                  {retestmark && showStudent && (
                    <>
                      {/* <Button
                        text="Retest"
                        type="button"
                        onClick={(e) => {
                          handleRetestPerformance();
                        }}
                      /> */}
                      <div className="row">
                        <div className="mt-1 text-right">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={retestShow}
                                onChange={(e) => {
                                  setRetestShow(e.target.checked);
                                }}
                                inputProps={{ "aria-label": "controlled" }}
                              />
                            }
                            label="Show Failed Students"
                          />
                        </div>
                      </div>
                    </>
                  )}
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
                <div className="row no-gutters mt-2">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th width="3%">Roll No.</th>
                        <th width="15%">Register No.</th>
                        <th>Student Name</th>
                        <th width="5%">Internal Mark</th>
                      </tr>
                    </thead>
                    {data.length === 0 ||
                    (retestShow && retestData.length === 0) ? (
                      <tbody>
                        <tr>
                          <td colspan={9} align="center">
                            No Students found
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody>
                        {!retestShow
                          ? data.map((item, index) => {
                              tabIndex = tabIndex + 2;
                              finalTabIndex = tabIndex + 1;

                              return (
                                <tr>
                                  <td>{item.rollNo}</td>
                                  <td>{item.registrationNo}</td>
                                  <td>{item.name}</td>
                                  <td align="center">
                                    <TextField
                                      tabIndex={tabIndex}
                                      isTable={true}
                                      type="number"
                                      id={"mark" + index}
                                      style={{ width: "65%" }}
                                      value={item.mark}
                                      onChange={(e) => {
                                        preFunction.amountValidation(
                                          e.target.value
                                        ) &&
                                          handleTextChange(
                                            e,
                                            data[index],
                                            index
                                          );
                                      }}
                                      error={
                                        data[index].markError
                                          ? "Please enter a mark less than or equal to 80"
                                          : ""
                                      }
                                    />
                                  </td>
                                </tr>
                              );
                            })
                          : retestData.map((item, index) => {
                              return (
                                <tr>
                                  <td>{item.rollNo}</td>
                                  <td>{item.registrationNo}</td>
                                  <td>{item.name}</td>
                                  <td align="center">
                                    <TextField
                                      isTable={true}
                                      type="number"
                                      id="mark"
                                      style={{ width: "65%" }}
                                      value={item.mark}
                                      onChange={(e) => {
                                        handleTextChangeFailed(
                                          e,
                                          retestData[index],
                                          index
                                        );
                                      }}
                                      // error={
                                      //   data[index].markError
                                      //     ? "Please enter a mark less than or equal to 80"
                                      //     : ""
                                      // }
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
              {showStudent && data.length == 0 ? (
                <div colSpan="10" className="text-center ">
                  No Subject found
                </div>
              ) : null}
              {data.length > 0 && (
                <Button
                  tabIndex={finalTabIndex + 1}
                  id="save"
                  text="F4 - Save"
                  type="button"
                  onClick={(e) => {
                    {
                      retestShow ? handleRetestMark() : handleMark();
                    }
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentInternal;
