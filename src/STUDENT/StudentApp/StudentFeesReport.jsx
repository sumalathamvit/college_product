import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import academicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DisplayText from "../../component/FormField/DisplayText";
import ScreenTitle from "../../component/common/ScreenTitle";
import AuthContext from "../../auth/context";

function StudentFeesReport() {
  const RENAME = useSelector((state) => state.web.rename);
  const { collegeId } = useContext(AuthContext);
  const formikRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);

  const [showRes, setShowRes] = useState(false);
  const [data, setData] = useState([]);
  const currentYear = new Date().getFullYear();
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    course: Yup.object().required("Please select " + RENAME?.course),
    semester: Yup.object().required("Please select " + RENAME?.sem),
    section: Yup.object().required("Please select " + RENAME?.section),
  });

  const handleShow = async (values) => {
    if (load) return;
    console.log("values--->", values);
    try {
      setLoad(true);
      setData([]);
      setShowRes(true);
      const getStudentDetail = await academicApi.getStudentFeesReport(
        values.section.classID
      );
      console.log("getStudentDetail---", getStudentDetail);
      setData(getStudentDetail.data.message.data.fees_due_list);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const getStudentFeesDetails = async () => {
    try {
      setData([]);
      if (location.state && location.state.id && formikRef.current) {
        console.log("Location----", location.state);
        // return;
        getBatchMaster(location.state);
        getSectionMaster(
          location.state.courseID,
          location.state.batchID,
          location.state.semester
        );
        formikRef.current.setFieldValue("course", {
          courseID: location.state.courseID,
          courseName: location.state.course,
        });
        // formikRef.current.setFieldValue("batch", {
        //   batchID: location.state.batchID,
        //   batch: location.state.batch,
        // });
        formikRef.current.setFieldValue("semester", {
          semester: location.state.semester,
          className: location.state.className,
          batchID: location.state.batchID,
          batch: location.state.batch,
        });
        formikRef.current.setFieldValue("section", {
          classID: location.state.classID,
          section: location.state.section,
        });
        setShowRes(true);
        const getStudentDetail = await academicApi.getStudentFeesReport(
          location.state.classID
        );
        console.log("getStudentDetail---", getStudentDetail);
        setData(getStudentDetail.data.message.data.fees_due_list);
      }
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getSectionMaster = async (course, batch, semester) => {
    console.log("batch-semester---", batch, semester);

    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldValue("section", "");
    setSectionList([]);
    if (batch && semester) {
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
        setSectionList(getMasterSubjectStaffRes.data.message.data.section);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getBatchMaster = async (course) => {
    formikRef.current.setFieldTouched("course", false);
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldValue("batch", "");
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("section", "");
    console.log("text---", course);
    setBatchList([]);
    // setSemesterList([]);
    if (course) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "batch",
            course.courseID
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        // setBatchList(getMasterSubjectStaffRes.data.message.data.currentBatch);
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
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getInitialList();
    getStudentFeesDetails();
  }, []);

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
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              course: "",
              batch: "",
              semester: "",
              section: "",
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
                  <div className="col-lg-9">
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={1}
                      label={RENAME?.course}
                      id="course"
                      mandatory={1}
                      options={courseList}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      style={{ width: "80%" }}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setFieldValue("course", text);
                        setFieldValue("batch", "");
                        setFieldValue("section", "");
                        getBatchMaster(text);
                        setShowRes(false);
                      }}
                    />

                    <>
                      <SelectFieldFormik
                        tabIndex={2}
                        label={RENAME?.sem}
                        id="semester"
                        mandatory={1}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        options={semesterList}
                        style={{ width: "30%" }}
                        onChange={(text) => {
                          console.log();
                          setFieldValue("semester", text);
                          getSectionMaster(
                            values?.course,
                            text,
                            text?.semester
                          );
                          setFieldValue("section", "");
                        }}
                      />
                      {collegeConfig.institution_type !== 1 ? (
                        <DisplayText
                          label={RENAME?.year}
                          value={values.semester ? values.semester.batch : "-"}
                        />
                      ) : null}
                    </>
                    <>
                      <SelectFieldFormik
                        tabIndex={3}
                        label={RENAME?.section}
                        id="section"
                        mandatory={1}
                        maxlength={1}
                        options={sectionList}
                        getOptionLabel={(option) => option.section}
                        getOptionValue={(option) => option.classID}
                        style={{ width: "30%" }}
                        onChange={(text) => {
                          setFieldValue("section", text);
                        }}
                      />
                    </>
                  </div>
                  <Button
                    tabIndex={4}
                    text={"Show"}
                    type="submit"
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />
                  {showRes ? (
                    <div className="row mt-4 p-0">
                      <div className="table-responsive p-0">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th width="1%">No</th>
                              <th width="5%">Student No.</th>
                              <th>Student Name</th>
                              <th width="3%">Opening Balance (र)</th>
                              <th width="5%">Paid (र)</th>
                              <th width="5%">Balance (र)</th>
                              <th width="5%">View</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.length === 0 ? (
                              <tr>
                                <td colspan={9} align="center">
                                  No data found
                                </td>
                              </tr>
                            ) : (
                              data.map((item, index) => {
                                return (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.enrollNo}</td>
                                    <td>{item.name}</td>
                                    <td align="right">{item.openingBalance}</td>
                                    <td align="right">{item.paid}</td>
                                    <td align="right">{item.balance}</td>
                                    <td>
                                      <button
                                        type="view"
                                        className="btn-3"
                                        title="View"
                                        onClick={() =>
                                          navigate("/student-fees-view", {
                                            state: {
                                              id: item.studentID,
                                              semester: item.semester,
                                              className: item.className,
                                              classID: values.section.classID,
                                              section: values.section.section,
                                              course: values.course.courseName,
                                              courseID: values.course.courseID,
                                              batch: values.semester.batch,
                                              batchID: values.semester.batchID,
                                            },
                                          })
                                        }
                                      >
                                        View
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default StudentFeesReport;
