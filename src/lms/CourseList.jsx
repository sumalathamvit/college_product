import React, {
  useEffect,
  useState,
  createRef,
  useRef,
  useContext,
} from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { Formik, setIn } from "formik";

import empApi from "../api/EmployeeApi";
import LMSApi from "../api/LMSApi";
import StudentApi from "../api/StudentApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import TextField from "../component/FormField/TextField";
import ScreenTitle from "../component/common/ScreenTitle";
import { toast } from "react-toastify";
import SettingsIcon from "@mui/icons-material/Settings";
import TextFieldFormik from "./../component/FormField/TextFieldFormik";
import SelectFieldFormik from "./../component/FormField/SelectFieldFormik";
import FileField from "../component/FormField/FileField";
import TextAreaFieldFormik from "./../component/FormField/TextareaFieldFormik";
import ModalComponent from "../component/ModalComponent";
// import { lmsCourseStatusList } from "../component/common/CommonArray";
import SwitchField from "../component/FormField/SwitchField";

import AuthContext from "../auth/context";
import EmployeeApi from "../api/EmployeeApi";
import ErrorMessage from "../component/common/ErrorMessage";

function CourseList() {
  const collegeConfig = useSelector((state) => state.web.college);

  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const fileInputRef = createRef(null);

  const [titleOpenModal, setTitleOpenModal] = useState(false);

  const [course, setCourse] = useState("");

  const [instructorList, setInstrucorList] = useState([]);
  const [mentorList, setMentorList] = useState([]);
  const [data, setData] = useState([]);
  const [characterError, setCharacterError] = useState(false);
  const [courseError, setCourseError] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [empCode, setEmpCode] = useState("");
  const [employeeemailid, setEmployeEmailId] = useState("");
  // const [empCodeList1, setEmpCodeList1] = useState([]);
  // const [empCode1, setEmpCode1] = useState("");
  // const [employeeemailid1, setEmployeEmailId1] = useState("");
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const formikRef = useRef();
  const [fileType, setFileType] = useState();
  const [documentProof, setDocumentProof] = useState();
  const [courseedit, setCourseEdit] = useState();
  const [courseeditmodal, setCourseEditModal] = useState();
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  const { collegeId, collegeName } = useContext(AuthContext);

  // const formSchema = Yup.object().shape({
  //   courseName: Yup.string().required("Please enter the Course Name"),
  //   empCode: Yup.object().required("Please select the Instructor"),
  //   introduction: Yup.string().required("Please enter the Introduction"),
  //   description: Yup.string().required("Please enter the Description"),
  //   introductionVideo: Yup.string()
  //     .required("Please enter Video Link")
  //     .matches(
  //       /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/,
  //       "Please enter valid URL"
  //     ),
  //   // empCode1: Yup.object().required("Please select the Mentor"),
  //   status: Yup.object().required("Please select the Status"),

  //   bannerImage: Yup.string().required("Please choose Banner Image"),

  //   paidCourse: Yup.boolean(),
  //   courseFee: Yup.string().when("paidCourse", (paidCourse, schema) => {
  //     if (paidCourse[0]) {
  //       return Yup.string()

  //         .required("Please enter Course Fees")
  //         .trim();
  //     }
  //     return schema;
  //   }),
  // });
  const formSchema1 = Yup.object().shape({
    coursename: Yup.string().required("Please enter the Course Name"),
  });
  // const handleCourseAdd = async (values) => {
  //   if (load) return;

  //   console.log("values1--", values, data);

  //   const res = data.some(
  //     (item) =>
  //       item.title.trim().toLowerCase() ===
  //       values.courseName.trim().toLowerCase()
  //   );
  //   console.log(res, "check response");
  //   if (res) {
  //     setModalMessage("CourseName already exist");
  //     setModalErrorOpen(true);
  //     setModalTitle("Message");
  //     setLoad(false);
  //     return;
  //   }

  //   let proofUrl = "";
  //   const response = await StudentApi.uploadFile(
  //     "lms_banner",
  //     fileType,
  //     documentProof.split(",")[1]
  //   );
  //   console.log("response--", response);
  //   if (!response.data.message.success) {
  //     setModalErrorOpen(true);
  //     setModalMessage(response.data.message.message);
  //     setModalTitle("Message");
  //     setLoad(false);
  //     return;
  //   }

  //   proofUrl = response.data.message.data.file_url;
  //   console.log("proofUrl--------", proofUrl);
  //   // return;
  //   let instructor = [];
  //   instructor.push({ instructor: values.empCode.personal_email });

  //   console.log("instructor---", instructor);
  //   setLoad(true);
  //   console.log(
  //     values.courseName ? values.courseName.trim() : null,
  //     values.introductionVideo ? values.introductionVideo : null,
  //     proofUrl,
  //     // values.status ? values.status.value : null,
  //     values.status.value === "Published" || "Upcoming" ? 1 : 0,
  //     values.status.value === "Upcoming" ? 1 : 0,
  //     values.status.value === "Disable Self Learning" ? 1 : 0,
  //     values.introduction ? values.introduction : null,
  //     values.description ? values.description : null,
  //     values.paidCourse === true ? 1 : 0,
  //     values.courseFee ? parseInt(values.courseFee) : null,
  //     instructor ? instructor : null,
  //     "checking values for testing"
  //   );

  //   try {
  //     setLoad(true);
  //     const courseAddRes = await LMSApi.addEditLMSCourse(
  //       values.courseName ? values.courseName.trim() : null,
  //       values.introductionVideo ? values.introductionVideo : null,
  //       proofUrl,
  //       // values.status ? values.status.value : null,
  //       values.status.value === "Published" || "Upcoming" ? 1 : 0,
  //       values.status.value === "Upcoming" ? 1 : 0,
  //       values.status.value === "Disable Self Learning" ? 1 : 0,
  //       values.introduction ? values.introduction : null,
  //       values.description ? values.description : null,
  //       values.paidCourse === true ? 1 : 0,
  //       values.courseFee ? parseInt(values.courseFee) : null,
  //       instructor ? instructor : null
  //     );
  //     console.log("courseAddRes---", courseAddRes);
  //     toast.success("New Course added successfully");
  //     setTitleOpenModal(false);
  //     getAllList();
  //     setLoad(false);
  //     return;
  //   } catch (error) {
  //     setLoad(false);
  //     console.log("exception--", error);
  //   }
  // };

  // const handleFileUpload = (e) => {
  //   console.log(e.target.files[0]);
  //   if (e.target.files[0].size > string.MAX_FILE_SIZE) {
  //     setModalMessage("Please choose file size less than 2MB");
  //     setModalErrorOpen(true);
  //     setModalTitle("File Type Error");
  //     setLoad(false);
  //     return false;
  //   }

  //   if (
  //     e.target.files[0].type != "application/pdf" &&
  //     !e.target.files[0].type.includes("image")
  //   ) {
  //     setModalMessage("Please upload Image / PDF file only");
  //     setModalErrorOpen(true);
  //     setModalTitle("File Type Error");
  //     setLoad(false);

  //     return false;
  //   }
  //   setFileType(e.target.files[0].name.split(".")[1]);
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     if (reader.readyState === 2) {
  //       setDocumentProof(reader.result);
  //     }
  //   };
  //   reader.readAsDataURL(e.target.files[0]);
  //   return true;
  // };

  // const employeeSearch = async (value) => {
  //   setEmpCodeList([]);

  //   try {
  //     if (value.length > 2) {
  //       const employeeRes = await EmployeeApi.employeeSearch(value);
  //       console.log("employeeRes", employeeRes);
  //       setEmpCodeList(employeeRes.data.message.employee_data);
  //       return employeeRes.data.message.employee_data;
  //     }
  //   } catch (error) {
  //     console.log("error----", error);
  //   }
  // };
  // const employeeSearch1 = async (value) => {
  //   setEmpCodeList1([]);
  //   try {
  //     if (value.length > 2) {
  //       const employeeRes = await EmployeeApi.employeeSearch(value);
  //       console.log("employeeRes", employeeRes);
  //       setEmpCodeList1(employeeRes.data.message.employee_data);
  //       return employeeRes.data.message.employee_data;
  //     }
  //   } catch (error) {
  //     console.log("error----", error);
  //   }
  // };

  // const handleGetEmployeeDetails = async (employeeDetail) => {
  //   try {
  //     setLoad(true);
  //     console.log("employeeDetail---", employeeDetail);
  //     setEmpCode(employeeDetail);
  //     setEmployeEmailId(employeeDetail.personal_email);

  //     setLoad(false);
  //   } catch (error) {
  //     setLoad(false);
  //     console.log("error----", error);
  //   }
  // };

  // const handleGetEmployeeDetails1 = async (employeeDetail) => {
  //   try {
  //     setLoad(true);
  //     console.log("employeeDetail---", employeeDetail);
  //     setEmpCode1(employeeDetail);
  //     setEmployeEmailId1(employeeDetail.personal_email);

  //     setLoad(false);
  //   } catch (error) {
  //     setLoad(false);
  //     console.log("error----", error);
  //   }
  // };
  // const handleEdit = async (value) => {
  //   console.log("value--", courseedit.name, value.coursename, data);
  //   // return;
  //   if (load) return;
  //   try {
  //     const res = data.some(
  //       (item) =>
  //         item.title.trim().toLowerCase() ===
  //         value.coursename.trim().toLowerCase()
  //     );
  //     console.log(res, "check response");
  //     if (res) {
  //       setModalMessage("CourseName already exist");
  //       setModalErrorOpen(true);
  //       setModalTitle("Message");
  //       setLoad(false);
  //       return;
  //     }
  //     if (courseedit.title == value.coursename) {
  //       // getAllList();
  //       setModalMessage("No changes made");
  //       setModalErrorOpen(true);
  //       setModalTitle("Message");
  //       setCourseEditModal(false);
  //       setLoad(false);
  //       return;
  //       // toast.success("No changes made", {
  //       //   autoClose: 1000, // time in milliseconds, 5000ms = 5 seconds
  //       // });
  //     }
  //     setLoad(true);

  //     const updateCourseRes = await LMSApi.editCourseName(
  //       courseedit.name,
  //       value.coursename
  //     );
  //     console.log("updateCourseRes--", updateCourseRes);
  //     toast.success("Course updated successfully");
  //     setLoad(false);

  //     getAllList();
  //     setCourseEditModal(false);
  //     return;
  //   } catch (error) {
  //     console.log("error----", error);
  //   }
  // };
  const getAllList = async () => {
    try {
      setLoad(true);
      let searchStr = [];

      if (course) {
        searchStr.push(
          `["name", "like", "${course}%"],["name", "like", "%${course}%"]`
        );
      } else {
        searchStr.push(null);
      }
      const getCourseRes = await LMSApi.getLMSCourseDetail(searchStr.join(","));
      console.log("getCourseRes---", getCourseRes);

      setData(getCourseRes.data.data);
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  useEffect(() => {
    getAllList();
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
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-2">
          <div className="col-lg-3">
            <TextField
              autoFocus
              id="course"
              mandatory={1}
              value={course}
              error={courseError}
              touched={courseError ? true : false}
              maxlength={20}
              placeholder="Course"
              onChange={(e) => {
                setCourse(e.target.value);
                setCourseError(false);
              }}
              // onKeyUp={(e) => e.keyCode == 13 && getStudentSearch()}
            />
            <ErrorMessage
              Message={`Please type atleast 3 characters`}
              view={characterError}
            />
          </div>
          <div className="col-lg-6 ps-3 mt-1">
            <Button
              isTable={true}
              frmButton={false}
              onClick={() => {
                if (course.length >= 3) {
                  setCharacterError(false);
                  getAllList();
                } else {
                  setCharacterError(true);
                }
              }}
              text="Search"
              type="button"
            />
          </div>

          {/* </div> */}
          <div className="col-lg-3 mt-1 text-right">
            <Button
              isTable={true}
              frmButton={false}
              className={"btn-green"}
              onClick={() => {
                navigate("/lms-new-course");
              }}
              // onClick={() => setTitleOpenModal(true)}
              text={"New Course"}
              type="button"
            />
          </div>
        </div>
        <div className="row no-gutters mt-3">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th width="1%">No.</th>
                  <th>Course</th>
                  <th width="5%">Setting</th>
                </tr>
              </thead>
              {data?.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={8} align="center">
                      No courses found
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {data?.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <a
                          href="javascript:void(0)"
                          onClick={(e) => {
                            navigate("/chapter-list", {
                              state: { course: item },
                            });
                          }}
                        >
                          {item.title}
                        </a>
                      </td>
                      <td align="center">
                        <SettingsIcon
                          style={{
                            width: "1em",
                            height: "1em",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            // setCourseEdit(item);
                            // setCourseEditModal(true);
                            navigate("/lms-new-course", {
                              state: {
                                data: item.name,
                                // course: location.state.course,
                                // chapter: location.state.chapter,
                              },
                            });
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
        {/* <Modal
          show={courseeditmodal}
          dialogClassName="title-modal"
          onEscapeKeyDown={() => {
            // setEditChapter();
            setCourseEditModal(false);
          }}
        >
          <Modal.Header>
            <Modal.Title> Edit Course</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formik
              enableReinitialize={true}
              // innerRef={formilRef}
              initialValues={{
                coursename: courseedit ? courseedit.title : null,
              }}
              validationSchema={formSchema1}
              onSubmit={handleEdit}
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
                      <TextFieldFormik
                        autoFocus
                        label="Course Name"
                        tabIndex={1}
                        id="coursename"
                        mandatory={1}
                        searchIcon={true}
                        onChange={(e) => {
                          setFieldValue("coursename", e.target.value);
                        }}
                      />
                    </div>
                    {/* <Button
                      text={"F4 - Save"}
                      tabIndex={3}
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                      id="save"
                    /> */}
        {/* <div className="text-center mt-2">
                      <Button
                        className={"btn me-4"}
                        frmButton={false}
                        tabIndex={5}
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                        id="save"
                        text="F4 - Save"
                      />
                      <Button
                        text="Close"
                        type="button"
                        frmButton={false}
                        onClick={(e) => {
                          setCourseEditModal(false);
                        }}
                      />
                    </div>
                  </form>
                );
              }}
            </Formik>
          </Modal.Body>
        </Modal> */}
        {/* */}
        {/* <Modal
          show={titleOpenModal}
          dialogClassName="title-modal"
          onEscapeKeyDown={() => setTitleOpenModal(false)}
        >
          <Modal.Header>
            <Modal.Title> New Course</Modal.Title>
          </Modal.Header>

          <Formik
            enableReinitialize={true}
            //innerRef={titleRef}
            initialValues={{
              college: "",
              courseName: "",
              empCode: "",
              introduction: "",
              description: "",
              introductionVideo: "",
              bannerImage: "",
              // empCode1: "",
              status: "",
              paidCourse: "",
              courseFee: "",
            }}
            validationSchema={formSchema}
            onSubmit={handleCourseAdd}
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
                  <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
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
                        labelSize={4}
                        onChange={(e) => {
                          setFieldValue("courseName", e.target.value);
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
                          option.custom_employeeid +
                          " - " +
                          option.employee_name
                        }
                        getOptionValue={(option) => option.name}
                        onInputChange={(inputValue) => {
                          employeeSearch(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("empCode", text);
                          setEmpCode(text);
                          handleGetEmployeeDetails(text);
                        }}
                      />
                      <TextAreaFieldFormik
                        id="introduction"
                        label="Introduction"
                        tabIndex={3}
                        rows={6}
                        labelSize={4}
                        mandatory={1}
                        onChange={(e) =>
                          setFieldValue("introduction", e.target.value)
                        }
                      />

                      <TextAreaFieldFormik
                        tabIndex={4}
                        id="description"
                        label="Description"
                        mandatory={1}
                        rows={6}
                        labelSize={4}
                        onChange={(e) =>
                          setFieldValue("description", e.target.value)
                        }
                      />
                      <TextFieldFormik
                        tabIndex={5}
                        id="introductionVideo"
                        label="Introduction Video Link"
                        labelSize={4}
                        mandatory={1}
                        onChange={(e) =>
                          setFieldValue("introductionVideo", e.target.value)
                        }
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
                          }
                        }}
                      />

                      <SelectFieldFormik
                        label="Status"
                        id="status"
                        mandatory={1}
                        tabIndex={7}
                        labelSize={4}
                        options={lmsCourseStatusList}
                        onChange={(text) => {
                          setFieldValue("status", text);
                        }}
                        style={{ width: "70%" }}
                      />

                      <div className="mb-2">
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
                          }}
                        />
                      </div>
                      {values.paidCourse ? (
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
                                // return;
                              } else {
                                setFieldValue("courseFee", e.target.value);
                              }

                              // setFieldTouched("courseduration", false);
                              // setFieldValue("courseduration", e.target.value);
                            }
                          }}
                          style={{ width: "30%" }}
                        />
                      ) : null}
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      type="submit"
                      text={"F4 - Save"}
                      frmButton={false}
                      tabIndex={12}
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                      id="save"
                    />
                    <Button
                      text="Close"
                      type="button"
                      frmButton={false}
                      onClick={(e) => {
                        setTitleOpenModal(false);
                      }}
                    />
                  </Modal.Footer>
                </form>
              );
            }}
          </Formik>
        </Modal> */}
      </div>
    </div>
  );
}
export default CourseList;
