import React, { useEffect, useRef, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import moment from "moment";
import * as Yup from "yup";

import StudentApi from "../api/StudentApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import ModalComponent from "../component/ModalComponent";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../component/FormField/DateFieldFormik";
import DisplayText from "../component/FormField/DisplayText";
import AuthContext from "../auth/context";

function ActivityGroup() {
  const formikRef = useRef();
  const formikReference = useRef();
  const studentFormikRef = useRef();
  const formikNewStudentRef = useRef();

  const [load, setLoad] = useState(false);
  const [feesAllocated, setFeesAllocated] = useState(false);
  const [isMonthlyFees, setIsMonthlyFees] = useState(false);
  const [newActivityModal, setNewActivityModal] = useState(false);
  const [addNewStudentModal, setAddNewStudent] = useState(false);
  const [showRes, setShowRes] = useState(false);

  const [activityGroupList, setActivityGroupList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [studentArr, setStudentArr] = useState([]);
  const [deletedStudentArr, setDeletedStudentArr] = useState([]);
  const [studentArrLength, setStudentArrLength] = useState(0);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { collegeId, setUnSavedChanges } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  const formSchema = Yup.object().shape({
    groupName: Yup.string().required("Please enter Group Name"),
    startgroupMonthYear: Yup.string().required("Please select Month / Year"),
    endgroupMonthYear: Yup.string().required("Please select Month / Year"),
  });

  const getStudentFormSchema = Yup.object().shape({
    group: Yup.object().required("Please select Activity Group"),
  });

  const StudentSchema = Yup.object().shape({
    studentId: Yup.object().required("Please select Student"),
  });

  const formNewStudentSchema = Yup.object().shape({
    studentId: Yup.object().required("Please select Student"),
    activityDate: isMonthlyFees
      ? Yup.string().required("Please select Activity Start Date")
      : Yup.mixed().notRequired(),
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

  // Function to add new activity group
  const handleAddActivityGroup = async (values) => {
    if (load) return;
    console.log("values--", values);
    try {
      setLoad(true);

      const addActivityGroupRes = await StudentApi.addActivityGroup(
        collegeConfig.is_university ? values.collegeId.collegeID : collegeId,
        null,
        values.groupName,
        moment(values.startgroupMonthYear)
          .startOf("month")
          .format("YYYY-MM-DD"),
        moment(values.endgroupMonthYear).startOf("month").format("YYYY-MM-DD")
      );
      console.log("addActivityGroupRes---", addActivityGroupRes);
      if (!addActivityGroupRes.data.message.success) {
        setModalTitle("Message");
        setModalMessage(addActivityGroupRes.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setNewActivityModal(false);
      toast.success(addActivityGroupRes.data.message.message);
      if (collegeConfig.is_university) {
        getGroupList(formikReference?.current?.values?.college.collegeID);
      } else {
        getGroupList(collegeId);
      }
      setLoad(false);
    } catch (error) {
      console.log("exception--", error);
    }
  };

  // Function to assign student to activity group
  const assignStudentGroup = async (values) => {
    if (load) return;
    console.log("values--", values);
    console.log("studentArr--", studentArr);
    console.log("deletedStudentArr--", deletedStudentArr);
    try {
      setLoad(true);

      const studentValues = studentFormikRef?.current?.values;
      // check the condition if the student is already added
      for (let i = 0; i < studentArr.length; i++) {
        if (studentArr[i].studentID === studentValues?.studentId?.id) {
          setModalTitle("Message");
          setModalMessage("Student already added");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
      }
      if (studentValues?.studentId) {
        console.log("StudentValues---", studentValues);
        handleAddStudent(studentValues);
      }
      // check the condtion if the studentarr is not incremented and the deletedStudentArr is empty then show the message
      if (
        studentArr.length === studentArrLength &&
        deletedStudentArr.length === 0
      ) {
        setModalTitle("Message");
        setModalMessage("No Changes made");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      let studentDetailArray = studentArr.map((obj) => {
        console.log("obj--", obj);
        return {
          activityGroupDetailID: obj.activityGroupDetailID,
          studentID: obj.studentID,
          semester: obj.semester,
          studyYear: obj.studyYear,
          isActive: obj.isActive,
        };
      });
      studentDetailArray = studentDetailArray.concat(deletedStudentArr);
      console.log("studentDetailArray--->", studentDetailArray);

      const assignGroupRes = await StudentApi.assignStudentToActivityGroup(
        values.group.activityGroupID,
        studentDetailArray
      );
      console.log("assignGroupRes---", assignGroupRes);
      if (!assignGroupRes.data.message.success) {
        setModalTitle("Message");
        setModalMessage(assignGroupRes.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      toast.success(assignGroupRes.data.message.message);
      setStudentArr([]);
      setDeletedStudentArr([]);
      setStudentArrLength(0);
      setShowRes(false);
      handleUnSavedChanges(0);
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  // Function to add student to the list
  const handleAddStudent = async (values) => {
    console.log("values---", values.studentId);

    for (let i = 0; i < studentArr.length; i++) {
      if (studentArr[i].studentID === values.studentId.id) {
        setModalTitle("Message");
        setModalMessage("Student already added");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
    }

    let obj = {
      activityGroupDetailID: null,
      studentID: values.studentId.id,
      semester: values.studentId.semester,
      studyYear: values.studentId.studyYear,
      isActive: 1,
      className: values.studentId.className,
      studentName: values.studentId.name,
      enrollNo: values.studentId.enrollNo,
    };
    studentArr.push(obj);
    handleUnSavedChanges(1);

    studentFormikRef.current.resetForm();
    document.getElementById("studentId")?.focus();
  };

  // Function to delete student from the list
  const handleDeleteStudent = (item) => {
    console.log("item", item);

    const deleteStudent = studentArr.filter((m) => m !== item);
    setStudentArr(deleteStudent);

    if (item.activityGroupDetailID) {
      let obj = {
        activityGroupDetailID: item.activityGroupDetailID,
        studentID: item.studentID,
        semester: item.semester,
        studyYear: item.studyYear,
        isActive: 0,
      };
      setDeletedStudentArr([...deletedStudentArr, obj]);
    }
    handleUnSavedChanges(1);
  };

  // Function to search student
  const handleSearchStudent = async (text) => {
    setStudentList([]);

    if (text.length > 2) {
      try {
        const searchStudentRes = await StudentApi.searchStudent(
          text,
          formikReference?.current?.values?.college
            ? formikReference?.current?.values?.college?.collegeID
            : collegeId
        );
        console.log("searchStudentRes--------", searchStudentRes);
        setStudentList(searchStudentRes.data.message.student);
      } catch (error) {
        console.log("error--", error);
      }
    }
  };

  // Function to get all assigned students
  const getAllAssignedStudents = async (values) => {
    if (load) return;
    console.log("values--", values);

    try {
      setLoad(true);
      const getAllAssignedStudentsRes = await StudentApi.getAllAssignedStudents(
        values.group.activityGroupID
      );
      console.log("getAllAssignedStudentsRes---", getAllAssignedStudentsRes);
      setStudentArr(getAllAssignedStudentsRes.data.message.data.students);
      setStudentArrLength(
        getAllAssignedStudentsRes.data.message.data.students.length
      );
      setShowRes(true);
      // setFeesAllocated(true);
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  // Function to get all activity group list
  const getGroupList = async (collegeID) => {
    try {
      setLoad(true);
      const getAllActivityGroupRes = await StudentApi.getAllActivityGroup(
        collegeID
      );
      console.log("getAllActivityGroupRes---", getAllActivityGroupRes);
      setActivityGroupList(
        getAllActivityGroupRes.data.message.data.activity_group
      );

      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  // handle Fees Allocated
  const handleFeesAllocated = async (values) => {
    console.log("values123--", values);
    setShowRes(false);
    if (values.amount == null) {
      console.log("values.amount--", "true");
      setFeesAllocated(true);
    } else {
      setFeesAllocated(false);
    }
    if (values.isMonthlyFees === 1) {
      console.log("values.isMonthlyFees--", "true");
      setIsMonthlyFees(true);
    } else {
      console.log("values.isMonthlyFees--", "false");
      setIsMonthlyFees(false);
    }
  };

  // Function to add single student to the activity group with Fees Allocation
  const handleAddStudentFeeAllocation = async (values) => {
    if (load) return;
    console.log("values--", values);
    try {
      setLoad(true);

      // check the condition if the student is already added
      for (let i = 0; i < studentArr.length; i++) {
        if (studentArr[i].studentID === values?.studentId?.id) {
          setModalTitle("Message");
          setModalMessage("Student already added in the Group");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
      }
      const addStudentFeeAllocationRes =
        await StudentApi.addStudentToActivityGroup(
          formikReference?.current?.values?.group?.activityGroupID,
          formikReference?.current?.values?.group?.particularID,
          formikReference?.current?.values?.group?.amount,
          formikReference?.current?.values?.group?.isMonthlyFees,
          values.activityDate
            ? moment(values.activityDate).format("YYYY-MM-DD")
            : null,
          values.studentId.id,
          values.studentId.semester,
          values.studentId.studyYear,
          values.studentId.batchID
        );
      console.log("addStudentFeeAllocationRes---", addStudentFeeAllocationRes);
      if (!addStudentFeeAllocationRes.data.message.success) {
        setModalTitle("Message");
        setModalMessage(addStudentFeeAllocationRes.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      toast.success(addStudentFeeAllocationRes.data.message.message);
      setAddNewStudent(false);
      getAllAssignedStudents(formikReference?.current?.values);
      handleUnSavedChanges(0);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getGroupList(collegeId);
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
        <ScreenTitle titleClass={"page-heading-position-report"} />

        <div style={{ textAlign: "right" }}>
          <Button
            isTable={true}
            frmButton={false}
            className={"btn-green"}
            onClick={() => setNewActivityModal(true)}
            text={"New Activity Group"}
            type="button"
          />
        </div>
        <Formik
          enableReinitialize={true}
          innerRef={formikReference}
          initialValues={{
            college: "",
            group: "",
          }}
          validationSchema={getStudentFormSchema}
          onSubmit={getAllAssignedStudents}
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
                <div className="col-lg-8">
                  {collegeConfig.is_university ? (
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={0}
                      label="College"
                      id="college"
                      mandatory={1}
                      options={collegeConfig.collegeList}
                      getOptionLabel={(option) => option.collegeName}
                      getOptionValue={(option) => option.collegeID}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setFieldValue("college", text);
                        handleUnSavedChanges(1);
                        getGroupList(text.collegeID);
                        studentFormikRef?.current?.resetForm();
                        setFieldValue("group", "");
                        setShowRes(false);
                      }}
                    />
                  ) : null}
                  <SelectFieldFormik
                    autoFocus={!collegeConfig.is_university}
                    label="Activity Group"
                    tabIndex={1}
                    id="group"
                    mandatory={1}
                    style={{ width: "80%" }}
                    options={activityGroupList}
                    getOptionLabel={(option) => option.activityGroupName}
                    getOptionValue={(option) => option.activityGroupID}
                    onChange={(text) => {
                      setFieldValue("group", text);
                      setShowRes(false);
                      handleFeesAllocated(text);
                    }}
                  />
                  {values?.group && showRes && (
                    <>
                      <DisplayText
                        label={"Activity start on"}
                        value={
                          moment(
                            formikReference?.current?.values?.group?.fromMonth
                          )
                            .format("MMMM-YYYY")
                            .split(" ")[0]
                        }
                      />
                      <DisplayText
                        label={"Activity end on"}
                        value={
                          moment(
                            formikReference?.current?.values?.group?.toMonth
                          )
                            .format("MMMM-YYYY")
                            .split(" ")[0]
                        }
                      />
                    </>
                  )}
                </div>
                {!showRes && (
                  <Button
                    text={"Show"}
                    tabIndex={2}
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                  />
                )}
              </form>
            );
          }}
        </Formik>
        {showRes && (
          <div className="col-lg-12 p-0">
            <div style={{ textAlign: "right" }}>
              {!feesAllocated && (
                <Button
                  isTable={true}
                  frmButton={false}
                  className={"btn-green"}
                  onClick={() => setAddNewStudent(true)}
                  text={"Add Student"}
                  type="button"
                />
              )}
            </div>
            <div className="subhead-row p-0">
              <div className="subhead">Student List</div>
              <div className="col line-div"></div>
            </div>
            <Formik
              enableReinitialize={true}
              innerRef={studentFormikRef}
              initialValues={{
                studentId: "",
              }}
              validationSchema={StudentSchema}
              onSubmit={handleAddStudent}
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
                    <table className="table table-bordered mt-2">
                      <thead>
                        <tr>
                          <th width="2%">No.</th>
                          <th>Student No. & Student Name</th>
                          <th width="15%">{RENAME?.sem}</th>
                          {showRes && feesAllocated && <th width="5%"></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {studentArr.map((item, index) => {
                          if (item.isActive === 1) {
                            return (
                              <tr>
                                <td>{index + 1}</td>
                                <td>
                                  {item.enrollNo + " - " + item.studentName}
                                </td>
                                <td>{item.className}</td>
                                {showRes && feesAllocated && (
                                  <td>
                                    <Button
                                      isTable={true}
                                      type="button"
                                      className="plus-button"
                                      text="-"
                                      onClick={() => handleDeleteStudent(item)}
                                    />
                                  </td>
                                )}
                              </tr>
                            );
                          }
                        })}
                        {showRes && feesAllocated && (
                          <tr>
                            <td></td>
                            <td>
                              <SelectFieldFormik
                                autoFocus={showRes ? true : false}
                                placeholder={"Student No. / Name"}
                                id="studentId"
                                mandatory={1}
                                clear={true}
                                isTable={true}
                                tabIndex={3}
                                searchIcon={true}
                                getOptionLabel={(option) => option.name}
                                getOptionValue={(option) => option.id}
                                options={studentList}
                                style={{ width: "80%" }}
                                onInputChange={(text) => {
                                  handleSearchStudent(text);
                                }}
                                onChange={(text) => {
                                  setFieldValue("studentId", text);
                                  handleUnSavedChanges(1);
                                  console.log("text--", text);
                                }}
                              />
                            </td>
                            <td></td>
                            <td>
                              <Button
                                isTable={true}
                                text="+"
                                tabIndex={4}
                                type="submit"
                                className="plus-button"
                                onClick={(e) =>
                                  preFunction.handleErrorFocus(errors)
                                }
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </form>
                );
              }}
            </Formik>
            {showRes && feesAllocated && (
              <Button
                text={"F4 - Save"}
                id="save"
                tabIndex={4}
                type="button"
                onClick={(e) => {
                  assignStudentGroup(formikReference?.current?.values);
                }}
              />
            )}
          </div>
        )}

        <Modal
          show={newActivityModal}
          onEscapeKeyDown={() => setNewActivityModal(false)}
          size="lg"
          centered
        >
          <Modal.Header>
            <Modal.Title>New Activity Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formik
              enableReinitialize={true}
              innerRef={formikRef}
              initialValues={{
                collegeId: "",
                groupName: "",
                activityType: "",
                startgroupMonthYear: "",
                endgroupMonthYear: "",
                monthlyFee: "",
              }}
              validationSchema={formSchema}
              onSubmit={handleAddActivityGroup}
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
                          tabIndex={40}
                          label="College"
                          id="collegeId"
                          mandatory={1}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            setFieldValue("collegeId", text);
                            handleUnSavedChanges(1);
                          }}
                        />
                      ) : null}
                      <TextFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        label="Group Name"
                        tabIndex={41}
                        id="groupName"
                        mandatory={1}
                        maxlength={30}
                        onChange={handleChange}
                      />
                      <DateFieldFormik
                        type="month"
                        tabIndex={42}
                        label="Activity Start on"
                        id="startgroupMonthYear"
                        style={{ width: "65%" }}
                        mandatory={1}
                        onChange={(e) => {
                          setFieldValue("startgroupMonthYear", e.target.value);
                          setShowRes(false);
                        }}
                        minDate={moment()}
                        maxDate={values.endgroupMonthYear}
                      />
                      <DateFieldFormik
                        type="month"
                        tabIndex={43}
                        label="Activity End on"
                        id="endgroupMonthYear"
                        style={{ width: "65%" }}
                        mandatory={1}
                        onChange={(e) => {
                          setFieldValue("endgroupMonthYear", e.target.value);
                          setShowRes(false);
                        }}
                        minDate={moment()}
                        maxDate={moment().add(10, "months")}
                      />
                    </div>
                    <div className="text-center mt-3">
                      <Button
                        className={"btn me-4"}
                        frmButton={false}
                        tabIndex={44}
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                        text="Save"
                      />
                      <Button
                        text="Close"
                        type="button"
                        frmButton={false}
                        onClick={(e) => {
                          setNewActivityModal(false);
                        }}
                      />
                    </div>
                  </form>
                );
              }}
            </Formik>
          </Modal.Body>
        </Modal>
      </div>
      <Modal
        show={addNewStudentModal}
        onEscapeKeyDown={() => setAddNewStudent(false)}
        size="lg"
        centered
      >
        <Modal.Header>
          <Modal.Title>Add Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            enableReinitialize={true}
            innerRef={formikNewStudentRef}
            initialValues={{
              studentId: "",
              activityDate: "",
            }}
            validationSchema={formNewStudentSchema}
            onSubmit={handleAddStudentFeeAllocation}
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
                    <SelectFieldFormik
                      autoFocus={addNewStudentModal ? true : false}
                      label={"Student No. / Name"}
                      id="studentId"
                      mandatory={1}
                      clear={true}
                      // isTable={true}
                      labelSize={3}
                      tabIndex={3}
                      searchIcon={true}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id}
                      options={studentList}
                      style={{ width: "90%" }}
                      onInputChange={(text) => {
                        handleSearchStudent(text);
                      }}
                      onChange={(text) => {
                        setFieldValue("studentId", text);
                        handleUnSavedChanges(1);
                        console.log("text--", text);
                      }}
                    />
                    {isMonthlyFees && (
                      <DateFieldFormik
                        tabIndex={6}
                        label="Enrolled From"
                        id="activityDate"
                        mandatory={1}
                        minDate={
                          moment(
                            formikReference?.current?.values?.group?.fromMonth
                          )
                            .format("YYYY-MM-DD")
                            .split(" ")[0]
                        }
                        maxDate={
                          moment(
                            formikReference?.current?.values?.group?.toMonth
                          )
                            .endOf("month")
                            .format("YYYY-MM-DD")
                            .split(" ")[0]
                        }
                        style={{ width: "40%" }}
                        labelSize={3}
                        onChange={(e) => {
                          setFieldValue("activityDate", e.target.value);
                        }}
                      />
                    )}
                  </div>
                  <div className="text-center mt-3">
                    <Button
                      className={"btn me-4"}
                      frmButton={false}
                      tabIndex={44}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                      }}
                      text="Save"
                    />
                    <Button
                      text="Close"
                      type="button"
                      frmButton={false}
                      onClick={(e) => {
                        setAddNewStudent(false);
                      }}
                    />
                  </div>
                </form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
}
export default ActivityGroup;
