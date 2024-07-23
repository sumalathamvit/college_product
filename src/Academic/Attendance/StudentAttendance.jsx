import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";
import moment from "moment";

import academicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import DisplayText from "../../component/FormField/DisplayText";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import Icon from "../../component/Icon";
import AuthContext from "../../auth/context";
import { useSelector } from "react-redux";
import CommonFunction from "../../component/common/CommonFunction";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import string from "../../string";

function StudentAttendance() {
  const RENAME = useSelector((state) => state.web.rename);
  const { role, employeeId, setUnSavedChanges } = useContext(AuthContext);
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [topicUpdated, setTopicUpdated] = useState(null);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  // const [semesterList, setSemesterList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [showStudent, setShowStudent] = useState(false);
  const [periodList, setPeriodList] = useState([]);
  const [topicList, setTopicList] = useState([]);
  const [topic, setTopic] = useState([]);
  const [topicError, setTopicError] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [semester, setSemester] = useState("");
  const [presentAll, setPresentAll] = useState(false);
  const [attendanceDetail, setAttendanceDetail] = useState([]);
  const [classData, setClassData] = useState([]);
  const [attendanceConfig, setAttendanceConfig] = useState([]);
  const [mySubjectList, setMySubjectList] = useState([]);
  const [absentees, setAbsentees] = useState([]);
  const [attendanceStaff, setAttendanceStaff] = useState([]);
  const [uniqStaff, setUniqStaff] = useState();
  const [uniqSubject, setUniqSubject] = useState();
  const [absent, setAbsent] = useState("");
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [existingAttendance, setExistingAttendance] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [prevAttendance, setPrevAttendance] = useState([]);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    attendanceDate: Yup.date().required("Please select Date"),
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required("Please select " + RENAME?.sem),
    subject: Yup.object().required("Please select Subject"),
    period: Yup.array().required("Please select Period"),
    section: Yup.object().required("Please select " + RENAME?.section),
  });
  const staffFormSchema = Yup.object().shape({
    mySubject: Yup.object().required("Please select Subject"),
    class: Yup.object().required("Please select " + RENAME?.sem),
    group:
      groupList.length > 0
        ? Yup.object().required("Please select Group")
        : Yup.mixed().notRequired(),
    period: Yup.array().required("Please select Period"),
  });

  const checkAll = (value) => {
    console.log(presentAll, value, "value");
    let absentString = absent.replace(/ /g, "");
    const absentData = absentString.split(",");

    if (value) {
      for (let i = 0; i < data.length; i++) {
        if (absentData.includes(data[i].rollNo && data[i].rollNo.toString())) {
          data[i].attendance = 0;
          data[i].isLeave = 0;
          data[i].isLate = 0;
          data[i].onDuty = 0;
        } else {
          data[i].attendance = 1;
          data[i].isLeave = 0;
          data[i].isLate = 0;
          data[i].onDuty = 0;
        }
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        data[i].attendance = 0;
      }
    }
    setData([...data]);
  };
  const handleAbsent = (absent) => {
    absent = absent.replace(/ /g, "");
    const absentData = absent.split(",");

    for (let i = 0; i < data.length; i++) {
      if (absentData.includes(data[i].rollNo && data[i].rollNo.toString())) {
        data[i].attendance = 0;
        data[i].isLeave = 0;
        data[i].isLate = 0;
        data[i].onDuty = 0;
      } else if (
        data[i].attendance === 0 &&
        data[i].isLeave === 0 &&
        data[i].isLate === 0 &&
        data[i].onDuty === 0
      ) {
        data[i].attendance = 1;
        data[i].isLeave = 0;
        data[i].isLate = 0;
        data[i].onDuty = 0;
      }
    }

    setData([...data]);
  };

  function findUnmatchedObjects(array1, array2) {
    const unmatchedInArray1 = array1.filter(
      (obj1) => !array2.some((obj2) => isEqual(obj1, obj2))
    );

    // Find unmatched objects in array2
    const unmatchedInArray2 = array2.filter(
      (obj2) => !array1.some((obj1) => isEqual(obj2, obj1))
    );

    return {
      unmatchedInArray1,
      unmatchedInArray2,
    };
  }

  // Helper function to compare objects for equality
  function isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  const handleAttendance = async (values) => {
    if (load) return;
    console.log("values---", values);
    if (!values.staff) {
      setModalTitle("Message");
      setModalMessage("No found Staff");
      setModalErrorOpen(true);
      return;
    }

    setUnSavedChanges(false);

    setTopicError(false);
    const today = new Date();
    const selectedDate = new Date(values.attendanceDate);

    // Calculate the difference in milliseconds between the two dates
    const differenceInMilliseconds = today.getTime() - selectedDate.getTime();

    // Convert milliseconds to days
    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );
    if (role === "SUPERADMIN") {
      if (differenceInDays > attendanceConfig[0].adminDelayDay) {
        setModalTitle("Message");
        setModalMessage(
          `Edit only within ${attendanceConfig[0].adminDelayDay} days`
        );
        setModalErrorOpen(true);

        return;
      }
    } else if (differenceInDays > attendanceConfig[0].delayDay) {
      setModalTitle("Message");
      setModalMessage(
        `Edit only within ${attendanceConfig[0].delayDay} days. Please contact the Admin`
      );
      setModalErrorOpen(true);

      return;
    }
    if (topic.length < 1) {
      document.getElementById("topic").focus();
      setTopicError(true);
      return;
    }

    try {
      setLoad(true);
      const studentDetails = data.map((obj) => {
        return {
          studentID: obj.studentID,
          attendance: obj.attendance ? obj.attendance : 0,
          isLate: obj.isLate ? obj.isLate : 0,
          isLeave: obj.isLeave ? obj.isLeave : 0,
          onDuty: obj.onDuty ? obj.onDuty : 0,
        };
      });

      const attendanceInsertUpdateRes =
        await academicApi.attendanceInsertUpdate(
          data[0].attendanceID,
          topic.map((item) => item.id).join(","),
          values.section.classID,
          values.staff.employeeID,
          values.subject.subjectID,
          semester,
          moment(values.attendanceDate).format("yyyy-MM-DD"),
          values.period.map((item) => item.periodID).join(","),
          studentDetails,
          1,
          values.subject.isMandatory,
          values?.group?.groupID ?? null
        );
      console.log("attendanceInsertUpdateRes---", attendanceInsertUpdateRes);
      // return;
      if (attendanceInsertUpdateRes.data.message.success) {
        // toast.success(attendanceInsertUpdateRes.data.message.message);
        handleClear(attendanceInsertUpdateRes.data.message.message);
        // setTopic([]);
      } else {
        setModalTitle("Message");
        setModalMessage(attendanceInsertUpdateRes.data.message.message);
        setModalErrorOpen(true);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const getPeriodBatch = async (section, subject) => {
    console.log("subject---", subject);
    setShowStudent(false);
    setGroupList([]);
    formikRef.current.setFieldValue("group", null);
    formikRef.current.setFieldValue("period", null);
    setTopic([]);
    try {
      const getMasterPeriodRes = await academicApi.getMasterSubjectStaff(
        collegeConfig.is_university
          ? formikRef?.current?.values?.college?.collegeID
          : collegeId,
        "attendance",
        null,
        null,
        null,
        null,
        subject.subjectID,
        section
      );
      console.log("getMasterPeriodRes---", getMasterPeriodRes);
      setGroupList(getMasterPeriodRes.data.message.data.group);
    } catch (error) {
      console.log(error);
    }
  };
  const getBatchforStaff = async (section, subject) => {
    console.log("subject---", section, subject);
    setShowStudent(false);
    setGroupList([]);
    formikRef.current.setFieldValue("group", null);
    formikRef.current.setFieldValue("period", null);
    setTopic([]);
    try {
      const getMasterPeriodRes = await academicApi.getMasterSubjectStaff(
        collegeConfig.is_university
          ? formikRef.current.values.college.collegeID
          : collegeId,
        "attendance",
        null,
        null,
        null,
        null,
        subject.subjectID,
        section
      );
      console.log("getMasterPeriodRes---", getMasterPeriodRes);
      setGroupList(getMasterPeriodRes.data.message.data.group);
      // setPeriodList(getMasterPeriodRes.data.message.data.period);
    } catch (error) {
      console.log(error);
    }
  };
  const getSubjectStaff = async (course, batch, semester) => {
    console.log("batch-semester---", course, batch);
    setShowStudent(false);
    setSubjectList([]);
    setEmployeeList([]);
    setTopicList([]);
    setSectionList([]);
    if (course && batch) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
            "subject",
            course,
            batch,
            semester
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSubjectList(getMasterSubjectStaffRes.data.message.data.subject);
        setEmployeeList(getMasterSubjectStaffRes.data.message.data.staff);
        setSectionList(getMasterSubjectStaffRes.data.message.data.section);
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
    formikRef.current.setFieldValue("staff", "");
    console.log("text---", course);
    setBatchList([]);
    // setSemesterList([]);
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
        setBatchList(getMasterSubjectStaffRes.data.message.data.batch);
        // setSemesterList(getMasterSubjectStaffRes.data.message.data.semester);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getCourseList = async (value) => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getCourseList(value);
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      if (!getMasterSubjectStaffRes.data.message.success) {
        setModalMessage(getMasterSubjectStaffRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleShowAttendance = async (values) => {
    if (load) return;
    setUnSavedChanges(false);
    setTopicUpdated(null);
    setMessage("");
    setPrevAttendance([]);

    console.log(
      "values---",
      values,
      values.period.map((item) => item.periodID).join(",")
    );
    setData([]);
    // setTopic([]);
    setPresentAll(false);
    setTopicUpdated(null);
    setTopicError(false);
    try {
      setLoad(true);
      const getAttendanceDetailsRes = await academicApi.getAttendanceDetails(
        role === "SUPERADMIN" ? 1 : 0,
        values.course.courseID,
        semester,
        values.section.classID,
        values.subject.subjectID,
        values.subject.isMandatory,
        moment(values.attendanceDate).format("yyyy-MM-DD"),
        values.period.map((item) => `${item.periodID}`).join(","),
        values?.staff?.employeeID ?? null,
        values?.group?.groupID ?? null,
        values?.group?.groupXClassID ?? null
      );
      console.log("getAttendanceDetailsRes---", getAttendanceDetailsRes);

      // if (
      //   getAttendanceDetailsRes.data.message.data.existing_attendance &&
      //   getAttendanceDetailsRes.data.message.data.existing_attendance.data &&
      //   getAttendanceDetailsRes.data.message.data.existing_attendance.data
      //     .prev_attendance.length > 0
      // ) {
      //   setExistingAttendance(
      //     getAttendanceDetailsRes.data.message.data.existing_attendance
      //   );
      // }
      if (getAttendanceDetailsRes.data.message.success === false) {
        setLoad(false);
        setMessage(getAttendanceDetailsRes.data.message.message);
        setPrevAttendance(
          getAttendanceDetailsRes.data.message.data.prev_attendance
        );
        setShowStudent(false);
        return;
      }
      if (
        getAttendanceDetailsRes.data.message.data.staff.length === 0 &&
        getAttendanceDetailsRes.data.message.data.student.length === 0
      ) {
        setModalTitle("Student");
        setModalMessage("No Students found");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setExistingAttendance(
        getAttendanceDetailsRes.data.message.data.existing_attendance
      );
      if (
        getAttendanceDetailsRes.data.message.data.existing_attendance &&
        getAttendanceDetailsRes.data.message.data.existing_attendance.data &&
        getAttendanceDetailsRes.data.message.data.existing_attendance.data
          .prev_attendance.length > 0
      ) {
        setShowStudent(false);
      } else {
        setShowStudent(true);
      }

      if (
        getAttendanceDetailsRes.data.message.data.attendanceDetail.length > 0
      ) {
        setTopicUpdated(
          getAttendanceDetailsRes.data.message.data.attendanceDetail
            .map((item) => item.topic)
            .join(", ")
        );
      }

      // for (
      //   let k = 0;
      //   k < getAttendanceDetailsRes.data.message.data.student.length;
      //   k++
      // ) {
      //   getAttendanceDetailsRes.data.message.data.student[k].isLate =
      //     getAttendanceDetailsRes.data.message.data.student[k].isLate ?? 0;
      // }

      // setInitialData(getAttendanceDetailsRes.data.message.data.student);
      setAttendanceStaff(
        getAttendanceDetailsRes.data.message.data.existing_attendance
      );

      // let uniqueStaffIDs = new Set(
      //   getAttendanceDetailsRes.data.message.data.existing_attendance.map(
      //     (staff) => staff.staffID
      //   )
      // );
      // let uniqueSubjectIDs = new Set(
      //   getAttendanceDetailsRes.data.message.data.existing_attendance.map(
      //     (staff) => staff.subjectID
      //   )
      // );
      // setUniqStaff(uniqueStaffIDs);
      // setUniqSubject(uniqueSubjectIDs);

      setAttendanceDetail(
        getAttendanceDetailsRes.data.message.data.attendanceDetail
      );
      setData(getAttendanceDetailsRes.data.message.data.student);
      setEmployeeList(getAttendanceDetailsRes.data.message.data.staff);
      // setTopicList(getAttendanceDetailsRes.data.message.data.topic);
      getAttendanceDetailsRes.data.message.data.staff.length > 0
        ? formikRef?.current?.setFieldValue(
            "staff",
            getAttendanceDetailsRes.data.message.data.staff[0]
          )
        : formikRef?.current?.setFieldValue("staff", "");
      setLoad(false);
      if (
        getAttendanceDetailsRes.data.message.data.attendanceDetail.length < 1 ||
        absent
      ) {
        setPresentAll(true);
      }
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const handleShowAttendanceStaff = async (values) => {
    if (load) return;
    setUnSavedChanges(false);
    setPrevAttendance([]);
    setExistingAttendance([]);
    console.log(
      role === "SUPERADMIN" ? 1 : 0,
      values.class.courseID,
      values.class.semester,
      values.class.classID,
      values.mySubject,

      moment(values.attendanceDate).format("yyyy-MM-DD"),
      values.period.map((item) => item.periodID).join(","),
      values?.group?.groupID ?? null,
      values?.group?.groupXClassID ?? null,
      "values"
    );
    setData([]);
    setPresentAll(false);
    setTopicUpdated(null);
    setTopicError(false);

    try {
      setLoad(true);
      const getAttendanceDetailsRes = await academicApi.getAttendanceDetails(
        role === "SUPERADMIN" ? 1 : 0,
        values.class.courseID,
        values.class.semester,
        values.class.classID,
        values.mySubject.subjectID,
        values.class.isMandatory,
        moment(values.attendanceDate).format("yyyy-MM-DD"),
        values.period.map((item) => item.periodID).join(","),
        employeeId,
        values?.group?.groupID ?? null,
        values?.group?.groupXClassID ?? null
      );
      console.log("getAttendanceDetailsRes---", getAttendanceDetailsRes);
      setLoad(false);
      if (getAttendanceDetailsRes.data.message.success === false) {
        setLoad(false);
        setMessage(getAttendanceDetailsRes.data.message.message);
        setPrevAttendance(
          getAttendanceDetailsRes.data.message.data.prev_attendance
        );

        return;
      }
      if (
        getAttendanceDetailsRes.data.message.data.staff.length === 0 &&
        getAttendanceDetailsRes.data.message.data.student.length === 0
      ) {
        setModalTitle("Student");
        setModalMessage("No Students found");
        setModalErrorOpen(true);
        setLoad(false);

        return;
      }
      setExistingAttendance(
        getAttendanceDetailsRes.data.message.data.existing_attendance
      );
      if (
        getAttendanceDetailsRes.data.message.data.attendanceDetail.length > 0
      ) {
        setTopicUpdated(
          getAttendanceDetailsRes.data.message.data.attendanceDetail
            .map((item) => item.topic)
            .join(", ")
        );
      }
      // for (
      //   let k = 0;
      //   k < getAttendanceDetailsRes.data.message.data.student.length;
      //   k++
      // ) {
      //   getAttendanceDetailsRes.data.message.data.student[k].isLate =
      //     getAttendanceDetailsRes.data.message.data.student[k].isLate ?? 0;
      // }

      // setInitialData(getAttendanceDetailsRes.data.message.data.student);
      setAttendanceDetail(
        getAttendanceDetailsRes.data.message.data.attendanceDetail
      );
      setData(getAttendanceDetailsRes.data.message.data.student);
      setEmployeeList(getAttendanceDetailsRes.data.message.data.staff);
      // setTopicList(getAttendanceDetailsRes.data.message.data.topic);
      getAttendanceDetailsRes.data.message.data.staff.length > 0
        ? formikRef?.current?.setFieldValue(
            "staff",
            getAttendanceDetailsRes.data.message.data.staff[0]
          )
        : formikRef?.current?.setFieldValue("staff", "");

      // setAttendanceStaff(
      //   getAttendanceDetailsRes.data.message.data.existing_attendance
      // );

      // let uniqueStaffIDs = new Set(
      //   getAttendanceDetailsRes.data.message.data.existing_attendance.map(
      //     (staff) => staff.staffID
      //   )
      // );
      // let uniqueSubjectIDs = new Set(
      //   getAttendanceDetailsRes.data.message.data.existing_attendance.map(
      //     (staff) => staff.subjectID
      //   )
      // );
      // setUniqStaff(uniqueStaffIDs);
      // setUniqSubject(uniqueSubjectIDs);
      // console.log("uniqueStaffIDs---", uniqueSubjectIDs, uniqueStaffIDs);

      // console.log("uniqueStaffIDs---", uniqueStaffIDs);
      setShowStudent(true);
      setLoad(false);
      if (
        getAttendanceDetailsRes.data.message.data.attendanceDetail.length < 1 &&
        getAttendanceDetailsRes.data.message.data.student.length > 0
      ) {
        setPresentAll(true);
      }
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const getMyClass = async (item) => {
    console.log(item, "item");
    try {
      const res = await academicApi.getMySubjectAndClass(
        employeeId,
        item.subjectID
      );
      if (!res.ok) {
      }
      console.log(res, "res");
      setClassData(res.data.message.data.classData);
      if (res.data.message.data.classData.length > 0) {
        formikRef.current.setFieldValue(
          "class",
          res.data.message.data.classData[0]
        );
        getBatchforStaff(res.data.message.data.classData[0].classID, item);
        getAttendanceConfigStaff(formikRef.current.values);
      }
    } catch (error) {}
  };

  const getMySubject = async () => {
    try {
      const res = await academicApi.getMySubjectAndClass(employeeId, null);
      if (!res.ok) {
      }
      console.log(res, "res");
      setMySubjectList(res.data.message.data.subject);
    } catch (error) {}
  };

  const getAttendanceConfig = async (values) => {
    try {
      setPeriodList([]);

      const res = await academicApi.get_attendance_config(
        values.course.courseID,
        values.batch.batchID,
        semester
      );
      console.log(res, "getAttendanceConfig");
      if (!res.ok) {
      }
      console.log(res, "getAttendanceConfig");

      if (res.data.message.data.attendanceConfig.length < 1) {
        setModalTitle("Message");
        setModalMessage("Attendance Config not found");
        setModalErrorOpen(true);
        return;
      }

      setAttendanceConfig(res.data.message.data.attendanceConfig);

      setPeriodList(
        CommonFunction.periodList(
          res.data.message.data.attendanceConfig[0].totalPeriod
        )
      );
    } catch (error) {}
  };

  const getAttendanceConfigStaff = async (values) => {
    try {
      setPeriodList([]);
      const res = await academicApi.get_attendance_config(
        values.class.courseID,
        values.class.batchID,
        values.class.semester
      );
      console.log(res, "getAttendanceConfig");
      if (!res.ok) {
      }
      console.log(res, "getAttendanceConfig");
      setAttendanceConfig(res.data.message.data.attendanceConfig);
      setPeriodList(
        CommonFunction.periodList(
          res.data.message.data.attendanceConfig[0].totalPeriod
        )
      );
    } catch (error) {}
  };

  //handle attendance for staff
  const handleAttendanceStaff = async (values) => {
    if (load) return;

    setUnSavedChanges(false);

    setTopicError(false);
    const today = new Date();
    const selectedDate = new Date(values.attendanceDate);

    // Calculate the difference in milliseconds between the two dates
    const differenceInMilliseconds = today.getTime() - selectedDate.getTime();

    // Convert milliseconds to days
    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );

    // if (differenceInDays > attendanceConfig && attendanceConfig[0].delayDay) {
    //   setModalTitle("Message");
    //   setModalMessage(
    //     `Edit only within ${attendanceConfig[0].delayDay} days. Please contact the Admin`
    //   );
    //   setModalErrorOpen(true);
    //   return;
    // }

    if (topic.length < 1) {
      document.getElementById("topic").focus();
      setTopicError(true);
      return;
    }

    try {
      setLoad(true);

      const attendanceInsertUpdateRes =
        await academicApi.attendanceInsertUpdate(
          data[0].attendanceID,
          topic.map((item) => item.id).join(","),
          values.class.classID,
          employeeId,
          values.mySubject.subjectID,
          values.class.semester,
          moment(values.attendanceDate).format("yyyy-MM-DD"),
          values.period.map((item) => item.periodID).join(","),
          data,
          0,
          values.class.isMandatory,
          values?.group?.groupID ?? null
        );

      console.log("attendanceInsertUpdateRes---", attendanceInsertUpdateRes);
      if (attendanceInsertUpdateRes.data.message.success) {
        // toast.success(attendanceInsertUpdateRes.data.message.message);
        handleClear(attendanceInsertUpdateRes.data.message.message);
        // formikRef.current.resetForm();

        // setData([]);
        // handleShowAttendanceStaff(values);
        // setTopic([]);
        // setAbsent("");
      } else {
        setModalTitle("Message");
        setModalMessage(attendanceInsertUpdateRes.data.message.message);
        setModalErrorOpen(true);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const getTopicList = async (subjectID) => {
    try {
      setLoad(true);
      setTopic([]);
      const getTopicList = await academicApi.getTopicList(subjectID);
      console.log(getTopicList, "getTopicList");
      setTopicList(getTopicList?.data?.message?.data?.topic);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const clearAttendance = async () => {
    console.log(
      existingAttendance.data,
      data[0],
      prevAttendance,
      "existingAttendance"
    );
    try {
      const res = await academicApi.clearAttendance(
        // existingAttendance.data &&
        //   existingAttendance.data.prev_attendance.length > 0
        //   ? existingAttendance.data.prev_attendance
        //       .map((item) => item.attendanceID)
        //       .join(",")

        prevAttendance.length > 0
          ? prevAttendance.map((item) => item.attendanceID).join(",")
          : data[0].attendanceID
          ? data[0].attendanceID.toString()
          : null
      );
      console.log(res, "clearAttendance");
      setConfirmModal(false);
      if (res.data.message.success) {
        toast.success(res.data.message.message);
        setData([]);
        handleShowAttendance(formikRef.current.values);
      } else {
        setModalTitle("Message");
        setModalMessage(res.data.message.message);
        setModalErrorOpen(true);
      }
    } catch (error) {
      console.log("error", error);

      setConfirmModal(false);
    }
  };

  const handleClear = (message) => {
    setSuccessMessage(message);
    formikRef.current.resetForm();
    setPresentAll(false);
    setTopicUpdated(null);
    setTopicError(false);
    setAttendanceStaff([]);
    setAbsent("");
    setTopic([]);
    setAbsentees([]);
    setExistingAttendance([]);
    setPrevAttendance([]);
    setData([]);
    setTopicList([]);
    setEmployeeList([]);
    setSectionList([]);
    setGroupList([]);
    setTopic([]);
    setTopicUpdated(null);
    setTopicError(false);
    setShowStudent(false);
    setAttendanceDetail([]);
  };

  useEffect(() => {
    if (presentAll) checkAll(presentAll);
  }, [presentAll]);

  useEffect(() => {
    // add index to data
    let attendanceData = data;
    if (attendanceData.length > 0) {
      for (let i = 0; i < data.length; i++) {
        attendanceData[i].index = i;
      }
    }

    const absentData = attendanceData.filter(
      (item) => item.attendance === 0 && item.isLate === 0 && item.onDuty === 0
    );

    setAbsentees(absentData);

    // //absentData roll number add in setAbsent
    // let absentRollNo = "";
    // for (let i = 0; i < absentData.length; i++) {
    //   absentRollNo += absentData[i].rollNo + ",";
    // }
    // setAbsent(absentRollNo);
  }, [data]);

  useEffect(() => {
    if (
      !collegeConfig.is_university ||
      role.toUpperCase() !== string.SUPER_ADMIN_ROLE
    ) {
      getMySubject();
      getCourseList(collegeId);
    } else {
      setCourseList([]);
    }
    // getAttendanceConfig();
  }, [collegeConfig.is_university]);

  const onClear = () => {
    setPresentAll(true);
    setTopicUpdated(null);
    setTopicError(false);
    setAttendanceStaff([]);
  };

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
        {role === "Staff" ? (
          <div>
            <div className="row no-gutters">
              <Formik
                enableReinitialize={false}
                innerRef={formikRef}
                initialValues={{
                  attendanceDate: new Date(),
                  mySubject: null,
                  class: null,
                  period: null,
                  group: null,
                  staff: null,
                }}
                validationSchema={staffFormSchema}
                onSubmit={handleShowAttendanceStaff}
              >
                {({
                  values,
                  errors,
                  handleSubmit,
                  setFieldValue,
                  setFieldTouched,
                  resetForm,
                }) => {
                  return (
                    <form onSubmit={handleSubmit} autoComplete="off">
                      <div className="col-lg-8">
                        <DateFieldFormik
                          autoFocus
                          tabIndex={1}
                          mandatory={1}
                          label="Attendance Date"
                          id="attendanceDate"
                          maxDate={new Date()}
                          minDate={
                            attendanceConfig.length > 0
                              ? new Date(attendanceConfig[0].startDate)
                              : new Date()
                          }
                          labelSize={3}
                          onChange={(e) => {
                            setShowStudent(false);
                            setFieldValue("attendanceDate", e.target.value);
                            setPrevAttendance([]);
                            setExistingAttendance([]);
                            setMessage("");
                          }}
                          style={{ width: "30%" }}
                        />

                        <SelectFieldFormik
                          tabIndex={2}
                          label="Subject"
                          id="mySubject"
                          mandatory={1}
                          labelSize={3}
                          getOptionLabel={(option) => option.subjectName}
                          getOptionValue={(option) => option.subjectName}
                          options={mySubjectList}
                          onChange={(text) => {
                            setFieldValue("mySubject", text);
                            setFieldValue("class", null);
                            setFieldValue("staff", null);
                            setFieldValue("period", null);
                            setFieldValue("group", null);
                            setFieldTouched("class", false);
                            setFieldTouched("staff", false);
                            setFieldTouched("period", false);
                            setFieldTouched("group", false);
                            setAbsent("");

                            setTopicUpdated(null);
                            setTopic([]);
                            setShowStudent(false);
                            getMyClass(text);
                            setPrevAttendance([]);
                            setExistingAttendance([]);
                            setMessage("");
                            getTopicList(text.subjectID);
                            setSuccessMessage("");
                            console.log(text, "text");
                          }}
                          style={{ width: "90%" }}
                        />
                        {classData.length > 1 ? (
                          <SelectFieldFormik
                            tabIndex={3}
                            label={RENAME?.sem}
                            id="class"
                            mandatory={1}
                            labelSize={3}
                            getOptionLabel={(option) =>
                              collegeConfig.institution_type === 1
                                ? `${option.semester} - ${option.section} ${RENAME?.section}, ${option.courseName}`
                                : `${option.section} ${RENAME?.section}, ${option.courseName}`
                            }
                            getOptionValue={(option) => option.classID}
                            options={classData}
                            onChange={(text) => {
                              setFieldValue("class", text);
                              setFieldValue("staff", null);
                              setFieldValue("period", null);
                              setFieldValue("group", null);
                              setFieldTouched("staff", false);
                              setFieldTouched("period", false);
                              setFieldTouched("group", false);
                              setTopicUpdated(null);
                              setTopic([]);
                              setShowStudent(false);
                              getBatchforStaff(text.classID, values.mySubject);
                              getAttendanceConfigStaff(values);
                              setPrevAttendance([]);
                              setExistingAttendance([]);
                              setMessage("");
                              setAbsent("");
                            }}
                            style={{ width: "100%" }}
                          />
                        ) : (
                          <DisplayText
                            labelSize={3}
                            label={RENAME?.sem}
                            value={
                              classData.length > 0
                                ? collegeConfig.institution_type === 1
                                  ? `${classData[0].semester} - ${classData[0].section} ${RENAME?.section}, ${classData[0].courseName}`
                                  : `${classData[0].section} ${RENAME?.section}, ${classData[0].courseName}`
                                : "-"
                            }
                          />
                        )}
                        {groupList.length > 0 ? (
                          <SelectFieldFormik
                            label="Group"
                            id="group"
                            tabIndex={classData.length > 1 ? 4 : 3}
                            mandatory={1}
                            labelSize={3}
                            getOptionLabel={(option) => option.groupName}
                            getOptionValue={(option) => option.groupID}
                            options={groupList}
                            searchIcon={false}
                            style={{ width: "50%" }}
                            onChange={(text) => {
                              setShowStudent(false);
                              setFieldValue("group", text);
                              setFieldValue("period", null);
                              setFieldTouched("period", false);
                              setPrevAttendance([]);
                              setExistingAttendance([]);
                              setMessage("");
                              setTopicUpdated(null);
                              setTopic([]);

                              setShowStudent(false);
                              setPrevAttendance([]);
                              setExistingAttendance([]);
                              setMessage("");
                              setAbsent("");
                            }}
                          />
                        ) : null}
                        <SelectFieldFormik
                          tabIndex={
                            classData.length > 1
                              ? groupList.length > 0
                                ? 5
                                : 4
                              : 3
                          }
                          label="Period"
                          id="period"
                          isMulti={true}
                          mandatory={1}
                          labelSize={3}
                          options={periodList}
                          getOptionLabel={(option) => option.label}
                          getOptionValue={(option) => option.label}
                          style={{ width: "70%" }}
                          searchIcon={false}
                          onChange={(text) => {
                            setShowStudent(false);
                            setFieldValue("period", text.length ? text : null);
                            setShowStudent(false);
                            setPrevAttendance([]);
                            setExistingAttendance([]);
                            setMessage("");
                            setAbsent("");

                            console.log(text, "period");
                          }}
                        />
                      </div>

                      {topicUpdated && (
                        <DisplayText
                          labelSize={2}
                          label="Updated Topic"
                          value={topicUpdated}
                        />
                      )}

                      <ReactSelectField
                        tabIndex={
                          classData.length > 1
                            ? groupList.length > 0
                              ? 6
                              : 5
                            : 4
                        }
                        label={"Topic"}
                        id="topic"
                        labelSize={2}
                        getOptionLabel={(option) => option.topic}
                        getOptionValue={(option) => option.id}
                        value={topic}
                        options={topicList}
                        isMulti={true}
                        mandatory={1}
                        error={topicError ? "Please select Topic" : ""}
                        touched={topicError ? true : false}
                        onChange={(txt) => {
                          setTopicError(false);
                          setTopic(txt);
                        }}
                        style={{ width: "60%" }}
                      />
                      <TextFieldFormik
                        tabIndex={
                          classData.length > 1
                            ? groupList.length > 0
                              ? 7
                              : 6
                            : 5
                        }
                        type="number"
                        id="absent"
                        value={absent}
                        label="Absentees"
                        placeholder={"1,2,3 etc..."}
                        labelSize={2}
                        style={{ width: "50%" }}
                        onChange={(e) => {
                          setAbsent(e.target.value);
                          handleAbsent(e.target.value);
                        }}
                      />

                      <div>
                        <Button
                          tabIndex={
                            classData.length > 1
                              ? groupList.length > 0
                                ? 8
                                : 7
                              : 6
                          }
                          text={"Show"}
                          onClick={(e) => {
                            preFunction.handleErrorFocus(errors);
                          }}
                        />
                      </div>
                      {successMessage != "" && (
                        <div
                          className="col-lg-12 mt-4 text-center"
                          style={{
                            color: "#3d5179",
                            fontWeight: "bold",
                            fontSize: "18px",
                          }}
                        >
                          {successMessage}
                        </div>
                      )}
                    </form>
                  );
                }}
              </Formik>
            </div>
          </div>
        ) : (
          <div className="row no-gutters">
            <Formik
              enableReinitialize={false}
              innerRef={formikRef}
              initialValues={{
                attendanceDate: new Date(),
                college: null,
                course: null,
                batch: null,
                section: null,
                semester: null,
                subject: null,
                staff: null,
                period: null,
                group: null,
              }}
              validationSchema={FormSchema}
              onSubmit={handleShowAttendance}
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
                    <div className="row no-gutters">
                      <div className="col-lg-8">
                        {collegeConfig.is_university ? (
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
                              setFieldValue("college", text);
                              setFieldTouched("college", false);
                              setShowStudent(false);
                              setFieldValue("course", null);
                              setFieldValue("batch", null);
                              setFieldValue("semester", null);
                              setFieldValue("section", null);
                              setFieldValue("subject", null);
                              setFieldValue("period", null);
                              setFieldValue("group", null);
                              setFieldValue("staff", null);
                              setGroupList([]);
                              setAbsent("");
                              getCourseList(text.collegeID);
                              setMessage("");
                              setPrevAttendance([]);
                              setTopicList([]);
                              setTopic("");
                              setSuccessMessage("");
                            }}
                          />
                        ) : null}
                        <DateFieldFormik
                          tabIndex={2}
                          label="Attendance Date"
                          id="attendanceDate"
                          mandatory={1}
                          maxDate={new Date()}
                          minDate={
                            attendanceConfig.length > 0
                              ? new Date(attendanceConfig[0].startDate)
                              : new Date()
                          }
                          // minDate={moment().subtract(attendanceConfig[0].delayDay , "days")}
                          labelSize={3}
                          onChange={(e) => {
                            setShowStudent(false);
                            setFieldValue("attendanceDate", e.target.value);
                            setMessage("");
                            setPrevAttendance([]);
                          }}
                          style={{ width: "30%" }}
                        />

                        <SelectFieldFormik
                          tabIndex={collegeConfig.is_university ? 3 : 2}
                          label={RENAME?.course}
                          labelSize={3}
                          id="course"
                          mandatory={1}
                          // maxlength={10}
                          getOptionLabel={(option) => option.courseName}
                          getOptionValue={(option) => option.courseID}
                          options={courseList}
                          onChange={(text) => {
                            setShowStudent(false);
                            setTopicUpdated(null);
                            setFieldValue("course", text);
                            setFieldTouched("course", false);
                            setFieldValue("batch", null);
                            setFieldValue("semester", null);
                            setFieldValue("section", null);
                            setFieldValue("subject", null);
                            setFieldValue("period", null);
                            setFieldValue("group", null);
                            setFieldValue("staff", null);
                            setTopicList([]);
                            setTopic("");
                            setGroupList([]);
                            getBatchMaster(text);
                            getSubjectStaff(
                              text?.courseID,
                              values.batch?.batchID,
                              values.batch?.semester
                            );
                            setAbsent("");
                            setMessage("");
                            setPrevAttendance([]);
                          }}
                          style={{ width: "90%" }}
                        />

                        <>
                          <SelectFieldFormik
                            tabIndex={collegeConfig.is_university ? 4 : 3}
                            label={RENAME?.sem}
                            id="batch"
                            mandatory={1}
                            labelSize={3}
                            getOptionLabel={(option) => option.className}
                            getOptionValue={(option) => option.semester}
                            options={batchList}
                            style={{ width: "50%" }}
                            onChange={(text) => {
                              setShowStudent(false);
                              setTopicUpdated(null);
                              setAbsent("");

                              setFieldValue("batch", text);
                              setFieldTouched("batch", false);
                              setFieldValue("semester", null);
                              setFieldValue("section", null);
                              setFieldValue("subject", null);
                              setFieldValue("period", null);
                              setFieldValue("group", null);
                              setFieldValue("staff", null);
                              setTopicList([]);
                              setTopic("");
                              setGroupList([]);
                              setSemester(text?.semester);
                              getSubjectStaff(
                                values.course?.courseID,
                                text?.batchID,
                                text?.semester
                              );
                              setMessage("");
                              setPrevAttendance([]);
                            }}
                          />

                          <>
                            {collegeConfig.institution_type !== 1 ? (
                              <DisplayText
                                labelSize={3}
                                label={RENAME?.year}
                                value={
                                  values.batch?.year ? values.batch?.year : "-"
                                }
                              />
                            ) : null}
                            <SelectFieldFormik
                              tabIndex={collegeConfig.is_university ? 5 : 4}
                              label={RENAME?.section}
                              id="section"
                              mandatory={1}
                              labelSize={3}
                              getOptionLabel={(option) => option.section}
                              getOptionValue={(option) => option.classID}
                              options={sectionList}
                              style={{ width: "30%" }}
                              onChange={(text) => {
                                setShowStudent(false);
                                setTopicUpdated(null);
                                setAbsent("");

                                setFieldValue("section", text);
                                setFieldTouched("section", false);
                                setFieldValue("subject", null);
                                setFieldValue("period", null);
                                setFieldValue("group", null);
                                setFieldTouched("period", false);
                                setFieldValue("staff", null);
                                setTopicList([]);
                                setTopic("");
                                setGroupList([]);
                                getAttendanceConfig(formikRef.current.values);
                                setMessage("");
                                setPrevAttendance([]);
                              }}
                            />
                            <SelectFieldFormik
                              tabIndex={collegeConfig.is_university ? 6 : 5}
                              label="Subject"
                              id="subject"
                              mandatory={1}
                              labelSize={3}
                              getOptionLabel={(option) => option.subjectName}
                              getOptionValue={(option) => option.subjectID}
                              options={subjectList}
                              searchIcon={false}
                              onChange={(text) => {
                                console.log(text, "subject");
                                setShowStudent(false);
                                setTopicUpdated(null);
                                setAbsent("");

                                setFieldValue("subject", text);
                                setFieldTouched("subject", false);
                                setFieldValue("period", null);
                                setFieldValue("group", null);
                                setFieldValue("staff", null);
                                setTopicList([]);
                                setTopic("");
                                values.section.classID &&
                                  getPeriodBatch(values.section.classID, text);
                                getTopicList(text?.subjectID);
                                setMessage("");
                                setPrevAttendance([]);
                                setFieldTouched("period", false);
                              }}
                              style={{ width: "80%" }}
                            />
                            {groupList.length > 0 && (
                              <SelectFieldFormik
                                tabIndex={collegeConfig.is_university ? 7 : 6}
                                label="Group"
                                id="group"
                                disabled={groupList.length < 1 ? true : false}
                                mandatory={1}
                                labelSize={3}
                                getOptionLabel={(option) => option.groupName}
                                getOptionValue={(option) => option.groupID}
                                options={groupList}
                                searchIcon={false}
                                style={{ width: "50%" }}
                                onChange={(text) => {
                                  setShowStudent(false);
                                  setTopicUpdated(null);
                                  setAbsent("");
                                  console.log(text, "group");
                                  setPrevAttendance([]);
                                  setFieldValue("group", text);
                                  setMessage("");
                                  setFieldTouched("period", false);
                                  setFieldTouched("group", false);
                                  setFieldValue("staff", null);
                                }}
                              />
                            )}
                            <SelectFieldFormik
                              tabIndex={
                                collegeConfig.is_university &&
                                groupList.length > 0
                                  ? 8
                                  : !collegeConfig.is_university &&
                                    groupList.length > 0
                                  ? 7
                                  : collegeConfig.is_university &&
                                    groupList.length == 0
                                  ? 7
                                  : 6
                              }
                              label="Period"
                              id="period"
                              isMulti={true}
                              mandatory={1}
                              labelSize={3}
                              options={periodList}
                              getOptionLabel={(option) => option.label}
                              getOptionValue={(option) => option.label}
                              style={{ width: "70%" }}
                              searchIcon={false}
                              onChange={(text) => {
                                setShowStudent(false);
                                setTopicUpdated(null);
                                setFieldValue("staff", null);

                                setAbsent("");

                                setFieldTouched("period", false);
                                setFieldValue(
                                  "period",
                                  text.length ? text : null
                                );
                                setMessage("");
                                setPrevAttendance([]);

                                console.log(text, "period");
                              }}
                            />
                          </>
                        </>
                      </div>
                      {/* {showStudent && (
                      <> */}
                      <div className="col-lg-4">
                        {values.staff && (
                          <div>
                            <DisplayText
                              labelSize={3}
                              label="Staff "
                              value={
                                values.staff.employeeID +
                                " - " +
                                values.staff.employee_name
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-8">
                      {topicUpdated && (
                        <DisplayText
                          labelSize={3}
                          label="Updated Topic"
                          value={topicUpdated}
                        />
                      )}

                      <ReactSelectField
                        tabIndex={
                          collegeConfig.is_university && groupList.length > 0
                            ? 9
                            : !collegeConfig.is_university &&
                              groupList.length > 0
                            ? 8
                            : collegeConfig.is_university &&
                              groupList.length == 0
                            ? 8
                            : 7
                        }
                        label={"Topic"}
                        id="topic"
                        labelSize={3}
                        getOptionLabel={(option) => option.topic}
                        getOptionValue={(option) => option.id}
                        value={topic}
                        options={topicList}
                        isMulti={true}
                        mandatory={1}
                        error={topicError ? "Please select Topic" : ""}
                        touched={topicError ? true : false}
                        onChange={(txt) => {
                          setTopicError(false);
                          setTopic(txt);
                        }}
                        style={{ width: "80%" }}
                      />

                      <TextFieldFormik
                        tabIndex={
                          collegeConfig.is_university && groupList.length > 0
                            ? 10
                            : !collegeConfig.is_university &&
                              groupList.length > 0
                            ? 9
                            : collegeConfig.is_university &&
                              groupList.length == 0
                            ? 9
                            : 8
                        }
                        type="number"
                        id="absent"
                        label="Absentees"
                        placeholder={"1,2,3 etc..."}
                        value={absent}
                        labelSize={3}
                        onChange={(e) => {
                          // if (
                          //   !isNaN(e.target.value)
                          //   // &&
                          //   // !e.target.value.includes(",")
                          // ) {
                          setAbsent(e.target.value);
                          handleAbsent(e.target.value);
                          // }
                        }}
                      />
                    </div>
                    {/* </>
                    )} */}
                    <div>
                      <Button
                        tabIndex={
                          collegeConfig.is_university && groupList.length > 0
                            ? 11
                            : !collegeConfig.is_university &&
                              groupList.length > 0
                            ? 10
                            : collegeConfig.is_university &&
                              groupList.length == 0
                            ? 10
                            : 9
                        }
                        text={"Show"}
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                      {successMessage != "" && (
                        <div
                          className="col-lg-12 mt-4 text-center"
                          style={{
                            color: "#3d5179",
                            fontWeight: "bold",
                            fontSize: "18px",
                          }}
                        >
                          {successMessage}
                        </div>
                      )}
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        )}
        {existingAttendance.data &&
          existingAttendance.data.prev_attendance &&
          existingAttendance.data.prev_attendance.length > 0 &&
          existingAttendance.data.prev_attendance.map((item) => {
            return <div>{item.message}</div>;
          })}
        {prevAttendance.length > 0 && (
          <div className="row no-gutters mt-3">
            {prevAttendance.map((item) => {
              return <div>{item.message}</div>;
            })}
            <div className="row no-gutters mt-3">
              <div className="col-10 text-center ">{message}</div>

              {role === "Staff" ? null : (
                <div className=" text-end">
                  <span
                    className="text-primary"
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => setConfirmModal(true)}
                  >
                    Delete
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {showStudent && (
          <>
            <div className="row no-gutters mt-3">
              {data.length > 0 && (
                <div className="text-end">
                  <span
                    className="text-primary "
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => setConfirmModal(true)}
                  >
                    Delete
                  </span>
                </div>
              )}
            </div>
            <div className="row mt-0">
              <div className="subhead-row p-0">
                <div className="subhead">Student List</div>
                <div className="col line-div"></div>
              </div>

              <div className="row no-gutters mt-2">
                <table className="table table-bordered ">
                  <thead>
                    <tr>
                      <th width="1%">Roll No</th>
                      <th width="5%">Registration Number</th>
                      <th> Student Name</th>
                      <th width="5%">
                        Present
                        <input
                          type="checkbox"
                          id="selectAll"
                          className="ms-1"
                          value={presentAll}
                          checked={presentAll}
                          onClick={(e) => {
                            checkAll(
                              e.currentTarget.value === "false" ? true : false
                            );
                            setPresentAll(
                              e.currentTarget.value === "false" ? true : false
                            );
                            setUnSavedChanges(true);
                          }}
                        />
                      </th>
                      <th width="2%">Leave</th>
                      <th width="2%">Late</th>
                      <th width="2%">OD</th>
                    </tr>
                  </thead>
                  {data.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colspan={9} align="center">
                          No Students found
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {data.map((item, index) => {
                        return (
                          <tr>
                            <td>{item.rollNo}</td>
                            <td>{item.registrationNo}</td>
                            <td>{item.name}</td>
                            <td align="center">
                              <input
                                type="checkbox"
                                checked={item.attendance}
                                onClick={(e) => {
                                  if (!e.target.checked) {
                                    document.getElementById(
                                      "selectAll"
                                    ).checked = false;
                                    setPresentAll(false);
                                  }

                                  if (data[index].attendance == 0) {
                                    data[index].attendance = 1;
                                    data[index].isLeave = 0;
                                    data[index].onDuty = 0;
                                    data[index].isLate = 0;
                                  } else {
                                    data[index].attendance = 0;
                                    data[index].isLate = 0;
                                  }

                                  setData([...data]);
                                  setUnSavedChanges(true);
                                }}
                              />
                            </td>
                            <td align="center">
                              <input
                                type="checkbox"
                                name="leave"
                                id="leave"
                                checked={item.isLeave}
                                onClick={(e) => {
                                  if (data[index].isLeave == 0) {
                                    data[index].attendance = 0;
                                    data[index].isLeave = 1;
                                    data[index].isLate = 0;
                                    data[index].onDuty = 0;
                                    document.getElementById(
                                      "selectAll"
                                    ).checked = false;
                                    setPresentAll(false);
                                  } else {
                                    data[index].isLeave = 0;
                                  }
                                  setData([...data]);
                                  setUnSavedChanges(true);
                                }}
                              />
                            </td>
                            <td align="center">
                              <input
                                type="checkbox"
                                name="late"
                                id="leave"
                                checked={item.isLate}
                                onClick={(e) => {
                                  // data[index].isLate =
                                  //   e.target.checked &&
                                  //   data[index].isLeave === 0
                                  //     ? 1
                                  //     : 0;
                                  if (data[index].isLate == 0) {
                                    data[index].attendance = 1;
                                    data[index].isLeave = 0;
                                    data[index].isLate = 1;
                                    data[index].onDuty = 0;
                                    document.getElementById(
                                      "selectAll"
                                    ).checked = false;
                                    setPresentAll(false);
                                  } else {
                                    data[index].isLate = 0;
                                  }
                                  setData([...data]);
                                  setUnSavedChanges(true);
                                }}
                              />
                            </td>
                            <td align="center">
                              <input
                                type="checkbox"
                                name="od"
                                id="od"
                                checked={item.onDuty}
                                onClick={(e) => {
                                  if (data[index].onDuty == 0) {
                                    data[index].attendance = 0;
                                    data[index].isLeave = 0;
                                    data[index].isLate = 0;
                                    data[index].onDuty = 1;
                                    document.getElementById(
                                      "selectAll"
                                    ).checked = false;
                                    setPresentAll(false);
                                  } else {
                                    data[index].onDuty = 0;
                                  }

                                  setData([...data]);
                                  setUnSavedChanges(true);
                                }}
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
            {absentees.length > 0 && (
              <div className="ms-2 mt-2">
                <div className="subhead-row p-0">
                  <div className="subhead">Absentees</div>
                  <div className="col line-div"></div>
                </div>
                <div className="mt-1">
                  {absentees.map((item, index) => (
                    <div key={index} className="row mb-1">
                      <div className="col-4 border p-1 d-flex align-items-center">
                        <span>
                          {item.rollNo} - {item.name}
                        </span>
                      </div>
                      <div
                        className="col-1 border d-flex align-items-center justify-content-center"
                        onClick={() => {
                          console.log("clicked");
                          data[item.index].attendance = 1;
                          data[item.index].isLeave = 0;
                          data[item.index].onDuty = 0;
                          setData([...data]);
                          setUnSavedChanges(true);
                          console.log(data[index], "data");
                        }}
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <Icon iconName={"Close"} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              // className="ms-2 text-center"
              className="ms-2 "
              style={{ color: "GrayText" }}
            >
              {existingAttendance.success && data.length > 0 && (
                <Button
                  id="save"
                  text="F4 - Save"
                  type="button"
                  onClick={(e) => {
                    role === "Staff"
                      ? handleAttendanceStaff(formikRef.current.values)
                      : handleAttendance(formikRef.current.values);
                  }}
                />
              )}
              {/* {role === "Staff" ? (
                (attendanceStaff.length > 0 &&
                  !uniqStaff.has(parseInt(employeeId))) ||
                uniqStaff.size > 1 ? (
                  <div
                    className="row m-2 ms-0 no-gutters "
                    style={{ color: "GrayText" }}
                  >
                    {attendanceStaff.map((item) => {
                      return (
                        <div>
                          Period: {item.period}, Already {item.employee_name}{" "}
                          Posted on {item.subjectName}
                        </div>
                      );
                    })}
                    <div>Please contact the admin for assistance.</div>
                  
                  </div>
                ) : (
                  <Button
                    id="save"
                    text="F4 - Save"
                    type="button"
                    onClick={(e) => {
                      handleAttendanceStaff(formikRef.current.values);
                    }}
                  />
                )
              ) : (
                existingAttendance.success && (
                  <Button
                    id="save"
                    text="F4 - Save"
                    type="button"
                    onClick={(e) => {
                      handleAttendance(formikRef.current.values);
                    }}
                  />
                )
              )} */}
            </div>
          </>
        )}
      </div>
      {
        /* confirm Modal */
        confirmModal && (
          <ModalComponent
            title={"Confirm"}
            isOpen={confirmModal}
            message={"Are you sure to delete the attendance?"}
            yesClickButtonTitle={"Yes"}
            noClickButtonTitle={"No"}
            yesClick={() => {
              clearAttendance();
            }}
            noClick={() => {
              setConfirmModal(false);
            }}
          />
        )
      }
    </div>
  );
}

export default StudentAttendance;
