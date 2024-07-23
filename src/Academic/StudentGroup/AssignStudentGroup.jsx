import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DateRangeIcon from "@mui/icons-material/DateRange";
import moment from "moment";
import { toast } from "react-toastify";
import * as Yup from "yup";
import academicApi from "../../api/AcademicApi";
import { useSelector } from "react-redux";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import { Formik } from "formik";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DisplayText from "../../component/FormField/DisplayText";
import ModalComponent from "../../component/ModalComponent";
import AuthContext from "../../auth/context";
import { Modal } from "react-bootstrap";
import $ from "jquery";

import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import ScreenTitle from "../../component/common/ScreenTitle";

const addGroupSchema = Yup.object().shape({
  groupName: Yup.object().required("Please enter Group Name"),
  groupValidity: Yup.date().required("Please select To Date"),
});

function AssignStudentGroup() {
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [checkedStudents, setCheckedStudents] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [addMasterModal, setAddMasterModal] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState();
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const { collegeId, setUnSavedChanges } = useContext(AuthContext);
  const [allGroupList, setAllGroupList] = useState([]);
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
    subject: $("#subject").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#subject").attr("alt") ?? "Subject"}`
        ),
  });

  let tabIndex = 7;
  let finalTabIndex = 7;

  const getGroupList = async () => {
    try {
      const getGroupListRes = await academicApi.getGroupMaster();
      console.log("getGroupListRes---", getGroupListRes);
      setAllGroupList(getGroupListRes.data.message.data.group_master);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    if (load) return;
    console.log("data", data);

    setUnSavedChanges(false);

    try {
      setLoad(true);
      console.log("data", data);

      const allTrue = data.every((obj) => obj.groupName);
      if (!allTrue) {
        setModalErrorOpen(true);
        setModalTitle("Group");
        setModalMessage("Please select Group for all Students");
        setLoad(false);
        return;
      }

      const studentDetails = data.map((obj) => {
        return {
          studentID: obj.studentID,
          groupXClassDetailID: obj.groupXClassDetailID,
          groupName: obj.groupName,
          groupXClassID: obj.groupXClassID,
        };
      });

      handleStudent(studentDetails);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleStudent = async (students) => {
    try {
      setLoad(true);
      console.log(
        "students",

        formikRef.current.values.section.classID,
        formikRef.current.values.subject.subjectID,
        students
      );
      if (students.length > 0) {
        const createStudentGroupDetail =
          await academicApi.createStudentGroupDetail(
            students,
            formikRef.current.values.section.classID,
            formikRef.current.values.subject.subjectID
          );
        console.log("createStudentGroupDetail--->", createStudentGroupDetail);

        if (createStudentGroupDetail.data.message.success) {
          toast.success(createStudentGroupDetail.data.message.message);
          setData([]);
          setCheckedStudents([]);
          setSelectedGroup();
          setShowRes(false);
        } else {
          setModalErrorOpen(true);
          setModalTitle("Message");
          setModalMessage(createStudentGroupDetail.data.message);
        }
      }
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const checkAll = (value) => {
    for (let i = 0; i < data.length; i++) {
      // if (
      //   value == true &&
      //   (data[i].inOtherGroup == selectedGroup.groupName ||
      //     !data[i].inOtherGroup)
      // ) {
      //   data[i].inGroup = 1;
      // } else {
      //   data[i].inGroup = 0;
      // }
      if (value) {
        data[i].inGroup = 1;
      } else {
        data[i].inGroup = 0;
      }
    }
    setData([...data]);
  };

  const getStudentDetail = async (values) => {
    setUnSavedChanges(false);
    setSelectedGroup();
    try {
      setLoad(true);
      setCheckedStudents([]);
      console.log(values, "values");

      const getStudentGroupDetail = await academicApi.getStudentGroupDetail(
        values.section.classID,
        values.subject.subjectID
        // values.group.groupID,
      );
      console.log("getStudentGroupDetail----", getStudentGroupDetail);
      // return;

      // set default ingroup value 0 in getStudentGroupDetail.data.message.data.group_detail
      for (
        let i = 0;
        i < getStudentGroupDetail.data.message.data.group_detail.length;
        i++
      ) {
        getStudentGroupDetail.data.message.data.group_detail[i].inGroup = 0;
      }
      setData(getStudentGroupDetail.data.message.data.group_detail);

      // let checkedStudents = [];
      // for (
      //   let i = 0;
      //   i < getStudentGroupDetail.data.message.data.group_detail.length;
      //   i++
      // ) {
      //   if (
      //     getStudentGroupDetail.data.message.data.group_detail[i].inGroup === 1
      //   ) {
      //     let obj = {
      //       studentID:
      //         getStudentGroupDetail.data.message.data.group_detail[i].studentID,
      //     };
      //     checkedStudents.push(obj);
      //   }
      // }
      // console.log("checkedStudents", checkedStudents);
      // setCheckedStudents(checkedStudents);
      setShowRes(true);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };
  const handleShow = async (classID, subjectID) => {
    setGroupList([]);
    console.log("classID-subjectID---", classID, subjectID);
    try {
      const getStudentGroup = await academicApi.getStudentGroup(
        classID,
        subjectID
      );
      console.log("getStudentGroup---", getStudentGroup);
      setGroupList(getStudentGroup.data.message.data.group);
    } catch (error) {
      console.log(error);
    }
  };

  const getSectionMaster = async (course, text) => {
    console.log("text---", course, text);
    setSectionList([]);
    setSubjectList([]);
    if (text) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "subject",
            course,
            text.batchID,
            text.semester,
            0
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSectionList(getMasterSubjectStaffRes.data.message.data.section);
        if (getMasterSubjectStaffRes.data.message.data.subject.length === 0) {
          setModalMessage("No Practical Subject for this course");
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
        setSubjectList(getMasterSubjectStaffRes.data.message.data.subject);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getSemester = async (text) => {
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("section", false);
    formikRef.current.setFieldTouched("semester", false);
    formikRef.current.setFieldTouched("subject", false);
    console.log("text---", text);
    setSemesterList([]);
    if (text) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeId,
            "batch",
            text.courseID,
            null,
            null,
            null
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSemesterList(getMasterSubjectStaffRes.data.message.data.batch);
      } catch (error) {
        setLoad(false);
        console.log(error);
      }
    }
  };
  const getInitialList = async () => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getMasterSubjectStaff(
        collegeId,
        "course",
        1
      );
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleAddGroup = async (values) => {
    if (load) return;
    // console.log("values", values);
    try {
      setLoad(true);
      const createStudentGroupRes = await academicApi.createStudentGroup(
        values.groupName.groupID,
        values.groupName.groupName,
        formikRef.current.values.section.classID,
        formikRef.current.values.subject.subjectID,
        moment(values.groupValidity).format("YYYY-MM-DD")
      );
      console.log("createStudentGroupRes--->", createStudentGroupRes);
      if (createStudentGroupRes.data.message.success == false) {
        setModalTitle("Message");
        setModalMessage(createStudentGroupRes.data.message.message);
        setModalErrorOpen(true);
        setAddMasterModal(false);
        setLoad(false);
        return;
      }
      toast.success(createStudentGroupRes.data.message.message);
      values.groupName = "";
      values.groupValidity = "";
      setAddMasterModal(false);
      handleShow(
        formikRef.current.values.section.classID,
        formikRef.current.values.subject.subjectID
      );
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getInitialList();
    getGroupList();
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
          <div className="row ">
            <div className="col-lg-12 text-right">
              <Button
                frmButton={false}
                text={"Add Group"}
                className={"btn-green"}
                type="button"
                isTable={true}
                onClick={(e) => {
                  if (
                    formikRef.current.values.section.classID &&
                    formikRef.current.values.subject.subjectID
                  ) {
                    setAddMasterModal(true);
                  } else {
                    setModalErrorOpen(true);
                    setModalTitle("Message");
                    setModalMessage(
                      "Please select " + RENAME?.section + " and Subject"
                    );
                  }
                }}
              />
            </div>
          </div>
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              course: "",
              semester: "",
              section: "",
              semester: "",
              subject: "",
              group: "",
            }}
            validationSchema={FormSchema}
            onSubmit={getStudentDetail}
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
                  <div className="row p-0">
                    <div className="col-lg-12">
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label={RENAME?.course}
                        id="course"
                        mandatory={1}
                        labelSize={3}
                        options={courseList}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.courseID}
                        searchIcon={false}
                        clear={false}
                        style={{ width: "65%" }}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setFieldValue("semester", "");
                          setFieldValue("year", "");
                          setFieldValue("section", "");
                          setFieldValue("subject", "");
                          setSelectedGroup();
                          getSemester(text);
                          setFieldTouched("course", false);
                          setSectionList([]);
                          setSubjectList([]);

                          setShowRes(false);
                        }}
                      />

                      <>
                        <SelectFieldFormik
                          tabIndex={2}
                          label={RENAME?.sem}
                          id="semester"
                          mandatory={1}
                          maxlength={10}
                          labelSize={3}
                          options={semesterList}
                          getOptionLabel={(option) => option.className}
                          getOptionValue={(option) => option.semester}
                          style={{ width: "30%" }}
                          onChange={(text) => {
                            console.log("text", text);
                            setFieldValue("semester", text);
                            setFieldValue("year", "");
                            setFieldValue("section", "");
                            setFieldValue("subject", "");
                            setSelectedGroup();
                            setShowRes(false);
                            setFieldTouched("semester", false);
                            getSectionMaster(values.course.courseID, text);
                          }}
                        />
                        <>
                          <SelectFieldFormik
                            tabIndex={3}
                            label={RENAME?.section}
                            id="section"
                            mandatory={1}
                            maxlength={1}
                            labelSize={3}
                            options={sectionList}
                            getOptionLabel={(option) => option.section}
                            getOptionValue={(option) => option.classID}
                            style={{ width: "20%" }}
                            onChange={(text) => {
                              setFieldValue("section", text);
                              setFieldValue("subject", "");
                              setFieldTouched("section", false);
                              setSelectedGroup();
                              setShowRes(false);
                            }}
                          />
                          <SelectFieldFormik
                            tabIndex={4}
                            label="Subject"
                            id="subject"
                            mandatory={1}
                            labelSize={3}
                            options={subjectList}
                            getOptionLabel={(option) => option.subjectName}
                            getOptionValue={(option) => option.subjectID}
                            style={{ width: "65%" }}
                            onChange={(text) => {
                              setFieldValue("subject", text);
                              setSelectedGroup();
                              setGroupList([]);
                              setShowRes(false);
                              handleShow(
                                values.section.classID,
                                text.subjectID
                              );
                            }}
                          />
                        </>
                      </>
                    </div>
                  </div>

                  {showRes ? null : (
                    <Button
                      tabIndex={6}
                      text={"Show"}
                      type="submit"
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

        {showRes ? (
          <div className="row no-gutters mt-2">
            <div className="row p-0">
              <div className="subhead-row p-0">
                <div className="subhead">Student Details</div>
                <div className="col line-div"></div>
              </div>
              <div className=" mt-1">
                <table className="table m-0 table-bordered">
                  <thead>
                    <tr>
                      <th width="1%">Roll No</th>
                      <th width="30%">Registration Number</th>
                      <th>Student Name</th>
                      <th width="15%"> Group</th>
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
                        tabIndex = tabIndex + 1;
                        finalTabIndex = tabIndex + 1;
                        return (
                          <tr key={index}>
                            <td>{item.rollNo}</td>
                            <td>{item.registrationNo}</td>
                            <td>{item.studentName}</td>
                            <td>
                              <ReactSelectField
                                tabIndex={tabIndex}
                                placeholder="Select"
                                id={"group"}
                                clear={false}
                                searchIcon={false}
                                options={groupList}
                                value={{
                                  groupName: item.groupName,
                                  groupXClassID: item.groupXClassID,
                                }}
                                getOptionLabel={(option) => option.groupName}
                                getOptionValue={(option) =>
                                  option.groupXClassID
                                }
                                onChange={(text) => {
                                  console.log("text", text);
                                  item.groupName = text.groupName;
                                  item.groupXClassID = text.groupXClassID;

                                  setData([...data]);
                                  console.log("data", data[index]);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-center">
                <Button
                  tabIndex={finalTabIndex}
                  text={"F4 - Save"}
                  id="save"
                  type="submit"
                  onClick={(e) => {
                    handleSave();
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}
        <Modal
          show={addMasterModal}
          dialogClassName="my-modal"
          onEscapeKeyDown={() => setAddMasterModal(false)}
        >
          <Formik
            enableReinitialize={true}
            initialValues={{
              groupName: "",
              groupValidity: "",
            }}
            validationSchema={addGroupSchema}
            onSubmit={handleAddGroup}
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
              // console.log(errors, "--------errors");
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <Modal.Header>
                    <Modal.Title>{"Add Group"}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="row px-5">
                      <div className="row no-gutters">
                        <SelectFieldFormik
                          tabIndex={1}
                          label="Group Name"
                          id="groupName"
                          mandatory={1}
                          maxlength={10}
                          options={allGroupList}
                          getOptionLabel={(option) => option.groupName}
                          getOptionValue={(option) => option.groupName}
                          style={{ width: "90%" }}
                          onChange={(text) => {
                            setFieldValue("groupName", text);
                          }}
                        />
                        <DateFieldFormik
                          tabIndex={2}
                          label="Group Validity"
                          id="groupValidity"
                          maxDate={new Date(moment().add(10, "years"))}
                          minDate={new Date()}
                          mandatory={1}
                          style={{ width: "50%" }}
                          onChange={(e) => {
                            setFieldValue("groupValidity", e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="row ">
                      <div className="col-lg-6 d-flex justify-content-end">
                        <Button
                          tabIndex={3}
                          isTable={true}
                          text="Save"
                          onClick={() => preFunction.handleErrorFocus(errors)}
                        />
                      </div>
                      <div className="col-lg-6 d-flex justify-content-start p-0">
                        <Button
                          tabIndex={4}
                          isTable={true}
                          text="Close"
                          type="button"
                          onClick={(e) => {
                            setAddMasterModal(false);
                          }}
                        />
                      </div>
                    </div>
                  </Modal.Footer>
                </form>
              );
            }}
          </Formik>
        </Modal>
      </div>
    </div>
  );
}

export default AssignStudentGroup;
