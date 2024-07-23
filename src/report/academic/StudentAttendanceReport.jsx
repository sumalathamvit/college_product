import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import moment from "moment";

import academicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import DisplayText from "../../component/FormField/DisplayText";
import CommonFunction from "../../component/common/CommonFunction";
import { useSelector } from "react-redux";
import AuthContext from "../../auth/context";
import ScreenTitle from "../../component/common/ScreenTitle";

function StudentAttendanceReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [showStudent, setShowStudent] = useState(false);
  const [attendanceConfig, setAttendanceConfig] = useState([]);
  const [periodList, setPeriodList] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);

  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),

    attendanceDate: Yup.date().required("Please select Attendance Date"),
    course: Yup.object().required("Please select " + RENAME?.course),

    batch: Yup.object().required("Please select " + RENAME?.sem),
    section: Yup.object().required("Please select " + RENAME?.section),
  });

  const handleExport = async (data, type) => {
    let csvData = [["No.", "Register No.", "Student Name"]];

    periodList.map((item, index) => csvData[0].push(item.label));
    data.map((item, index) => {
      csvData[index + 1] = [index + 1, item.registrationNo, item.name];
      periodList.map((item1, index1) => {
        csvData[index + 1].push(
          item[item1.label] === null ? " " : item[item1.label]
        );
      });
      csvData[index + 1].push(item.total);
      csvData[index + 1].push(item.avg);
      csvData[index + 1].push(item.arrear);
    });
    console.log("csvData---", csvData);
    if (type == 1) {
      preFunction.generatePDF(
        collegeName,
        "Student Attendance Report",
        csvData
      );
    } else {
      preFunction.downloadCSV(csvData, "Student Attendance Report.csv");
    }
  };
  const getSubjectStaff = async (course, batch) => {
    console.log("batch-semester---", course, batch);
    formikRef.current.setFieldTouched("batch", false);
    formikRef.current.setFieldTouched("section", false);

    formikRef.current.setFieldValue("section", "");

    setShowStudent(false);
    setSectionList([]);
    if (batch) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
            "subject",
            course.courseID,
            batch.batchID,
            batch.semester
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSectionList(getMasterSubjectStaffRes.data.message.data.section);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getBatchMaster = async (course) => {
    formikRef.current.setFieldValue("batch", "");
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldTouched("batch", false);
    formikRef.current.setFieldTouched("section", false);
    console.log("text---", course);
    setBatchList([]);
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
        setBatchList(getMasterSubjectStaffRes.data.message.data.batch);
        setSemesterList(getMasterSubjectStaffRes.data.message.data.semester);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getInitialList = async () => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getMasterSubjectStaff(
        collegeConfig.is_university
          ? formikRef.current.values.college.collegeID
          : collegeId,
        "course"
      );
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowAttendance = async (values) => {
    console.log("values---", values);
    setData([]);

    const getAttendanceDetailsRes = await academicApi.getAttendanceReport(
      values.section.classID,
      moment(values.attendanceDate).format("yyyy-MM-DD")
    );
    console.log("getAttendanceDetailsRes---", getAttendanceDetailsRes);

    setData(getAttendanceDetailsRes.data.message.data.student_attendance);
    setShowStudent(true);
  };
  const getAttendanceConfig = async (values) => {
    try {
      const res = await academicApi.get_attendance_config(
        values.course.courseID,
        values.batch.batchID,
        values.batch.semester
      );
      if (!res.ok) {
      }
      console.log(res.data.message.data, "res");
      setAttendanceConfig(res.data.message.data.attendanceConfig);
      setPeriodList(
        CommonFunction.periodList(
          res.data.message.data.attendanceConfig[0].totalPeriod
        )
      );
    } catch (error) {}
  };

  const getCourseList = async (collegeID) => {
    formikRef.current.setFieldValue("course", "");
    formikRef.current.setFieldValue("batch", "");
    formikRef.current.setFieldValue("section", "");

    formikRef.current.setFieldTouched("course", false);
    formikRef.current.setFieldTouched("batch", false);
    formikRef.current.setFieldTouched("section", false);
    try {
      const getCourseListRes = await academicApi.getCourseList(collegeID);
      console.log("getCourseListRes---", getCourseListRes);
      setCourseList(getCourseListRes.data.message.data.course);
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   getAttendanceConfig();
  // }, []);

  useEffect(() => {
    if (!collegeConfig.is_university) {
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
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              college: null,
              attendanceDate: new Date(),
              course: null,
              batch: null,
              section: null,
              semester: null,
              subject: null,
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
                  <div className="col-lg-8">
                    {collegeConfig.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={0}
                        label="College"
                        id="college"
                        mandatory={1}
                        style={{ width: "90%" }}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setFieldTouched("college", false);
                          getCourseList(text.collegeID);
                          setFieldValue("course", null);
                          setFieldValue("batch", null);
                          setFieldValue("section", null);
                          setShowStudent(false);
                        }}
                      />
                    ) : null}

                    <DateFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      tabIndex={1}
                      label="Attendance Date"
                      id="attendanceDate"
                      mandatory={1}
                      maxDate={new Date()}
                      minDate={moment().subtract(1, "months")}
                      style={{ width: "35%" }}
                      onChange={(e) => {
                        setShowStudent(false);
                        setFieldValue("attendanceDate", e.target.value);
                      }}
                    />

                    <SelectFieldFormik
                      tabIndex={2}
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
                    {/* {values.course && ( */}
                    <>
                      <SelectFieldFormik
                        tabIndex={3}
                        label={RENAME?.sem}
                        id="batch"
                        mandatory={1}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        options={batchList}
                        style={{ width: "50%" }}
                        onChange={(text) => {
                          setShowStudent(false);
                          setFieldTouched("batch", false);
                          setFieldValue("batch", text);
                          getSubjectStaff(values?.course, text);
                        }}
                      />
                    </>

                    <>
                      {values.batch && collegeConfig.institution_type !== 1 && (
                        <DisplayText
                          labelSize={5}
                          label={RENAME?.year}
                          value={values.batch.year ? values.batch.year : "-"}
                        />
                      )}
                      <SelectFieldFormik
                        tabIndex={4}
                        label={RENAME?.section}
                        id="section"
                        mandatory={1}
                        getOptionLabel={(option) => option.section}
                        getOptionValue={(option) => option.classID}
                        options={sectionList}
                        style={{ width: "30%" }}
                        onChange={(text) => {
                          setShowStudent(false);
                          setFieldTouched("section", false);
                          setFieldValue("section", text);
                          getAttendanceConfig(formikRef.current.values);
                        }}
                      />
                    </>
                    {/* )} */}
                  </div>
                  <Button
                    tabIndex={5}
                    isTable={true}
                    text={"Show"}
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />
                  {showStudent && (
                    <>
                      <div className="row">
                        <div className="subhead-row p-0">
                          <div className="subhead">Student Attendance List</div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="row no-gutters text-right mb-2">
                          <div className="col-lg-9 "></div>
                          <div className="col-lg-1  pe-2">
                            <Button
                              isCenter={false}
                              isTable={true}
                              type="button"
                              onClick={() => handleExport(data, 2)}
                              text={"Export Excel"}
                            />
                          </div>
                          <div className="col-lg-2 ps-1 ">
                            <Button
                              isCenter={false}
                              isTable={true}
                              type="button"
                              onClick={() => handleExport(data, 1)}
                              text={"Export PDF"}
                            />
                          </div>
                        </div>
                        <div className="row no-gutters mt-2">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="5%">Register No.</th>
                                <th> Student Name</th>
                                {periodList.map((item, index) => (
                                  <th width="1%">{item.label}</th>
                                ))}
                              </tr>
                            </thead>
                            {data.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td colspan={15} align="center">
                                    No Attendance found
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
                              <tbody>
                                {data.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>{item.registrationNo}</td>
                                      <td>{item.name}</td>
                                      {periodList.map((item1, index) => (
                                        <td align="center">
                                          <span
                                            style={{
                                              color:
                                                item[item1.label] == "P"
                                                  ? "green"
                                                  : item[item1.label] == "LA"
                                                  ? "blue"
                                                  : item[item1.label] == "L"
                                                  ? "orange"
                                                  : "red",
                                            }}
                                          >
                                            {item[item1.label]}
                                          </span>
                                        </td>
                                      ))}
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
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default StudentAttendanceReport;
