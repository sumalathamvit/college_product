import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { toast } from "react-toastify";
import { Formik } from "formik";

import academicApi from "../../../api/AcademicApi";

import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import FileField from "../../../component/FormField/FileField";
import TextFieldFormik from "../../../component/FormField/TextFieldFormik";
import { Modal } from "react-bootstrap";
import DateFieldFormik from "../../../component/FormField/DateFieldFormik";
import moment from "moment";
import ModalComponent from "../../../component/ModalComponent";
import AuthContext from "../../../auth/context";
import { useSelector } from "react-redux";
import { allowedFileExtensions } from "../../../component/common/CommonArray";
import ScreenTitle from "../../../component/common/ScreenTitle";
import string from "../../../string";

function EventsUpload() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [uploadCircular, setUploadCircular] = useState();
  const [fileType, setFileType] = useState("");
  const [departmentList, setDepartmentList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [allCourse, setAllCourse] = useState([]);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [batchList, setBatchList] = useState([]);
  const { setUnSavedChanges, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    department: Yup.array().required("Please select Department"),
    course: Yup.array().required("Please select " + RENAME?.course),
    semester: Yup.array().required("Please select " + RENAME?.sem),
    topic: Yup.string().required("Please enter Event Topic"),
    description: Yup.string().required("Please enter Event Description"),
    eventDate: Yup.date().required("Please select Event Date"),
    refDoc: Yup.string().required("Please choose Document"),
    eventfor: Yup.object().required("Please select Event for"),
  });

  const circularFor = [
    {
      id: 0,
      title: "Staff and Student",
    },
    {
      id: 1,
      title: "Staff",
    },
  ];

  const yearList = [
    {
      year: "All",
      yearID: -1,
    },

    {
      year: "Year 1",
      yearID: 1,
    },
    {
      year: "Year 2",
      yearID: 2,
    },
    {
      year: "Year 3",
      yearID: 3,
    },
    {
      year: "Year 4",
      yearID: 4,
    },
  ];

  const handleFileUpload = (e) => {
    console.log(e.target.files[0]);
    if (e.target.files[0].size > string.MAX_FILE_SIZE) {
      setModalErrorOpen(true);
      setModalTitle("File Size");
      setModalMessage("Please choose file size less than 2MB");
      e.target.value = null;
      return false;
    }

    const fileExtension = e.target.files[0].name.split(".").pop();

    if (!allowedFileExtensions.includes(fileExtension)) {
      setModalErrorOpen(true);
      setModalTitle("File Type");
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      return false;
    }
    setFileType(fileExtension);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setUploadCircular(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    return true;
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("values--->", values);
    setUnSavedChanges(false);

    try {
      setLoad(true);

      const response = await academicApi.uploadFile(
        "circular",
        fileType,
        uploadCircular.split(",")[1]
      );
      console.log("response--", response);
      let proofUrl = response.data.message.data.file_url;
      console.log("proofUrl--------", proofUrl);

      const uploadCircularRes = await academicApi.addEvent(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        values.department.map((item) => item.departmentID).join(","),
        values.course.map((item) => item.courseID).join(","),
        values.semester.map((item) => item.semester).join(","),
        values.topic,
        values.eventDate,
        values.description,
        proofUrl,
        values.eventfor.id
      );

      console.log("uploadCircularRes---", uploadCircularRes);
      if (!uploadCircularRes.data.message.success) {
        setModalErrorOpen(true);
        setModalTitle("Message");
        setModalMessage(uploadCircularRes.data.message.message);
        setLoad(false);
      } else {
        toast.success(uploadCircularRes.data.message.message);
        resetForm();
        navigate("/events-list");
      }

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const getDepartmentList = async (college) => {
    console.log("college", college);

    try {
      const getDepartmentListRes = await academicApi.getMasterCircular(
        "department",
        college,
        null
      );
      console.log("getDepartmentListRes---", getDepartmentListRes);
      setDepartmentList(getDepartmentListRes.data.message.data.department);
      setAllCourse(getDepartmentListRes.data.message.data.course);

      setSelectedDepartment([
        {
          department: "All",
          departmentID: -10,
        },
      ]);
      setSelectedCourse([
        {
          courseName: "All",
          courseID: -10,
          duration: 4,
        },
      ]);
      setSelectedYear([
        {
          year: "All",
          yearID: -10,
        },
      ]);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getCourseList = async (department) => {
    console.log(
      "department",
      department,
      department.map((item) => item.departmentID).join(",")
    );

    try {
      const getCourseListRes = await academicApi.getMasterCircular(
        "course",
        null,
        department.map((item) => item.departmentID).join(",")
      );
      console.log("getCourseListRes---", getCourseListRes);
      setCourseList(getCourseListRes.data.message.data.course);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getBatchMaster = async (course) => {
    console.log("course---", course);
    formikRef.current.setFieldTouched("course", false);

    console.log("text---", course);
    setBatchList([]);
    if (course) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
            "batch",
            course.courseID
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setBatchList(getMasterSubjectStaffRes.data.message.data.batch);
      } catch (error) {
        console.log("error", error);
        setLoad(false);
      }
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getDepartmentList(collegeId);
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
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: null,
              department: null,
              course: null,
              year: null,
              semester: "",
              topic: "",
              refDoc: "",
              description: "",
              eventDate: "",
              eventfor: "",
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
                    {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        style={{ width: "100%" }}
                        searchIcon={false}
                        clear={false}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          getDepartmentList(text?.collegeID);

                          setSelectedCollege(text);
                          setUnSavedChanges(true);
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      tabIndex={2}
                      label={RENAME?.dept}
                      id="department"
                      mandatory={1}
                      options={[
                        {
                          department: "All",
                          departmentID: -10,
                        },
                        ...departmentList,
                      ]}
                      isMulti={true}
                      getOptionLabel={(option) => option.department}
                      getOptionValue={(option) => option.departmentID}
                      style={{ width: "90%" }}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        console.log("text", text);

                        let departmentValue = text;

                        if (text.length > 0) {
                          if (text[text.length - 1].departmentID == -10) {
                            departmentValue = [text[text.length - 1]];
                          } else if (text[0].departmentID == -10) {
                            departmentValue = text.slice(1);
                          }
                        } else {
                          departmentValue = [
                            {
                              department: "All",
                              departmentID: -10,
                            },
                          ];
                        }

                        setFieldValue("department", departmentValue);
                        setSelectedDepartment(departmentValue);
                        if (departmentValue.length > 0) {
                          getCourseList(departmentValue);
                        }
                        setUnSavedChanges(true);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={3}
                      label={RENAME?.course}
                      id="course"
                      mandatory={1}
                      options={
                        selectedDepartment.length > 0 &&
                        selectedDepartment[0].departmentID == -10
                          ? [
                              {
                                courseName: "All",
                                courseID: -10,
                              },
                              ...allCourse,
                            ]
                          : [
                              {
                                courseName: "All",
                                courseID: -10,
                              },
                              ...courseList,
                            ]
                      }
                      isMulti={true}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      style={{ width: "90%" }}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        let courseValue = text;
                        if (text.length > 0) {
                          if (text[text.length - 1].courseID == -10) {
                            courseValue = [text[text.length - 1]];
                          } else if (text[0].courseID == -10) {
                            courseValue = text.slice(1);
                          }
                        } else {
                          courseValue = [
                            {
                              courseName: "All",
                              courseID: -10,
                            },
                          ];
                        }
                        setFieldValue("course", courseValue);
                        setSelectedCourse(courseValue);
                        if (courseValue.length > 0) {
                          getBatchMaster(courseValue[0]);
                        }
                        setUnSavedChanges(true);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={4}
                      label={RENAME?.sem}
                      id="semester"
                      isMulti={true}
                      mandatory={1}
                      options={[
                        {
                          className: "All",
                          semester: -10,
                        },
                        ...batchList,
                      ]}
                      getOptionLabel={(option) => option.className}
                      getOptionValue={(option) => option.semester}
                      style={{ width: "50%" }}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        let yearValue = text;
                        if (text.length > 0) {
                          if (text[text.length - 1].semester == -10) {
                            yearValue = [text[text.length - 1]];
                          } else if (text[0].semester == -10) {
                            yearValue = text.slice(1);
                          }
                        } else {
                          yearValue = [
                            {
                              year: "All",
                              yearID: -10,
                            },
                          ];
                        }
                        console.log(yearValue, "text");

                        setFieldValue("semester", yearValue);
                        setSelectedYear(yearValue);
                        setUnSavedChanges(true);
                      }}
                    />

                    <TextFieldFormik
                      tabIndex={5}
                      id="topic"
                      label="Event Topic"
                      mandatory={1}
                      maxlength={140}
                      onChange={(e) => {
                        setFieldValue("topic", e.target.value);
                        setUnSavedChanges(true);
                      }}
                    />
                    <>
                      <TextFieldFormik
                        tabIndex={6}
                        id="description"
                        label="Event Description"
                        mandatory={1}
                        maxlength={140}
                        onChange={(e) => {
                          setFieldValue("description", e.target.value);
                          setUnSavedChanges(true);
                        }}
                      />
                      <FileField
                        tabIndex={7}
                        label="Event Document"
                        type="file"
                        id="refDoc"
                        style={{ marginBottom: 5 }}
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
                      <DateFieldFormik
                        tabIndex={8}
                        label="Event Date"
                        id="eventDate"
                        maxDate={moment().add(3, "months")}
                        minDate={new Date()}
                        mandatory={1}
                        style={{ width: "30%" }}
                        onChange={(e) => {
                          setFieldValue("eventDate", e.target.value);
                          setUnSavedChanges(true);
                        }}
                      />
                      <SelectFieldFormik
                        tabIndex={9}
                        label="Event for"
                        id="eventfor"
                        placeholder={"Select"}
                        mandatory={1}
                        options={circularFor}
                        getOptionLabel={(option) => option.title}
                        getOptionValue={(option) => option.id}
                        style={{ width: "50%" }}
                        searchIcon={false}
                        clear={false}
                        onChange={(text) => {
                          setFieldValue("eventfor", text);
                          setUnSavedChanges(true);
                        }}
                      />
                    </>
                  </div>
                  <Button
                    tabIndex={10}
                    text={"Upload"}
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

export default EventsUpload;
