import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import moment from "moment";
import $ from "jquery";

import AcademicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DisplayText from "../../component/FormField/DisplayText";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import AuthContext from "../../auth/context";
import { useSelector } from "react-redux";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";

function AttendanceConfig() {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);

  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [showRes, setShowres] = useState(false);
  const [data, setData] = useState(null);
  const formikRef = useRef();
  const configRef = useRef();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
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
  });

  const handleShow = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      setData(null);
      const attendanceConfigRes = await AcademicApi.getAttendanceConfig(
        values.course.courseID,
        values.semester.batchID,
        values.semester.semester
      );
      console.log("attendanceConfigRes---", attendanceConfigRes);
      if (!attendanceConfigRes.data.message.success) {
        setModalMessage(attendanceConfigRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      handleUnSavedChanges(1);
      configRef?.current?.resetForm();

      setShowres(true);
      if (
        !attendanceConfigRes.data.message.data ||
        attendanceConfigRes.data.message.data.length === 0
      ) {
        document.getElementById("openDate")?.focus();
      } else {
        setData(attendanceConfigRes.data.message.data[0]);
        configRef?.current?.setFieldValue(
          "openDate",
          moment(attendanceConfigRes.data.message.data[0].openDate).format(
            "YYYY-MM-DD"
          )
        );
        if (attendanceConfigRes.data.message.data[0].endDate) {
          configRef?.current?.setFieldValue(
            "closeDate",
            new Date(attendanceConfigRes.data.message.data[0].endDate)
          );
        }
        configRef?.current?.setFieldValue(
          "semComplete",
          attendanceConfigRes.data.message.data[0].semesterComplete
        );
        document.getElementById("closeDate")?.focus();
        if (attendanceConfigRes.data.message.data[0].isSemesterComplete === 1) {
          console.log("jeree");
          handleUnSavedChanges(0);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error=--", error);
    }
  };

  const handleSave = async (values) => {
    if (load) return;
    console.log("values---", values);
    configRef.current.setErrors({});
    if (!values.openDate && !data) {
      configRef.current.setErrors({ openDate: "Please select open Date" });
      document.getElementById("openDate")?.focus();
      return;
    }
    if (
      values.openDate &&
      (values.openDate > moment().add(15, "days").format("YYYY-MM-DD") ||
        values.openDate < moment().subtract(30, "days").format("YYYY-MM-DD"))
    ) {
      configRef.current.setErrors({
        openDate:
          "Please select Open Date from " +
          moment().subtract(30, "days").format("DD-MM-YYYY") +
          " to " +
          moment().add(15, "days").format("DD-MM-YYYY"),
      });
      document.getElementById("openDate")?.focus();
      return;
    }
    if (data && data.startDate) {
      if (!values.closeDate) {
        configRef.current.setErrors({ closeDate: "Please select Close Date" });
        document.getElementById("closeDate")?.focus();
        return;
      }
      if (
        values.closeDate < moment().subtract(30, "days").format("YYYY-MM-DD")
      ) {
        configRef.current.setErrors({
          closeDate:
            "Please select Close Date from " +
            moment().subtract(30, "days").format("DD-MM-YYYY") +
            " to " +
            moment().add(15, "days").format("DD-MM-YYYY"),
        });
        document.getElementById("closeDate")?.focus();
        return;
      }
    }
    try {
      if (!data || !data?.startDate) {
        setLoad(true);
        const insertUpdateAttendanceConfigRes =
          await AcademicApi.insertUpdateAttendanceConfig(
            formikRef.current.values.course.courseID,
            formikRef.current.values.semester.batchID,
            formikRef.current.values.semester.semester,
            moment(values.openDate).format("YYYY-MM-DD")
          );
        console.log(
          "insertUpdateAttendanceConfigRes---",
          insertUpdateAttendanceConfigRes
        );
        if (!insertUpdateAttendanceConfigRes.data.message.success) {
          setModalMessage(insertUpdateAttendanceConfigRes.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        toast.success(insertUpdateAttendanceConfigRes.data.message.message);
        handleShow(formikRef.current.values);
        setShowres(false);
        setData(null);
        setLoad(false);
        return;
      }

      const insertUpdateAttendanceConfigRes =
        await AcademicApi.insertUpdateAttendanceConfig(
          formikRef.current.values.course.courseID,
          formikRef.current.values.semester.batchID,
          formikRef.current.values.semester.semester,
          moment(data?.openDate).format("YYYY-MM-DD"),
          moment(values.closeDate).format("YYYY-MM-DD"),
          values.semComplete
        );
      console.log(
        "insertUpdateAttendanceConfigRes---",
        insertUpdateAttendanceConfigRes
      );
      if (!insertUpdateAttendanceConfigRes.data.message.success) {
        setModalMessage(insertUpdateAttendanceConfigRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(insertUpdateAttendanceConfigRes.data.message.message);
      handleShow(formikRef.current.values);
      setShowres(false);
      setData(null);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const getCourseList = async (value) => {
    try {
      const getMasterSubjectStaffRes = await AcademicApi.getCourseList(value);
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

  const handleCourse = async (course) => {
    formikRef.current.setFieldValue("semester", null);
    console.log("values---", course);
    if (course) {
      const semesterRes = await AcademicApi.getMasterSubjectStaff(
        collegeConfig.is_university ? course.collegeID : collegeId,
        "batch",
        course.courseID
      );

      console.log("semesterRes----", semesterRes);
      if (!semesterRes.data.message.success) {
        setModalMessage(semesterRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        return;
      }

      setSemesterList(semesterRes.data.message.data.batch);
    }
  };

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getCourseList(collegeId);
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
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            innerRef={formikRef}
            enableReinitialize={false}
            initialValues={{
              college: null,
              course: null,
              semester: null,
            }}
            validationSchema={FormSchema}
            onSubmit={handleShow}
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
                    {collegeConfig.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        labelSize={3}
                        id="college"
                        mandatory={1}
                        style={{ width: "70%" }}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setFieldTouched("college", false);
                          setShowres(false);
                          setFieldValue("semester", null);
                          setFieldValue("course", null);
                          handleUnSavedChanges(0);
                          getCourseList(text.collegeID);
                        }}
                      />
                    ) : null}
                    <SelectFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      tabIndex={collegeConfig.is_university ? 2 : 1}
                      label={RENAME?.course}
                      labelSize={3}
                      id="course"
                      mandatory={1}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      options={courseList}
                      style={{ width: "70%" }}
                      onChange={(text) => {
                        handleCourse(text);
                        setShowres(false);
                        setFieldValue("semester", null);
                        setFieldValue("course", text);
                        handleUnSavedChanges(0);
                      }}
                    />
                    <SelectFieldFormik
                      label={RENAME?.sem}
                      labelSize={3}
                      id="semester"
                      tabIndex={collegeConfig.is_university ? 3 : 2}
                      mandatory={1}
                      options={semesterList}
                      style={{ width: "30%" }}
                      maxLength={10}
                      clear={false}
                      getOptionLabel={(option) => option.className}
                      getOptionValue={(option) => option.semester}
                      onChange={(text) => {
                        setShowres(false);
                        setFieldValue("semester", text);
                      }}
                    />
                    <Button
                      text={"Show"}
                      tabIndex={collegeConfig.is_university ? 4 : 3}
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                    />
                  </div>
                </form>
              );
            }}
          </Formik>

          <div
            className="row no-gutters"
            style={{ display: showRes ? "flex" : "none" }}
          >
            <Formik
              innerRef={configRef}
              initialValues={{
                openDate: null,
                closeDate: null,
                semComple: null,
              }}
              onSubmit={handleSave}
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
                    <div className="subhead-row">
                      <div className="subhead">Attendance</div>
                      <div className="col line-div"></div>
                    </div>
                    {!data || !data?.startDate ? (
                      <>
                        <DateFieldFormik
                          autoFocus
                          label="Attendance Open Date"
                          labelSize={3}
                          tabIndex={5}
                          id="openDate"
                          maxDate={moment().add(15, "days")}
                          minDate={moment().subtract(30, "days")}
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("openDate", e.target.value);
                          }}
                          style={{ width: "25%" }}
                        />
                        <Button
                          tabIndex={6}
                          onClick={(e) => preFunction.handleErrorFocus(errors)}
                          id="save"
                          text="F4 - Save"
                        />
                      </>
                    ) : (
                      <>
                        <DisplayText
                          label="Attendance Open Date"
                          labelSize={3}
                          value={
                            data.startDate
                              ? moment(data.startDate).format("DD-MM-YYYY")
                              : "-"
                          }
                        />
                        {data.isSemesterComplete === 1 ? (
                          <>
                            <DisplayText
                              label="Attendance Close Date"
                              labelSize={3}
                              value={moment(data.endDate).format("DD-MM-YYYY")}
                            />
                            <div className="subhead-row">
                              <div className="subhead">Semester Completion</div>
                              <div className="col line-div"></div>
                            </div>
                            <DisplayText
                              label={RENAME?.sem + " Completed"}
                              labelSize={3}
                              value={"Yes"}
                            />
                          </>
                        ) : (
                          <>
                            <DateFieldFormik
                              autoFocus
                              label="Attendance Close Date"
                              labelSize={3}
                              tabIndex={6}
                              id="closeDate"
                              maxDate={moment().add(15, "months")}
                              minDate={moment().subtract(30, "days")}
                              mandatory={1}
                              onChange={(e) => {
                                setFieldValue("closeDate", e.target.value);
                              }}
                              style={{ width: "25%" }}
                            />
                            {data?.closeDate &&
                              moment(data?.closeDate) < moment() && (
                                <>
                                  <div className="subhead-row">
                                    <div className="subhead">
                                      {RENAME?.sem} Completion
                                    </div>
                                    <div className="col line-div"></div>
                                  </div>
                                  <DisplayText
                                    label={RENAME?.sem + " Completed"}
                                    labelSize={3}
                                    value={
                                      <input
                                        type="checkbox"
                                        name="settle"
                                        tabIndex={7}
                                        id="settle"
                                        checked={values.semComplete}
                                        onChange={(e) => {
                                          setFieldValue(
                                            "semComplete",
                                            e.target.checked
                                          );
                                        }}
                                      />
                                    }
                                  />
                                </>
                              )}
                            <Button
                              tabIndex={8}
                              onClick={(e) =>
                                preFunction.handleErrorFocus(errors)
                              }
                              id="save"
                              text="F4 - Save"
                            />
                          </>
                        )}
                      </>
                    )}
                  </form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceConfig;
