import React, {
  useEffect,
  useState,
  useRef,
  createRef,
  useContext,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";

import academicApi from "../../../api/AcademicApi";

import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";

import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import { toast } from "react-toastify";
import FileField from "../../../component/FormField/FileField";
import TextFieldFormik from "../../../component/FormField/TextFieldFormik";
import ModalComponent from "../../../component/ModalComponent";
import AuthContext from "../../../auth/context";
import { useDispatch, useSelector } from "react-redux";
import { webSliceActions } from "../../../store/web";
import Icon from "../../../component/Icon";
import { allowedFileExtensions } from "../../../component/common/CommonArray";
import ScreenTitle from "../../../component/common/ScreenTitle";
import DisplayText from "../../../component/FormField/DisplayText";
import string from "../../../string";

function MaterialUpload() {
  const RENAME = useSelector((state) => state.web.rename);
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [image, setImage] = useState();
  const [fileType, setFileType] = useState();
  const [regulationList, setRegulationList] = useState([]);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const { collegeId, setUnSavedChanges } = useContext(AuthContext);
  const [editFile, setEditFile] = useState(false);
  const dispatch = useDispatch();
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    course: Yup.object().required("Please select " + RENAME?.course),
    regulation: Yup.object().required("Please select Regulation"),
    semester: Yup.object().required("Please select " + RENAME?.sem),
    subject: Yup.object().required("Please select Subject"),
    description: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .required("Please enter Description")
      .trim(),
    file: Yup.mixed().required("Please select a File to Upload"),
  });

  const fileInputRef = createRef();
  const formikRef = useRef();

  const handleImage = (e) => {
    if (e.target.files.length < 1) {
      return;
    }
    console.log(e.target.files[0]);
    if (e.target.files[0].size > string.MATERIAL_FILE_SIZE) {
      setModalTitle("File Size");
      setModalMessage("Please choose file size less than 20MB");
      setModalErrorOpen(true);
      e.target.value = null;
      return false;
    }

    const fileExtension = e.target.files[0].name.split(".").pop();

    if (!allowedFileExtensions.includes(fileExtension)) {
      setModalTitle("File Type");
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      setModalErrorOpen(true);

      return false;
    }
    setFileType(fileExtension);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const getSubjectStaff = async (course, regulation, semester) => {
    formikRef.current.setFieldValue("subject", "");
    setSubjectList([]);
    if (regulation && semester) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getAllSubjectByRegulationCourse(
            course.courseID,
            semester.semester,
            regulation.regulation
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSubjectList(getMasterSubjectStaffRes.data.message.data.subjects);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getBatchMaster = async (course) => {
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

        if (collegeConfig.institution_type !== 1)
          setSemesterList(getMasterSubjectStaffRes.data.message.data.semester);
        else setSemesterList(getMasterSubjectStaffRes.data.message.data.batch);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleUpdateMaterial = async (values) => {
    if (load) return;
    console.log("values---", values);
    let err = false;
    if (!values.description) {
      formikRef.current.setFieldTouched("description", true);
      err = true;
    }
    if (editFile && !values.file) {
      formikRef.current.setFieldTouched("file", true);
      err = true;
    }
    if (err) return;
    try {
      setLoad(true);
      console.log("values---", values);
      var fileUploadRes;
      if (editFile) {
        fileUploadRes = await academicApi.uploadFile(
          "material",
          fileType,
          image.split(",")[1]
        );
      }
      if (!editFile || fileUploadRes.ok) {
        const materialUploadViewRes = await academicApi.editMaterial(
          location.state.item.subjectCourseID,
          values.description,
          editFile
            ? fileUploadRes.data.message.data.file_url
            : location.state.item.filePath,
          location.state.item.subjectNotesID
        );
        console.log("materialUploadViewRes---", materialUploadViewRes);
        if (materialUploadViewRes.data.message.success) {
          toast.success(materialUploadViewRes.data.message.message);
          dispatch(webSliceActions.removeMaterialListShow());
          navigate("/material-list");
        } else {
          setModalTitle("Message");
          setModalMessage(materialUploadViewRes.data.message.message);
          setModalErrorOpen(true);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const getInitialList = async () => {
    try {
      if (location?.state?.item) {
        console.log("location.state.item---", location.state.item);
      } else {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(collegeId, "course");
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setCourseList(getMasterSubjectStaffRes.data.message.data.course);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    setSubjectList([]);
    setUnSavedChanges(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      setLoad(true);
      console.log("values---", values);
      const fileUploadRes = await academicApi.uploadFile(
        "material",
        fileType,
        image.split(",")[1]
      );
      console.log("fileUploadRes---", fileUploadRes);
      if (fileUploadRes.ok) {
        const materialUploadViewRes = await academicApi.uploadMaterial(
          values.subject.subjectCourseID,
          values.description,
          fileUploadRes.data.message.data.file_url
        );
        console.log("materialUploadViewRes---", materialUploadViewRes);
        if (materialUploadViewRes.data.message.success) {
          toast.success(materialUploadViewRes.data.message.message);
          resetForm();
          dispatch(webSliceActions.removeMaterialListShow());
          dispatch(webSliceActions.removeMaterialListSemester());
          dispatch(webSliceActions.removeMaterialList());
        } else {
          setModalTitle("Message");
          setModalMessage(materialUploadViewRes.data.message.message);
          setModalErrorOpen(true);
          formikRef.current.setFieldValue("file", null);
          formikRef.current.setFieldTouched("file", false);
        }
      }
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
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              course: null,
              regulation: null,
              semester: null,
              subject: null,
              file: null,
              description: location?.state?.item?.description
                ? location?.state?.item?.description
                : "",
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
                  {location?.state?.item ? (
                    <>
                      <div className="col-lg-8">
                        <DisplayText
                          label={RENAME?.course}
                          value={location?.state?.courseName}
                        />
                        <div className="row no-gutters mt-2">
                          <div className="col-lg-5 text-right pe-3 mt-2">
                            <label>Regulation</label>
                          </div>

                          <div className="col-lg-7 mt-2">
                            {location?.state?.regulation}
                          </div>
                        </div>
                        <div className="row no-gutters mt-2">
                          <div className="col-lg-5 text-right pe-3 mt-2">
                            <label>{RENAME?.sem}</label>
                          </div>

                          <div className="col-lg-7 mt-2">
                            {location?.state?.semester}
                          </div>
                        </div>
                        <div className="row no-gutters mt-2">
                          <div className="col-lg-5 text-right pe-3 mt-2">
                            <label>Subject</label>
                          </div>

                          <div className="col-lg-7 mt-2">
                            {location?.state?.item?.subjectName}
                          </div>
                        </div>
                        <TextFieldFormik
                          autoFocus
                          tabIndex={1}
                          id="description"
                          label="Description"
                          onChange={(e) => {
                            // handleChange(e);
                            setFieldValue("description", e.target.value);
                            setFieldTouched("description", false);
                          }}
                          style={{ width: "80%" }}
                          mandatory={1}
                        />
                        {!editFile ? (
                          <div className={"row no-gutters mt-1"}>
                            <div
                              className={`col-lg-5 ${
                                window.innerWidth > 992 ? "text-right" : ""
                              } pe-3 mt-2`}
                            >
                              <label> Material </label>
                            </div>
                            <div className={`col-lg-7 mt-2`}>
                              <div
                                className="row"
                                onClick={() => setEditFile(true)}
                                style={{
                                  //cursor
                                  cursor: "pointer",
                                }}
                              >
                                {location?.state?.item?.filePath
                                  .split("/")
                                  .pop()}
                                <div className="col">
                                  <Icon iconName={"Edit"} />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <FileField
                            tabIndex={2}
                            ref={fileInputRef}
                            label="Material"
                            id="file"
                            error={errors.file}
                            style={{ width: "80%" }}
                            touched={touched.file}
                            onChange={(e) => {
                              console.log(fileInputRef, "file");
                              setFieldValue("file", e.target.files[0]);
                              handleImage(e);
                            }}
                            accept=".pdf, image/*"
                          />
                        )}
                      </div>
                      <Button
                        tabIndex={3}
                        type="button"
                        text={"Update"}
                        onClick={(e) => {
                          handleUpdateMaterial(values);
                        }}
                      />
                    </>
                  ) : (
                    <>
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
                            setFieldTouched("course", false);
                            setFieldValue("regulation", "");
                            getBatchMaster(text);
                            setUnSavedChanges(true);
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
                            setFieldTouched("regulation", false);
                            getSubjectStaff(
                              values?.course,
                              text,
                              values?.semester
                            );
                            setUnSavedChanges(true);
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
                              setFieldTouched("semester", false);
                              getSubjectStaff(
                                values?.course,
                                values?.regulation,
                                text
                              );
                              setUnSavedChanges(true);
                            }}
                          />
                        </>
                        {/* )} */}
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
                              setUnSavedChanges(true);
                              setFieldTouched("subject", false);
                              setFieldValue("subject", text);
                            }}
                          />
                          {/* <TextFieldFormik
                            tabIndex={5}
                            id="description"
                            label="Description"
                            onChange={(e) => {
                              setUnSavedChanges(true);
                              setFieldTouched("description", false);
                              setFieldValue("description", e.target.value);
                            }}
                            style={{ width: "80%" }}
                            mandatory={1}
                          /> */}
                          <TextFieldFormik
                            tabIndex={5}
                            id="description"
                            label="Description"
                            onChange={(e) => {
                              setUnSavedChanges(true);
                              setFieldTouched("description", false);
                              setFieldValue("description", e.target.value);
                            }}
                            style={{ width: "80%" }}
                            mandatory={1}
                          />
                          <FileField
                            tabIndex={6}
                            ref={fileInputRef}
                            label="Material"
                            id="file"
                            error={errors.file}
                            style={{ width: "80%" }}
                            touched={touched.file}
                            onChange={(e) => {
                              console.log(fileInputRef, "file");
                              setFieldValue("file", e.target.files[0]);
                              handleImage(e);
                              setUnSavedChanges(true);
                            }}
                            accept=".pdf, image/*"
                          />
                        </>
                        {/* )} */}
                      </div>
                      <Button
                        tabIndex={7}
                        text={"Upload"}
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
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

export default MaterialUpload;
