import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  createRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import HeadingIcon from "@mui/icons-material/DateRange";
import moment from "moment";
import { toast } from "react-toastify";
import { Formik } from "formik";

import academicApi from "../../../api/AcademicApi";

import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import Spinner from "../../../component/Spinner";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import FileField from "../../../component/FormField/FileField";
import TextFieldFormik from "../../../component/FormField/TextFieldFormik";
import DisplayText from "../../../component/FormField/DisplayText";
import ModalComponent from "../../../component/ModalComponent";
import AuthContext from "../../../auth/context";
import { useDispatch, useSelector } from "react-redux";
import { webSliceActions } from "../../../store/web";
import Icon from "../../../component/Icon";
import { allowedFileExtensions } from "../../../component/common/CommonArray";
import ScreenTitle from "../../../component/common/ScreenTitle";
import string from "../../../string";

function TimeTableUpload() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [descriptionError, setDescriptionError] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [uploadTimeTable, setUploadTimeTable] = useState();
  const [fileType, setFileType] = useState("");
  const [selectedBatch, setSelectedBatch] = useState();
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const { collegeId, setUnSavedChanges } = useContext(AuthContext);
  const [editFile, setEditFile] = useState(false);
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required(
      collegeConfig.institution_type !== 1
        ? "Please select " + RENAME?.batch
        : "Please select " + RENAME?.sem
    ),
    section: Yup.object().required("Please select " + RENAME?.section),
    refDoc: Yup.string().required("Please choose Document"),
  });

  const dispatch = useDispatch();

  const fileInputRef = createRef();

  const handleFileUpload = (e) => {
    console.log(e.target.files[0]);

    if (e.target.files[0].size > string.MATERIAL_FILE_SIZE) {
      setModalTitle("File Size ");
      setModalMessage("Please choose file size less than 10MB");
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
        setUploadTimeTable(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    return true;
  };

  const handleUpdate = async (values) => {
    if (load) return;
    console.log("update", values);
    setUnSavedChanges(false);
    let err = false;
    setDescriptionError(false);
    setFileError(false);

    if (editFile && !values.refDoc) {
      formikRef.current.setFieldTouched("refDoc", true);
      setFileError(true);
      err = true;
    }
    if (err) return;

    try {
      setLoad(true);
      console.log("values---", values);

      var response;

      if (editFile) {
        response = await academicApi.uploadFile(
          "timetable",
          fileType,
          uploadTimeTable.split(",")[1]
        );
      }
      console.log("response--", response);

      const timetableId = location?.state?.item?.timeTableID;
      console.log("tableId----", timetableId);

      if (!editFile || response.ok) {
        const updateTimeTableRes = await academicApi.uploadTimeTable(
          timetableId,
          location?.state?.item?.classID,
          location?.state?.item?.semester,
          values.description,
          editFile
            ? response.data.message.data.file_url
            : location?.state?.item?.filePath,
          1
        );
        console.log("uploadTimeTableRes---", updateTimeTableRes);

        if (!updateTimeTableRes.data.message.success) {
          setModalErrorOpen(true);
          setModalTitle("Message");
          setModalMessage(updateTimeTableRes.data.message.message);
          setLoad(false);
          console.log(updateTimeTableRes.data.exception);
          return;
        } else {
          toast.success("Time Table Updated Successfully");
          navigate("/timetable-list");
          dispatch(webSliceActions.removeTimeTableListShow());
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    setUnSavedChanges(false);
    fileInputRef.current.value = "";
    console.log("values--->", values);
    formikRef.current.setFieldValue("refDoc", null);
    try {
      setLoad(true);

      const response = await academicApi.uploadFile(
        "timetable",
        fileType,
        uploadTimeTable.split(",")[1]
      );
      console.log("response--", response);
      let proofUrl = response.data.message.data.file_url;
      console.log("proofUrl--------", proofUrl);

      // console.log(
      //   "Checking--------",
      //   values.section.classID,
      //   values.batch.semester,
      //   values.description ? values.description : null,
      //   proofUrl
      // );

      const uploadTimeTableRes = await academicApi.uploadTimeTable(
        null,
        values.section.classID,
        values.batch.semester,
        "",
        proofUrl,
        0
      );
      console.log("uploadTimeTableRes---", uploadTimeTableRes);
      if (!uploadTimeTableRes.data.message.success) {
        setModalErrorOpen(true);
        setModalTitle("Message");
        setModalMessage(uploadTimeTableRes.data.message.message);

        setLoad(false);
        console.log(uploadTimeTableRes.data.exception);
        return;
      } else {
        setSelectedBatch(null);
        toast.success(uploadTimeTableRes.data.message.message);
        setLoad(false);
        dispatch(webSliceActions.removeTimeTableListShow());
        dispatch(webSliceActions.removeTimeTableList());
        dispatch(webSliceActions.removeTimeTableListBatch());
        resetForm();
      }

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const getSectionMaster = async (course, batch) => {
    console.log("batch-semester---", course, batch);
    formikRef.current.setFieldValue("section", "");
    setSectionList([]);
    if (batch) {
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

  const getBatchMaster = async (text) => {
    console.log("text---", text);
    formikRef.current.setFieldValue("batch", "");
    formikRef.current.setFieldValue("section", "");
    setSelectedBatch(null);
    setSectionList([]);
    setBatchList([]);

    if (text) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "batch",
            text.courseID,
            null,
            null
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setBatchList(getMasterSubjectStaffRes.data.message.data.batch);
        // setSemesterList(getMasterSubjectStaffRes.data.message.data.semester);
      } catch (error) {
        setLoad(false);
        console.log(error);
      }
    }
  };

  const getInitialList = async () => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getMasterSubjectStaff(
        collegeId,
        "course",
        1
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
    console.log("location?.state?.item", location?.state?.item);
    console.log("location?.state?.id", location?.state?.id);
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
              course: "",
              batch: "",

              semester: "",
              section: "",
              refDoc: "",
              // description: location?.state?.item.description
              //   ? location?.state?.item.description
              //   : "",
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
                      <div className="row no-gutters pt-2">
                        <div className="col-lg-10 pe-2">
                          <div className="row no-gutters mt-2">
                            <div className="col-lg-5 text-right pe-3 mt-2">
                              <label>{RENAME?.course}</label>
                            </div>
                            <div className="col-lg-7 mt-2">
                              {location?.state?.item?.courseName}
                            </div>
                          </div>
                          <div className="row no-gutters mt-2">
                            <div className="col-lg-5 text-right pe-3 mt-2">
                              <label>Batch :</label>
                            </div>
                            <div className="col-lg-7 mt-2">
                              {location?.state?.item?.batch}
                            </div>
                          </div>
                          {collegeConfig.institution_type !== 1 ? (
                            <div className="row no-gutters mt-2">
                              <div className="col-lg-5 text-right pe-3 mt-2">
                                <label>{RENAME?.sem} :</label>
                              </div>
                              <div className="col-lg-7 mt-2">
                                {location?.state?.item?.semester}
                              </div>
                            </div>
                          ) : (
                            <div className="row no-gutters mt-2">
                              <div className="col-lg-5 text-right pe-3 mt-2">
                                <label>{RENAME?.sem} :</label>
                              </div>
                              <div className="col-lg-7 mt-2">
                                {location?.state?.item?.className}
                              </div>
                            </div>
                          )}

                          <div className="row no-gutters mt-2">
                            <div className="col-lg-5 text-right pe-3 mt-2">
                              <label>Section :</label>
                            </div>
                            <div className="col-lg-7 mt-2">
                              {location?.state?.item?.section}
                            </div>
                          </div>

                          {!editFile ? (
                            <div className={"row no-gutters mt-1"}>
                              <div
                                className={`col-lg-5 ${
                                  window.innerWidth > 992 ? "text-right" : ""
                                } pe-3 mt-2`}
                              >
                                <label>File Name :</label>
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
                              label="Time Table"
                              type="file"
                              id="refDoc"
                              style={{ width: "70%" }}
                              error={errors.refDoc}
                              touched={touched.refDoc}
                              name="refDoc"
                              accept=".pdf, image/*"
                              onChange={(event) => {
                                if (handleFileUpload(event))
                                  setFieldValue(
                                    "refDoc",
                                    event.target.files[0]
                                  );
                                else setFieldValue("refDoc", null);
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        text={"Update"}
                        onClick={(e) => {
                          handleUpdate(values);
                        }}
                      />
                    </>
                  ) : (
                    <>
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
                          // style={{ width: "140%" }}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            setFieldValue("course", text);
                            setFieldTouched("course", false);
                            getBatchMaster(text);
                            setUnSavedChanges(true);
                          }}
                        />

                        {/* {values.course ? ( */}
                        <>
                          {collegeConfig.institution_type !== 1 ? (
                            <SelectFieldFormik
                              tabIndex={2}
                              label={RENAME?.year}
                              id="batch"
                              mandatory={1}
                              maxlength={10}
                              options={batchList}
                              getOptionLabel={(option) => option.year}
                              getOptionValue={(option) => option.batchID}
                              style={{ width: "50%" }}
                              onChange={(text) => {
                                setFieldValue("batch", text);
                                setFieldTouched("batch", false);
                                setSelectedBatch(text);
                                getSectionMaster(values.course, text);
                                setUnSavedChanges(true);
                              }}
                            />
                          ) : (
                            <SelectFieldFormik
                              tabIndex={2}
                              label={RENAME?.sem}
                              id="batch"
                              mandatory={1}
                              maxlength={10}
                              options={batchList}
                              getOptionLabel={(option) => option.className}
                              getOptionValue={(option) => option.semester}
                              style={{ width: "50%" }}
                              onChange={(text) => {
                                setFieldValue("batch", text);
                                setFieldTouched("batch", false);
                                setSelectedBatch(text);
                                getSectionMaster(values.course, text);
                                setUnSavedChanges(true);
                              }}
                            />
                          )}
                        </>

                        <>
                          {collegeConfig.institution_type !== 1 ? (
                            <DisplayText
                              labelSize={5}
                              label={RENAME?.sem}
                              value={
                                selectedBatch && selectedBatch.semester
                                  ? selectedBatch.semester
                                  : "-  "
                              }
                            />
                          ) : null}

                          <SelectFieldFormik
                            tabIndex={3}
                            label={RENAME?.section}
                            id="section"
                            mandatory={1}
                            options={sectionList}
                            getOptionLabel={(option) => option.section}
                            getOptionValue={(option) => option.classID}
                            style={{ width: "30%" }}
                            onChange={(text) => {
                              setFieldValue("section", text);
                              setFieldTouched("section", false);
                              setUnSavedChanges(true);
                            }}
                          />

                          {/* <TextFieldFormik
                              id="description"
                              label="Description"
                              mandatory={1}
                              maxlength={140}
                              // style={{ width: "90%" }}
                              onChange={(e) => {
                                setFieldValue("description", e.target.value);
                              }}
                            /> */}
                          <FileField
                            tabIndex={4}
                            ref={fileInputRef}
                            label="Time Table"
                            type="file"
                            id="refDoc"
                            // style={{ width: "90%" }}
                            error={errors.refDoc}
                            touched={touched.refDoc}
                            name="refDoc"
                            accept=".pdf, image/*"
                            onChange={(event) => {
                              if (handleFileUpload(event))
                                setFieldValue("refDoc", event.target.files[0]);
                              else setFieldValue("refDoc", null);
                              setUnSavedChanges(true);
                            }}
                          />
                        </>
                        {/* ) : null} */}
                      </div>
                      <Button
                        tabIndex={5}
                        text={"Upload"}
                        type="submit"
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

export default TimeTableUpload;
