import React, {
  useEffect,
  useRef,
  useState,
  createRef,
  useContext,
} from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import ModalComponent from "../component/ModalComponent";
import { Modal } from "react-bootstrap";
import LMSApi from "../api/LMSApi";
import HTMLEditor from "../component/FormField/HTMLEditor";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextAreaFieldFormik from "../component/FormField/TextareaFieldFormik";
import SwitchField from "../component/FormField/SwitchField";
import { lmsCourseStatusList } from "../component/common/CommonArray";
import FileField from "../component/FormField/FileField";
import EmployeeApi from "../api/EmployeeApi";
import StudentApi from "../api/StudentApi";
import AuthContext from "../auth/context";
import HeadingIcon from "@mui/icons-material/School";
import DisplayText from "../component/FormField/DisplayText";
import string from "../string";

function NewLMSCourse() {
  const navigate = useNavigate();
  const location = useLocation();
  const formilRef = useRef();
  const titleRef = useRef();
  const fileInputRef = createRef(null);
  const [load, setLoad] = useState(false);
  const collegeConfig = useSelector((state) => state.web.college);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [editmodal, setEditModal] = useState(false);
  const [html, setHTML] = useState("");
  const [privateVideoList, setPrivateVideoList] = useState([]);
  const contentRef = useRef();
  const insContentRef = useRef();
  const [empCodeList, setEmpCodeList] = useState([]);
  const [empCode, setEmpCode] = useState("");
  const [employeeemailid, setEmployeEmailId] = useState("");
  const [fileType, setFileType] = useState();
  const [documentProof, setDocumentProof] = useState();
  const [status, setStatus] = useState({});

  const { unSavedChanges, setUnSavedChanges, collegeName, collegeId } =
    useContext(AuthContext);
  const [data, setData] = useState([]);
  const formSchema = Yup.object().shape({
    courseName: Yup.string().required("Please enter the Course Name"),
    empCode: Yup.object().required("Please select the Instructor"),
    introduction: Yup.string().required("Please enter the Introduction"),
    description: Yup.string().required("Please enter the Description"),
    introductionVideo: Yup.string()
      .required("Please enter Video Link")
      .matches(
        /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/,
        "Please enter valid URL"
      ),
    // empCode1: Yup.object().required("Please select the Mentor"),
    status: Yup.object().required("Please select the Status"),
    bannerImage: !location.state
      ? Yup.string().required("Please choose Banner Image")
      : Yup.mixed().notRequired(),
    // bannerImage: Yup.string().required("Please choose Banner Image"),

    // paidCourse: Yup.boolean(),
    // courseFee: Yup.string().when("paidCourse", (paidCourse, schema) => {
    //   if (paidCourse[0]) {
    //     return Yup.string()

    //       .required("Please enter Course Fees")
    //       .trim();
    //   }
    //   return schema;
    // }),
  });
  const handleFileUpload = (e) => {
    console.log(e.target.files[0]);
    if (e.target.files[0].size > string.MAX_FILE_SIZE) {
      setModalMessage("Please choose file size less than 2MB");
      setModalErrorOpen(true);
      setModalTitle("File Type Error");
      setLoad(false);
      return false;
    }

    if (
      e.target.files[0].type != "application/pdf" &&
      !e.target.files[0].type.includes("image")
    ) {
      setModalMessage("Please upload Image / PDF file only");
      setModalErrorOpen(true);
      setModalTitle("File Type Error");
      setLoad(false);

      return false;
    }
    setFileType(e.target.files[0].name.split(".")[1]);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setDocumentProof(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    return true;
  };
  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage?.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage?.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleCourseAdd = async (values) => {
    if (load) return;

    console.log("values1--", values, data);

    const res = data.some(
      (item) =>
        item.title.trim().toLowerCase() ===
        values.courseName.trim().toLowerCase()
    );
    console.log(res, "check response");
    if (res) {
      setModalMessage("CourseName already exist");
      setModalErrorOpen(true);
      setModalTitle("Message");
      setLoad(false);
      return;
    }

    let proofUrl = "";
    const response = await StudentApi.uploadFile(
      "lms_banner",
      fileType,
      documentProof.split(",")[1]
    );
    console.log("response--", response);
    if (!response.data.message.success) {
      setModalErrorOpen(true);
      setModalMessage(response.data.message.message);
      setModalTitle("Message");
      setLoad(false);
      return;
    }

    proofUrl = response.data.message.data.file_url;
    console.log("proofUrl--------", proofUrl);
    // return;
    let instructor = [];
    instructor.push({ instructor: values.empCode.personal_email });

    console.log("instructor---", instructor);
    setLoad(true);
    console.log(
      values.courseName ? values.courseName.trim() : null,
      values.introductionVideo ? values.introductionVideo : null,
      proofUrl,
      // values.status ? values.status.value : null,
      values.status.value === "Published" ? 1 : 0,
      values.status.value === "Published" || values.status.value === "Upcoming"
        ? 1
        : 0,
      values.status.value === "Disable Self Learning" ? 1 : 0,
      values.introduction ? values.introduction : null,
      values.description ? values.description : null,
      // values.paidCourse === true ? 1 : 0,
      // values.paidCourse === 0,
      // values.courseFee === 0,
      // values.courseFee ? parseInt(values.courseFee) : null,
      instructor ? instructor : null,
      "checking values for testing"
    );

    try {
      setLoad(true);
      const courseAddRes = await LMSApi.addEditLMSCourse(
        values.courseName ? values.courseName.trim() : null,
        values.introductionVideo ? values.introductionVideo : null,
        proofUrl,
        // values.status ? values.status.value : null,
        values.status.value === "Published" ? 1 : 0,
        values.status.value === "Published" ||
          values.status.value === "Upcoming"
          ? 1
          : 0,
        values.status.value === "Disable Self Learning" ? 1 : 0,
        values.introduction ? values.introduction : null,
        values.description ? values.description : null,
        // values.paidCourse === true ? 1 : 0,
        // values.courseFee ? parseInt(values.courseFee) : null,
        // values.paidCourse === 0,
        // values.courseFee === 0,
        instructor ? instructor : null
      );
      console.log("courseAddRes---", courseAddRes);
      toast.success("New Course added successfully");
      // setTitleOpenModal(false);
      // getAllList();
      navigate(
        "/course-list"
        //   , {
        //   state: {
        //     course: location.state.course,
        //     chapter: location.state.chapter,
        //   },
        // }
      );
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  const handleCourseEdit = async (values) => {
    if (load) return;

    console.log("values1--", values, data.image);

    let proofUrl = "";
    if (values.bannerImage) {
      const response = await StudentApi.uploadFile(
        "lms_banner",
        fileType,
        documentProof.split(",")[1]
      );
      console.log("response--", response);
      if (!response.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(response.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      proofUrl = response.data.message.data.file_url;
      console.log("proofUrl--------", proofUrl);
    }
    // return;
    let instructor = [];
    instructor.push({ instructor: values.empCode.personal_email });

    console.log("instructor---", instructor);
    setLoad(true);
    console.log(
      location.state.data,
      values.introductionVideo ? values.introductionVideo : null,
      values.bannerImage ? proofUrl : data.image,
      values.status.value === "Published" ? 1 : 0,
      values.status.value === "Published" || values.status.value === "Upcoming"
        ? 1
        : 0,
      values.status.value === "Disable Self Learning" ? 1 : 0,
      values.introduction ? values.introduction : null,
      values.description ? values.description : null,
      instructor ? instructor : null,
      "checking values for testing"
    );
    // return;
    try {
      setLoad(true);
      const courseAddRes = await LMSApi.EditLMSCourse(
        location.state.data,
        values.introductionVideo ? values.introductionVideo : null,
        values.bannerImage ? proofUrl : data.image,
        values.status.value === "Published" ? 1 : 0,
        values.status.value === "Published" ||
          values.status.value === "Upcoming"
          ? 1
          : 0,
        values.status.value === "Disable Self Learning" ? 1 : 0,
        values.introduction ? values.introduction : null,
        values.description ? values.description : null,
        instructor ? instructor : null
      );
      console.log("courseAddRes---", courseAddRes);
      toast.success(" Course Updated successfully");
      // setTitleOpenModal(false);
      // getAllList();
      navigate(
        "/course-list"
        //   , {
        //   state: {
        //     course: location.state.course,
        //     chapter: location.state.chapter,
        //   },
        // }
      );
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };
  const handleGetEmployeeDetails = async (employeeDetail) => {
    try {
      setLoad(true);
      console.log("employeeDetail---", employeeDetail);
      setEmpCode(employeeDetail);
      setEmployeEmailId(employeeDetail.personal_email);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const employeeSearch = async (value) => {
    setEmpCodeList([]);
    try {
      if (value.length > 2) {
        const employeeRes = await EmployeeApi.employeeSearch(value);
        console.log("employeeRes", employeeRes);
        setEmpCodeList(employeeRes.data.message.employee_data);
        return employeeRes.data.message.employee_data;
      }
    } catch (error) {
      console.log("error----", error);
    }
  };
  const getAllList = async (item) => {
    try {
      setLoad(true);
      console.log("CourseName--", item.data);
      // return;
      const getCourseRes = await LMSApi.getLMSCoursewithInstructor(item.data);
      setLoad(false);
      console.log("Response---", getCourseRes.data.message.data.course);
      // return;
      setData(getCourseRes.data.message.data.course[0]);
      let details = getCourseRes.data.message.data.course[0];
      console.log("details--", details.title);
      titleRef.current.setFieldValue("courseName", details.title);
      titleRef.current.setFieldValue("empCode", {
        custom_employeeid: details.custom_employeeid,
        employee_name: details.employee_name,
        personal_email: details.user_id,
      });
      titleRef.current.setFieldValue(
        "introduction",
        details.short_introduction
      );
      titleRef.current.setFieldValue("description", details.description);
      if (details.published === 1 && details.upcoming === 1) {
        titleRef.current.setFieldValue("status", {
          label: "Published",
          value: "Published",
        });
      } else if (details.upcoming === 1) {
        titleRef.current.setFieldValue("status", {
          label: "Upcoming",
          value: "Upcoming",
        });
      } else {
        titleRef.current.setFieldValue("status", {
          label: "Disable Self Learning",
          value: "Disable Self Learning",
        });
      }
      titleRef.current.setFieldValue(
        "introductionVideo",
        `https://www.youtube.com/${details.video_link}`
      );
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };
  useEffect(() => {
    console.log("useEffect--", location.state);
    if (location.state) {
      getAllList(location.state);
    }
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
        {location.state ? (
          <div className="page-heading">
            <div>
              <HeadingIcon className="page-heading-position-report" />
              Edit Course
            </div>
          </div>
        ) : (
          <ScreenTitle titleClass={"page-heading-position-report"} />
        )}
        <div className="col-lg-12">
          <a
            href="javascript:void(0)"
            onClick={(e) => navigate("/course-list")}
          >
            Courses
          </a>
        </div>

        <div className="row no-gutters mt-3">
          <Formik
            enableReinitialize={true}
            innerRef={titleRef}
            initialValues={{
              college: "",
              courseName: "",
              empCode: "",
              introduction: "",
              description: "",
              introductionVideo: "",
              bannerImage: "",
              status: "",
              // paidCourse: location?.state?.data?.paid_course
              //   ? location?.state?.data?.paid_course
              //   : "",
              // courseFee: location?.state?.data?.paid_course
              //   ? location?.state?.data?.course_price
              //   : "",
            }}
            validationSchema={formSchema}
            onSubmit={
              location?.state?.data ? handleCourseEdit : handleCourseAdd
            }
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
                    {collegeConfig.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        style={{ width: "30%" }}
                        searchIcon={false}
                        clear={false}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          // getAllList(text ? text.collegeID : null);
                        }}
                      />
                    ) : null}
                    <TextFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      tabIndex={1}
                      id="courseName"
                      label="Course Name"
                      mandatory={1}
                      disabled={location.state ? true : false}
                      labelSize={4}
                      onChange={(e) => {
                        setFieldValue("courseName", e.target.value);
                        handleUnSavedChanges(1);
                      }}
                    />

                    <SelectFieldFormik
                      label="Instructor"
                      id="empCode"
                      mandatory={1}
                      labelSize={4}
                      tabIndex={2}
                      value={empCode}
                      clear={false}
                      searchIcon={true}
                      options={empCodeList}
                      getOptionLabel={(option) =>
                        option.custom_employeeid + " - " + option.employee_name
                      }
                      getOptionValue={(option) => option.name}
                      onInputChange={(inputValue) => {
                        employeeSearch(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("empCode", text);
                        setEmpCode(text);
                        // console.log("text---", text);
                        handleGetEmployeeDetails(text);
                        handleUnSavedChanges(1);
                      }}
                    />
                    <TextAreaFieldFormik
                      id="introduction"
                      label="Introduction"
                      tabIndex={3}
                      rows={6}
                      labelSize={4}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("introduction", e.target.value);
                        handleUnSavedChanges(1);
                      }}
                    />

                    <TextAreaFieldFormik
                      tabIndex={4}
                      id="description"
                      label="Description"
                      mandatory={1}
                      rows={6}
                      labelSize={4}
                      onChange={(e) => {
                        setFieldValue("description", e.target.value);
                        handleUnSavedChanges(1);
                      }}
                    />
                    <TextFieldFormik
                      tabIndex={5}
                      id="introductionVideo"
                      label="Introduction Video Link"
                      labelSize={4}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("introductionVideo", e.target.value);
                        handleUnSavedChanges(1);
                      }}
                    />
                    <FileField
                      tabIndex={6}
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      id="bannerImage"
                      label="Banner Image"
                      labelSize={4}
                      error={errors.bannerImage}
                      touched={touched.bannerImage}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          setFieldValue("bannerImage", e.target.value);
                          handleFileUpload(e);
                          handleUnSavedChanges(1);
                        }
                      }}
                    />

                    {data?.image ? (
                      <>
                        <div className="row mt-2 mb-2">
                          <div className="col-lg-4"></div>
                          <div className="col-lg-6">
                            <a
                              href=""
                              target="_blank"
                              onClick={(e) =>
                                window.open(
                                  string.FILEURL + data?.image,
                                  "_blank"
                                )
                              }
                            >
                              View Banner Image
                            </a>
                          </div>
                        </div>
                      </>
                    ) : null}
                    <SelectFieldFormik
                      label="Status"
                      id="status"
                      mandatory={1}
                      tabIndex={7}
                      labelSize={4}
                      options={lmsCourseStatusList}
                      onChange={(text) => {
                        setStatus(text);
                        setFieldValue("status", text);
                        handleUnSavedChanges(1);
                      }}
                      style={{ width: "70%" }}
                    />

                    {/* <div className="mb-2">
                      <SwitchField
                        // id="paidCourse"
                        label="Paid Course"
                        labelSize={4}
                        tabIndex={8}
                        yesOption={"Yes"}
                        noOption={"No"}
                        checked={values.paidCourse}
                        value={values.paidCourse}
                        onChange={(e) => {
                          setFieldValue("paidCourse", !values.paidCourse);
                          handleUnSavedChanges(1);
                        }}
                      />
                    </div> */}
                    {/* {values.paidCourse ? (
                      <TextFieldFormik
                        tabIndex={9}
                        id="courseFee"
                        label="Course Fee"
                        mandatory={1}
                        maxlength={10}
                        labelSize={4}
                        onChange={(e) => {
                          if (preFunction.amountValidation(e.target.value)) {
                            if (e.target.value <= 0) {
                              setFieldValue("courseFee", "");
                              handleUnSavedChanges(1);
                              // return;
                            } else {
                              setFieldValue("courseFee", e.target.value);
                              handleUnSavedChanges(1);
                            }
                          }
                        }}
                        style={{ width: "30%" }}
                      />
                    ) : null} */}
                  </div>

                  <Button
                    text={"F4 - Save"}
                    tabIndex={5}
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                    id="save"
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
export default NewLMSCourse;
