import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { useSelector } from "react-redux";

import academicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import CommonApi from "../../component/common/CommonApi";
import ScreenTitle from "../../component/common/ScreenTitle";

import AuthContext from "../../auth/context";

function UniversityResult() {
  const RENAME = useSelector((state) => state.web.rename);
  const { collegeId } = useContext(AuthContext);
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [showRes, setShowRes] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [studentInfo, setStudentInfo] = useState();
  const [semesterList, setSemesterList] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);

  const [isGradeMark, setIsGradeMark] = useState();

  const FormSchema = Yup.object().shape({
    enrollNo: Yup.object().required("Please select Student No."),
    semester: Yup.object().required("Please select " + RENAME?.sem),
  });

  const handleShow = async (values) => {
    if (load) return;
    console.log("values---", values);
    try {
      setLoad(true);
      console.log(
        "checking--->",
        values.enrollNo.studentID,
        values.semester.semester
      );
      setShowRes(true);
      const universityMarkDetailList =
        await academicApi.getStudentUniversityMarks(
          values.enrollNo.id,
          values.semester.semester
        );
      console.log("universityMarkDetailList", universityMarkDetailList);
      setData(
        universityMarkDetailList.data.message.data.student_university_marks
      );
      setIsGradeMark(universityMarkDetailList.data.message.data.isMark);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleSelectStudent = async (value) => {
    console.log("value", value);

    try {
      setLoad(true);
      if (value) {
        const getStudentDetail = await academicApi.viewStudentDetail(value.id);
        console.log(
          "getStudentDetail--",
          getStudentDetail?.data?.message.semester,
          getStudentDetail
        );
        setStudentInfo(value);
        if (collegeConfig.institution_type == 1) {
          try {
            const classRes = await academicApi.getMasterSubjectStaff(
              collegeId,
              "batch",
              getStudentDetail?.data?.message.courseID
            );
            console.log("classRes---", classRes);
            let batchArr = [];
            for (let i = 0; i < classRes.data.message.data.batch.length; i++) {
              batchArr.push(classRes.data.message.data.batch[i]);
              if (
                classRes.data.message.data.batch[i].className == value.className
              ) {
                break;
              }
            }
            setSemesterList(batchArr);
          } catch (error) {
            console.log("error", error);
            setLoad(false);
          }
        } else {
          let semesterListArr = [];

          for (let i = 1; i <= getStudentDetail?.data?.message.semester; i++) {
            console.log("i--", i);
            semesterListArr.push({ semester: i });
          }
          setSemesterList(semesterListArr);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
  };

  useEffect(() => {
    setLoad(false);
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              enrollNo: "",
              semester: "",
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
                  <div className="col-lg-10">
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={1}
                      label="Student No./Name"
                      labelSize={3}
                      id="enrollNo"
                      mandatory={1}
                      options={studentList}
                      searchIcon={true}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id}
                      onInputChange={(inputValue) => {
                        searchStudent(inputValue);
                      }}
                      style={{ width: "100%" }}
                      onChange={(text) => {
                        setFieldValue("enrollNo", text);
                        setFieldValue("semester", "");
                        handleSelectStudent(text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={2}
                      label={RENAME?.sem}
                      labelSize={3}
                      id="semester"
                      mandatory={1}
                      maxlength={2}
                      clear={false}
                      getOptionLabel={(option) =>
                        collegeConfig.institution_type !== 1
                          ? option.semester
                          : option.className
                      }
                      getOptionValue={(option) => option.semester}
                      options={semesterList}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setFieldValue("semester", text);
                        setShowRes(false);
                      }}
                    />
                  </div>
                  <Button
                    tabIndex={3}
                    type="submit"
                    text={"Show"}
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />
                  {values.enrollNo && showRes && (
                    <>
                      <div className="row border mt-3 m-1 p-0">
                        <div className="row mt-3 pb-2">
                          <div className="col-lg-2"></div>
                          {collegeConfig.institution_type !== 1 ? (
                            <label
                              className="control-label col-lg-7 p-0 px-0"
                              style={{
                                fontSize: "20px",
                              }}
                            >
                              <div
                                style={{ textAlign: "center", color: "purple" }}
                                className="p-0 mt-2"
                              >
                                Anna University
                              </div>
                              <div
                                style={{ textAlign: "center", color: "purple" }}
                                className="p-0 mt-2"
                              >
                                Results for UG / PG - Credit System
                              </div>
                              <div
                                style={{ textAlign: "center", color: "green" }}
                                className="p-0 mt-2"
                              >
                                Degree & Branch:{"  "}
                                {studentInfo.course +
                                  "-" +
                                  studentInfo.department}
                              </div>
                              <div
                                style={{ textAlign: "center" }}
                                className="p-0 mt-3"
                              >
                                Register No:{"  "}
                                {data[0].registrationNo}
                              </div>
                            </label>
                          ) : (
                            <label
                              className="control-label col-lg-7 p-0 px-0"
                              style={{
                                fontSize: "20px",
                              }}
                            >
                              <div
                                style={{ textAlign: "center" }}
                                className="p-0 mt-3"
                              >
                                Student No :{"  "}
                                {values?.enrollNo?.enrollNo}
                              </div>
                            </label>
                          )}
                        </div>
                        <div className="row">
                          <div className="row no-gutters mt-2">
                            <div className="col-lg-12">
                              <table className="table table-bordered">
                                <thead>
                                  <tr>
                                    <th width="1%">{RENAME?.sem}</th>
                                    <th width="2%">Month/Year</th>
                                    <th>
                                      {collegeConfig.institution_type !== 1
                                        ? "Subject Code / Name"
                                        : "Subject Name"}
                                    </th>
                                    <th width="8%">
                                      {isGradeMark == 0 ? "Grade" : "Marks"}
                                    </th>
                                    <th width="10%">Result</th>
                                  </tr>
                                </thead>
                                {data.length === 0 ? (
                                  <tbody>
                                    <tr>
                                      <td align="center" colSpan={5}>
                                        No results found
                                      </td>
                                    </tr>
                                  </tbody>
                                ) : (
                                  <tbody>
                                    {data.map((item, index) => {
                                      return (
                                        <tr>
                                          <td>{item.semester}</td>
                                          <td>{item.examMonthYear}</td>
                                          <td>{item.subjectName}</td>
                                          <td>
                                            {item.totalMark
                                              ? item.totalMark
                                              : item.grade}
                                          </td>
                                          <td>
                                            {item.result == 1 ? "Pass" : "Fail"}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                )}
                              </table>
                            </div>
                          </div>
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

export default UniversityResult;
