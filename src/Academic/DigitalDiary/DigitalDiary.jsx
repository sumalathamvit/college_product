import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import academicApi from "../../api/AcademicApi";
import { useSelector } from "react-redux";
import $ from "jquery";
import { Formik } from "formik";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DisplayText from "../../component/FormField/DisplayText";
import ModalComponent from "../../component/ModalComponent";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import FileField from "../../component/FormField/FileField";
import { allowedFileExtensions } from "../../component/common/CommonArray";
import ScreenTitle from "../../component/common/ScreenTitle";

import AuthContext from "../../auth/context";
import string from "../../string";

function DigitalDiary() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const { setUnSavedChanges, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const [fileType, setFileType] = useState("");
  const [file, setFile] = useState("");
  const fileInputRef = useRef(null);

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
    content: $("#content").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.string().required(
          `Please select ${$("#content").attr("alt") ?? "Content"}`
        ),
  });

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("data", values);

    setUnSavedChanges(false);

    try {
      let proofUrl = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (file) {
        const response = await academicApi.uploadFile(
          "circular",
          fileType,
          file.split(",")[1]
        );
        console.log("response--", response);
        proofUrl = response.data.message.data.file_url;
      }
      setLoad(true);
      const createDigitalDiary = await academicApi.createDigitalDiary(
        values.section.classID,
        values.content,
        proofUrl
      );

      console.log("createDigitalDiary--->", createDigitalDiary);

      if (createDigitalDiary.data.message.success) {
        toast.success("Digital Diary Created Successfully");
        resetForm();
      }

      setFileType("");
      setFile("");

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getSemesterMaster = async (text) => {
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
  const handleFileUpload = (e) => {
    console.log(e.target.files[0]);
    if (e.target.files[0].size > string.MAX_FILE_SIZE) {
      setModalErrorOpen(true);
      setModalMessage("Please choose file size less than 2MB");
      setModalTitle("File Size ");
      e.target.value = null;
      return false;
    }

    const fileExtension = e.target.files[0].name.split(".").pop();

    if (!allowedFileExtensions.includes(fileExtension)) {
      setModalErrorOpen(true);
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      setModalTitle("File Type");
      return false;
    }
    setFileType(fileExtension);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setFile(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    return true;
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
        <ScreenTitle titleClass="page-heading-position" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: null,
              course: "",
              semester: "",
              section: "",
              content: "",
              refDoc: "",
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
                  <div className="row p-0">
                    <div className="col-lg-10">
                      {collegeConfig.is_university ? (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={0}
                          label="College"
                          id="college"
                          labelSize={3}
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

                          getSemesterMaster(text);
                          setFieldTouched("course", false);
                          setFieldTouched("content", false);
                          setFieldValue("content", "");

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
                          }}
                        />
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
                          }}
                        />
                        <TextFieldFormik
                          tabIndex={4}
                          labelSize={3}
                          id="content"
                          label="Diary Content"
                          mandatory={1}
                          maxlength={140}
                          style={{ width: "60%" }}
                          onChange={(e) => {
                            setFieldValue("content", e.target.value);
                            setUnSavedChanges(true);
                          }}
                        />
                        <FileField
                          ref={fileInputRef}
                          tabIndex={5}
                          labelSize={3}
                          label="File"
                          type="file"
                          id="refDoc"
                          style={{ marginBottom: 5, width: "60%" }}
                          error={errors.refDoc}
                          touched={touched.refDoc}
                          name="refDoc"
                          accept=".pdf, image/*"
                          onChange={(event) => {
                            if (
                              event.target.files.length > 0 &&
                              handleFileUpload(event)
                            )
                              setFieldValue("refDoc", event.target.files[0]);
                            else setFieldValue("refDoc", null);
                            setUnSavedChanges(true);
                          }}
                        />
                      </>
                    </div>
                  </div>

                  <Button
                    id="save"
                    tabIndex={6}
                    text="F4 - Save"
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
      </div>
    </div>
  );
}

export default DigitalDiary;
