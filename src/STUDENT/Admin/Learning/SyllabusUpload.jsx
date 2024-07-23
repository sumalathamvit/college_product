import React, {
  useEffect,
  useState,
  useRef,
  createRef,
  useContext,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import HeadingIcon from "@mui/icons-material/School";
import { Formik } from "formik";

import academicApi from "../../../api/AcademicApi";

import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import { toast } from "react-toastify";
import FileField from "../../../component/FormField/FileField";
import TextFieldFormik from "../../../component/FormField/TextFieldFormik";
import AuthContext from "../../../auth/context";
import ModalComponent from "../../../component/ModalComponent";
import { useDispatch, useSelector } from "react-redux";
import { webSliceActions } from "../../../store/web";
import Icon from "../../../component/Icon";
import { allowedFileExtensions } from "../../../component/common/CommonArray";
import ScreenTitle from "../../../component/common/ScreenTitle";
import string from "../../../string";

const FormSchema = Yup.object().shape({
  regulation: Yup.object().required("Please select Regulation"),
  subject: Yup.object().required("Please select Subject"),
  description: Yup.string().required("Please enter Description").trim(),
  file: Yup.mixed().required("Please select a File to Upload"),
});

function SyllabusUpload() {
  const RENAME = useSelector((state) => state.web.rename);
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [subjectList, setSubjectList] = useState([]);
  const [regulationList, setRegulationList] = useState([]);
  const [image, setImage] = useState();
  const [fileType, setFileType] = useState();
  const { collegeId, collegeName } = useContext(AuthContext);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [editFile, setEditFile] = useState(false);
  const { setUnSavedChanges } = useContext(AuthContext);
  const fileInputRef = createRef();
  const dispatch = useDispatch();

  const formikRef = useRef();

  const handleImage = (e) => {
    if (e.target.files.length < 1) {
      return;
    }

    if (e.target.files[0].size > string.MATERIAL_FILE_SIZE) {
      setModalTitle("File Size ");
      setModalMessage("Please choose file size less than 10MB");
      setModalErrorOpen(true);
      e.target.value = null;
      return;
    }
    const fileExtension = e.target.files[0].name.split(".").pop();

    if (!allowedFileExtensions.includes(fileExtension)) {
      setModalErrorOpen(true);
      setModalTitle("File Type");
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      return;
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

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    // formikRef.current.setFieldValue("description", "");
    setSubjectList([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    console.log("values---", values, "fileInputRef");

    setUnSavedChanges(false);

    try {
      setLoad(true);
      console.log("values---", values);

      const fileUploadRes = await academicApi.uploadFile(
        "syllabus",
        fileType,
        image.split(",")[1]
      );
      console.log("fileUploadRes---", fileUploadRes);

      if (fileUploadRes.ok) {
        const syllabusUploadViewRes = await academicApi.syllabusUploadView(
          values.subject.subjectID,
          values.description,
          fileUploadRes.data.message.data.file_url
        );
        console.log("syllabusUploadViewRes---", syllabusUploadViewRes);
        if (syllabusUploadViewRes.data.message.success) {
          toast.success("Syllabus Uploaded Successfully");
          resetForm();
          dispatch(webSliceActions.removeSyllabusList());
          dispatch(webSliceActions.removeSyllabusListShow());
          // navigate("/syllabus-list");
        } else {
          setModalErrorOpen(true);
          setModalTitle("Message");
          setModalMessage(syllabusUploadViewRes.data.message.message);
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
  const getSubject = async (item) => {
    try {
      const res = await academicApi.getAllSubjectsByRegulation(
        item.regulation,
        collegeId
      );
      console.log("res---", res);

      if (res.data.message.data.subjects.length === 0) {
        return;
      }
      setSubjectList(res.data.message.data.subjects);
    } catch (error) {}
  };

  const handleUpdateSyllabus = async (values) => {
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
          "syllabus",
          fileType,
          image.split(",")[1]
        );
        console.log("fileUploadRes---", fileUploadRes);
      }
      if (!editFile || fileUploadRes.ok) {
        const syllabusUploadViewRes = await academicApi.syllabusUpdate(
          location.state.item.syllabusID,
          location.state.item.subjectID,

          values.description,
          editFile
            ? fileUploadRes.data.message.data.file_url
            : location.state.item.filePath
        );
        console.log("syllabusUploadViewRes---", syllabusUploadViewRes);
        if (syllabusUploadViewRes.data.message.success) {
          toast.success(syllabusUploadViewRes.data.message.message);
          dispatch(webSliceActions.removeSyllabusListShow());

          navigate("/syllabus-list");
        } else {
          setModalErrorOpen(true);
          setModalTitle("Message");
          setModalMessage(syllabusUploadViewRes.data.message.message);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };
  useEffect(() => {
    // getInitialList();
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
              regulation: null,
              subject: null,
              file: "",

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
              handleSubmit,
              handleChange,
              setFieldValue,
              setFieldTouched,
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  {location?.state?.item ? (
                    <>
                      <div className="col-lg-8">
                        {/* <div className="row no-gutters mt-2">
                          <div className="col-lg-5 text-right pe-3 mt-2">
                            <label>Course</label>
                          </div>

                          <div className="col-lg-7 mt-2">
                            {location?.state?.item?.courseName}
                          </div>
                        </div>
                        <div className="row no-gutters mt-2">
                          <div className="col-lg-5 text-right pe-3 mt-2">
                            <label>Batch</label>
                          </div>

                          <div className="col-lg-7 mt-2">
                            {location?.state?.item?.batch}
                          </div>
                        </div>
                        <div className="row no-gutters mt-2">
                          <div className="col-lg-5 text-right pe-3 mt-2">
                            <label>Semester</label>
                          </div>

                          <div className="col-lg-7 mt-2">
                            {location?.state?.item?.semester}
                          </div>
                        </div> */}

                        <div className="row no-gutters mt-2">
                          <div className="col-lg-5 text-right pe-3 mt-2">
                            <label>Regulation</label>
                          </div>

                          <div className="col-lg-7 mt-2">
                            {location?.state?.item?.regulation}
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
                          id="description"
                          label="Description"
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          style={{ width: "80%" }}
                          mandatory={1}
                          tabIndex={1}
                        />
                        {!editFile ? (
                          <div className={"row no-gutters mt-1"}>
                            <div
                              className={`col-lg-5 ${
                                window.innerWidth > 992 ? "text-right" : ""
                              } pe-3 mt-2`}
                            >
                              <label>Syllabus</label>
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
                            ref={fileInputRef}
                            label="Syllabus"
                            id="file"
                            value={location?.state?.item?.file_name}
                            error={errors.file}
                            style={{ width: "80%" }}
                            touched={touched.file}
                            onChange={(e) => {
                              console.log(fileInputRef, "file");
                              setFieldValue("file", e.target.files[0]);
                              handleImage(e);
                            }}
                            accept=".pdf, image/*"
                            tabIndex={2}
                          />
                        )}
                      </div>
                      <Button
                        type="button"
                        text={"Update"}
                        onClick={(e) => {
                          handleUpdateSyllabus(values);
                        }}
                        tabIndex={3}
                      />
                    </>
                  ) : (
                    <>
                      <div className="col-lg-8">
                        <SelectFieldFormik
                          autoFocus
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

                            getSubject(text);
                            setFieldValue("subject", null);
                            setUnSavedChanges(true);
                          }}
                          tabIndex={1}
                        />
                        <>
                          <SelectFieldFormik
                            label="Subject"
                            id="subject"
                            mandatory={1}
                            getOptionLabel={(option) => option.subjectName}
                            getOptionValue={(option) => option.subjectID}
                            options={subjectList}
                            onChange={(text) => {
                              setFieldValue("subject", text);
                              setFieldTouched("subject", false);
                              setUnSavedChanges(true);
                            }}
                            tabIndex={2}
                          />
                          <TextFieldFormik
                            id="description"
                            label="Description"
                            onChange={(e) => {
                              setUnSavedChanges(true);
                              setFieldTouched("description", false);
                              setFieldValue("description", e.target.value);
                              // handleChange(e);
                            }}
                            style={{ width: "80%" }}
                            mandatory={1}
                            tabIndex={3}
                          />
                          <FileField
                            ref={fileInputRef}
                            label="Syllabus"
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
                            tabIndex={4}
                          />
                        </>
                        {/* )} */}
                      </div>
                      <Button
                        text={"Upload"}
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                        tabIndex={5}
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

export default SyllabusUpload;
