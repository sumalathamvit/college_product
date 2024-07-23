import React, {
  useEffect,
  useState,
  useRef,
  createRef,
  useContext,
} from "react";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import * as Yup from "yup";
import { Formik } from "formik";
import { Tab, Tabs } from "react-bootstrap";
import { toast } from "react-toastify";

import academicApi from "../../api/AcademicApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextAreaFieldFormik from "../../component/FormField/TextareaFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import StudentCard from "../../component/StudentCard";
import FileField from "../../component/FormField/FileField";
import ModalComponent from "../../component/ModalComponent";
import AuthContext from "../../auth/context";
import { useSelector } from "react-redux";
import { allowedFileExtensions } from "../../component/common/CommonArray";
import CommonApi from "../../component/common/CommonApi";
import string from "../../string";
import ScreenTitle from "../../component/common/ScreenTitle";
import StudentApi from "../../api/StudentApi";

function PushNotification() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const formikReference = useRef();
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [studentInfo, setStudentInfo] = useState([]);
  const [image, setImage] = useState();
  const [fileType, setFileType] = useState();
  const [collegeList, setCollegeList] = useState([]);
  const fileInputRef1 = createRef();
  const fileInputRef2 = createRef();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const { setUnSavedChanges, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.object().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
    year: Yup.object().required("Please select " + RENAME?.sem),
    title: Yup.string()
      .required("Please enter Title")
      .matches(/^[A-Za-z@., -]+$/, "Please enter valid Title")
      .trim(),
    message: Yup.string().required("Please enter Message"),
  });

  const TabFormSchema = Yup.object().shape({
    enrollNo: Yup.object().required("Please select Student No."),
    title: Yup.string()
      .required("Please enter Title")
      .matches(/^[A-Za-z@., -]+$/, "Please enter valid Title")
      .trim(),
    message: Yup.string().required("Please enter Message"),
  });

  const handlePushNotification = async (values, { resetForm }) => {
    if (load) return;
    setUnSavedChanges(false);

    fileInputRef1.current.value = "";
    fileInputRef2.current.value = "";

    try {
      setLoad(true);
      let imageUrl = "";
      if (image) {
        console.log("syllabus", fileType, image.split(",")[1], "logging");
        const fileUploadRes = await academicApi.uploadFile(
          "notification",
          fileType,
          image.split(",")[1]
        );
        // console.log(fileUploadRes.data, "upload image");

        if (fileUploadRes.ok) {
          imageUrl = fileUploadRes.data.message.data.file_url;
        }
      }

      // console.log(
      //   values.enrollNo ? values.enrollNo.id.toString() : "",
      //   collegeConfig.is_university
      //     ? values.college
      //       ? values.college.collegeID.toString()
      //       : ""
      //     : collegeId,
      //   values.course ? values.course.id.toString() : "",
      //   values.year ? values.year.batchID.toString() : "",
      //   values.title,
      //   values.message,
      //   imageUrl,
      //   "checking data"
      // );
      // return;
      const pushNotificationRes = await academicApi.pushNotification(
        values.enrollNo ? values.enrollNo.id.toString() : "",
        collegeConfig.is_university
          ? values.college
            ? values.college.collegeID.toString()
            : ""
          : collegeId,
        values.course ? values.course.id.toString() : "",
        values.year ? values.year.batchID.toString() : "",
        values.title,
        values.message,
        string.FILEURL + imageUrl
      );
      console.log("pushNotificationRes", pushNotificationRes);
      // return;
      if (!pushNotificationRes.data.message.success) {
        setLoad(false);
        setModalTitle("Message");
        setModalMessage(pushNotificationRes.data.message.message);
        setModalErrorOpen(true);

        return;
      } else {
        toast.success(pushNotificationRes.data.message.message);
        resetForm();
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };
  const handleImage = (e) => {
    if (e.target.files.length < 1) {
      return;
    }
    console.log(e.target.files[0], "file");
    if (e.target.files[0].size > string.MAX_FILE_SIZE) {
      setModalTitle("File Size");
      setModalMessage("Please choose file size less than 2MB");
      setModalErrorOpen(true);
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
        console.log(reader.result, "checking image");
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleSelectStudent = async (value) => {
    console.log("value", value);
    try {
      setLoad(true);
      if (value) {
        const getStudentDetail = await academicApi.viewStudentDetail(value.id);
        console.log("getStudentDetail--", getStudentDetail);
        setStudentInfo(getStudentDetail?.data?.message);
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

  const getInitialList = async () => {
    try {
      // setLoad(true);
      // console.log("values---", values);
      const res = await academicApi.getAllColleges();
      console.log("res", res.data.message.data.colleges);
      setCollegeList(res.data.message.data.colleges);
      // setLoad(false);
      // setOpenModal(false);
    } catch (error) {
      // setLoad(false);
      // // setOpenModal(false);
      console.log(error);
    }
  };
  const getBatchList = async (collegeID) => {
    try {
      console.log("collegeID", collegeID);

      const response = await StudentApi.getMaster(5, collegeID);
      console.log("response", response);
      // return;
      setCourseList(response.data.message.data.course_data);
    } catch (error) {
      console.log(error);
    }
  };

  const getBatchMaster = async (course) => {
    console.log("text---", course);
    setBatchList([]);
    // setSemesterList([]);
    if (course) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
            "batch",
            course.id
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setBatchList(getMasterSubjectStaffRes.data.message.data.batch);
        // setSemesterList(getMasterSubjectStaffRes.data.message.data.semester);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // const handleTabSelect = () => {
  //   // Focus on the input field when tab is selected
  //   // inputRef.current.focus();
  //   document.getElementById("enrollNo").focus();
  // };

  useEffect(() => {
    getInitialList();
    if (!collegeConfig.is_university) {
      getBatchList(collegeId);
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
        <div className="col-lg-12 mt-1">
          <div className="col-lg-8 mt-4"></div>
          <Tabs
            id="uncontrolled-tab-example"
            className="text-center mt-4 pt-2"
            fill
          >
            <Tab eventKey={1} title="Send by Batch">
              <div className="row no-gutters p-3">
                <Formik
                  enableReinitialize={false}
                  innerRef={formikRef}
                  initialValues={{
                    college: null,
                    course: null,
                    year: null,
                    message: "",
                    title: "",
                    file: null,
                  }}
                  validationSchema={FormSchema}
                  onSubmit={handlePushNotification}
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
                        <div className="col-lg-9 mt-1">
                          {collegeConfig.is_university ? (
                            <SelectFieldFormik
                              autoFocus
                              tabIndex={1}
                              label="College"
                              id="college"
                              mandatory={1}
                              getOptionLabel={(option) => option.college}
                              getOptionValue={(option) => option.collegeID}
                              options={collegeList}
                              onChange={(text) => {
                                setFieldValue("college", text);
                                getBatchList(text.collegeID);
                                setUnSavedChanges(true);
                              }}
                            />
                          ) : null}

                          <SelectFieldFormik
                            tabIndex={2}
                            label={RENAME?.course}
                            id="course"
                            mandatory={1}
                            clear={false}
                            getOptionLabel={(option) => option.courseName}
                            getOptionValue={(option) => option.id}
                            // options={courseList}
                            options={[
                              { id: "All", courseName: "All" },
                              ...courseList,
                            ]}
                            style={{ width: "90%" }}
                            onChange={(text) => {
                              console.log(text, "test");
                              setFieldValue("course", text);
                              setUnSavedChanges(true);
                              getBatchMaster(text);
                            }}
                          />

                          <>
                            <SelectFieldFormik
                              tabIndex={3}
                              label={RENAME?.sem}
                              id="year"
                              mandatory={1}
                              // maxlength={10}
                              clear={false}
                              getOptionLabel={(option) => option.className}
                              getOptionValue={(option) => option.semester}
                              // options={batchList}
                              options={[
                                {
                                  className: "All",
                                  semester: "All",
                                  batchID: "All",
                                },
                                ...batchList,
                              ]}
                              style={{ width: "90%" }}
                              onChange={(text) => {
                                console.log(text, "year");
                                setFieldValue("year", text);
                                setUnSavedChanges(true);
                              }}
                            />
                            <TextFieldFormik
                              tabIndex={4}
                              label={"Title"}
                              id="title"
                              mandatory={1}
                              maxlength={140}
                              style={{ width: "90%" }}
                              onChange={(e) => {
                                setFieldValue("title", e.target.value);
                                setUnSavedChanges(true);
                              }}
                            />

                            <TextAreaFieldFormik
                              tabIndex={5}
                              maxlength={140}
                              marginTopReduce={true}
                              // isTable={true}
                              id={`message`}
                              name="message"
                              label="Message"
                              placeholder="Message"
                              value={values.message}
                              style={{ width: "90%" }}
                              mandatory={1}
                              onChange={(e) => {
                                setFieldValue("message", e.target.value);
                                setUnSavedChanges(true);
                              }}
                            />

                            <FileField
                              tabIndex={6}
                              ref={fileInputRef1}
                              marginTopReduce={true}
                              label="Image"
                              id="file"
                              error={errors.file}
                              style={{ width: "90%" }}
                              touched={touched.file}
                              onChange={(e) => {
                                console.log(fileInputRef1, "file");
                                setFieldValue("file", e.target.files[0]);
                                handleImage(e);
                                setUnSavedChanges(true);
                              }}
                              accept="image/*"
                            />
                          </>
                        </div>
                        <div className="mt-3">
                          <Button
                            tabIndex={7}
                            type="submit"
                            isTable={true}
                            text={"Send"}
                            onClick={(e) => {
                              preFunction.handleErrorFocus(errors);
                            }}
                          />
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </div>
            </Tab>
            <Tab
              eventKey={2}
              title="Send by Individual"
              // onSelect={() => handleTabSelect()}
            >
              <div className="row no-gutters p-3">
                <Formik
                  enableReinitialize={false}
                  innerRef={formikReference}
                  initialValues={{
                    enrollNo: "",
                    message: "",
                    title: "",
                    file: null,
                  }}
                  validationSchema={TabFormSchema}
                  onSubmit={handlePushNotification}
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
                        <div className="col-lg-9 mt-1">
                          <SelectFieldFormik
                            autoFocus
                            tabIndex={8}
                            label="Student No."
                            id="enrollNo"
                            mandatory={1}
                            options={studentList}
                            searchIcon={true}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.id}
                            onInputChange={(inputValue) => {
                              searchStudent(inputValue);
                            }}
                            style={{ width: "90%" }}
                            onChange={(text) => {
                              setFieldValue("enrollNo", text);
                              handleSelectStudent(text);
                              setUnSavedChanges(true);
                            }}
                          />
                        </div>
                        {values.enrollNo && studentInfo ? (
                          <>
                            <div className="subhead-row">
                              <div className="subhead">Student Details</div>
                              <div className="col line-div"></div>
                            </div>

                            {studentInfo && (
                              <StudentCard studentInfo={studentInfo} />
                            )}
                          </>
                        ) : null}
                        <div className="col-lg-9 mt-1">
                          <TextFieldFormik
                            tabIndex={9}
                            label={"Title"}
                            id="title"
                            mandatory={1}
                            maxlength={140}
                            style={{ width: "90%" }}
                            onChange={(e) => {
                              setFieldValue("title", e.target.value);
                              setUnSavedChanges(true);
                            }}
                          />
                          <TextAreaFieldFormik
                            tabIndex={10}
                            maxlength={140}
                            id={`message`}
                            marginTopReduce={true}
                            name="message"
                            label="Message"
                            placeholder="Message"
                            value={values.message}
                            style={{ width: "90%" }}
                            mandatory={1}
                            onChange={(e) => {
                              setFieldValue("message", e.target.value);
                              setUnSavedChanges(true);
                            }}
                          />
                          <FileField
                            tabIndex={11}
                            ref={fileInputRef2}
                            label="Image"
                            marginTopReduce={true}
                            id="file"
                            error={errors.file}
                            style={{ width: "90%" }}
                            touched={touched.file}
                            onChange={(e) => {
                              console.log(fileInputRef2, "file");
                              setFieldValue("file", e.target.files[0]);
                              handleImage(e);
                              setUnSavedChanges(true);
                            }}
                            accept="image/*"
                          />
                        </div>
                        <div className="mt-3">
                          <Button
                            tabIndex={12}
                            type="submit"
                            isTable={true}
                            text={"Send"}
                            onClick={(e) => {
                              preFunction.handleErrorFocus(errors);
                            }}
                          />
                        </div>
                      </form>
                    );
                  }}
                </Formik>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default PushNotification;
