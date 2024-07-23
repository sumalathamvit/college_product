import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import HeadingIcon from "@mui/icons-material/School";
import { Formik } from "formik";

import academicApi from "../../../api/AcademicApi";
import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import { useDispatch, useSelector } from "react-redux";
import { webSliceActions } from "../../../store/web";
import ScreenTitle from "../../../component/common/ScreenTitle";
import AuthContext from "../../../auth/context";

function QPList() {
  const RENAME = useSelector((state) => state.web.rename);
  const { collegeId } = useContext(AuthContext);
  const navigate = useNavigate();
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [regulationList, setRegulationList] = useState([]);
  //Get Redux
  const clientData = useSelector((state) => state.web.qpList);
  const clientSubjectData = useSelector((state) => state.web.qpSubjectList);
  const clientShow = useSelector((state) => state.web.qpListShow);

  const [selectedRegulation, setSelectedRegulation] = useState(
    clientData.regulation
  );
  const [selectedCourse, setSelectedCourse] = useState(clientData.course);
  const [selectedSemester, setSelectedSemester] = useState(clientData.semester);
  const [selectedSubject, setSelectedSubject] = useState(clientData.subject);
  const [data, setData] = useState(clientData.data ? clientData.data : []);
  const [showList, setShowList] = useState(clientShow);
  const [subjectList, setSubjectList] = useState(clientSubjectData);
  const collegeConfig = useSelector((state) => state.web.college);
  const dispatch = useDispatch();

  const FormSchema = Yup.object().shape({
    course: Yup.object().required("Please select " + RENAME?.course),
    regulation: Yup.object().required("Please select Regulation"),
    semester: Yup.object().required("Please select " + RENAME?.sem),
    subject: Yup.object().required("Please select Subject"),
  });

  console.log("clientData---", clientData);

  const getBatchMaster = async (course) => {
    formikRef.current.setFieldValue("batch", "");
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("subject", "");

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
        // setSemesterList(getMasterSubjectStaffRes.data.message.data.semester);

        if (collegeConfig.institution_type !== 1)
          setSemesterList(getMasterSubjectStaffRes.data.message.data.semester);
        else setSemesterList(getMasterSubjectStaffRes.data.message.data.batch);
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

  const handleShowQP = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      console.log("values---", selectedSubject.subjectCourseID);
      const getQPListRes = await academicApi.QPListBySubject(
        values.subject.subjectCourseID
      );

      console.log("getQPListRes--", getQPListRes);
      setShowList(true);
      setData(getQPListRes.data.message.data.questionPaper);
      dispatch(
        webSliceActions.replaceQpList({
          course: values.course,
          regulation: values.regulation,
          semester: values.semester,
          subject: values.subject,
          data: getQPListRes.data.message.data.questionPaper,
        })
      );
      dispatch(webSliceActions.replaceQpListShow(true));
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const getAllRegulation = async () => {
    try {
      const res = await academicApi.getAllRegulation();
      setRegulationList(res.data.message.data.regulation);
    } catch (error) {}
  };
  const getSubjectStaff = async (course, regulation, semester) => {
    setSubjectList([]);
    formikRef.current.setFieldValue("subject", "");
    setSelectedSubject("");
    if (regulation && semester) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getAllSubjectByRegulationCourse(
            course.courseID,
            semester.semester,
            regulation.regulation
          );

        console.log(getMasterSubjectStaffRes, "res");
        dispatch(
          webSliceActions.replaceQpSubjectList(
            getMasterSubjectStaffRes.data.message.data.subjects
          )
        );
        setSubjectList(getMasterSubjectStaffRes.data.message.data.subjects);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    getInitialList();
    getAllRegulation();
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
              course: selectedCourse,
              regulation: selectedRegulation,
              semester: selectedSemester,
              subject: selectedSubject,
              // course: "",
              // regulation: "",
              // semester: "",
              // subject: "",
            }}
            validationSchema={FormSchema}
            onSubmit={handleShowQP}
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
                        setFieldValue("course", text);
                        getBatchMaster(text);
                        setSelectedCourse(text);
                        setShowList(false);
                      }}
                    />

                    <SelectFieldFormik
                      tabIndex={2}
                      label="Regulation"
                      id="regulation"
                      mandatory={1}
                      maxlength={10}
                      getOptionLabel={(option) => option.regulation}
                      getOptionValue={(option) => option.regulation}
                      options={regulationList}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setFieldValue("regulation", text);
                        getSubjectStaff(values?.course, text, values?.semester);
                        setSelectedRegulation(text);
                        setShowList(false);
                      }}
                    />
                    <>
                      <SelectFieldFormik
                        tabIndex={3}
                        label={RENAME?.sem}
                        id="semester"
                        mandatory={1}
                        maxlength={2}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        options={semesterList}
                        style={{ width: "40%" }}
                        onChange={(text) => {
                          setFieldValue("semester", text);

                          getSubjectStaff(
                            values?.course,
                            values?.regulation,
                            text
                          );
                          setSelectedSemester(text);
                          setShowList(false);
                        }}
                      />
                      {/* {values.semester && ( */}
                      <>
                        <SelectFieldFormik
                          tabIndex={4}
                          label="Subject"
                          id="subject"
                          mandatory={1}
                          getOptionLabel={(option) => option.subjectName}
                          getOptionValue={(option) => option.subjectCourseID}
                          options={subjectList}
                          onChange={(text) => {
                            setFieldValue("subject", text);
                            setSelectedSubject(text);
                            setShowList(false);
                          }}
                        />
                      </>
                      {/* )} */}
                    </>
                    {/* )} */}
                  </div>
                  <Button
                    tabIndex={5}
                    text={"Show"}
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />

                  {showList && (
                    <>
                      <div className="row">
                        <div className="subhead-row p-0">
                          <div className="subhead">
                            Subject Question Paper Details
                          </div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="p-0 mb-2 text-right">
                          <Button
                            text={"Add Question Paper"}
                            className={"btn-green"}
                            frmButton={false}
                            type="button"
                            isTable={true}
                            onClick={(e) => {
                              navigate("/qp-upload");
                            }}
                          />
                        </div>
                        <div className="row no-gutters mt-2">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                {/* <th width="35%">Subject</th> */}
                                <th>Description</th>
                                <th width="5%">Edit</th>
                                <th width="5%">View</th>
                              </tr>
                            </thead>
                            {data.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td align="center" colSpan={5}>
                                    No records found
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
                              <tbody>
                                {data.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      {/* <td>{item.subjectName}</td> */}
                                      <td>{item.description}</td>
                                      <td>
                                        <Button
                                          isTable={true}
                                          type="button"
                                          className="btn-3"
                                          text="Edit"
                                          onClick={() => {
                                            navigate("/qp-upload", {
                                              state: {
                                                item: item,
                                                courseName:
                                                  values.course.courseName,
                                                regulation:
                                                  values.regulation.regulation,
                                                semester:
                                                  values.semester.className,
                                                subject: values.subject,
                                              },
                                            });
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <Button
                                          isTable={true}
                                          type="button"
                                          className="btn-3"
                                          text="View"
                                          onClick={() => {
                                            console.log("values---", item);
                                            navigate("/file-view", {
                                              state: {
                                                item: item,
                                                view: "Question Paper",
                                                courseName:
                                                  values.course.courseName,
                                                regulation:
                                                  values.regulation.regulation,
                                                semester:
                                                  values.semester.className,
                                                subjectName:
                                                  values.subject.subjectName,
                                              },
                                            });
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

export default QPList;
