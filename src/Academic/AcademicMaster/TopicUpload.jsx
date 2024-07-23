import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import $ from "jquery";

import academicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextAreaFieldFormik from "../../component/FormField/TextareaFieldFormik";
import { subjectUnitList } from "../../component/common/CommonArray";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";

import AuthContext from "../../auth/context";

function TopicUpload() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const { setUnSavedChanges } = useContext(AuthContext);
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
    subject: $("#subject").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#subject").attr("alt") ?? "Subject"}`
        ),
    unit: $("#unit").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#unit").attr("alt") ?? "Unit"}`
        ),
    topic: $("#topic").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.string().required(
          `Please select ${$("#topic").attr("alt") ?? "Topic"}`
        ),
  });

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    setUnSavedChanges(false);
    formikRef.current.setFieldTouched("course", false);
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("subject", false);
    formikRef.current.setFieldTouched("unit", false);
    formikRef.current.setFieldTouched("topic", false);
    console.log("values--->", values);
    try {
      setLoad(true);
      console.log(
        "testing-->",
        values.subject.subjectID,
        values.unit.unit,
        values.topic,
        sessionStorage.getItem("email")
      );
      const uploadTopicRes = await academicApi.uploadTopic(
        values.subject.subjectID,
        values.unit.unit,
        values.topic,
        null
      );
      console.log("uploadTopicRes--->", uploadTopicRes);
      if (!uploadTopicRes.data.message.success) {
        setModalTitle("Message");
        setModalMessage(uploadTopicRes.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      } else {
        toast.success(uploadTopicRes.data.message.message);
        values.unit = "";
        values.topic = "";
        // resetForm();
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };
  const getSubjectStaff = async (course, semester) => {
    formikRef.current.setFieldTouched("semester", false);

    console.log("semester----", course, semester);
    setSubjectList([]);
    formikRef.current.setFieldValue("subject", "");
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
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSubjectList(getMasterSubjectStaffRes.data.message.data.subject);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getSemesterMaster = async (text) => {
    formikRef.current.setFieldTouched("course", false);

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

  const getCourseList = async (value) => {
    formikRef.current.setFieldTouched("college", false);

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

  const getTopicList = async (subjectID, unit) => {
    console.log("subjectID, unit---", subjectID, unit);
    formikRef.current.setFieldValue("topic", "");

    try {
      const getMasterSubjectStaffRes = await academicApi.getAllTopicList(
        subjectID,
        unit
      );
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      if (!getMasterSubjectStaffRes.data.message.success) {
        setModalMessage(getMasterSubjectStaffRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      //set topic list like , seperated
      let topicArray = getMasterSubjectStaffRes.data.message.data.topics;
      let topicString = "";
      topicArray.map((topic, index) => {
        topicString += topic.topic + ",";
      });
      formikRef.current.setFieldValue("topic", topicString);
      setLoad(false);
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
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              college: "",
              course: "",
              semester: "",
              subject: "",
              unit: "",
              topic: "",
            }}
            validationSchema={FormSchema}
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
                  <div className="col-lg-9">
                    {collegeConfig.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        // labelSize={3}
                        id="college"
                        mandatory={1}
                        style={{ width: "90%" }}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          // setFieldTouched("college", false);
                          setFieldValue("course", "");
                          setFieldValue("semester", "");
                          setFieldValue("subject", "");
                          setFieldValue("unit", "");
                          setFieldValue("topic", "");
                          setUnSavedChanges(true);
                          getCourseList(text.collegeID);
                          setUnSavedChanges(true);
                        }}
                      />
                    ) : null}
                    <SelectFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      tabIndex={2}
                      label={RENAME?.course}
                      id="course"
                      mandatory={1}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      options={courseList}
                      style={{ width: "90%" }}
                      onChange={(text) => {
                        setFieldValue("course", text);
                        setFieldValue("semester", "");
                        setFieldValue("subject", "");
                        setFieldValue("unit", "");
                        setFieldValue("topic", "");
                        getSemesterMaster(text);
                        setUnSavedChanges(true);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={3}
                      label={RENAME?.sem}
                      id="semester"
                      mandatory={1}
                      maxlength={10}
                      getOptionLabel={(option) => option.className}
                      getOptionValue={(option) => option.semester}
                      options={semesterList}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("semester", text);
                        getSubjectStaff(values?.course, text);
                        setUnSavedChanges(true);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={5}
                      label="Subject"
                      id="subject"
                      mandatory={1}
                      getOptionLabel={(option) => option.subjectName}
                      getOptionValue={(option) => option.subjectID}
                      options={subjectList}
                      onChange={(text) => {
                        setFieldValue("subject", text);
                        setFieldTouched("subject", false);
                        setFieldValue("unit", "");
                        setFieldValue("topic", "");
                        setUnSavedChanges(true);
                      }}
                    />

                    <SelectFieldFormik
                      tabIndex={6}
                      label="Unit"
                      id="unit"
                      mandatory={1}
                      options={subjectUnitList}
                      getOptionLabel={(option) => option.unit}
                      getOptionValue={(option) => option.unit}
                      style={{ width: "30%" }}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setFieldValue("unit", text);
                        setFieldTouched("unit", false);
                        setUnSavedChanges(true);
                        getTopicList(values.subject.subjectID, text.unit);
                      }}
                    />
                    <TextAreaFieldFormik
                      tabIndex={7}
                      id="topic"
                      label="Topic"
                      maxlength={1000}
                      placeholder="Topic 1, Topic 2, Topic 3, etc."
                      style={{ width: "100%" }}
                      rows={5}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("topic", e.target.value);
                        setFieldTouched("topic", false);
                        setUnSavedChanges(true);
                      }}
                    />
                  </div>
                  <Button
                    tabIndex={8}
                    id="save"
                    text="F4 - Save"
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
      </div>
    </div>
  );
}

export default TopicUpload;
