import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";

import academicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import { useSelector } from "react-redux";
import AuthContext from "../../auth/context";
import ScreenTitle from "../../component/common/ScreenTitle";
import $ from "jquery";

function StudentPerformanceUnivReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [showStudent, setShowStudent] = useState(false);
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);
  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: $("#course").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#course").attr("alt") ?? RENAME?.course}`
        ),
    batch: $("#batch").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#batch").attr("alt") ?? RENAME?.batch}`
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

  const handleExport = async (data, type) => {
    let csvData = [["No.", "Register No.", "Student Name"]];
    subjectData.map((item, index) => csvData[0].push(item.subjectCode));
    data.map((item, index) => {
      csvData[index + 1] = [index + 1, item.registrationNo, item.name];
      subjectData.map((item1, index1) => {
        csvData[index + 1].push(item[item1.subjectCode]);
      });
    });
    // console.log("csvData---", csvData);
    if (type == 1) {
      preFunction.generatePDF(
        formikRef.current.values.college
          ? formikRef.current.values.college.collegeName
          : collegeName,
        "University Performance Report",
        csvData
      );
    } else {
      preFunction.downloadCSV(csvData, "University Performance Report.csv");
    }
  };

  const handleUnivPerformance = async (values) => {
    if (load) return;
    console.log("values---", values);
    try {
      setLoad(true);
      const getStudentUniversityPerformanceReportRes =
        await academicApi.getStudentUniversityPerformanceReport(
          values.course.courseID,
          values.batch.batchID,
          values.section.classID,

          collegeConfig.institution_type === 1
            ? values?.semester?.semester
            : values?.batch?.semester
        );
      console.log(
        "getStudentUniversityPerformanceReportRes---",
        getStudentUniversityPerformanceReportRes
      );
      setSubjectData(
        getStudentUniversityPerformanceReportRes.data.message.data.subjects
      );
      setData(
        getStudentUniversityPerformanceReportRes.data.message.data
          .university_performance_report
      );
      setShowStudent(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const getSubjectStaff = async (course, batch, semester) => {
    console.log("batch-semester---", course, batch);
    // formikRef.current.setFieldValue("section", "");

    formikRef.current.setFieldTouched("semester", false);

    formikRef.current.setFieldTouched("section", false);
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
            collegeConfig.institution_type === 1
              ? semester.semester
              : batch.semester
          );
        console.log("Res---", getMasterSubjectStaffRes);
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
    formikRef.current.setFieldTouched("semester", false);
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

  const getCourseList = async (collegeID) => {
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("batch", false);
    formikRef.current.setFieldTouched("section", false);

    formikRef.current.setFieldTouched("course", false);
    try {
      const getMasterSubjectStaffRes = await academicApi.getMasterSubjectStaff(
        collegeID,
        "course"
      );
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // getInitialList();
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
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              college: null,
              course: null,
              batch: null,
              section: null,
              semester: null,
              staff: null,
            }}
            validationSchema={FormSchema}
            onSubmit={handleUnivPerformance}
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
                  <div className="col-lg-9">
                    {collegeConfig.is_university && (
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
                          setShowStudent(false);
                          getCourseList(text.collegeID);
                          setFieldValue("course", "");
                          setFieldValue("batch", "");
                          setFieldValue("semester", "");
                          setFieldValue("section", "");
                          // setFieldValue("staff", "");
                        }}
                      />
                    )}
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
                    {/* {values.course && ( */}
                    <>
                      <SelectFieldFormik
                        tabIndex={2}
                        label={RENAME?.batch}
                        id="batch"
                        mandatory={1}
                        getOptionLabel={(option) => option.batch}
                        getOptionValue={(option) => option.batchID}
                        options={batchList}
                        style={{ width: "50%" }}
                        onChange={(text) => {
                          setShowStudent(false);
                          setFieldValue("batch", text);
                          setFieldTouched("batch", false);
                          setSectionList([]);
                          setFieldValue("section", "");
                          setFieldValue("semester", "");

                          getSubjectStaff(
                            values?.course,
                            text,
                            values?.semester
                          );
                        }}
                      />

                      <SelectFieldFormik
                        tabIndex={4}
                        label={RENAME?.sem}
                        id="semester"
                        mandatory={1}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        options={semesterList}
                        style={{ width: "30%" }}
                        onChange={(text) => {
                          setShowStudent(false);
                          setFieldValue("semester", text);
                          setFieldTouched("semester", false);
                          setFieldValue("section", "");
                          setSectionList([]);
                          setFieldTouched("section", false);
                          getSubjectStaff(values?.course, values?.batch, text);
                        }}
                      />

                      <>
                        <SelectFieldFormik
                          tabIndex={3}
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
                          }}
                        />
                      </>
                    </>
                    {/* )} */}
                    {/* {values.semester && values.batch && ( */}

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
                          <div className="subhead">Student List</div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="row no-gutters text-right">
                          <div className="col-lg-9"></div>
                          <div className="col-lg-1 pe-2">
                            <Button
                              isTable={true}
                              type="button"
                              className="btn"
                              onClick={() => handleExport(data, 2)}
                              text={"Export Excel"}
                            />
                          </div>
                          <div className="col-lg-2">
                            <Button
                              isTable={true}
                              type="button"
                              className="btn"
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
                                <th width="15%">Registeration No.</th>
                                <th> Student Name</th>
                                {subjectData.map((item, index) => (
                                  <th width="2%">{item.subjectCode}</th>
                                ))}
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
                                      <td>{index + 1}</td>
                                      <td>{item.registrationNo}</td>
                                      <td>{item.name}</td>
                                      {subjectData.map((item1, index) => (
                                        <td align="center">
                                          {item[item1.subjectCode] === null
                                            ? "NA"
                                            : item[item1.subjectCode]}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            )}
                          </table>
                        </div>
                        <div className="row no-gutters">
                          {subjectData.map((item, index) => (
                            <div className="p-1">{item.subjectName}</div>
                          ))}
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

export default StudentPerformanceUnivReport;
