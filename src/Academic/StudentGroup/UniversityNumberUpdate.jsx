import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import $ from "jquery";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";
import AcademicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextField from "../../component/FormField/TextField";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import { sectionList } from "../../component/common/CommonArray";
import AuthContext from "../../auth/context";

function UniversityNumberUpdate() {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [sectionArr, setSectionArr] = useState([]);
  const formikRef = useRef();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const { setUnSavedChanges, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const updateSchema = Yup.object().shape({
    course: $("#course").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#course").attr("alt") ?? RENAME?.course}`
        ),
    batch: $("#batch").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#batch").attr("alt") ?? RENAME?.sem}`
        ),
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

  const handleShow = async (values) => {
    if (load) return;
    try {
      console.log("Values-----", values, data);
      if (
        values.updateType === 3 &&
        (!values.section || !values.section.classID)
      ) {
        document.getElementById("section")?.focus();
        formikRef.current.setErrors({
          section: "Please select " + RENAME?.section,
        });
        setShowRes(false);
        return;
      }
      setLoad(true);
      const studentDetailRes = await StudentApi.updateUniversityNumber({
        screenName: "university",
        courseID: values?.course?.id,
        standard:
          collegeConfig.institution_type === 1 ? values?.batch?.semester : null,
        batchID:
          collegeConfig.institution_type === 1 ? null : values?.batch?.batchID,
        classID: values?.section?.classID,
        institutionType: collegeConfig.institution_type,
      });
      console.log("studentDetailRes----", studentDetailRes);
      if (!studentDetailRes.data.message.success) {
        setModalMessage(studentDetailRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      if (values.updateType === 1) {
        let univNoArr = [];
        for (
          let i = 0;
          i < studentDetailRes.data.message.data.student_data.length;
          i++
        ) {
          univNoArr.push({
            studentID:
              studentDetailRes.data.message.data.student_data[i].studentID,
            registrationNo:
              studentDetailRes.data.message.data.student_data[i].registrationNo,
          });
        }
        setPreviousData(univNoArr);
        setShowRes(true);
        setLoad(false);
      } else if (values.updateType === 2) {
        let sectionArr = [];
        for (
          let i = 0;
          i < studentDetailRes.data.message.data.student_data.length;
          i++
        ) {
          sectionArr.push({
            studentID:
              studentDetailRes.data.message.data.student_data[i].studentID,
            section: studentDetailRes.data.message.data.student_data[i].section,
          });
        }
        setPreviousData(sectionArr);
        setShowRes(true);
        setLoad(false);
      } else {
        let rollNoArr = [];
        for (
          let i = 0;
          i < studentDetailRes.data.message.data.student_data.length;
          i++
        ) {
          rollNoArr.push({
            studentID:
              studentDetailRes.data.message.data.student_data[i].studentID,
            rollNo: studentDetailRes.data.message.data.student_data[i].rollNo,
          });
        }
        setPreviousData(rollNoArr);
        setShowRes(true);
        setLoad(false);
      }
      let array = studentDetailRes.data.message.data.student_data;
      const allTrue = array.every((obj) => !obj.rollNo);
      if (
        values.updateType === 3 &&
        allTrue &&
        studentDetailRes.data.message.data.student_data.length > 0
      ) {
        array.forEach((item, index) => {
          item.rollNo = index + 1;
        });
        setModalMessage(
          "Please verify the roll number for all students and save the information."
        );
        setModalErrorOpen(true);
        setModalTitle("Message");
      }
      console.log(array, "array");

      setData(array);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleSave = async (values) => {
    if (load) return;
    let studentList = [];
    console.log("values---", values);
    console.log("previousData---", previousData);
    console.log("data---", data);
    if (values.updateType === 1) {
      for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
          if (
            data[i].registrationNo &&
            data[j].registrationNo &&
            data[i].registrationNo !== "" &&
            data[j].registrationNo !== "" &&
            parseInt(data[i].registrationNo) ===
              parseInt(data[j].registrationNo)
          ) {
            setModalMessage(
              "Registration No. should be unique for all students"
            );
            setModalErrorOpen(true);
            setModalTitle("Message");
            document.getElementById("univNo" + i)?.focus();
            setLoad(false);
            return;
          }
        }
      }
      console.log(studentList, "studentList");
      for (let i = 0; i < data.length; i++) {
        let isDuplicate = false;
        for (let j = 0; j < previousData.length; j++) {
          if (previousData[j].registrationNo === data[i].registrationNo) {
            isDuplicate = true;
            break;
          }
        }
        console.log("isDuplicate---", isDuplicate);
        if (!isDuplicate) {
          studentList.push(
            collegeConfig.institution_type === 1
              ? {
                  enrollNo: data[i].enrollNo,
                  registrationNo: data[i].registrationNo,
                  studentID: data[i].studentID,
                  classID: data[i].classID,
                  semester: data[i].semester,
                }
              : {
                  enrollNo: data[i].enrollNo,
                  registrationNo: data[i].registrationNo,
                  studentID: data[i].studentID,
                  classID: data[i].classID,
                }
          );
        }
      }
      console.log("studentList---", studentList);
      if (studentList.length === 0) {
        setModalMessage("No Change made");
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setLoad(true);
      const studentDetailRes = await StudentApi.updateUniversityNumber({
        screenName: "university",
        courseID: values?.course?.id,
        batchID: values?.batch?.batchID,
        classID: values?.section?.classID,
        institutionType: collegeConfig.institution_type,
        studentDetail: studentList,
      });
      console.log("studentDetailRes----", studentDetailRes);
      if (!studentDetailRes.data.message.success) {
        setModalMessage(studentDetailRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      toast.success(studentDetailRes.data.message.message);
      setLoad(false);
    } else if (values.updateType === 2) {
      for (let i = 0; i < data.length; i++) {
        let isDuplicate = false;
        console.log("previousData---", previousData);
        console.log("data[i].section---", data);

        if (previousData[i].section === data[i].section) {
          isDuplicate = true;
        }
        console.log("isDuplicate---", isDuplicate);
        if (!isDuplicate) {
          studentList.push(
            collegeConfig.institution_type === 1
              ? {
                  enrollNo: data[i].enrollNo,
                  section: data[i].section,
                  studentID: data[i].studentID,
                  classID: data[i].classID,
                  semester: data[i].semester,
                }
              : {
                  enrollNo: data[i].enrollNo,
                  section: data[i].section,
                  studentID: data[i].studentID,
                  classID: data[i].classID,
                }
          );
        }
      }
      console.log("studentList---", studentList);
      if (studentList.length === 0) {
        setModalMessage("No Change in " + RENAME?.section);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      const studentDetailRes = await StudentApi.updateUniversityNumber({
        screenName: "class",
        courseID: values?.course?.id,
        batchID: values?.batch?.batchID,
        classID: values?.section?.classID,
        institutionType: collegeConfig.institution_type,
        studentDetail: studentList,
      });
      console.log("studentDetailRes----", studentDetailRes);
      if (!studentDetailRes.data.message.success) {
        setModalMessage(studentDetailRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      toast.success(studentDetailRes.data.message.message);
      handleBatchChange(values, values.batch);
    } else {
      for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
          if (
            !data[i].rollNo &&
            !data[j].rollNo &&
            data[i].rollNo !== "" &&
            data[j].rollNo !== "" &&
            parseInt(data[i].rollNo) === parseInt(data[j].rollNo)
          ) {
            setModalMessage("Roll Number should be unique for all students");
            setModalErrorOpen(true);
            setModalTitle("Message");
            setLoad(false);
            return;
          }
        }
      }

      for (let i = 0; i < data.length; i++) {
        if (data[i].rollNo === "" && previousData[i].rollNo !== "") {
          setModalMessage(
            "Already assigned Roll Number for " +
              data[i].enrollNo +
              " and It should not be empty"
          );
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        let isDuplicate = false;
        console.log("previousData---", previousData[i].rollNo, data[i].rollNo);
        if (
          data[i].rollNo &&
          parseInt(previousData[i].rollNo) === parseInt(data[i].rollNo)
        ) {
          isDuplicate = true;
        }
        console.log("isDuplicate---", isDuplicate);

        if (!isDuplicate && data[i].rollNo) {
          studentList.push(
            collegeConfig.institution_type === 1
              ? {
                  enrollNo: data[i].enrollNo,
                  rollNo: parseInt(data[i].rollNo),
                  studentID: data[i].studentID,
                  classID: values.section.classID,
                  semester: data[i].semester,
                }
              : {
                  enrollNo: data[i].enrollNo,
                  rollNo: parseInt(data[i].rollNo),
                  studentID: data[i].studentID,
                  classID: values.section.classID,
                }
          );
        }
      }
      console.log("studentList---", studentList);
      setLoad(false);
      if (studentList.length === 0) {
        setModalMessage("No Change in Roll Number");
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      const studentDetailRes = await StudentApi.updateUniversityNumber({
        screenName: "roll_no",
        courseID: values?.course?.id,
        batchID: values?.batch?.batchID,
        classID: values?.section?.classID,
        institutionType: collegeConfig.institution_type,
        studentDetail: studentList,
      });
      console.log("studentDetailRes----", studentDetailRes);
      if (!studentDetailRes.data.message.success) {
        setModalMessage(studentDetailRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      toast.success(studentDetailRes.data.message.message);
    }
    setShowRes(false);
    setData([]);
  };

  const getAllList = async () => {
    try {
      const masterRes = await StudentApi.getMaster(5);
      console.log("Master----", masterRes);
      if (!masterRes.data.message.success) {
        setModalMessage(masterRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(masterRes.data.message.data.course_data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleBatchChange = async (values, batch) => {
    console.log("batch", batch);
    console.log("values", values);
    formikRef.current.setFieldTouched("batch", false);
    try {
      let batchRes;
      if (collegeConfig.institution_type === 1) {
        batchRes = await StudentApi.getMaster(
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
      } else {
        batchRes = await AcademicApi.getMasterSubjectStaff(
          collegeConfig.is_university ? values.college?.collegeID : collegeId,
          "subject",
          values.course.id,
          batch.batchID,
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
        batchRes.data.message.data.section.splice(0, 0, {
          classID: null,
          section: "All",
        });
        setSectionArr(batchRes.data.message.data.section);
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
          collegeConfig.is_university ? values.college?.collegeID : collegeId,
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

  const getMasterList = async (college_id) => {
    try {
      let masterList;
      if (collegeConfig.institution_type === 1) {
        masterList = await StudentApi.getMaster(8, college_id);
      } else {
        masterList = await StudentApi.getMaster(5, college_id);
      }
      console.log("masterList", masterList);
      if (!masterList?.data?.message?.success) {
        setModalMessage(masterList?.data?.message?.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(masterList?.data?.message?.data?.course_data);

      if (masterList?.data?.message?.data?.course_data.length === 1) {
        formikRef?.current?.setFieldValue(
          "course",
          masterList?.data?.message?.data?.course_data[0]
        );
        handleCourse(
          formikRef.current.values,
          masterList?.data?.message?.data?.course_data[0]
        );
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig?.is_university) {
      getMasterList(collegeId);
    } else if (collegeConfig?.collegeList.length === 1) {
      formikRef.current.setFieldValue("college", collegeConfig?.collegeList[0]);
      getMasterList(collegeConfig?.collegeList[0]?.collegeID);
    }
  }, [collegeConfig?.is_university]);

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
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              course: "",
              batch: "",
              section: {
                classID: null,
                section: "All",
              },
              updateType: 1,
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
                  <div className="col-lg-10">
                    {collegeConfig?.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={0}
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
                      autoFocus
                      label={RENAME?.course}
                      labelSize={3}
                      id="course"
                      tabIndex={1}
                      options={courseList}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.id}
                      matchFrom="start"
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
                      }}
                    />
                    <>
                      <SelectFieldFormik
                        label={RENAME?.batch}
                        labelSize={3}
                        tabIndex={2}
                        id="batch"
                        options={batchList}
                        maxlength={10}
                        getOptionLabel={(option) =>
                          collegeConfig.institution_type === 1
                            ? option.className
                            : option.batch
                        }
                        getOptionValue={(option) =>
                          collegeConfig.institution_type === 1
                            ? option.semester
                            : option.batchID
                        }
                        matchFrom="start"
                        mandatory={1}
                        style={{ width: "60%" }}
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
                        tabIndex={3}
                        maxlength={2}
                        id="section"
                        options={sectionArr}
                        getOptionLabel={(option) => option.section}
                        getOptionValue={(option) => option.classID}
                        style={{ width: "25%" }}
                        matchFrom="start"
                        onChange={(text) => {
                          setFieldValue("section", text);
                          setShowRes(false);
                        }}
                      />
                    </>
                  </div>
                  <div className="text-center mt-2 pt-1">
                    <Button
                      text="Show Roll No."
                      frmButton={false}
                      className={"btn me-2"}
                      tabIndex={4}
                      onClick={(e) => {
                        if (!values?.section?.classID) {
                          setFieldValue("section", sectionArr[1]);
                        }
                        preFunction.handleErrorFocus(errors);
                        setFieldValue("updateType", 3);
                        document.getElementById("rollNo0")?.focus();
                      }}
                    />

                    <Button
                      text={"Show " + RENAME?.section}
                      frmButton={false}
                      tabIndex={5}
                      className={"btn ms-2 me-2"}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                        document.getElementById("section0")?.focus();
                        setFieldValue("updateType", 2);
                      }}
                    />
                    <Button
                      text={"Show Registration No."}
                      frmButton={false}
                      tabIndex={6}
                      className={"btn ms-2 me-2"}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                        setFieldValue("updateType", 1);
                        document.getElementById("univNo0")?.focus();
                      }}
                    />
                  </div>
                  {showRes ? (
                    <div className="row no-gutters mt-4">
                      <table className="table table-bordered mb-4">
                        <thead>
                          <tr>
                            <th width="5%">No.</th>
                            <th width="10%">Student No.</th>
                            <th>Student Name</th>
                            {values.updateType === 3 ? (
                              <th width="10%">Roll No.</th>
                            ) : values.updateType === 2 ? (
                              <th width="15%">{RENAME?.section}</th>
                            ) : (
                              <th width="22%">Registration No.</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {data.length === 0 ? (
                            <tr>
                              <td colspan={9} align="center">
                                No data found
                              </td>
                            </tr>
                          ) : (
                            data.map((item, index) => {
                              return (
                                <tr>
                                  <td align="center">{index + 1}</td>
                                  <td>{item.enrollNo}</td>
                                  <td>{item.name}</td>
                                  {values.updateType === 3 ? (
                                    <td>
                                      <TextField
                                        id={"rollNo" + index}
                                        isAmount={true}
                                        value={item.rollNo ? item.rollNo : ""}
                                        maxLength={3}
                                        tabIndex={index + 8}
                                        onChange={(e) => {
                                          if (
                                            preFunction.amountValidation(
                                              e.target.value
                                            )
                                          ) {
                                            data[index].rollNo = e.target.value;
                                            data[
                                              index
                                            ].registrationNoError = false;
                                            for (
                                              let i = 0;
                                              i < data.length;
                                              i++
                                            ) {
                                              if (
                                                i !== index &&
                                                data[i].rollNo ===
                                                  e.target.value
                                              ) {
                                                data[
                                                  index
                                                ].registrationNoError = true;
                                                setData([...data]);
                                                return;
                                              }
                                            }

                                            setData([...data]);
                                          }
                                          handleUnSavedChanges(1);
                                        }}
                                        error={
                                          item.registrationNoError
                                            ? "Should be unique for all students"
                                            : ""
                                        }
                                        touched={
                                          item.registrationNoError
                                            ? true
                                            : false
                                        }
                                      />
                                    </td>
                                  ) : values.updateType === 2 ? (
                                    <td>
                                      <ReactSelectField
                                        placeholder={RENAME?.section}
                                        tabIndex={index + 8}
                                        id={"section" + index}
                                        value={
                                          item.section
                                            ? {
                                                label: item.section,
                                                value: item.section,
                                              }
                                            : null
                                        }
                                        clear={false}
                                        searchIcon={false}
                                        options={sectionList}
                                        maxlength={1}
                                        onChange={(text) => {
                                          data[index].section = text
                                            ? text.value
                                            : "";
                                          setData([...data]);
                                          handleUnSavedChanges(1);
                                        }}
                                      />
                                    </td>
                                  ) : (
                                    <td>
                                      <TextField
                                        id={"univNo" + index}
                                        value={
                                          item.registrationNo > 0
                                            ? item.registrationNo
                                            : ""
                                        }
                                        maxLength={15}
                                        tabIndex={index + 8}
                                        onChange={(e) => {
                                          if (
                                            preFunction.amountValidation(
                                              e.target.value
                                            )
                                          ) {
                                            data[index].registrationNo =
                                              e.target.value;
                                            data[
                                              index
                                            ].registrationNoError = false;
                                            for (
                                              let i = 0;
                                              i < data.length;
                                              i++
                                            ) {
                                              if (
                                                i !== index &&
                                                data[i].registrationNo ===
                                                  e.target.value
                                              ) {
                                                data[
                                                  index
                                                ].registrationNoError = true;
                                                setData([...data]);
                                                return;
                                              }
                                            }

                                            setData([...data]);
                                          }
                                          handleUnSavedChanges(1);
                                        }}
                                        error={
                                          item.registrationNoError
                                            ? "Should be unique for all students"
                                            : ""
                                        }
                                        touched={
                                          item.registrationNoError
                                            ? true
                                            : false
                                        }
                                      />
                                    </td>
                                  )}
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                      {data.length > 0 && (
                        <Button
                          type="button"
                          isTable="true"
                          tabIndex={data.length + 8}
                          onClick={(e) => {
                            handleSave(values);
                          }}
                          id="save"
                          text="F4 - Save"
                        />
                      )}
                    </div>
                  ) : null}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default UniversityNumberUpdate;
