import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import moment from "moment";
import $ from "jquery";
import { Formik } from "formik";

import academicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import AuthContext from "../../auth/context";

function DigitalDiaryList() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const collegeConfig = useSelector((state) => state.web.college);
  const [showRes, setShowRes] = useState(false);
  const [data, setData] = useState([]);
  const { setUnSavedChanges, collegeId } = useContext(AuthContext);

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
    section: $("#section").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#section").attr("alt") ?? RENAME?.section}`
        ),
  });

  const handleShow = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      const getDigitalDiaryListRes = await academicApi.getDigitalDiaryList(
        values.section.classID
      );
      console.log("getDigitalDiaryListRes---", getDigitalDiaryListRes);
      setShowRes(true);
      setData(getDigitalDiaryListRes.data.message.data.digitalDiary);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getSemester = async (text) => {
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldTouched("semester", false);

    console.log("text---", text);
    setSemesterList([]);
    if (text) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
            "batch",
            text.courseID,
            null,
            null,
            null
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSemesterList(getMasterSubjectStaffRes.data.message.data.batch);
      } catch (error) {
        setLoad(false);
        console.log(error);
      }
    }
  };

  const getSectionMaster = async (course, text) => {
    console.log("text---", course, text);
    setSectionList([]);
    if (text) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
            "subject",
            course,
            text.batchID,
            text.semester,
            0
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSectionList(getMasterSubjectStaffRes.data.message.data.section);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getCourseList = async (value) => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getCourseList(value);
      console.log(
        "getMasterSubjectStaffRes---",
        getMasterSubjectStaffRes,
        getMasterSubjectStaffRes.data.message.data.semester
      );
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
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: null,
              course: "",
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
                  <div className="row p-0">
                    <div className="col-lg-10">
                      {collegeConfig.is_university ? (
                        <SelectFieldFormik
                          labelSize={3}
                          autoFocus
                          tabIndex={0}
                          label="College"
                          id="college"
                          mandatory={1}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          options={collegeConfig.collegeList}
                          style={{ width: "65%" }}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            setUnSavedChanges(true);
                            getCourseList(text.collegeID);
                          }}
                        />
                      ) : null}
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        tabIndex={1}
                        label={RENAME?.course}
                        id="course"
                        mandatory={1}
                        labelSize={3}
                        options={courseList}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.courseID}
                        searchIcon={false}
                        clear={false}
                        style={{ width: "65%" }}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setFieldValue("semester", "");
                          setFieldValue("year", "");
                          setFieldValue("section", "");

                          getSemester(text);
                          setFieldTouched("course", false);
                          setFieldTouched("content", false);
                          setFieldValue("content", "");
                          setShowRes(false);

                          setSectionList([]);
                        }}
                      />

                      <>
                        <SelectFieldFormik
                          tabIndex={2}
                          label={RENAME?.sem}
                          id="semester"
                          mandatory={1}
                          maxlength={10}
                          labelSize={3}
                          options={semesterList}
                          getOptionLabel={(option) => option.className}
                          getOptionValue={(option) => option.semester}
                          style={{ width: "30%" }}
                          onChange={(text) => {
                            console.log("text", text);
                            setFieldValue("semester", text);
                            setFieldValue("year", "");
                            setFieldValue("section", "");
                            setFieldValue("subject", "");
                            setFieldTouched("semester", false);
                            setFieldTouched("content", false);
                            setFieldValue("content", "");

                            getSectionMaster(values.course.courseID, text);
                            setShowRes(false);
                          }}
                        />
                        <>
                          <SelectFieldFormik
                            tabIndex={3}
                            label={RENAME?.section}
                            id="section"
                            mandatory={1}
                            maxlength={1}
                            labelSize={3}
                            options={sectionList}
                            getOptionLabel={(option) => option.section}
                            getOptionValue={(option) => option.classID}
                            style={{ width: "20%" }}
                            onChange={(text) => {
                              setFieldValue("section", text);
                              setFieldTouched("section", false);
                              setFieldTouched("content", false);
                              setFieldValue("content", "");
                              setShowRes(false);
                            }}
                          />
                        </>
                      </>
                    </div>
                  </div>

                  <Button
                    tabIndex={6}
                    text="Show"
                    className={"btn me-3"}
                    type="submit"
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />
                </form>
              );
            }}
          </Formik>
        </div>
        <div className="row no-gutters mt-3">
          {showRes ? (
            <div className="table-responsive">
              <table className="table table-hover table-bordered ">
                <thead>
                  <tr>
                    <th width={"1%"}>No.</th>
                    <th>Diary Content</th>
                    <th width={"10%"}>Date</th>
                    <th width={"1%"}>View</th>
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

                          <td>{item.classWork}</td>
                          <td>{moment(item.date).format("DD-MM-YYYY")}</td>
                          <td>
                            <Button
                              isTable={true}
                              className={"btn-3"}
                              text={"View"}
                              onClick={() =>
                                navigate("/view-digital-diary", {
                                  state: {
                                    item: {
                                      ...item,
                                      college: formikRef.current.values?.college
                                        ? formikRef.current.values.college
                                            .collegeName
                                        : collegeConfig.collegeName,
                                      course:
                                        formikRef.current.values.course
                                          .courseName,
                                      className:
                                        formikRef.current.values.semester
                                          .className,
                                      section:
                                        formikRef.current.values.section
                                          .section,
                                    },
                                  },
                                })
                              }
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default DigitalDiaryList;
