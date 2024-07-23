import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import $ from "jquery";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import AuthContext from "../../auth/context";

import academicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import string from "../../string";

function SubjectStaff() {
  //#region const
  const RENAME = useSelector((state) => state.web.rename);
  const collegeConfig = useSelector((state) => state.web.college);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [showSubject, setShowSubject] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [primaryClassIncharge, setPrimaryClassIncharge] = useState();
  const [primaryClassInchargeError, setPrimaryClassInchargeError] =
    useState(false);
  const [secondaryClassIncharge, setSecondaryClassIncharge] = useState();

  const { collegeId, role, setUnSavedChanges } = useContext(AuthContext);
  //#endregion

  const FormSchema = Yup.object().shape({
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
  });

  let tabIndex = 5;
  let finalTabIndex = 5;
  const formikRef = useRef();

  const handleAllocate = async () => {
    if (load) return;
    setPrimaryClassInchargeError(false);
    if (!primaryClassIncharge) {
      setPrimaryClassInchargeError(true);
      document.getElementById("primaryClassIncharge").focus();
      return;
    }
    if (secondaryClassIncharge === primaryClassIncharge) {
      setModalErrorOpen(true);
      setModalTitle("Staff Allocation");
      setModalMessage(
        "Primary Class Incharge and Secondary Class Incharge should not be same"
      );
      return;
    }
    console.log(subjectList, formikRef.current.values, "subjectList");
    setUnSavedChanges(false);
    // const allTrue = subjectList.every((obj) => obj.staffID);
    // if (!allTrue) {
    //   setSerror(true);
    //   setModalErrorOpen(true);
    //   setModalTitle("Staff Allocation");
    //   setModalMessage("Please allocate all Staff");
    //   return;
    // }
    // subjectList.forEach((obj) => {

    //     delete obj.subjectName;
    //     delete obj.subjectType;
    //     delete obj.subjectCourseID;
    //     delete obj.isMandatory;
    //     delete obj.staff;
    //     delete obj.assistingStaff;

    // });
    console.log("primaryClassIncharge---", primaryClassIncharge);
    console.log("secondaryClassIncharge---", secondaryClassIncharge);

    let subjectAssignData = [];
    if (subjectList.length > 0 && subjectList.some((obj) => !obj.disabled)) {
      subjectAssignData = subjectList
        .map((obj) => {
          if (obj.staffID) {
            const {
              subjectName,
              subjectType,
              subjectCourseID,
              isMandatory,
              staff,
              assistingStaff,
              ...rest
            } = obj;
            return rest;
          }
          return obj;
        })
        .filter((obj) => obj.staffID);

      console.log("subjectList---", subjectAssignData);
    }
    try {
      setLoad(true);
      console.log(subjectAssignData, "checking  list");
      const assignSubjectStaffRes = await academicApi.assignStaffSubject(
        formikRef.current.values.section.classID,
        subjectAssignData,
        primaryClassIncharge.employeeID,
        secondaryClassIncharge ? secondaryClassIncharge.employeeID : null
      );
      console.log("assignSubjectStaffRes---", assignSubjectStaffRes);
      setSubjectList([]);
      setPrimaryClassIncharge();
      setSecondaryClassIncharge();
      if (assignSubjectStaffRes.data.message.success) {
        toast.success(assignSubjectStaffRes.data.message.message);
        setShowSubject(false);
        formikRef.current.resetForm();
      } else {
        setModalErrorOpen(true);
        setModalTitle("Message");
        setModalMessage(assignSubjectStaffRes.data.message.message);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const getSubjectStaff = async (course, semester) => {
    formikRef.current.setFieldTouched("semester", false);

    console.log("semester---", course, semester);
    setShowSubject(false);
    setSubjectList([]);
    setEmployeeList([]);
    setSectionList([]);
    if (semester) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "subject",
            course?.courseID,
            semester?.batchID,
            semester?.semester
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSubjectList(getMasterSubjectStaffRes.data.message.data.subject);
        setEmployeeList(getMasterSubjectStaffRes.data.message.data.staff);
        setSectionList(getMasterSubjectStaffRes.data.message.data.section);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getSemesterMaster = async (course) => {
    formikRef.current.setFieldTouched("course", false);
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("subject", "");
    formikRef.current.setFieldValue("staff", "");

    console.log("text---", course);
    setSemesterList([]);
    // setSemesterList([]);
    if (course) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "batch",
            course.courseID
          );
        setSemesterList(getMasterSubjectStaffRes.data.message.data.batch);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getInitialList = async (collegeId) => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getMasterSubjectStaff(
        collegeId,
        "course"
      );
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowAllocation = async (values) => {
    if (load) return;
    console.log("values---", values);
    try {
      setLoad(true);
      const getStaffSubjectRes = await academicApi.getStaffSubject(
        values.section.classID,
        values.semester.semester
      );
      console.log("getStaffSubjectRes---", getStaffSubjectRes);
      // return;
      // setOldSubjectArr(getStaffSubjectRes.data.message.data);

      subjectList.map((item) => {
        if (getStaffSubjectRes.data.message.data.length > 0) {
          getStaffSubjectRes?.data?.message?.teacher[0]?.primaryTeacherID &&
            setPrimaryClassIncharge({
              employeeID:
                getStaffSubjectRes?.data?.message?.teacher[0]?.primaryTeacherID,
              employeeName:
                getStaffSubjectRes?.data?.message?.teacher[0]?.primaryTeacher,
            });
          getStaffSubjectRes?.data?.message?.teacher[0]?.secondaryTeacherID &&
            setSecondaryClassIncharge({
              employeeID:
                getStaffSubjectRes?.data?.message?.teacher[0]
                  ?.secondaryTeacherID,
              employeeName:
                getStaffSubjectRes?.data?.message?.teacher[0]?.secondaryTeacher,
            });
          getStaffSubjectRes.data.message.data.map((obj) => {
            if (item.subjectID === obj.subjectID) {
              item.staff = {
                employeeID: obj.employeeID,
                employeeName: obj.employeeName,
              };
              item.assistingStaff = {
                employeeID: obj.assistStaffID,
                employeeName: obj.assistStaffName,
              };
              item.staffID = obj.employeeID;
              item.assistStaffID = obj.assistStaffID;
              item.disabled = true;
            }
          });
        } else {
          item.staff = null;
          item.assistingStaff = null;
          item.staffID = null;
          item.assistStaffID = null;
          item.disabled = false;
        }

        setSubjectList([...subjectList]);
      });

      setShowSubject(true);
      setLoad(false);
      formikRef.current.setFieldTouched("course", false);
      formikRef.current.setFieldTouched("semester", false);
      formikRef.current.setFieldTouched("section", false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };
  //duplicatecheck for AssistingStaff
  const duplicatecheckAssistingStaff = async (text, index) => {
    try {
      if (subjectList[index].staffID === text.employeeID) {
        subjectList[index].assistingStaff = "";
        setModalErrorOpen(true);
        setModalTitle("Staff Allocation");
        setModalMessage("Staff and Assisting Staff should not be same");
        return;
      }
      subjectList[index].assistingStaff = text;
      subjectList[index].assistStaffID =
        subjectList[index].staffID === text.employeeID ? null : text.employeeID;
      // console.log(subjectList[index].assistStaffID, "chekcing values");
      // subjectList[index].assistStaffID =
      //   text.employeeID ? text.employeeID : "";
      setSubjectList([...subjectList]);
      setUnSavedChanges(true);
    } catch (error) {
      console.log(error);
    }
  };

  //duplicatecheck for staff
  const duplicatecheckStaff = async (text, index) => {
    try {
      // if (subjectList.some((item) => item.staff === text)) {
      //   subjectList[index].staff = "";
      //   setModalErrorOpen(true);
      //   setModalTitle("Staff Allocation");
      //   setModalMessage("Staff already allocated");
      //   return;
      // }

      if (subjectList[index].assistStaffID === text.employeeID) {
        subjectList[index].staff = "";
        setModalErrorOpen(true);
        setModalTitle("Staff Allocation");
        setModalMessage("Staff and Assisting Staff should not be same");
        return;
      }
      subjectList[index].staff = text;
      subjectList[index].staffID = text.employeeID;
      subjectList[index].assistStaffID = subjectList[index].assistStaffID
        ? subjectList[index].assistStaffID
        : null;
      setSubjectList([...subjectList]);
      setUnSavedChanges(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (
      !collegeConfig.is_university ||
      role.toUpperCase() !== string.SUPER_ADMIN_ROLE
    ) {
      getInitialList(collegeId);
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
            innerRef={formikRef}
            initialValues={{
              course: null,
              semester: null,
              section: null,
              semester: null,
            }}
            validationSchema={FormSchema}
            onSubmit={handleShowAllocation}
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
                    {collegeConfig.is_university &&
                    role.toUpperCase() == string.SUPER_ADMIN_ROLE ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        labelSize={3}
                        id="college"
                        mandatory={1}
                        style={{ width: "65%" }}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setFieldTouched("college", false);
                          setFieldValue("course", "");
                          getInitialList(text.collegeID);
                          setSemesterList([]);
                          setSectionList([]);
                          setFieldValue("semester", "");
                          setFieldValue("section", "");
                          setShowSubject(false);
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
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      options={courseList}
                      style={{ width: "65%" }}
                      onChange={(text) => {
                        setShowSubject(false);
                        setFieldValue("course", text);
                        getSemesterMaster(text);
                      }}
                    />
                    <>
                      <SelectFieldFormik
                        tabIndex={2}
                        label={RENAME?.sem}
                        id="semester"
                        mandatory={1}
                        labelSize={3}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        options={semesterList}
                        style={{ width: "30%" }}
                        onChange={(text) => {
                          console.log();
                          setFieldValue("semester", text);
                          getSubjectStaff(values.course, text);
                          setFieldValue("section", "");
                        }}
                      />
                      <>
                        <SelectFieldFormik
                          tabIndex={3}
                          label={RENAME?.section}
                          id="section"
                          mandatory={1}
                          labelSize={3}
                          getOptionLabel={(option) => option.section}
                          getOptionValue={(option) => option.classID}
                          options={sectionList}
                          style={{ width: "20%" }}
                          onChange={(text) => {
                            setShowSubject(false);
                            setFieldValue("section", text);
                          }}
                        />
                        <Button
                          tabIndex={4}
                          text={"Show"}
                          onClick={(e) => {
                            preFunction.handleErrorFocus(errors);
                          }}
                        />
                      </>
                    </>
                  </div>
                </form>
              );
            }}
          </Formik>

          {showSubject && (
            <>
              <div className="row">
                <div className="subhead-row p-0">
                  <div className="subhead">Subject Allocation Details</div>
                  <div className="col line-div"></div>
                </div>
                <div className="row no-gutters mt-2">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th>Subject</th>
                        <th width="30%">Staff</th>
                        <th width="30%">Assisting Staff</th>
                      </tr>
                    </thead>

                    <tbody>
                      {subjectList.length > 0 &&
                        subjectList.map((item, index) => {
                          tabIndex = tabIndex + 2;
                          finalTabIndex = tabIndex + 1;
                          return (
                            <tr>
                              <td>{index + 1}</td>
                              <td>{item.subjectName}</td>
                              {item.disabled ? (
                                <>
                                  <td>
                                    {item.staff && item.staff.employeeName}
                                  </td>
                                  <td>
                                    {item.assistingStaff &&
                                      item.assistingStaff.employeeName}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td>
                                    <ReactSelectField
                                      // id="staff"
                                      tabIndex={tabIndex}
                                      mandatory={1}
                                      getOptionLabel={(option) =>
                                        option.employeeID +
                                        " - " +
                                        option.employeeName
                                      }
                                      getOptionValue={(option) =>
                                        option.employeeID
                                      }
                                      value={item.staff}
                                      options={employeeList}
                                      searchIcon={false}
                                      onChange={(text) => {
                                        duplicatecheckStaff(text, index);
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <ReactSelectField
                                      // id="staff"
                                      tabIndex={tabIndex + 1}
                                      mandatory={1}
                                      getOptionLabel={(option) =>
                                        option.employeeID +
                                        " - " +
                                        option.employeeName
                                      }
                                      getOptionValue={(option) =>
                                        option.employeeID
                                      }
                                      value={item.assistingStaff}
                                      options={employeeList}
                                      searchIcon={false}
                                      onChange={(text) =>
                                        duplicatecheckAssistingStaff(
                                          text,
                                          index
                                        )
                                      }
                                    />
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                {showSubject && subjectList.length == 0 ? (
                  <div colSpan="10" className="text-center ">
                    No Subject found
                  </div>
                ) : null}
                <div className="subhead-row p-0">
                  <div className="subhead">Class Incharge Details</div>
                  <div className="col line-div"></div>
                </div>
                <div className="col-lg-12">
                  <ReactSelectField
                    label={"Class Incharge"}
                    id="primaryClassIncharge"
                    labelSize={3}
                    tabIndex={50}
                    mandatory={1}
                    getOptionLabel={(option) =>
                      option.employeeID + " - " + option.employeeName
                    }
                    getOptionValue={(option) => option.employeeID}
                    options={employeeList}
                    searchIcon={false}
                    value={primaryClassIncharge}
                    onChange={(text) => {
                      setPrimaryClassIncharge(text);
                      setPrimaryClassInchargeError(false);
                      setUnSavedChanges(true);
                    }}
                    style={{ width: "50%" }}
                    error={
                      primaryClassInchargeError
                        ? "Please select Class Incharge"
                        : ""
                    }
                    touched={primaryClassInchargeError}
                  />
                  <ReactSelectField
                    label={"Additional Class Incharge"}
                    id="secondaryClassIncharge"
                    labelSize={3}
                    tabIndex={51}
                    getOptionLabel={(option) =>
                      option.employeeID + " - " + option.employeeName
                    }
                    getOptionValue={(option) => option.employeeID}
                    options={employeeList}
                    searchIcon={false}
                    clear={true}
                    value={secondaryClassIncharge}
                    onChange={(text) => {
                      setUnSavedChanges(true);
                      setSecondaryClassIncharge(text);
                    }}
                    style={{ width: "50%" }}
                  />
                </div>
              </div>
              {/* {subjectList.length > 0 &&
                subjectList.some((obj) => !obj.disabled) && ( */}
              <Button
                tabIndex={finalTabIndex + 1}
                id="save"
                text="F4 - Save"
                onClick={() => {
                  handleAllocate();
                }}
              />
              {/* )} */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubjectStaff;
