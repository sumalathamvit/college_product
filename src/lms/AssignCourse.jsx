import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import StudentApi from "../api/StudentApi";
import AcademicApi from "../api/AcademicApi";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ReactSelectField from "../component/FormField/ReactSelectField";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextField from "../component/FormField/TextField";
import ScreenTitle from "../component/common/ScreenTitle";
import ModalComponent from "../component/ModalComponent";
import { sectionList } from "../component/common/CommonArray";
import AuthContext from "../auth/context";
import { useSelector } from "react-redux";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import DateFieldFormik from "../component/FormField/DateFieldFormik";
import moment from "moment";
import LMSApi from "../api/LMSApi";
import EmployeeApi from "../api/EmployeeApi";
import HeadingIcon from "@mui/icons-material/School";

function AssignCourse() {
  // #region const
  const RENAME = useSelector((state) => state.web.rename);

  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [boardList, setBoardList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [sectionArr, setSectionArr] = useState([]);
  const [presentAll, setPresentAll] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [empCode, setEmpCode] = useState("");
  const formikRef = useRef();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [employeeemailid, setEmployeEmailId] = useState("");
  const { setUnSavedChanges, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  // #endregion

  const updateSchema = Yup.object().shape({
    batchname: Yup.string().required("Please enter Batch Name"),
    coursename: Yup.object().required("Please select Course"),
    courseduration: Yup.string().required("Please enter Duration"),
    startDate: Yup.string().required("Please enter Start Date"),
    course: Yup.object().required("Please select  " + RENAME?.course),
    batch: Yup.object().required(
      collegeConfig.institution_type !== 1
        ? "Please select  " + RENAME?.batch
        : "Please select " + RENAME?.sem
    ),
    section: Yup.object().required("Please select " + RENAME?.section),
    empCode: Yup.object().required("Please select Mentor Name"),
  });

  const handleUnSavedChanges = (changed) => {
    if (changed === 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };
  const getMasterList = async (college_id) => {
    try {
      const masterList = await LMSApi.getLMSCourseList();

      console.log("masterList", masterList.data.data);
      //   return;

      setCourseList(masterList.data.data);

      //   if (masterList?.data?.message?.data?.course_data.length === 1) {
      //     formikRef?.current?.setFieldValue(
      //       "course",
      //       masterList?.data?.message?.data?.course_data[0]
      //     );
      //     handleCourse(
      //       formikRef.current.values,
      //       masterList?.data?.message?.data?.course_data[0]
      //     );
      //   }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };
  const handleBatchChange = async (values, batch) => {
    console.log("values", values, batch);
    formikRef.current.setFieldTouched("batch", false);
    try {
      if (values) {
        const batchRes = await StudentApi.getMaster(
          8,
          collegeConfig.is_university ? values.collegeID : collegeId,
          values.course.id,
          batch.semester
        );
        console.log("batchRes", batchRes);
        if (!batchRes.data.message.success) {
          setModalMessage(batchRes.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          return;
        }
        //add all in section array
        batchRes.data.message.data.class_data.splice(0, 0, {
          classID: null,
          section: "All",
        });
        setSectionArr(batchRes.data.message.data.class_data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleCourseChange = async (values) => {
    try {
      formikRef.current.setFieldValue("batch", null);
      formikRef.current.setFieldTouched("course", false);
      formikRef.current.setFieldTouched("batch", false);
      if (values) {
        const batchRes = await AcademicApi.getMasterSubjectStaff(
          collegeConfig.is_university ? values.collegeID : collegeId,
          "batch",
          values.id
        );
        console.log("batchRes", batchRes);
        if (!batchRes.data.message.success) {
          setModalMessage(batchRes.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          return;
        }
        setBatchList(batchRes.data.message.data.batch);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getMasterListBoardCourse = async (college_id) => {
    try {
      let masterList;
      if (collegeConfig.institution_type === 1) {
        masterList = await StudentApi.getMaster(8, college_id);
      } else {
        masterList = await StudentApi.getMaster(5, college_id);
      }
      console.log("overallList", masterList);
      if (!masterList?.data?.message?.success) {
        setModalMessage(masterList?.data?.message?.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setBoardList(masterList?.data?.message?.data?.course_data);

      if (masterList?.data?.message?.data?.course_data.length === 1) {
        formikRef?.current?.setFieldValue(
          "course",
          masterList?.data?.message?.data?.course_data[0]
        );
        setSectionArr([
          {
            classID: null,
            section: "All",
          },
        ]);
        formikRef?.current?.setFieldValue("section", {
          classID: null,
          section: "All",
        });
        setShowRes(false);
        handleCourseChange(masterList?.data?.message?.data?.course_data[0]);
        // getMasterListBoardCourse(
        //   masterList?.data?.message?.data?.course_data[0].id
        // );
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };
  const checkAll = () => {
    if (!presentAll) {
      data.forEach((item) => {
        item.checked = true;
      });
      setPresentAll(true);
    } else {
      data.forEach((item) => {
        item.checked = false;
      });
      setPresentAll(false);
    }
    setData([...data]);
    setUnSavedChanges(true);
  };
  const handleShow = async (values) => {
    try {
      console.log("Values-----", values.batch.semester, values.section.classID);
      console.log("Values-----", values);

      setLoad(true);
      const studentDetailRes = await LMSApi.viewStudentDetailSchool(
        values.batch.semester,
        values.section.classID
      );
      console.log(
        "studentDetailRes----",
        studentDetailRes.data.message.data.student_data
      );

      // if (!studentDetailRes.data.message.success) {
      //   setModalMessage(studentDetailRes.data.message.message);
      //   setModalErrorOpen(true);
      //   setModalTitle("Message");
      //   setLoad(false);
      //   return;
      // }

      // console.log(array, "array");

      let array = studentDetailRes.data.message.data.student_data.map(
        (item) => {
          return {
            checked: true,
            ...item,
          };
        }
      );
      setShowRes(true);
      console.log(array, "array");
      setPresentAll(true);
      setData(array);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleSave = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      console.log(formikRef.current.values.coursename.title, "check");
      // console.log(employeeemailid, "employeemailid");

      // console.log(values.startDate, values.courseduration, "values");
      let endDate = new Date(values.startDate);

      endDate.setDate(endDate.getDate() + parseInt(values.courseduration) - 1);
      let year = endDate.getFullYear();
      let month = (endDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
      let day = endDate.getDate().toString().padStart(2, "0");

      // Format the date as YYYY-MM-DD
      let formattedDate = `${year}-${month}-${day}`;

      // console.log("endDate", formattedDate);
      // return;
      let checkedStudents = data.filter((item) => item.checked);
      // console.log("checkedStudents", checkedStudents);
      // return;
      let newstudentnamemail = checkedStudents.map((item) => {
        return {
          email: item.email,
          first_name: item.name,
        };
      });
      console.log(newstudentnamemail, "Student name and email");
      const evaluator = await LMSApi.getEvaluator(employeeemailid);
      console.log("evaluator", evaluator);
      if (evaluator.data.data.length === 0) {
        const newevaluator = await LMSApi.createNewEvaluator(employeeemailid);
        console.log("New evaluator", newevaluator);
        // return;
      }
      // console.log(
      //   newstudentnamemail,
      //   formikRef.current.values.batchname,
      //   values.startDate,
      //   formattedDate,
      //   formikRef.current.values.coursename.name,
      //   employeeemailid,
      //   "Overall Values"
      // );
      const studentcourseassign = await LMSApi.viewStudentCourseAssign(
        newstudentnamemail,
        formikRef.current.values.batchname,
        values.startDate,
        formattedDate,
        [
          {
            course: formikRef.current.values.coursename.name,
            evaluator: employeeemailid,
          },
        ]
      );
      console.log(studentcourseassign, "studentcourseassign");

      if (!studentcourseassign.data.message.success) {
        setModalMessage(studentcourseassign.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success("Course Assigned successfully");
      setLoad(false);
      formikRef.current.resetForm();
      setShowRes(false);
      setData([]);
      setUnSavedChanges(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  // const getAllList = async () => {
  //   try {
  //     const masterRes = await StudentApi.getMaster(5);
  //     console.log("Master----", masterRes);
  //     if (!masterRes.data.message.success) {
  //       setModalMessage(masterRes.data.message.message);
  //       setModalErrorOpen(true);
  //       setModalTitle("Message");
  //       setLoad(false);
  //       return;
  //     }
  //     setCourseList(masterRes.data.message.data.course_data);
  //   } catch (error) {
  //     console.log("error", error);
  //   }
  // };

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

  const handleGetEmployeeDetails = async (employeeDetail) => {
    try {
      setLoad(true);
      console.log("employeeDetail---", employeeDetail);
      setEmpCode(employeeDetail);
      setEmployeEmailId(employeeDetail.personal_email);
      // setEmployeeInfo(employeeDetail);
      // console.log("employeeDetail---", employeeDetail);
      // if (allowanceList.length === 0)
      // getAllList();
      // salaryEmployee(employeeDetail.name);
      // allowanceFormikRef?.current?.resetForm();
      // deductionFormikRef?.current?.resetForm();
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };
  const handleCourse = async (values, course) => {
    formikRef.current.setFieldValue("batch", null);
    if (values) {
      let batchRes;
      if (collegeConfig.institution_type === 1) {
        batchRes = await StudentApi.getMaster(
          8,
          collegeConfig.is_university ? values.collegeID : collegeId,
          course.id
        );
        setBatchList(batchRes.data.message.data.semester_data);
      } else {
        batchRes = await StudentApi.getMaster(
          5,
          collegeConfig.is_university ? values.collegeID : collegeId,
          course.id
        );
        setBatchList(batchRes.data.message.data.batch_data);
      }
      console.log("batchRes----", batchRes);
    }
  };

  useEffect(() => {
    getMasterList();
    if (!collegeConfig?.is_university) {
      getMasterListBoardCourse(collegeId);
    }
  }, [collegeConfig?.is_university]);

  // useEffect(() => {
  //   if (!collegeConfig?.is_university) {
  //     getMasterListBoardCourse(collegeId);
  //   }
  // }, [collegeConfig?.is_university]);
  // useEffect(() => {
  //   getAllList();
  // }, []);

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
        <div className="row no-gutters">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              coursename: null,
              college: null,
              course: null,
              batch: null,
              section: null,
              empCode: null,
              batchname: "",
              courseduration: "",
              startDate: moment().format("YYYY-MM-DD"),
            }}
            validationSchema={updateSchema}
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
                  <div className="col-lg-12">
                    {collegeConfig?.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        labelSize={3}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig?.collegeList}
                        getOptionLabel={(option) => option?.collegeName}
                        getOptionValue={(option) => option?.collegeID}
                        style={{ width: "80%" }}
                        searchIcon={false}
                        clear={false}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setFieldValue("course", null);
                          setFieldValue("batch", null);
                          getMasterList(text?.collegeID);
                        }}
                      />
                    ) : null}
                    <SelectFieldFormik
                      autoFocus={collegeConfig?.is_university ? false : true}
                      tabIndex={2}
                      labelSize={3}
                      label="Course Name"
                      id="coursename"
                      mandatory={1}
                      options={courseList}
                      getOptionLabel={(option) => option.title}
                      getOptionValue={(option) => option.name}
                      style={{ width: "70%" }}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setFieldValue("coursename", text);
                        // setFieldValue("course", null);
                        // setFieldValue("batch", null);
                        getMasterList();
                        getMasterListBoardCourse(collegeId);
                      }}
                    />
                    <TextFieldFormik
                      tabIndex={3}
                      id="courseduration"
                      label="Course Duration(in Days)"
                      placeholder={"Duration"}
                      maxlength={4}
                      labelSize={3}
                      onChange={(e) => {
                        if (preFunction.amountValidation(e.target.value)) {
                          if (e.target.value <= 0) {
                            setFieldValue("courseduration", "");
                            // return;
                          } else {
                            setUnSavedChanges(true);
                            setFieldValue("courseduration", e.target.value);
                          }

                          // setFieldTouched("courseduration", false);
                          // setFieldValue("courseduration", e.target.value);
                        }
                      }}
                      style={{ width: "25%" }}
                      mandatory={1}
                    />
                    <DateFieldFormik
                      label="Start Date"
                      labelSize={3}
                      id="startDate"
                      tabIndex={4}
                      mandatory={1}
                      style={{ width: "25%" }}
                      onChange={(e) => {
                        setFieldValue("startDate", e.target.value);
                      }}
                    />

                    {boardList.length > 1 ? (
                      <SelectFieldFormik
                        label={RENAME?.course}
                        labelSize={3}
                        id="course"
                        tabIndex={5}
                        options={boardList}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.id}
                        matchFrom="start"
                        style={{ width: "80%" }}
                        mandatory={1}
                        maxlength={40}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setSectionArr([
                            {
                              classID: null,
                              section: "All",
                            },
                          ]);
                          setFieldValue("section", {
                            classID: null,
                            section: "All",
                          });
                          setShowRes(false);
                          handleCourseChange(text);
                          // getMasterListBoardCourse(text.id);
                        }}
                      />
                    ) : null}
                    <>
                      <SelectFieldFormik
                        label={
                          collegeConfig.institution_type !== 1
                            ? RENAME?.batch
                            : RENAME?.sem
                        }
                        labelSize={3}
                        tabIndex={6}
                        id="batch"
                        name="batch"
                        placeholder={RENAME?.batch ? "Year" : "Batch"}
                        options={batchList}
                        maxlength={10}
                        getOptionLabel={(option) => option.batch}
                        getOptionValue={(option) => option.batchID}
                        matchFrom="start"
                        mandatory={1}
                        style={{ width: "30%" }}
                        onChange={(text) => {
                          setFieldValue("batch", text);
                          setFieldValue("section", {
                            classID: null,
                            section: "All",
                          });
                          setSectionArr([]);
                          setShowRes(false);
                          handleBatchChange(values, text);
                        }}
                      />

                      <SelectFieldFormik
                        label={RENAME?.section}
                        labelSize={3}
                        tabIndex={7}
                        mandatory={1}
                        maxlength={2}
                        id="section"
                        options={sectionArr}
                        getOptionLabel={(option) => option.section}
                        getOptionValue={(option) => option.classID}
                        style={{ width: "30%" }}
                        matchFrom="start"
                        onChange={(text) => {
                          setFieldValue("section", text);
                          setShowRes(false);
                        }}
                      />
                      <TextFieldFormik
                        tabIndex={8}
                        id="batchname"
                        label="Batch Name"
                        labelSize={3}
                        onChange={(e) => {
                          setUnSavedChanges(true);
                          setFieldTouched("batchname", false);
                          setFieldValue("batchname", e.target.value);
                        }}
                        style={{ width: "70%" }}
                        mandatory={1}
                      />
                      <SelectFieldFormik
                        label="Mentor Name"
                        id="empCode"
                        mandatory={1}
                        labelSize={3}
                        tabIndex={9}
                        value={empCode}
                        clear={false}
                        searchIcon={true}
                        style={{ width: "70%" }}
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
                    </>
                    {/* ) : null} */}
                  </div>
                  <div className="text-center mt-2 pt-1">
                    <Button
                      text="Show"
                      frmButton={false}
                      tabIndex={10}
                      className={"btn ms-2 me-2"}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                        document.getElementById("section0")?.focus();
                        // setFieldValue("updateType", 2);
                      }}
                    />
                  </div>
                  {/* {data.length > 0 ? ( */}
                  {showRes && (
                    <>
                      <div className="row no-gutters">
                        <div className="col-lg-10"></div>
                      </div>
                      <div className="row no-gutters">
                        <div className="subhead-row">
                          <div className="subhead">Student Details</div>
                          <div className="col line-div"></div>
                        </div>

                        <div className="row">
                          {/* <div className="col-2"></div>
                          <div className="col-8"> */}
                          <div className="table-responsive mt-2 p-0 text-center">
                            <table className="table table-bordered table-hover">
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="15%">Student No.</th>
                                  <th>Student Name</th>
                                  <th
                                    width="5%"
                                    style={{ textAlign: "center" }}
                                  >
                                    {/* <input
                                    type="checkbox"
                                    name="selectAll"
                                    id="selectAll"
                                    onClick={(e) => checkAll()}
                                  /> */}
                                    <input
                                      type="checkbox"
                                      id="selectAll"
                                      className="ms-1"
                                      value={presentAll}
                                      checked={presentAll}
                                      onClick={(e) => {
                                        checkAll();
                                      }}
                                    />
                                  </th>
                                </tr>
                              </thead>

                              {data.length == 0 ? (
                                <tbody>
                                  <tr>
                                    <td colSpan={10} align="center">
                                      No records found
                                    </td>
                                  </tr>
                                </tbody>
                              ) : (
                                <tbody>
                                  {data.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.enrollNo}</td>
                                        <td>{item.name}</td>
                                        {/* <td>
                                        {item.DOJ
                                          ? moment(item.DOJ).format(
                                              "DD-MM-YYYY"
                                            )
                                          : joiningDate
                                          ? moment(joiningDate).format(
                                              "DD-MM-yyyy"
                                            )
                                          : ""}
                                      </td> */}
                                        <td style={{ textAlign: "center" }}>
                                          <input
                                            type="checkbox"
                                            name="settle"
                                            id="settle"
                                            checked={item.checked}
                                            onChange={(e) => {
                                              data[index].checked =
                                                e.target.checked;
                                              setData([...data]);

                                              console.log("e", data[index]);
                                            }}
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              )}
                            </table>
                          </div>
                        </div>
                      </div>
                      {/* </div> */}
                      <Button
                        isTable={true}
                        text="F4 - Save"
                        id="save"
                        type="button"
                        onClick={() => {
                          handleSave(values);
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

export default AssignCourse;
