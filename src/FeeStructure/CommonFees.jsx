import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import { Tab, Tabs } from "react-bootstrap";
import { toast } from "react-toastify";
import * as Yup from "yup";
import moment from "moment";

import StudentApi from "../api/StudentApi";

import AuthContext from "../auth/context";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import StudentFeesDetails from "../component/StudentFeesDetails";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import ModalComponent from "../component/ModalComponent";
import ScreenTitle from "../component/common/ScreenTitle";
import { activityFeesTypeList } from "../component/common/CommonArray";

function CommonFees() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [particularList, setParticularList] = useState([]);
  const [activityGroupList, setActivityGroupList] = useState([]);
  const [activityGroupStudentList, setActivityGroupStudentList] = useState([]);
  const [initialAmount, setInitialAmount] = useState("");
  const [amountError, setAmountError] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [showRes, setShowRes] = useState(false);
  const formikRef = useRef();
  const formikActivityRef = useRef();
  const collegeConfig = useSelector((state) => state.web.college);
  const [college, setCollege] = useState("");
  const { collegeId, setUnSavedChanges } = useContext(AuthContext);
  const RENAME = useSelector((state) => state.web.rename);

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
    batch: Yup.object().required("Please select  " + RENAME?.sem),
    particular: Yup.object().required("Please select Particular"),
    amount: Yup.number()
      .min(1, "Please enter valid Amount")
      .required("Please enter Amount"),
  });

  const ActivityFormSchema = Yup.object().shape({
    collegeId: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    group: Yup.object().required("Please select Activity Group"),
    activityParticular: Yup.object().required("Please select Particular"),
    feesType: Yup.object().required("Please select Fees"),
    amount: Yup.number()
      .min(1, "Please enter valid Amount")
      .required("Please enter Amount"),
  });

  const handleSave = async (values) => {
    if (load) return;
    try {
      console.log("values--", values);

      let feesDue = [];
      let studentArr = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].amount == 0) {
          studentArr.push(data[i].name);
        } else {
          feesDue.push({
            studentID: data[i].studentID,
            amount: data[i].amount,
          });
        }
      }
      console.log("feesDue----", feesDue, studentArr.toString());
      if (feesDue.length == 0) {
        setModalMessage("Please enter at least one valid Amount");
        setModalErrorOpen(true);
        setModalTitle("Message");
        document.getElementById("amount0").focus();
        return;
      }

      setLoad(true);
      let addFeesDue = await StudentApi.addFeesDue(
        values.batch.batchID,
        values.batch.semester,
        values.batch.studyYear,
        values.particular.id,
        feesDue
      );

      console.log("addFeesDue---", addFeesDue);
      if (!addFeesDue.data.message.success) {
        setModalMessage(addFeesDue.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Already Exists");
        setLoad(false);
        return;
      }
      toast.success(addFeesDue.data.message.message);
      setData([]);
      formikRef.current.resetForm();
      handleUnSavedChanges(0);
      if (!collegeConfig.is_university) {
        selectList(collegeId);
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSaveActivityFee = async (values) => {
    if (load) return;
    try {
      console.log("values--", values, activityGroupStudentList);

      let studentActivityArr = activityGroupStudentList.map((item) => {
        return {
          studentID: item.studentID,
          semester: item.semester,
          studyYear: item.studyYear,
          batchID: item.batchID,
        };
      });

      if (studentActivityArr.length == 0) {
        setModalMessage("Please enter at least one valid Amount");
        setModalErrorOpen(true);
        setModalTitle("Message");
        document.getElementById("amount0").focus();
        return;
      }

      setLoad(true);
      let addFeesDue = await StudentApi.addCommonFeesDueActivityGrp(
        values.group.activityGroupID,
        moment(values.group.fromMonth).format("YYYY-MM-DD").split(" ")[0],
        values.feesType.value,
        values.activityParticular.id,
        values.amount,
        studentActivityArr
      );
      console.log("addFeesDue---", addFeesDue);
      if (!addFeesDue.data.message.success) {
        setModalMessage(addFeesDue.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Already Exists");
        setLoad(false);
        return;
      }
      toast.success(addFeesDue.data.message.message);
      setActivityGroupStudentList([]);
      formikActivityRef.current.resetForm();
      if (collegeConfig.is_university) {
        getGroupList(formikActivityRef?.current?.values?.collegeId.collegeID);
      } else {
        getGroupList(collegeId);
      }
      handleUnSavedChanges(0);
      setShowRes(false);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleParticular = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      setData([]);
      console.log("values---", values);
      const students = await StudentApi.getFeeDue(
        collegeConfig.institution_type,
        values.course.id,
        collegeConfig.institution_type === 1 ? null : values.batch.batchID,
        values.batch.semester,
        values.admissionType ? values.admissionType.id : null,
        values.particular.id
      );
      console.log("students-------", students);
      if (!students.data.message.success) {
        setModalMessage(students.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      handleUnSavedChanges(1);
      for (let i = 0; i < students.data.message.data.length; i++) {
        students.data.message.data[i].amount = values.amount;
        students.data.message.data[i].amountError = false;
      }
      setData(students.data.message.data);

      setInitialAmount(values.amount);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleAmount = (item, index, amount) => {
    let arr = data;
    setData([]);
    arr[index].amount = amount;
    setData([...arr]);
  };

  const selectList = async (college_id) => {
    try {
      console.log("selectList", collegeConfig);
      const masterList = await StudentApi.getMaster(5, college_id);
      setCollege(college_id);
      console.log("masterList", masterList);

      if (!masterList.data.message.success) {
        setModalMessage(masterList.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setCourseList(masterList.data.message.data.course_data);
      if (masterList.data.message.data.course_data.length == 1) {
        formikRef.current.setFieldValue(
          "course",
          masterList.data.message.data.course_data[0]
        );
        getBatchMaster(masterList.data.message.data.course_data[0]);
      }
      //masterList.data.message.data.admission_type_data
      //add all in 0th index
      masterList.data.message.data.admission_type_data.splice(0, 0, {
        id: null,
        admissionType: "All",
      });
      setAdmissionTypeList(masterList.data.message.data.admission_type_data);
      formikRef.current.setFieldValue(
        "admissionType",
        masterList.data.message.data.admission_type_data[0]
      );
      setParticularList(masterList.data.message.data.particular_uncommon_data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const getBatchMaster = async (text) => {
    console.log("text---", text);
    handleUnSavedChanges(0);

    formikRef.current.setFieldValue("batch", null);
    formikRef.current.setFieldValue("particular", null);
    formikRef.current.setFieldValue("amount", "");
    formikRef.current.setFieldTouched("amount", false);

    if (text) {
      try {
        const getPersonalMasterRes = await StudentApi.getMaster(
          collegeConfig.institution_type === 1 ? 8 : 5,
          college,
          text.id
        );
        setSemesterList(
          collegeConfig.institution_type === 1
            ? getPersonalMasterRes.data.message.data.semester_data
            : getPersonalMasterRes.data.message.data.batch_data
        );
        console.log("getPersonalMasterRes---", getPersonalMasterRes);
      } catch (error) {
        setLoad(false);
        console.log(error);
      }
    }
  };

  const handleCheckBoxOnchange = () => {
    let arr = data;
    setData([]);
    console.log("arr", arr);
    for (let i = 0; i < arr.length; i++) {
      arr[i].amount = "";
      arr[i].amountError = false;
    }
    console.log("arr------", arr);
    setData([...arr]);
  };

  // Function to get all assigned students
  const getAllAssignedStudents = async (values) => {
    if (load) return;
    console.log("values--", values);

    if (values?.group.isMonthlyFees == 0 || values?.group.isMonthlyFees == 1) {
      setModalMessage("Fees Due already created for this group");
      setModalErrorOpen(true);
      setModalTitle("Message");
      setLoad(false);
      return;
    }

    try {
      setLoad(true);
      const getAllAssignedStudentsRes = await StudentApi.getAllAssignedStudents(
        values.group.activityGroupID
      );
      console.log("getAllAssignedStudentsRes---", getAllAssignedStudentsRes);

      setActivityGroupStudentList(
        getAllAssignedStudentsRes.data.message.data.students
      );
      setShowRes(true);
      setLoad(false);
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

  useEffect(() => {
    if (!collegeConfig.is_university) {
      selectList(collegeId);
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
        <Tabs
          id="uncontrolled-tab-example"
          className="text-center mt-4 pt-2"
          fill
        >
          <Tab eventKey={1} title={RENAME?.sem}>
            <div className="row no-gutters mt-1 p-3">
              <Formik
                enableReinitialize={false}
                innerRef={formikRef}
                initialValues={{
                  college: "",
                  course: "",
                  batch: "",
                  admissionType: admissionTypeList[0],
                  // semester: "",
                  particular: "",
                  amount: "",
                }}
                validationSchema={FormSchema}
                onSubmit={handleParticular}
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
                      <div className="row no-gutters">
                        <div className="col-lg-9">
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
                                setCollege(text);
                                selectList(text.collegeID);
                                setFieldValue("course", "");
                                setFieldValue("batch", "");
                                setFieldValue("particular", "");
                                setFieldValue("amount", "");
                                setData([]);
                              }}
                              style={{ width: "80%" }}
                            />
                          ) : null}
                          <SelectFieldFormik
                            autoFocus={!collegeConfig.is_university}
                            label={RENAME?.course}
                            id="course"
                            tabIndex={1}
                            mandatory={1}
                            maxlength={40}
                            matchFrom="start"
                            clear={false}
                            options={courseList}
                            style={{ width: "90%" }}
                            getOptionLabel={(option) => option.courseName}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("course", text);
                              setData([]);
                              getBatchMaster(text);
                            }}
                          />
                          <SelectFieldFormik
                            label={RENAME?.sem}
                            id="batch"
                            mandatory={1}
                            tabIndex={2}
                            maxlength={10}
                            matchFrom="start"
                            style={{ width: "50%" }}
                            options={semesterList}
                            clear={false}
                            getOptionLabel={(option) =>
                              collegeConfig.institution_type === 1
                                ? option.className
                                : option.semester
                            }
                            getOptionValue={(option) => option.semester}
                            onChange={(text) => {
                              setFieldValue("batch", text);
                              setData([]);
                            }}
                          />
                          <SelectFieldFormik
                            label="Admission Type"
                            id="admissionType"
                            mandatory={1}
                            maxlength={10}
                            tabIndex={3}
                            options={admissionTypeList}
                            matchFrom="start"
                            style={{ width: "50%" }}
                            getOptionLabel={(option) => option.admissionType}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("admissionType", text);
                              setData([]);
                              handleUnSavedChanges(0);
                            }}
                          />
                          <SelectFieldFormik
                            label="Particular"
                            id="particular"
                            mandatory={1}
                            tabIndex={4}
                            maxlength={10}
                            matchFrom="start"
                            options={particularList}
                            clear={false}
                            style={{ width: "90%" }}
                            getOptionLabel={(option) => option.particular}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setData([]);
                              setFieldValue("particular", text);
                              handleUnSavedChanges(0);
                            }}
                          />

                          <TextFieldFormik
                            id="amount"
                            isAmount={true}
                            label="Amount (₹)"
                            placeholder=" "
                            mandatory={1}
                            tabIndex={5}
                            maxlength={7}
                            style={{ width: "20%" }}
                            onChange={(e) => {
                              setAmountError(false);
                              if (
                                preFunction.amountValidation(e.target.value)
                              ) {
                                handleChange(e);
                                setInitialAmount(e.target.value);
                                handleUnSavedChanges(0);
                              }
                            }}
                            error={
                              amountError ? "Please Enter valid Amount" : ""
                            }
                          />
                        </div>
                        <Button
                          text="Show"
                          type="submit"
                          tabIndex={6}
                          onClick={() => preFunction.handleErrorFocus(errors)}
                        />

                        {data.length > 0 ? (
                          <div className="row no-gutters">
                            <div className="subhead-row">
                              <div className="subhead">
                                Update Fees Due Detail
                              </div>
                              <div className="col line-div"></div>
                            </div>
                            <div className="row no-gutters">
                              <div className="col-lg-10"></div>
                              <div className="col-lg-2 text-right mb-2">
                                <a
                                  href="javascript:void(0)"
                                  onClick={(e) => handleCheckBoxOnchange()}
                                >
                                  Clear All Amount
                                </a>
                              </div>
                            </div>
                            <div className="table-responsive mt-2 p-0">
                              <table className="table table-bordered m-0">
                                <thead>
                                  <tr>
                                    <th width="1%">No.</th>
                                    <th width="10%">Student No.</th>
                                    <th width="30%">Student Name</th>
                                    <th>Particular Name</th>
                                    <th width="8%">Amount (₹)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.map((item, index) => {
                                    return (
                                      <StudentFeesDetails
                                        item={item}
                                        index={index}
                                        className={"form-control"}
                                        handleAmount={handleAmount}
                                        particular={
                                          values.particular.particular
                                        }
                                        initialAmount={initialAmount}
                                      />
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null}
                        {data.length > 0 ? (
                          <div className="text-right mt-2 p-0">
                            <Button
                              tabIndex={6 + data.length}
                              type="button"
                              onClick={() => {
                                handleSave(values);
                              }}
                              text="F4 - Save"
                              id="save"
                            />
                          </div>
                        ) : null}
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </div>
          </Tab>
          <Tab eventKey={2} title="Activity Group">
            <div className="row no-gutters mt-1 p-3">
              <Formik
                enableReinitialize={false}
                innerRef={formikActivityRef}
                initialValues={{
                  collegeId: "",
                  group: "",
                  activityParticular: "",
                  feesType: "",
                  amount: "",
                }}
                validationSchema={ActivityFormSchema}
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
                      <div className="row no-gutters">
                        <div className="col-lg-9">
                          {collegeConfig.is_university ? (
                            <SelectFieldFormik
                              autoFocus
                              tabIndex={0}
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
                                getGroupList(text.collegeID);
                                selectList(text.collegeID);
                                setFieldValue("particular", "");
                                setFieldValue("amount", "");
                                setActivityGroupStudentList([]);
                                setShowRes(false);
                              }}
                              style={{ width: "80%" }}
                            />
                          ) : null}
                          <SelectFieldFormik
                            autoFocus
                            label="Activity Group"
                            tabIndex={1}
                            id="group"
                            mandatory={1}
                            style={{ width: "90%" }}
                            options={activityGroupList}
                            getOptionLabel={(option) =>
                              option.activityGroupName
                            }
                            getOptionValue={(option) => option.activityGroupID}
                            onChange={(text) => {
                              setFieldValue("group", text);
                              setShowRes(false);
                            }}
                          />

                          <SelectFieldFormik
                            label="Particular"
                            id="activityParticular"
                            mandatory={1}
                            tabIndex={4}
                            maxlength={10}
                            matchFrom="start"
                            options={particularList}
                            clear={false}
                            style={{ width: "90%" }}
                            getOptionLabel={(option) => option.particular}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setData([]);
                              setFieldValue("activityParticular", text);
                              handleUnSavedChanges(0);
                              setShowRes(false);
                            }}
                          />

                          <SelectFieldFormik
                            label="Fees"
                            id="feesType"
                            mandatory={1}
                            tabIndex={4}
                            maxlength={10}
                            matchFrom="start"
                            options={activityFeesTypeList}
                            clear={false}
                            style={{ width: "40%" }}
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                            onChange={(text) => {
                              setData([]);
                              setFieldValue("feesType", text);
                              handleUnSavedChanges(0);
                              setShowRes(false);
                            }}
                          />
                          {values.group &&
                            values?.feesType &&
                            values?.feesType?.label == "Monthly" && (
                              <>
                                <div className="row p-0 mt-1 mb-2">
                                  <div className="col-lg-5"></div>
                                  <div className="col-lg-7 p-0">
                                    <text
                                      style={{
                                        color: "green",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      The monthly fees will be added upto{" "}
                                      {
                                        moment(
                                          formikActivityRef?.current?.values
                                            ?.group?.toMonth
                                        )
                                          .format("MMMM-YYYY")
                                          .split(" ")[0]
                                      }
                                    </text>
                                  </div>
                                </div>
                              </>
                            )}

                          <TextFieldFormik
                            id="amount"
                            isAmount={true}
                            label="Amount (₹)"
                            placeholder=" "
                            mandatory={1}
                            tabIndex={5}
                            maxlength={7}
                            style={{ width: "20%" }}
                            onChange={(e) => {
                              setAmountError(false);
                              setActivityGroupStudentList([]);
                              if (
                                preFunction.amountValidation(e.target.value)
                              ) {
                                handleChange(e);
                                setInitialAmount(e.target.value);
                                handleUnSavedChanges(0);
                                setShowRes(false);
                              }
                            }}
                          />
                        </div>
                        <Button
                          text="Show"
                          type="submit"
                          tabIndex={6}
                          onClick={() => preFunction.handleErrorFocus(errors)}
                        />

                        {showRes ? (
                          <div className="row no-gutters">
                            <div className="subhead-row">
                              <div className="subhead">
                                Update Fees Due Detail
                              </div>
                              <div className="col line-div"></div>
                            </div>
                            <div className="table-responsive mt-2 p-0">
                              <table className="table table-bordered m-0">
                                <thead>
                                  <tr>
                                    <th width="2%">No.</th>
                                    <th width="10%">Student No.</th>
                                    <th width="25%">Student Name</th>
                                    <th>{RENAME.course}</th>
                                    <th width="15%">{RENAME.sem}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {activityGroupStudentList.length == 0 ? (
                                    <tr>
                                      <td colSpan="6" className="text-center">
                                        No Student found
                                      </td>
                                    </tr>
                                  ) : (
                                    <>
                                      {activityGroupStudentList.map(
                                        (item, index) => {
                                          return (
                                            <tr key={index}>
                                              <td>{index + 1}</td>
                                              <td>{item.enrollNo}</td>
                                              <td>{item.studentName}</td>
                                              <td>{item.courseName}</td>
                                              <td>{item.className}</td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null}
                        {showRes && activityGroupStudentList.length > 0 ? (
                          <div className="text-right mt-2 p-0">
                            <Button
                              tabIndex={6 + activityGroupStudentList.length}
                              type="button"
                              onClick={() => {
                                handleSaveActivityFee(values);
                              }}
                              text="Save"
                            />
                          </div>
                        ) : null}
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
  );
}

export default CommonFees;
