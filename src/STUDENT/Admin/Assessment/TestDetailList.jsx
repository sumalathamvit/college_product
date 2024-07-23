import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Modal } from "react-bootstrap";
import { Formik } from "formik";
import { toast } from "react-toastify";
import moment from "moment";
import { useSelector } from "react-redux";

import academicApi from "../../../api/AcademicApi";

import AuthContext from "../../../auth/context";

import string from "../../../string";

import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import DateField from "../../../component/FormField/DateField";
import TextField from "../../../component/FormField/TextField";
import ModalComponent from "../../../component/ModalComponent";
import ScreenTitle from "../../../component/common/ScreenTitle";
import ErrorMessage from "./../../../component/common/ErrorMessage";

function TestDetailList() {
  //#region const
  const RENAME = useSelector((state) => state.web.rename);
  const { role, employeeId, collegeId } = useContext(AuthContext);
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [showRes, setShowRes] = useState("");
  const [testNameList, setTestNameList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [sectionList, setSectionList] = useState([]);

  const [testDateError, setTestDateError] = useState(false);
  const [minMarkError, setMinMarkError] = useState(false);
  const [maxMarkError, setMaxMarkError] = useState(false);
  const [markvalidateError, setMarkValidateError] = useState(false);
  const [changeTestDate, setChangeTestDate] = useState("");
  const [changeMinMark, setChangeMinMark] = useState("");
  const [changeMaxMark, setChangeMaxMark] = useState("");
  const [updateTestArr, setUpdateTestArr] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isClassInCharge, setIsClassInCharge] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  //#endregion

  const FormSchema = Yup.object().shape({
    testName: Yup.object().required("Please select Test Name"),
    course: Yup.object().required("Please select " + RENAME?.course),
    semester: Yup.object().required("Please select " + RENAME?.sem),
    section: Yup.object().required("Please select " + RENAME?.section),
  });

  let tabIndex = 6;
  let finalTabIndex = 1;

  const closeErrors = () => {
    setTestDateError(false);
    setMaxMarkError(false);
    setMinMarkError(false);
    setMarkValidateError(false);
  };

  const handleShow = async (values) => {
    if (load) return;
    setData([]);
    try {
      setLoad(true);
      setShowRes(true);
      const testDetailList = await academicApi.getTestDetailList(
        values.section.classID,
        values.semester.semester,
        values.testName.testID,
        null,
        0
      );
      console.log("testDetailList------------------", testDetailList);
      setData(testDetailList?.data?.message?.data?.testDetail ?? []);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleAssign = async () => {
    if (load) return;
    try {
      setLoad(true);
      setShowRes(true);

      let testDetailArray = subjectList.map((obj) => {
        return {
          maxMark: obj.maxMark,
          minMark: obj.minMark,
          subjectCourseID: obj.subjectCourseID,
          testDate: obj.testDate ? obj.testDate : null,
        };
      });
      console.log("testDetailArray--->", testDetailArray);
      for (let i = 0; i < testDetailArray.length; i++) {
        if (!testDetailArray[i].minMark || testDetailArray[i].minMark === "0") {
          setModalTitle("Mark");
          setModalMessage(
            `Enter the Minimum Mark for ${subjectList[i].subjectName}`
          );
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
        if (!testDetailArray[i].maxMark || testDetailArray[i].maxMark === "0") {
          setModalTitle("Mark");
          setModalMessage(
            `Enter the Maximum Mark for ${subjectList[i].subjectName}`
          );
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
      }
      const assignTestDetail = await academicApi.createTestDetail(
        formikRef.current.values.testName.testID,
        formikRef.current.values.semester.semester,
        formikRef.current.values.course.courseID,
        formikRef.current.values.semester.batchID,
        formikRef.current.values.section.classID,
        testDetailArray
      );
      console.log("assignTestDetail", assignTestDetail);

      if (!assignTestDetail.data.message.success) {
        setModalTitle("Message");
        setModalMessage(assignTestDetail.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      await handleSendCircular();
      toast.success(assignTestDetail.data.message.message);
      handleShow(formikRef.current.values);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleUpdate = async () => {
    if (load) return;
    let err = false;
    setMarkValidateError(false);
    let todayDate = new Date();
    if (
      changeTestDate == "" ||
      changeTestDate < moment().subtract(1, "month") ||
      changeTestDate >= moment().add(1, "years")
    ) {
      setTestDateError(true);
      err = true;
    }
    if (changeMinMark == "") {
      setMinMarkError(true);
      err = true;
    }
    if (changeMaxMark == "") {
      setMaxMarkError(true);
      err = true;
    }
    if (parseInt(changeMaxMark) < parseInt(changeMinMark)) {
      setMarkValidateError(true);
      err = true;
    }
    if (err) return;

    try {
      setLoad(true);
      const updateTestDetail = await academicApi.updateTestDetail(
        updateTestArr.testDetailID,
        moment(changeTestDate).format("YYYY-MM-DD"),
        changeMinMark,
        changeMaxMark
      );
      console.log("assignTestDetail", updateTestDetail);
      if (!updateTestDetail.data.message.success) {
        setModalTitle("Message");
        setModalMessage(updateTestDetail.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      await handleSendCircular();
      toast.success(updateTestDetail.data.message.message);
      setOpenModal(false);
      handleShow(formikRef.current.values);
      setChangeTestDate("");

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };
  const handleSendCircular = async () => {
    let passCircular = true;

    const testDetailList = await academicApi.getTestDetailList(
      formikRef.current.values.section.classID,
      formikRef.current.values.semester.semester,
      formikRef.current.values.testName.testID,
      null,
      0
    );
    console.log("testDetailList---", testDetailList);
    let timetable = formikRef.current.values.testName.test + " Time Table\n";
    for (
      let i = 0;
      i < testDetailList.data.message.data.testDetail.length;
      i++
    ) {
      if (
        !testDetailList.data.message.data.testDetail[i].testDate ||
        testDetailList.data.message.data.testDetail[i].testDate == ""
      ) {
        passCircular = false;
        break;
      }
      timetable +=
        moment(testDetailList.data.message.data.testDetail[i].testDate).format(
          "DD-MM-yyyy"
        ) +
        " - " +
        testDetailList.data.message.data.testDetail[i].subjectName +
        "\n";
    }
    let circularTopicID = "";
    let circularTopicName = "";
    if (passCircular) {
      const getAllCircularTopicsRes = await academicApi.getAllCircularTopics();
      console.log("getAllCircularTopicsRes---", getAllCircularTopicsRes);
      for (
        let i = 0;
        i < getAllCircularTopicsRes.data.message.data.circularTopic.length;
        i++
      ) {
        if (
          getAllCircularTopicsRes.data.message.data.circularTopic[i]
            .circularTopic == string.EXAM_CICULAR_TOPIC
        ) {
          circularTopicID =
            getAllCircularTopicsRes.data.message.data.circularTopic[i]
              .circularTopicID;
          circularTopicName =
            getAllCircularTopicsRes.data.message.data.circularTopic[i]
              .circularTopic;
          break;
        }
      }
      if (circularTopicID == "" || circularTopicName == "") {
        setModalTitle("Message");
        setModalMessage("Circular Topic EXAM not found");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      const uploadCircularRes = await academicApi.addCircular(
        parseInt(collegeId),
        formikRef.current.values.course.courseID.toString(),
        formikRef.current.values.course.courseID.toString(),
        formikRef.current.values.semester.semester.toString(),
        circularTopicID,
        circularTopicName,
        timetable,
        "",
        0
      );
      console.log("uploadCircularRes---", uploadCircularRes);
      setLoad(false);
      return;
    }
  };

  const getSubjectStaff = async (course, batch) => {
    console.log("batch-semester---", course, batch);

    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("section", false);
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
        if (!isClassInCharge)
          setSectionList(getMasterSubjectStaffRes.data.message.data.section);

        if (formikRef?.current?.values?.testName?.test) {
          for (
            let i = 0;
            i < getMasterSubjectStaffRes.data.message.data.subject.length;
            i++
          ) {
            getMasterSubjectStaffRes.data.message.data.subject[i].testName =
              formikRef.current.values.testName.test;
            getMasterSubjectStaffRes.data.message.data.subject[i].minMark =
              formikRef.current.values.testName.minMark;
            getMasterSubjectStaffRes.data.message.data.subject[i].maxMark =
              formikRef.current.values.testName.maxMark;
          }
        }
        setSubjectList(getMasterSubjectStaffRes.data.message.data.subject);
      } catch (error) {
        console.log(error);
        setLoad(false);
      }
    }
  };

  const getBatchMaster = async (course) => {
    formikRef.current.setFieldValue("batch", "");
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("subject", "");
    setSemesterList([]);
    if (course) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "batch",
            course.courseID
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSemesterList(getMasterSubjectStaffRes.data.message.data.batch);
      } catch (error) {
        console.log(error);
        setLoad(false);
      }
    }
  };

  const getInitialList = async () => {
    setIsClassInCharge(false);
    try {
      const getMasterSubjectStaffRes = await academicApi.getMasterSubjectStaff(
        collegeId,
        "course"
      );
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
      if (getMasterSubjectStaffRes.data.message.data.course.length == 1) {
        formikRef.current.setFieldValue(
          "course",
          getMasterSubjectStaffRes.data.message.data.course[0]
        );
        await getBatchMaster(
          getMasterSubjectStaffRes.data.message.data.course[0]
        );
      }
      const getAllTestRes = await academicApi.getAllTest(collegeId);
      console.log("getAllTestRes---", getAllTestRes);
      setTestNameList(getAllTestRes.data.message.data.test);
      if (getAllTestRes.data.message.data.test.length === 1) {
        formikRef.current.setFieldValue(
          "testName",
          getAllTestRes.data.message.data.test[0]
        );
      }
      if (role == string.STAFF_ROLE) {
        const getClassAdvisorbyStaffRes =
          await academicApi.getClassAdvisorbyStaff(employeeId);
        console.log("getClassAdvisorbyStaffRes---", getClassAdvisorbyStaffRes);

        if (
          getClassAdvisorbyStaffRes.data.message.data.class_data.length > 0 &&
          formikRef.current
        ) {
          setIsClassInCharge(true);
          let course = {
            courseID:
              getClassAdvisorbyStaffRes.data.message.data.class_data[0]
                .courseID,
            courseName:
              getClassAdvisorbyStaffRes.data.message.data.class_data[0]
                .courseName,
          };
          setCourseList([course]);
          formikRef.current.setFieldValue("course", course);
          let sem = {
            semester:
              getClassAdvisorbyStaffRes.data.message.data.class_data[0]
                .semester,
            batchID:
              getClassAdvisorbyStaffRes.data.message.data.class_data[0].batchID,
            className:
              getClassAdvisorbyStaffRes.data.message.data.class_data[0]
                .className,
          };

          formikRef.current.setFieldValue("semester", sem);
          let section = {
            classID:
              getClassAdvisorbyStaffRes.data.message.data.class_data[0].classID,
            section:
              getClassAdvisorbyStaffRes.data.message.data.class_data[0].section,
          };
          formikRef.current.setFieldValue("section", section);
          setSectionList([section]);
          if (getAllTestRes.data.message.data.test.length === 1) {
            await handleShow(formikRef.current.values);
            await getSubjectStaff(
              formikRef?.current?.values?.course,
              formikRef?.current?.values?.semester
            );
          }
        }
      }
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  useEffect(() => {
    getInitialList();
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
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              course: null,
              // batch: null,
              semester: null,
              section: null,
              subject: null,
              testName: null,
              testDate: null,
              maxMark: "",
              passMark: "",
            }}
            validationSchema={FormSchema}
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
                  <div className="col-lg-8">
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={1}
                      label="Test Name"
                      id="testName"
                      mandatory={1}
                      maxlength={15}
                      clear={false}
                      getOptionLabel={(option) => option.test}
                      getOptionValue={(option) => option.testID}
                      options={testNameList}
                      style={{ width: "50%" }}
                      searchIcon={false}
                      onChange={(text) => {
                        setFieldValue("testName", text);
                        setFieldTouched("testName", false);
                        if (values?.course && values?.semester)
                          getSubjectStaff(values?.course, values?.semester);
                        setShowRes(false);
                      }}
                    />
                    {courseList.length > 1 && (
                      <SelectFieldFormik
                        tabIndex={2}
                        label={RENAME?.course}
                        id="course"
                        mandatory={1}
                        clear={false}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.courseID}
                        options={courseList}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setFieldTouched("course", false);
                          getBatchMaster(text);
                          setShowRes(false);
                        }}
                      />
                    )}

                    <SelectFieldFormik
                      tabIndex={3}
                      label={RENAME?.sem}
                      id="semester"
                      mandatory={1}
                      getOptionLabel={(option) => option.className}
                      getOptionValue={(option) => option.semester}
                      options={semesterList}
                      style={{ width: "50%" }}
                      onChange={(text) => {
                        setFieldValue("semester", text);
                        setFieldValue("section", "");
                        getSubjectStaff(values?.course, text);
                        setShowRes(false);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={4}
                      label={RENAME?.section}
                      id="section"
                      mandatory={1}
                      maxlength={1}
                      clear={false}
                      getOptionLabel={(option) => option.section}
                      getOptionValue={(option) => option.classID}
                      options={sectionList}
                      style={{ width: "30%" }}
                      onChange={(text) => {
                        setFieldValue("section", text);
                        setFieldTouched("section", false);
                        setShowRes(false);
                      }}
                    />
                  </div>
                  {!showRes && (
                    <Button
                      tabIndex={5}
                      type="submit"
                      text={"Show"}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                      }}
                    />
                  )}
                </form>
              );
            }}
          </Formik>
        </div>
        <div className="row no-gutters">
          <form autoComplete="off">
            <div className="row no-gutters mt-3">
              {showRes ? (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th width="1%">No.</th>
                      <th>Subject</th>
                      <th width="10%">Test Date</th>
                      <th width="3%">Max Mark</th>
                      <th width="3%">Pass Mark</th>
                      {data.length > 0 && <th width="5%"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0
                      ? data.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.subjectName}</td>
                              <td>
                                {item.testDate
                                  ? moment(item.testDate).format("DD-MM-YYYY")
                                  : ""}
                              </td>
                              <td>{item.maxMark}</td>
                              <td>{item.minMark}</td>
                              <td>
                                <Button
                                  tabIndex={tabIndex}
                                  load={load}
                                  isTable={true}
                                  type="button"
                                  text={"Edit"}
                                  className={"btn-3"}
                                  onClick={(e) => {
                                    setOpenModal(true);
                                    setUpdateTestArr(item);
                                    setChangeMaxMark(item.maxMark);
                                    setChangeMinMark(item.minMark);
                                    setChangeTestDate(
                                      item.testDate
                                        ? moment(item.testDate).format(
                                            "YYYY-MM-DD"
                                          )
                                        : ""
                                    );
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })
                      : subjectList.map((item, index) => {
                          tabIndex = tabIndex + 3;
                          finalTabIndex = tabIndex + 2;
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.subjectName}</td>
                              <td>
                                <DateField
                                  tabIndex={tabIndex}
                                  mandatory={1}
                                  id={`testDate`}
                                  maxDate={moment().add(1, "years")}
                                  minDate={moment().subtract(1, "month")}
                                  // minimumDate={new Date()}
                                  value={item.testDate ? item.testDate : ""}
                                  style={{ width: "100%" }}
                                  onChange={(e) => {
                                    subjectList[index].testDate = e.target.value
                                      ? e.target.value
                                      : "";
                                    setSubjectList([...subjectList]);
                                  }}
                                />
                              </td>
                              <td>
                                <TextField
                                  tabIndex={tabIndex + 1}
                                  type="number"
                                  id="maxMark"
                                  placeholder="Mark"
                                  mandatory={1}
                                  maxlength={3}
                                  value={item.maxMark}
                                  onChange={(e) => {
                                    subjectList[index].maxMark = e.target.value
                                      ? e.target.value
                                      : "";
                                    setSubjectList([...subjectList]);
                                  }}
                                />
                              </td>
                              <td>
                                <TextField
                                  tabIndex={tabIndex + 2}
                                  type="number"
                                  id="passMark"
                                  placeholder="Mark"
                                  mandatory={1}
                                  maxlength={3}
                                  value={item.minMark}
                                  onChange={(e) => {
                                    subjectList[index].minMark = e.target.value
                                      ? e.target.value
                                      : "";
                                    setSubjectList([...subjectList]);
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              ) : null}
            </div>
            {showRes && subjectList.length == 0 ? (
              <div colSpan="10" className="text-center ">
                <ErrorMessage Message="No Subject found" view={true} />
              </div>
            ) : null}
            {data.length === 0 && showRes && subjectList.length > 0 ? (
              <Button
                load={load}
                id="save"
                text="F4 - Save"
                type={"button"}
                onClick={(e) => {
                  handleAssign();
                }}
              />
            ) : null}
          </form>
          {/* );
            }}
          </Formik> */}
        </div>
      </div>
      <Modal
        show={openModal}
        onEscapeKeyDown={(e) => setOpenModal(false)}
        className="modal-dialog modal-lg"
      >
        <Modal.Header>
          <Modal.Title>Modify Subject Test Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="row no-gutters mt-2">
              <label className="text-right col-lg-3">{RENAME?.course} :</label>
              <div className="col-lg-9 ps-2">
                {formikRef?.current?.values?.course?.courseName}
              </div>
            </div>
            <div className="row no-gutters mt-2">
              <label className="text-right col-lg-3">{RENAME?.sem} :</label>
              <div className="col-lg-9 ps-2">
                {formikRef?.current?.values?.semester?.semester}
              </div>
            </div>
            <div className="row no-gutters mt-2">
              <label className="text-right col-lg-3">{RENAME?.section} :</label>
              <div className="col-lg-9 ps-2">
                {formikRef?.current?.values?.section?.section}
              </div>
            </div>
            <div className="row no-gutters mt-2">
              <label className="text-right col-lg-3">Test Name :</label>
              <div className="col-lg-9 ps-2">
                {formikRef?.current?.values?.testName?.test}
              </div>
            </div>
            <div className="row no-gutters mt-2">
              <label className="text-right col-lg-3">Subject :</label>
              <div className="col-lg-9 ps-2">{updateTestArr.subjectName}</div>

              <>
                <div className="text-left col-lg-7 ps-2">
                  <DateField
                    autoFocus
                    tabIndex={1}
                    mandatory={1}
                    label="Test Date"
                    id="changeIncrementDate"
                    maxDate={moment().add(1, "years")}
                    // minDate={new Date()}
                    minDate={moment().subtract(1, "month")}
                    // labelSize={3}
                    // value={moment(changeTestDate).format("dd-mm-yyyy")}
                    value={
                      changeTestDate
                        ? moment(changeTestDate, "YYYY-MM-DD").toDate()
                        : null
                    }
                    style={{ width: "90%" }}
                    error={testDateError ? "Please select valid Test Date" : ""}
                    onChange={(e) => {
                      setChangeTestDate(e.target.value);
                      closeErrors();
                    }}
                  />
                </div>
                <TextField
                  tabIndex={2}
                  label={"Max Mark"}
                  type="number"
                  id="maxMark"
                  placeholder="Mark"
                  mandatory={1}
                  maxlength={3}
                  style={{ width: "20%" }}
                  value={changeMaxMark}
                  onChange={(e) => {
                    setChangeMaxMark(e.target.value);
                    closeErrors();
                  }}
                  error={maxMarkError ? "Please enter Max Mark" : ""}
                  touched={maxMarkError ? true : false}
                  labelSize={3}
                />
                <TextField
                  tabIndex={3}
                  label="Pass Mark"
                  type="number"
                  id="minMark"
                  placeholder="Mark"
                  style={{ width: "20%" }}
                  mandatory={1}
                  maxlength={3}
                  value={changeMinMark}
                  onChange={(e) => {
                    setChangeMinMark(e.target.value);
                    closeErrors();
                  }}
                  error={
                    minMarkError
                      ? "Please enter Min Mark"
                      : markvalidateError
                      ? "Please enter valid Mark"
                      : ""
                  }
                  touched={
                    minMarkError ? true : markvalidateError ? true : false
                  }
                  labelSize={3}
                />
              </>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="row ">
            <div className="col-lg-6 d-flex justify-content-end">
              <Button
                tabIndex={finalTabIndex}
                isTable={true}
                id="save"
                text="F4 - Save"
                // type="button"
                onClick={(e) => {
                  handleUpdate();
                }}
              />
            </div>

            <div className="col-lg-6 d-flex justify-content-start p-0">
              <Button
                isTable={true}
                text="Close"
                type="button"
                onClick={(e) => {
                  setOpenModal(false);
                }}
              />
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TestDetailList;
