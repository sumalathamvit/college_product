import React, { useEffect, useState, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Formik } from "formik";

import academicApi from "../../api/AcademicApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import ScreenTitle from "../../component/common/ScreenTitle";
import DisplayText from "../../component/FormField/DisplayText";
import $ from "jquery";
import AuthContext from "../../auth/context";
import string from "../../string";

function SubjectStudent() {
  const RENAME = useSelector((state) => state.web.rename);
  const { collegeId, role } = useContext(AuthContext);
  const [load, setLoad] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [semester, setSemester] = useState("");
  const [subjectList, setSubjectList] = useState([]);
  const [electiveList, setElectiveList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [showSubject, setShowSubject] = useState(false);
  const [studentNameList, setStudentNameList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [saveShow, setSaveShow] = useState(false);
  const [electiveMasterList, setElectiveMasterList] = useState([]);
  const [mainElectiveList, setMainElectiveList] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);

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
    electives: $("#electives").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#electives").attr("alt") ?? "Electives"}`
        ),
  });

  const formikRef = useRef();
  let tabIndex = 4;

  const handleAllocate = async () => {
    try {
      setLoad(true);

      const assignCommonSubjectStudentRes =
        await academicApi.assignStudentCommonSubjects(
          formikRef.current.values.section.classID
        );
      console.log(
        "assignCommonSubjectStudentRes---",
        assignCommonSubjectStudentRes
      );
      // return;
      if (assignCommonSubjectStudentRes.data.message.success) {
        toast.success(assignCommonSubjectStudentRes.data.message.message);
      } else {
        setModalTitle("Message");
        setModalMessage(assignCommonSubjectStudentRes.data.message.message);
        setModalErrorOpen(true);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const checkAll = (value) => {
    if (value.target.checked) {
      studentNameList.forEach((item) => {
        item.isAssigned = true;
      });
      setStudentNameList([...studentNameList]);
    } else {
      studentNameList.forEach((item) => {
        item.isAssigned = false;
      });
      setStudentNameList([...studentNameList]);
    }
  };

  const getSubjectStaff = async (course, semester) => {
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("electives", "");
    console.log("semester---", course, semester);
    setShowSubject(false);
    setSubjectList([]);
    setSectionList([]);
    setElectiveList([]);
    if (semester) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "subject",
            course.courseID,
            semester.batchID,
            semester.semester
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSectionList(getMasterSubjectStaffRes.data.message.data.section);
        console.log(course.courseID, semester.id, semester, "checking values");
        // return;
        const getBatchSubjectRes = await academicApi.getallSubjectwithCourse(
          course.courseID,
          semester.batchID,
          semester.semester,
          semester.batch,
          semester.regulation
        );
        console.log("Response---", getBatchSubjectRes.data.message.data);

        // setOldSubjectArr(getBatchSubjectRes.data.message.data);
        setSubjectList(getBatchSubjectRes.data.message.data.subjects);
        const electiveSubjects =
          getBatchSubjectRes.data.message.data.subjects.filter(
            (item) => item.isMandatory === 0
          );
        setElectiveList(electiveSubjects);
        setMainElectiveList(electiveSubjects);

        setElectiveMasterList(
          Array.from({ length: electiveSubjects.length }, (v, k) => ({
            id: k + 1,
            name: `Elective ${k + 1}`,
          }))
        );

        console.log("electiveSubjects---", electiveSubjects);

        // setEmployeeList(getMasterSubjectStaffRes.data.message.data.staff);
        //
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getSemester = async (course) => {
    formikRef.current.setFieldTouched("course", false);
    formikRef.current.setFieldValue("semester", "");
    formikRef.current.setFieldValue("section", "");
    formikRef.current.setFieldValue("subject", "");
    formikRef.current.setFieldValue("electives", "");
    console.log("text---", course);
    setSemesterList([]);
    setSemester("");
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
        // setSemesterList(getMasterSubjectStaffRes.data.message.data.semester);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getInitialList = async (collegeId) => {
    formikRef.current.setFieldTouched("electives", false);
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("section", false);
    try {
      const getMasterSubjectStaffRes = await academicApi.getMasterSubjectStaff(
        collegeId,
        "course"
      );
      // console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowAllocation = async (values) => {
    if (load) return;
    try {
      setLoad(true);
      const getStaffSubjectRes = await academicApi.getStudentSubject(
        values.section.classID
          ? values.section.classID
          : formikRef.current.values.section.classID
      );
      console.log("getStaffSubjectRes---", getStaffSubjectRes);
      setStudentNameList(getStaffSubjectRes.data.message.data.students);

      let electiveSubjects = [];

      getStaffSubjectRes.data.message.data.students.forEach((item) => {
        console.log(item, "item---");

        // i need subjects for each student with different electiveGroupNo
        item.student_subjects.forEach((obj) =>
          obj.electiveGroupNo !== formikRef.current.values.electives.id
            ? (electiveSubjects.push(obj), console.log(obj, "obj---"))
            : null
        );
      });

      console.log("electiveSubjects---", electiveSubjects);

      // filter electiveList  with electiveSubjects subjectID
      const electiveList1 = mainElectiveList.filter(
        (ele) =>
          !electiveSubjects.find(
            (subject) => subject.subjectID === ele.subjectID
          )
      );

      setElectiveList(electiveList1);

      setShowSubject(true);
      setLoad(false);
      formikRef.current.setFieldTouched("course", false);
      formikRef.current.setFieldTouched("semester", false);
      formikRef.current.setFieldTouched("section", false);
      formikRef.current.setFieldTouched("electives", false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleElectiveAllocate = async () => {
    if (load) return;
    console.log(studentNameList, "checking Student details");
    setSaveShow(false);
    if (
      electiveMasterList.length > 0 &&
      studentNameList.some((item) => !item.subject && !item.initialSubject)
    ) {
      setModalTitle("Subject Allocation");
      setModalMessage("Please select all subjects for students");
      setModalErrorOpen(true);
      return;
    }

    const studentDetails = formikRef.current.values.electives.id
      ? studentNameList.map((obj) => {
          return {
            studentID: obj.studentID,
            studentSubjectID: obj.initialSubject
              ? obj.initialSubject.studentSubjectID
              : null,
            subjectID: obj.subject
              ? obj.subject.subjectID
              : obj.initialSubject.subjectID,
            toChange:
              obj.initialSubject && obj.initialSubject.studentSubjectID ? 1 : 0,
          };
        })
      : null;

    console.log(
      formikRef.current.values.section.classID,
      formikRef.current.values.semester.semester,
      formikRef.current.values.electives.subjectID
        ? formikRef.current.values.electives.subjectID
        : null,
      formikRef.current.values.electives.id ? studentDetails : null,
      formikRef.current.values.electives.id,
      formikRef.current.values.electives.name,
      "checking Student details"
    );
    try {
      setLoad(true);

      const assignStudentElectivesRes =
        await academicApi.assignStudentElectiveSubjects(
          formikRef.current.values.section.classID,
          formikRef.current.values.semester.semester,
          formikRef.current.values.electives.id ? studentDetails : null,
          formikRef.current.values.electives.id,
          formikRef.current.values.electives.name
        );
      console.log("assignStudentElectivesRes---", assignStudentElectivesRes);
      if (assignStudentElectivesRes.data.message.success) {
        toast.success(assignStudentElectivesRes.data.message.message);
        setStudentNameList([]);
        formikRef.current.resetForm();
        setShowSubject(false);
        // handleShowAllocation(formikRef.current.values);
      } else {
        setModalTitle("Message");
        setModalMessage(assignStudentElectivesRes.data.message.message);
        setModalErrorOpen(true);
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
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
        <div className="row no-gutters">
          {/* <div className="p-0 mb-2 text-right">
            <Button
              text={"Update Common Subjects"}
              className={"btn-green"}
              type="button"
              frmButton={false}
              isTable={true}
              onClick={(e) => {
                if (
                  formikRef.current.values.course &&
                  formikRef.current.values.semester
                ) {
                  setOpenModal(true);
                } else {
                  setModalTitle("Credentials");
                  setModalMessage("Please assign Credentials");
                  setModalErrorOpen(true);
                }
              }}
            />
          </div> */}
        </div>
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              course: null,
              semester: null,
              section: null,
              semester: null,
              electives: null,
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
                        getSemester(text);
                        setSemester("");
                        setSaveShow(false);
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
                          getSubjectStaff(values?.course, text);
                          setSemester(text?.semester);
                          setSaveShow(false);
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
                            setSaveShow(true);
                          }}
                        />
                        {values.section ? (
                          <>
                            <div className="row">
                              <div className="subhead-row p-0">
                                <div className="subhead">Subject Details</div>
                                <div className="col line-div"></div>
                              </div>
                              <div className="row no-gutters mt-2">
                                <table className="table table-bordered">
                                  <thead>
                                    <tr>
                                      <th width="50%">Subject Name</th>
                                      <th width="30%">Subject Type</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {subjectList.map((item, index) => {
                                      if (item.isMandatory === 1) {
                                        return (
                                          <tr key={index}>
                                            <td>{item.subjectName}</td>
                                            <td>{item.subjectType}</td>
                                          </tr>
                                        );
                                      } else {
                                        return null; // Skip rendering this row if Ismandatory is not 0
                                      }
                                    })}
                                    {
                                      // subjectList  no have isMandatory subject then show no common subjects
                                      subjectList.filter(
                                        (item) => item.isMandatory === 1
                                      ).length === 0 ? (
                                        <tr>
                                          <td
                                            colSpan="2"
                                            className="text-center"
                                          >
                                            No Common Subjects
                                          </td>
                                        </tr>
                                      ) : null
                                    }
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            {electiveMasterList.length > 0 ? (
                              <>
                                <div className="subhead-row p-0">
                                  <div className="subhead">
                                    Elective Details
                                  </div>
                                  <div className="col line-div"></div>
                                </div>

                                <SelectFieldFormik
                                  tabIndex={4}
                                  // label="Electives"
                                  id="electives"
                                  mandatory={1}
                                  labelSize={0}
                                  getOptionLabel={(option) => option.name}
                                  getOptionValue={(option) => option.id}
                                  options={electiveMasterList}
                                  style={{ width: "30%" }}
                                  placeholder={"Select Elective"}
                                  onChange={(text) => {
                                    setShowSubject(false);
                                    setFieldValue("electives", text);
                                  }}
                                />
                                <div class="mt-4">
                                  <Button
                                    tabIndex={5}
                                    isTable={true}
                                    text={"Show"}
                                    onClick={(e) => {
                                      preFunction.handleErrorFocus(errors);
                                    }}
                                  />
                                </div>
                              </>
                            ) : null}
                          </>
                        ) : null}
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
                {/* <div className="subhead-row p-0">
                  <div className="subhead">Subject Allocation Details</div>
                  <div className="col line-div"></div>
                </div> */}
                <div className="row no-gutters mt-2">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Student No.</th>
                        <th width="50%">Student Name</th>
                        <th width="40%">Electives</th>
                      </tr>
                    </thead>
                    {showSubject && studentNameList.length == 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan="10" className="text-center ">
                            No Students found
                          </td>
                        </tr>
                      </tbody>
                    ) : null}
                    <tbody>
                      {studentNameList.map((item, index) => {
                        tabIndex = tabIndex + 1;
                        item.initialSubject = item.student_subjects.find(
                          (subject) =>
                            subject.electiveGroupNo ===
                            formikRef.current.values.electives.id
                        );

                        return (
                          <tr>
                            <td>{item.enrollNo}</td>
                            <td>{item.name}</td>
                            <td>
                              <ReactSelectField
                                // id="staff"
                                tabIndex={tabIndex}
                                placeholder={"Subject"}
                                mandatory={1}
                                getOptionLabel={(option) => option.subjectName}
                                getOptionValue={(option) => option.subjectID}
                                options={electiveList}
                                searchIcon={false}
                                value={
                                  item.subject
                                    ? {
                                        subjectID: item.subject.subjectID,
                                        subjectName: item.subject.subjectName,
                                      }
                                    : item.student_subjects.find(
                                        (subject) =>
                                          subject.electiveGroupNo ===
                                          formikRef.current.values.electives.id
                                      )
                                }
                                onChange={(text) => {
                                  console.log(text.subjectID, "checking text");
                                  item.subject = text;
                                  setStudentNameList([...studentNameList]);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {(showSubject && studentNameList.length > 0) ||
          (electiveMasterList.length === 0 &&
            subjectList.length > 0 &&
            saveShow) ? (
            <>
              <Button
                id="save"
                tabIndex={tabIndex + 1}
                text="F4 - Save"
                onClick={() => {
                  handleElectiveAllocate();
                }}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default SubjectStudent;
