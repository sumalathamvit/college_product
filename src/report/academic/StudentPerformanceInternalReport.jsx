import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import $ from "jquery";

import academicApi from "../../api/AcademicApi";

import AuthContext from "../../auth/context";

import string from "../../string";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";

function StudentPerformanceInternalReport() {
  //#region Const
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();

  const { role, employeeId, collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const [load, setLoad] = useState(false);
  const [showStudent, setShowStudent] = useState(false);
  const [data, setData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [staffClass, setStaffClass] = useState([]);
  const [testNameList, setTestNameList] = useState([]);
  const [subjectData, setSubjectData] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  //#endregion

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

  const handleExport = async (data, type) => {
    let csvData = [["No.", "Student No.", "Register No.", "Student Name"]];
    subjectData.map((item, index) => csvData[0].push(item.subjectCode));
    csvData[0].push("Total");
    csvData[0].push("Average");
    {
      collegeConfig.institution_type !== 1
        ? csvData[0].push("Arrear")
        : csvData[0].push("Failed");
    }

    data.map((item, index) => {
      csvData[index + 1] = [
        index + 1,
        item.enrollNo,
        item.registrationNo,
        item.name,
      ];
      subjectData.map((item1, index1) => {
        csvData[index + 1].push(
          item[item1.subjectCode] === null ? "NA" : item[item1.subjectCode]
        );
      });
      csvData[index + 1].push(item.total);
      csvData[index + 1].push(item.avg);

      csvData[index + 1].push(item.arrear);
    });
    console.log("csvData---", csvData);
    if (type == 1) {
      preFunction.generatePDF(
        formikRef.current.values.college
          ? formikRef.current.values.college.collegeName
          : collegeName,
        "Student Internal Report",
        csvData
      );
    } else {
      preFunction.downloadCSV(csvData, "Student Internal Report.csv");
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
        } else {
          setSectionList(getMasterSubjectStaffRes.data.message.data.section);
        }
        // setSectionList(getMasterSubjectStaffRes.data.message.data.section);
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

    const internalRes = await academicApi.getStudentInternal(
      values.testName.testID,
      values.section.classID,
      values.semester.semester
    );
    console.log("internalRes---", internalRes);
    if (internalRes.data.message.success === true) {
      toast.success(internalRes.data.message.message);
      setSubjectData(internalRes.data.message.data.subjects);
      setData(internalRes.data.message.data.internal_performance_report);
      setLoad(false);
    } else {
      setModalErrorOpen(true);
      setModalTitle("Message");
      setModalMessage(internalRes.data.message.message);

      setLoad(false);

      return;
    }

    setShowStudent(true);
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
      }

      const getAllTestRes = await academicApi.getAllTest(collegeID);
      console.log("getAllTestRes---", getAllTestRes);
      if (getAllTestRes.data.message.data.test.length > 0)
        setTestNameList(getAllTestRes.data.message.data.test);
    } catch (error) {
      console.log(error);
    }
  };

  const getInitialList = async () => {
    if (role == string.STAFF_ROLE) {
      const getClassbyStaffRes = await academicApi.getClassbyStaff(employeeId);
      console.log("getClassbyStaffRes", getClassbyStaffRes);
      if (getClassbyStaffRes.data.message.success) {
        setStaffClass(getClassbyStaffRes.data.message.data.staff);
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
            className: getClassbyStaffRes.data.message.data.staff[i].className,
            semester: getClassbyStaffRes.data.message.data.staff[i].semester,
            batchID: getClassbyStaffRes.data.message.data.staff[i].batchID,
          };
          if (
            semList.findIndex((item) => item.semester === semester.semester) ===
            -1
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
          formikRef.current.setFieldValue("section", secList[0]);
        }
      }
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) getCourseList(collegeId);
    else {
      setCourseList([]);
      setTestNameList([]);
    }
    getInitialList();
  }, [collegeConfig.is_university]);

  useEffect(() => {
    getInitialList();
  }, []);

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
                        <th width="1%">Student No.</th>
                        <th width="15%">Registration No.</th>
                        <th> Student Name</th>
                        {subjectData.map((item, index) => (
                          <th width="2%">{item.subjectCode}</th>
                        ))}
                        <th width="2%"> Total</th>
                        <th width="2%">Average</th>
                        {collegeConfig.institution_type !== 1 ? (
                          <th width="2%">Arrear</th>
                        ) : (
                          <th width="2%">Failed</th>
                        )}
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
                              <td>{item.enrollNo}</td>
                              <td>{item.registrationNo}</td>
                              <td>{item.name}</td>
                              {subjectData.map((item1, index) => (
                                <td class="text-center">
                                  {item[item1.subjectCode] === null
                                    ? "NA"
                                    : item[item1.subjectCode]}
                                </td>
                              ))}
                              <td align="right">{item.total}</td>
                              <td align="right">{item.avg}</td>
                              <td align="center">{item.arrear}</td>
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
        </div>
      </div>
    </div>
  );
}

export default StudentPerformanceInternalReport;
