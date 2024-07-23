import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";
import AcademicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";

import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";

import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import AuthContext from "../../auth/context";
import { useSelector } from "react-redux";
import $ from "jquery";

function StudentNameList() {
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [sectionArr, setSectionArr] = useState([]);
  const [changed, setChanged] = useState(false);
  const formikRef = useRef();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const collegeConfig = useSelector((state) => state?.web?.college);
  const RENAME = useSelector((state) => state?.web?.rename);
  const { collegeId, collegeName } = useContext(AuthContext);

  const formSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.object().nullable(),
    course: $("#course").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#course").attr("alt") ?? RENAME?.course}`
        ),
    batch: $("#batch").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#batch").attr("alt") ?? RENAME?.batch}`
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

  const handleShow = async (values) => {
    if (load) return;
    if (!changed) return;
    console.log("Values-----", values, data);
    setChanged(false);
    try {
      setLoad(true);
      const studentDetailRes = await StudentApi.getStudentNameList(
        values?.course?.id,
        values?.batch?.batchID,
        collegeConfig.institution_type === 1
          ? values?.semester?.semester
          : values?.batch?.semester,
        values?.section?.classID,
        collegeConfig?.institution_type
      );
      console.log("studentDetailRes----", studentDetailRes);
      if (!studentDetailRes?.data?.message?.success) {
        setModalMessage(studentDetailRes?.data?.message?.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      setData(studentDetailRes?.data?.message?.data?.student_list);
      setShowRes(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async (college_id) => {
    try {
      const masterRes = await StudentApi.getMaster(5, college_id);
      console.log("Master----", masterRes);
      if (!masterRes.data.message.success) {
        setModalMessage(masterRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(masterRes.data.message.data.course_data);
      if (masterRes.data.message.data.course_data.length === 1) {
        formikRef.current.setFieldValue(
          "course",
          masterRes.data.message.data.course_data[0]
        );
        handleCourseChange(masterRes.data.message.data.course_data[0]);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleBatchChange = async (values, batch) => {
    formikRef.current.setFieldTouched("batch", false);
    try {
      if (values) {
        let batchRes;
        if (collegeConfig.institution_type === 1) {
          batchRes = await StudentApi.getMaster(
            8,
            collegeId,
            values.course.id,
            batch.semester
          );
        } else {
          batchRes = await AcademicApi.getMasterSubjectStaff(
            collegeConfig.is_university ? values.college.collegeID : collegeId,
            "subject",
            values.course.id,
            batch.batchID,
            batch.semester
          );
        }
        console.log("batchRes", batchRes);
        if (!batchRes.data.message.success) {
          setModalMessage(batchRes.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          return;
        }
        if (collegeConfig.institution_type === 1)
          setSectionArr(batchRes.data.message.data.class_data);
        else setSectionArr(batchRes.data.message.data.section);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleCourseChange = async (course) => {
    try {
      console.log("values", course);
      formikRef.current.setFieldValue("batch", null);
      formikRef.current.setFieldValue("semester", null);
      formikRef.current.setFieldTouched("course", false);
      formikRef.current.setFieldTouched("batch", false);
      formikRef.current.setFieldTouched("semester", false);

      if (course) {
        let getMasterSubjectStaffRes = await AcademicApi.getMasterSubjectStaff(
          collegeConfig.is_university
            ? formikRef.current.values.college.collegeID
            : collegeId,
          "batch",
          course.id
        );

        console.log("getMasterSubjectStaffRes", getMasterSubjectStaffRes);
        if (!getMasterSubjectStaffRes.data.message.success) {
          setModalMessage(getMasterSubjectStaffRes.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          return;
        }
        if (collegeConfig.institution_type === 1)
          setSemesterList(getMasterSubjectStaffRes.data.message.data.batch);
        else setBatchList(getMasterSubjectStaffRes.data.message.data.batch);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
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
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: "",
              course: "",
              batch: "",
              semester: "",
              section: "",
              updateType: 1,
            }}
            validationSchema={formSchema}
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
                    {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        labelSize={3}
                        clear={false}
                        mandatory={1}
                        label="College"
                        id="college"
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        searchIcon={false}
                        onChange={(text) => {
                          setShowRes(false);
                          setFieldValue("college", text);
                          getAllList(text?.collegeID);
                          setChanged(true);
                        }}
                      />
                    )}
                    {courseList.length > 1 && (
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
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
                          setShowRes(false);
                          handleCourseChange(text);
                          setChanged(true);
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      label={RENAME?.batch}
                      labelSize={3}
                      tabIndex={2}
                      id="batch"
                      options={batchList}
                      maxlength={10}
                      getOptionLabel={(option) => option.batch}
                      getOptionValue={(option) => option.batchID}
                      matchFrom="start"
                      mandatory={1}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("batch", text);
                        setFieldValue("section", "");
                        setSectionArr([]);
                        setShowRes(false);
                        handleBatchChange(values, text);
                        setChanged(true);
                      }}
                    />
                    <SelectFieldFormik
                      label={RENAME?.sem}
                      labelSize={3}
                      tabIndex={2}
                      id="semester"
                      options={semesterList}
                      maxlength={10}
                      getOptionLabel={(option) => option.className}
                      getOptionValue={(option) => option.semester}
                      matchFrom="start"
                      mandatory={1}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("semester", text);
                        setFieldValue("section", "");
                        setSectionArr([]);
                        setShowRes(false);
                        handleBatchChange(values, text);
                        setChanged(true);
                      }}
                    />
                    <SelectFieldFormik
                      label={RENAME?.section}
                      labelSize={3}
                      tabIndex={3}
                      maxlength={2}
                      mandatory={1}
                      clear={false}
                      id="section"
                      options={sectionArr}
                      getOptionLabel={(option) => option.section}
                      getOptionValue={(option) => option.classID}
                      style={{ width: "40%" }}
                      matchFrom="start"
                      onChange={(text) => {
                        setFieldValue("section", text);
                        setShowRes(false);
                        setChanged(true);
                      }}
                    />
                  </div>
                  <Button
                    text="Show"
                    tabIndex={4}
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />

                  {showRes ? (
                    <div className="row no-gutters mt-4">
                      <table className="table table-bordered mb-4">
                        <thead>
                          <tr>
                            <th width="10%">Roll No.</th>
                            {collegeConfig.institution_type !== 1 && (
                              <th width="20%">Registration No.</th>
                            )}
                            <th>Student Name</th>
                            <th width="10%">Section</th>
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
                                  <td>{item.rollNo > 0 ? item.rollNo : ""}</td>
                                  {collegeConfig.institution_type !== 1 && (
                                    <td>
                                      {item.registrationNo > 0
                                        ? item.registrationNo
                                        : ""}
                                    </td>
                                  )}
                                  <td>{item.name}</td>
                                  <td>{item.section}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
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

export default StudentNameList;
