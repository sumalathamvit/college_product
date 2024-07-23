import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";
import moment from "moment";
import { Modal } from "react-bootstrap";
import $ from "jquery";
import { useSelector } from "react-redux";

import academicApi from "../../api/AcademicApi";
import StudentApi from "../../api/StudentApi";
import empApi from "../../api/EmployeeApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import Icon from "../../component/Icon";
import AuthContext from "../../auth/context";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import { schoolSessionList } from "../../component/common/CommonArray";
import ScreenTitle from "../../component/common/ScreenTitle";

function SchoolStudentAttendance() {
  const RENAME = useSelector((state) => state.web.rename);
  const { role, employeeId, setUnSavedChanges } = useContext(AuthContext);

  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [attendanceConfig, setAttendanceConfig] = useState([]);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [absentees, setAbsentees] = useState([]);
  const [staffClassData, setStaffClassData] = useState([]);
  const [courseConfig, setCourseConfig] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [openModalMessage, setOpenModalMessage] = useState("");

  const collegeConfig = useSelector((state) => state.web.college);

  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    employeeNumber:
      role !== "Staff"
        ? Yup.object().required("Please select Employee")
        : Yup.mixed().notRequired(),
    course: $("#course").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#course").attr("alt") ?? RENAME?.course}`
        ),
    class: $("#class").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#class").attr("alt") ?? RENAME?.sem}`
        ),
    section: $("#section").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#section").attr("alt") ?? RENAME?.section}`
        ),
    session: $("#session").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#session").attr("alt") ?? "Session"}`
        ),
    attendanceDate: $("#attendanceDate")
      .attr("class")
      ?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.date().required(
          `Please select ${
            $("#attendanceDate").attr("alt") ?? "Attendance Date"
          }`
        ),
  });

  const handleSaveAttendance = async (values) => {
    if (load) return;
    console.log("values", values);
    console.log("data", data);

    let restData = data.map(
      ({ rollNo, registrationNo, name, presentCount, ...rest }) => rest
    );

    let filteredData = restData.map((student) => ({
      ...student,
      forenoonAttendance: student.forenoonAttendance ?? 0,
      afternoonAttendance: student.afternoonAttendance ?? 0,
    }));

    console.log("restData", filteredData);

    try {
      setLoad(true);
      setShowRes(true);
      const attendanceDataRes = await academicApi.addSchoolAttendance(
        values.attendanceDate,
        values.section.value,
        values.session.value === "FN"
          ? role == "Staff"
            ? employeeId
            : values.employeeNumber.custom_employeeid
          : staffData[0]?.forenoonEmployeeID
          ? staffData[0].forenoonEmployeeID
          : null,
        values.session.value === "AN"
          ? role == "Staff"
            ? employeeId
            : values.employeeNumber.custom_employeeid
          : staffData[0]?.afternoonEmployeeID
          ? staffData[0].afternoonEmployeeID
          : null,
        values.class.value,
        filteredData
      );
      console.log("attendanceRes", attendanceDataRes);

      if (attendanceDataRes.data.message.success) {
        setSuccessMessage(attendanceDataRes.data.message.message);
        formikRef.current.resetForm();
        setAbsentees([]);
        setShowRes(false);
        setData([]);
        setStaffData([]);
        setCourseList([]);
        setClassList([]);
        setSectionList([]);
        setUnSavedChanges(false);
        if (role == "Staff") {
          document.getElementById("course").focus();
        } else {
          document.getElementById("employeeNumber").focus();
        }
      } else {
        setModalMessage(attendanceDataRes.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleShowAttendance = async (values) => {
    if (load) return;
    // formikRef.current.setFieldValue("employeeNumber", "");
    console.log("attendanceConfig", attendanceConfig);
    if (attendanceConfig.length == 0) {
      setModalMessage("Attendance Configuration not found");
      setModalTitle("Message");
      setModalErrorOpen(true);
      return;
    }
    if (attendanceConfig[0].startDate > values.attendanceDate) {
      setModalMessage(
        "Attendance date should be start " +
          attendanceConfig[0].startDate +
          " after"
      );
      setModalTitle("Message");
      setModalErrorOpen(true);
      return;
    }

    console.log("values", values);
    setAbsentees([]);
    try {
      setLoad(true);
      setShowRes(true);
      const attendanceRes = await academicApi.getSchoolAttendance(
        values.attendanceDate,
        values.section.value
      );
      console.log("attendanceRes--------------", attendanceRes);
      if (!attendanceRes.data.message.success) {
        setModalMessage(attendanceRes.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      let attData = attendanceRes.data.message.data.attendance_detail;
      let staffData = attendanceRes.data.message.data.staff_data;
      setStaffData(attendanceRes.data.message.data.staff_data);
      if (attendanceRes.data.message.success) {
        var markAbsentees = [];

        let absentees = [];
        if (values.absentees) absentees = values.absentees.trim().split(",");

        console.log("absentees", absentees);
        console.log("attData", attData);
        console.log("markAbsentees", markAbsentees);
        var filteredData = [];
        if (absentees.length > 0) {
          filteredData = attData.map((item) => {
            if (absentees.includes(item.rollNo?.toString())) {
              if (values.session.value === "FN") {
                item.forenoonAttendance = 0;
              } else {
                item.afternoonAttendance = 0;
              }
              if (!markAbsentees.includes(item)) {
                markAbsentees.push(item);
              }
            } else {
              if (values.session.value === "FN") {
                item.forenoonAttendance = 1;
              } else {
                item.afternoonAttendance = 1;
              }
            }
            return item;
          });
        } else if (staffData.length > 0) {
          for (let i = 0; i < attData.length; i++) {
            if (
              values.session.value === "FN" &&
              staffData[0].forenoonEmployeeID &&
              attData[i].forenoonAttendance === 0
            ) {
              markAbsentees.push(attData[i]);
            } else if (
              values.session.value === "AN" &&
              staffData[0].afternoonEmployeeID &&
              attData[i].afternoonAttendance === 0
            ) {
              markAbsentees.push(attData[i]);
            }
          }
          let empId =
            role == "Staff"
              ? employeeId
              : values.employeeNumber.custom_employeeid;
          let attStaffId =
            values.session.value === "FN"
              ? staffData[0].forenoonEmployeeID
              : staffData[0].afternoonEmployeeID;
          if (attStaffId && empId != attStaffId) {
            setOpenModalMessage(
              `The attendance is already marked by another staff (${
                values.session.value === "FN"
                  ? staffData[0].forenoonEmployeeID +
                    " - " +
                    staffData[0].forenoonEmployeeName
                  : staffData[0].afternoonEmployeeID +
                    " - " +
                    staffData[0].afternoonEmployeeName
              } ) Would you like to update ?`
            );
            setOpenModal(true);
          }
        }

        console.log("Filtered data:", filteredData);

        console.log("filteredData", filteredData);
        console.log("markAbsentees", markAbsentees);
        setAbsentees(markAbsentees);
        setData(filteredData.length > 0 ? filteredData : attData);
      } else {
        setModalMessage(attendanceRes.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleSectionList = async (course, classSection, staffClassData) => {
    console.log("course", course, classSection);
    setSectionList([]);
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("session", "");
    formikRef.current.setFieldValue("absentees", "");
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldTouched("session", false);
    formikRef.current.setFieldTouched("absentees", false);
    setShowRes(false);
    console.log("staffClassData", staffClassData);
    if (course && classSection?.toString()) {
      let sectionData = staffClassData.filter(
        (item) => item.courseName == course && item.semester == classSection
      );
      console.log("sectionData", sectionData);
      if (sectionData.length == 1) {
        formikRef.current.setFieldValue("section", {
          label: sectionData[0].section,
          value: sectionData[0].classID,
        });
      }
      sectionData.sort((a, b) => a.classID - b.classID);
      setSectionList(
        sectionData.map((item) => ({
          label: item.section,
          value: item.classID,
        }))
      );
    }
  };

  const handleCourse = async (course, staffClassData) => {
    formikRef.current.setFieldValue("class", "");
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("session", "");
    formikRef.current.setFieldValue("absentees", "");
    formikRef.current.setFieldTouched("class", false);
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldTouched("session", false);
    formikRef.current.setFieldTouched("absentees", false);
    setShowRes(false);
    if (course && staffClassData) {
      let uniqueSemesters = [];
      let classData = staffClassData.filter((item) => {
        if (
          item.courseName == course &&
          !uniqueSemesters.includes(item.semester)
        ) {
          uniqueSemesters.push(item.semester);
          return true;
        }
        return false;
      });
      console.log("classData", classData);
      classData.sort((a, b) => a.semester - b.semester);

      if (classData.length == 1) {
        formikRef.current.setFieldValue("class", {
          label: classData[0].className,
          value: classData[0].semester,
        });
        handleSectionList(course, classData[0].semester, staffClassData);
        handleAttendanceConfig(classData[0].semester);
      }

      setClassList(
        classData.map((item) => ({
          label: item.className,
          value: item.semester,
        }))
      );
    }
  };

  const checkAll = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    if (document.getElementById("selectAll").checked) {
      setAbsentees([]);
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
        data.forEach((item, index) => {
          if (formikRef.current.values.session.value == "FN") {
            data[index].forenoonAttendance = 1;
          } else {
            data[index].afternoonAttendance = 1;
          }
        });
      });
    } else {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
        data.forEach((item, index) => {
          if (formikRef.current.values.session.value == "FN") {
            data[index].forenoonAttendance = 0;
          } else {
            data[index].afternoonAttendance = 0;
          }
        });
      });
    }
    setData([...data]);
    setUnSavedChanges(true);
  };

  const getCourseList = async (collegeId) => {
    try {
      setLoad(true);
      const masterList = await StudentApi.getMaster(5, collegeId);
      console.log("MasterList5", masterList);
      setCourseConfig(masterList.data.message.data.course_data);

      if (masterList.data.message.data.course_data.length == 1) {
        formikRef.current.setFieldValue(
          "course",
          masterList.data.message.data.course_data[0]
        );
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Error", error);
    }
  };

  const employeeSearch = async (value) => {
    try {
      if (value.length > 1) {
        const employeeRes = await empApi.employeeSearch(value);
        console.log("employeeRes", employeeRes.data.message.employee_data);
        setEmpCodeList(employeeRes.data.message.employee_data);
      } else {
        setEmpCodeList([]);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  const handleEmployeeClassList = async (employee) => {
    formikRef.current.setFieldValue("class", "");
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("session", "");
    formikRef.current.setFieldValue("absentees", "");
    formikRef.current.setFieldTouched("class", false);
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldTouched("session", false);
    formikRef.current.setFieldTouched("absentees", false);

    setShowRes(false);
    if (employee) {
      try {
        const staffRes = await academicApi.getClassbyStaff(
          role == "Staff" ? employeeId : employee.custom_employeeid
        );
        console.log("staffRes", staffRes);

        let staffClassData = staffRes?.data?.message?.data?.staff;
        setStaffClassData(staffClassData);

        const courseData = [
          ...new Set(staffClassData.map((item) => item.courseName)),
        ];

        console.log("courseData", courseData);

        if (courseData.length == 1) {
          formikRef.current.setFieldValue("course", {
            label: courseData[0],
            value: courseData[0],
          });
          handleCourse(courseData[0], staffClassData);
        }
        setCourseList(
          courseData.map((item) => ({
            label: item,
            value: item,
          }))
        );
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const handleAttendanceConfig = async (className) => {
    // formikRef.current.setFieldValue("section", "");
    // formikRef.current.setFieldValue("session", "");
    // formikRef.current.setFieldValue("absentees", "");
    // formikRef.current.setFieldTouched("section", false);
    // formikRef.current.setFieldTouched("session", false);
    // formikRef.current.setFieldTouched("absentees", false);
    setAttendanceConfig([]);
    setShowRes(false);
    if (className?.toString()) {
      try {
        const attendanceConfigRes = await academicApi.get_attendance_config(
          null,
          null,
          className
        );
        console.log("attendanceConfigRes", attendanceConfigRes);
        if (attendanceConfigRes.data.message.success) {
          if (
            attendanceConfigRes.data.message.data.attendanceConfig.length == 0
          ) {
            setModalMessage("Attendance Configuration not found");
            setModalTitle("Message");
            setModalErrorOpen(true);
          } else {
            setAttendanceConfig(
              attendanceConfigRes.data.message.data.attendanceConfig
            );
          }
        } else {
          setModalMessage(attendanceConfigRes.data.message.message);
          setModalTitle("Message");
          setModalErrorOpen(true);
        }
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  useEffect(() => {
    console.log(collegeConfig, "collegeConfig");
    console.log("role", role);
    console.log("employeeId", employeeId);
    getCourseList(collegeConfig.collegeId);
    if (role === "Staff") {
      handleEmployeeClassList(employeeId);
    } else {
      document.getElementById("employeeNumber").focus();
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
        <div className="row no-gutters">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              employeeNumber: "",
              attendanceDate: moment().format("YYYY-MM-DD"),
              course: "",
              class: "",
              section: "",
              session: "",
              absentees: "",
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
              resetForm,
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="row">
                    <div className="col-lg-8">
                      {role !== "Staff" ? (
                        <SelectFieldFormik
                          tabIndex={1}
                          label="Employee No. / Name"
                          id="employeeNumber"
                          style={{ width: "70%" }}
                          labelSize={3}
                          mandatory={1}
                          options={empCodeList}
                          searchIcon={true}
                          getOptionLabel={(option) =>
                            option.custom_employeeid +
                            " - " +
                            option.employee_name
                          }
                          getOptionValue={(option) => option.name}
                          onInputChange={(inputValue) => {
                            employeeSearch(inputValue);
                          }}
                          onChange={(text) => {
                            setFieldValue("employeeNumber", text);
                            handleEmployeeClassList(text);
                            setSuccessMessage("");
                          }}
                        />
                      ) : null}
                      {courseConfig.length > 1 ? (
                        <SelectFieldFormik
                          // autoFocus
                          tabIndex={courseConfig.length > 1 ? 2 : null}
                          label={RENAME?.course}
                          labelSize={3}
                          id="course"
                          mandatory={1}
                          options={courseList}
                          onChange={(text) => {
                            setFieldValue("course", text);
                            handleCourse(text?.value, staffClassData);
                            setSuccessMessage("");
                          }}
                          style={{ width: "50%" }}
                        />
                      ) : null}

                      <SelectFieldFormik
                        tabIndex={courseConfig.length > 1 ? 3 : 2}
                        label={RENAME?.sem}
                        id="class"
                        mandatory={1}
                        labelSize={3}
                        options={classList}
                        style={{ width: "30%" }}
                        onChange={(text) => {
                          setFieldValue("class", text);
                          handleSectionList(
                            values.course?.value,
                            text?.value,
                            staffClassData
                          );
                          handleAttendanceConfig(text?.value);
                        }}
                      />

                      <SelectFieldFormik
                        tabIndex={courseConfig.length > 1 ? 4 : 3}
                        label={RENAME?.section}
                        id="section"
                        mandatory={1}
                        labelSize={3}
                        options={sectionList}
                        style={{ width: "30%" }}
                        onChange={(text) => {
                          setFieldValue("section", text);
                          setFieldValue("absentees", "");
                          setShowRes(false);
                        }}
                      />

                      <SelectFieldFormik
                        tabIndex={courseConfig.length > 1 ? 5 : 4}
                        label={"Session"}
                        id="session"
                        mandatory={1}
                        labelSize={3}
                        options={schoolSessionList}
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.label}
                        style={{
                          width: "30%",
                        }}
                        searchIcon={false}
                        onChange={(text) => {
                          setFieldValue("session", text);
                          setFieldValue("absentees", "");
                          setShowRes(false);
                        }}
                      />

                      <TextFieldFormik
                        tabIndex={courseConfig.length > 1 ? 6 : 5}
                        type="number"
                        id="absentees"
                        label="Absentees"
                        placeholder={"1,2,3 etc..."}
                        labelSize={3}
                        onChange={(e) => {
                          setFieldValue("absentees", e.target.value);
                          // make change in data and absentees
                          let absentees = e.target.value.trim().split(",");
                          console.log("absentees", absentees);
                          let filteredData = data.map((item) => {
                            if (absentees.includes(item.rollNo?.toString())) {
                              if (values.session.value === "FN") {
                                item.forenoonAttendance = 0;
                              } else {
                                item.afternoonAttendance = 0;
                              }
                            } else {
                              if (values.session.value === "FN") {
                                item.forenoonAttendance = 1;
                              } else {
                                item.afternoonAttendance = 1;
                              }
                            }
                            return item;
                          });
                          setAbsentees(
                            filteredData.filter((item) =>
                              values.session.value == "FN"
                                ? item.forenoonAttendance == 0
                                : item.afternoonAttendance == 0
                            )
                          );
                          setData(filteredData);
                        }}
                      />
                    </div>
                    <div className="row col-lg-4 p-0 text-right">
                      <DateFieldFormik
                        label="Attendance Date"
                        id="attendanceDate"
                        mandatory={1}
                        maxDate={new Date()}
                        minDate={
                          attendanceConfig.length > 0
                            ? new Date(attendanceConfig[0].startDate)
                            : new Date(moment().subtract(3, "days"))
                        }
                        labelSize={7}
                        onChange={(e) => {
                          setFieldValue("attendanceDate", e.target.value);
                          setShowRes(false);
                          setFieldValue("absentees", "");
                          setAbsentees([]);
                          setData([]);
                          setStaffData([]);
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    tabIndex={courseConfig.length > 1 ? 7 : 6}
                    text={"Show"}
                    type="submit"
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

                  {showRes && (
                    <>
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
                                  {"Present  "}
                                  <input
                                    type="checkbox"
                                    name="selectAll"
                                    id="selectAll"
                                    onClick={(e) => {
                                      checkAll();
                                      setUnSavedChanges(true);
                                    }}
                                  />
                                </th>
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
                                          checked={
                                            values.session.value == "FN"
                                              ? item.forenoonAttendance
                                              : item.afternoonAttendance
                                          }
                                          onClick={(e) => {
                                            if (values.session.value == "FN") {
                                              data[index].forenoonAttendance = e
                                                .target.checked
                                                ? 1
                                                : 0;
                                            } else {
                                              data[index].afternoonAttendance =
                                                e.target.checked ? 1 : 0;
                                            }
                                            if (!e.target.checked) {
                                              document.getElementById(
                                                "selectAll"
                                              ).checked = false;
                                              if (
                                                absentees.filter(
                                                  (absentee) =>
                                                    absentee.studentID ==
                                                    item.studentID
                                                ).length == 0
                                              ) {
                                                setAbsentees([
                                                  ...absentees,
                                                  {
                                                    rollNo: item.rollNo,
                                                    name: item.name,
                                                    studentID: item.studentID,
                                                  },
                                                ]);
                                              }
                                              setFieldValue(
                                                "absentees",
                                                values.absentees
                                                  ? values.absentees +
                                                      "," +
                                                      item.rollNo
                                                  : item.rollNo
                                              );
                                            } else {
                                              setAbsentees(
                                                absentees.filter(
                                                  (absentee) =>
                                                    absentee.studentID !=
                                                    item.studentID
                                                )
                                              );
                                              setFieldValue(
                                                "absentees",
                                                values.absentees
                                                  ? values.absentees
                                                      .split(",")
                                                      .filter(
                                                        (absentee) =>
                                                          absentee !=
                                                          item.rollNo
                                                      )
                                                      .join(",")
                                                  : ""
                                              );
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
                      <Button
                        id="save"
                        text="F4 - Save"
                        type="button"
                        onClick={(e) => {
                          handleSaveAttendance(values);
                          // resetForm();
                          // setAbsentees([]);
                          // setShowRes(false);
                          // setData([]);
                        }}
                      />

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
                                    // data[item.index].attendance = 1;  do base on condition
                                    console.log("item", item);
                                    let index = data.findIndex(
                                      (student) =>
                                        student.studentID == item.studentID
                                    );
                                    if (values.session.value == "FN") {
                                      data[index].forenoonAttendance = 1;
                                    }
                                    if (values.session.value == "AN") {
                                      data[index].afternoonAttendance = 1;
                                    }

                                    // remove that item from absentees
                                    setAbsentees(
                                      absentees.filter(
                                        (absentee) =>
                                          absentee.studentID != item.studentID
                                      )
                                    );

                                    setData([...data]);
                                    setUnSavedChanges(true);
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
                    </>
                  )}
                  <Modal
                    show={openModal}
                    dialogClassName="my-modal"
                    onEscapeKeyDown={(e) => {
                      setOpenModal(false);
                      setUnSavedChanges(false);
                      setShowRes(false);
                      setData([]);
                      resetForm();
                      setAbsentees([]);
                      document.getElementById("employeeNumber").focus();
                    }}
                  >
                    <Modal.Header>
                      <Modal.Title>Update Attendance ?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="">{openModalMessage}</div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        text="Yes"
                        frmButton={false}
                        onClick={() => {
                          setOpenModal(false);
                        }}
                      />
                      &nbsp;&nbsp;
                      <Button
                        autoFocus
                        text="No"
                        frmButton={false}
                        onClick={() => {
                          setOpenModal(false);
                          setUnSavedChanges(false);
                          setShowRes(false);
                          setData([]);
                          resetForm();
                          setAbsentees([]);
                          document.getElementById("employeeNumber")?.focus();
                        }}
                      />
                    </Modal.Footer>
                  </Modal>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default SchoolStudentAttendance;
