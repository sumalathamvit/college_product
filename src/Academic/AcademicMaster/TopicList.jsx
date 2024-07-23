import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import { Modal } from "react-bootstrap";
import $ from "jquery";
import { toast } from "react-toastify";

import academicApi from "../../api/AcademicApi";

import AuthContext from "../../auth/context";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import { subjectUnitList } from "../../component/common/CommonArray";
import TextField from "../../component/FormField/TextField";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";

function TopicList() {
  const RENAME = useSelector((state) => state.web.rename);
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [showList, setShowList] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [data, setData] = useState([]);

  const [updateTopicArr, setUpdateTopicArr] = useState([]);
  const [changeUnit, setChangeUnit] = useState("");
  const [changeTopic, setChangeTopic] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [unitError, setUnitError] = useState(false);
  const [topicError, setTopicError] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [change, setChange] = useState(false);
  const formikRef = useRef();
  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
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
    subject: $("#subject").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#subject").attr("alt") ?? "Subject"}`
        ),
    unit: $("#unit").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#unit").attr("alt") ?? "Unit"}`
        ),
  });

  const handleUpdateTopic = async () => {
    if (load) return;
    setChange(false);
    let err = false;
    if (changeTopic == "") {
      setTopicError(true);
      err = true;
    }
    if (changeUnit == "") {
      setUnitError(true);
      err = true;
    }
    if (err) return;

    console.log("updateTopicArr", updateTopicArr);
    try {
      setLoad(true);
      console.log(
        "checking--->",
        updateTopicArr.subjectID,
        updateTopicArr.unit,
        changeTopic,
        updateTopicArr.topicID
      );

      const updateTopicDetail = await academicApi.uploadTopic(
        updateTopicArr.subjectID,
        updateTopicArr.unit ? updateTopicArr.unit : changeUnit.unit,
        changeTopic,
        updateTopicArr.topicID
      );
      console.log("updateTopicDetail", updateTopicDetail);
      if (!updateTopicDetail.data.message.success) {
        setModalErrorOpen(true);
        setModalTitle("Message");
        setModalMessage(updateTopicDetail.data.message.message);
        setLoad(false);
        return;
      } else {
        toast.success(updateTopicDetail.data.message.message);
        setOpenModal(false);
        handleShowTopic(formikRef.current.values);
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const handleShowTopic = async (values) => {
    if (load) return;
    formikRef.current.setFieldTouched("subject", false);

    try {
      setLoad(true);
      console.log("values---", values);
      const getTopicsListRes = await academicApi.getAllTopicList(
        values.subject.subjectID,
        values.unit.unit != "All" ? values.unit.unit : null
      );
      console.log("getTopicListRes--", getTopicsListRes);
      setShowList(true);
      setData(getTopicsListRes.data.message.data.topics);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const getSubjectStaff = async (course, semester) => {
    formikRef.current.setFieldTouched("semester", false);
    console.log("semester----", course, semester);
    setSubjectList([]);
    if (semester) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
            "subject",
            course.courseID,
            semester.batchID,
            semester.semester
          );
        console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
        setSubjectList(getMasterSubjectStaffRes.data.message.data.subject);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getSemesterMaster = async (text) => {
    console.log("text---", text);
    setSemesterList([]);
    if (text) {
      try {
        const getMasterSubjectStaffRes =
          await academicApi.getMasterSubjectStaff(
            collegeConfig.is_university
              ? formikRef.current.values.college.collegeID
              : collegeId,
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

  const getCourseList = async (value) => {
    try {
      const getMasterSubjectStaffRes = await academicApi.getCourseList(value);
      console.log("getMasterSubjectStaffRes---", getMasterSubjectStaffRes);
      if (!getMasterSubjectStaffRes.data.message.success) {
        setModalMessage(getMasterSubjectStaffRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setCourseList(getMasterSubjectStaffRes.data.message.data.course);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getCourseList(collegeId);
    }
    console.log("testformik", formikRef?.current?.values);
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
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: "",
              course: "",
              semester: "",
              subject: "",
              unit: "",
            }}
            validationSchema={FormSchema}
            onSubmit={handleShowTopic}
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
                  <div className="col-lg-9">
                    {collegeConfig.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="College"
                        // labelSize={3}
                        id="college"
                        mandatory={1}
                        style={{ width: "90%" }}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setFieldTouched("college", false);
                          setFieldValue("course", "");
                          setFieldValue("semester", "");
                          setFieldValue("subject", "");
                          setShowList(false);
                          getSemesterMaster(text);
                          setFieldValue("unit", {
                            unit: "All",
                          });
                          getCourseList(text.collegeID);
                        }}
                      />
                    ) : null}
                    <SelectFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      tabIndex={collegeConfig.is_university ? 2 : 1}
                      label={RENAME?.course}
                      // labelSize={3}
                      id="course"
                      mandatory={1}
                      // maxlength={10}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      options={courseList}
                      style={{ width: "90%" }}
                      onChange={(text) => {
                        setFieldValue("course", text);
                        setFieldTouched("course", false);
                        setFieldValue("semester", "");
                        setFieldValue("subject", "");
                        setShowList(false);
                        getSemesterMaster(text);
                        setFieldValue("unit", {
                          unit: "All",
                        });
                      }}
                    />

                    <SelectFieldFormik
                      tabIndex={collegeConfig.is_university ? 3 : 2}
                      label={RENAME?.sem}
                      id="semester"
                      mandatory={1}
                      maxlength={10}
                      getOptionLabel={(option) => option.className}
                      getOptionValue={(option) => option.semester}
                      options={semesterList}
                      style={{ width: "40%" }}
                      onChange={(text) => {
                        setFieldValue("semester", text);
                        setFieldValue("subject", "");
                        setShowList(false);
                        getSubjectStaff(values?.course, text, values?.semester);
                      }}
                    />

                    <SelectFieldFormik
                      tabIndex={collegeConfig.is_university ? 5 : 4}
                      label="Subject"
                      id="subject"
                      mandatory={1}
                      getOptionLabel={(option) => option.subjectName}
                      getOptionValue={(option) => option.subjectID}
                      options={subjectList}
                      onChange={(text) => {
                        setFieldValue("subject", text);
                        setFieldTouched("subject", false);
                        setShowList(false);
                      }}
                    />

                    <SelectFieldFormik
                      tabIndex={collegeConfig.is_university ? 6 : 5}
                      label="Unit"
                      id="unit"
                      mandatory={1}
                      options={[{ unit: "All" }, ...subjectUnitList]}
                      getOptionLabel={(option) => option.unit}
                      getOptionValue={(option) => option.unit}
                      style={{ width: "30%" }}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setFieldValue("unit", text);
                        setShowList(false);
                      }}
                    />
                  </div>
                  <Button
                    tabIndex={collegeConfig.is_university ? 7 : 5}
                    text={"Show"}
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />

                  {showList && (
                    <>
                      <div className="row">
                        <div className="subhead-row p-0">
                          <div className="subhead">Topic Details</div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="p-0 mb-2 text-right">
                          <Button
                            text={"Add Topic"}
                            className={"btn-green"}
                            frmButton={false}
                            type="button"
                            isTable={true}
                            onClick={(e) => {
                              navigate("/topic-upload");
                            }}
                          />
                        </div>
                        <div className="row no-gutters mt-2">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th>Topic</th>
                                <th width="5%">Unit</th>
                                <th width="5%">Edit</th>
                              </tr>
                            </thead>
                            {data.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td align="center" colSpan={5}>
                                    No records found
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
                              <tbody>
                                {data.map((item, index) => {
                                  return (
                                    <tr>
                                      <td class="text-center">{index + 1}</td>
                                      <td>{item.topic}</td>
                                      <td class="text-center">
                                        {item.unit
                                          ? item.unit
                                          : formikRef?.current?.values?.unit
                                              .unit}
                                      </td>
                                      <td>
                                        <Button
                                          isTable={true}
                                          type="button"
                                          className="btn-3"
                                          text="Edit"
                                          onClick={() => {
                                            console.log(item, "item");
                                            setOpenModal(true);
                                            setUpdateTopicArr(item);
                                            setChangeUnit({
                                              unit: formikRef?.current?.values
                                                ?.unit.unit,
                                            });
                                            setChangeTopic(item.topic);
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
                    </>
                  )}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
      <Modal
        show={openModal}
        className="modal-dialog modal-lg"
        style={{ minHeight: 400 }}
        onEscapeKeyDown={(e) => setOpenModal(false)}
      >
        <Modal.Header>
          <Modal.Title>Edit Topic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row no-gutters mt-2">
            <label className="text-right col-lg-3">{RENAME?.course} :</label>
            <div className="col-lg-9 ps-2">
              {formikRef?.current?.values?.course?.courseName}
            </div>
          </div>
          <div className="row no-gutters  mt-2">
            <label className="text-right col-lg-3">{RENAME?.sem} :</label>
            <div className="col-lg-9 ps-2">
              {formikRef?.current?.values?.semester?.semester}
            </div>
          </div>
          <div className="row no-gutters mt-2">
            <label className="text-right col-lg-3">Subject :</label>
            <div className="col-lg-9  ps-2">
              {formikRef?.current?.values?.subject?.subjectName}
            </div>
          </div>
          <div className="row no-gutters mt-2">
            <label className="text-right col-lg-3">Unit :</label>
            <div className="col-lg-9  ps-2">
              {updateTopicArr.unit ? updateTopicArr.unit : changeUnit.unit}
            </div>
          </div>

          <TextField
            autoFocus
            tabIndex={1}
            labelSize={3}
            label="Topic"
            id="topic"
            placeholder="Topic"
            mandatory={1}
            value={changeTopic}
            style={{ width: "75%" }}
            onChange={(e) => {
              setChangeTopic(e.target.value);
              setTopicError(false);
              setChange(true);
            }}
            error={topicError ? "Please enter Topic" : ""}
          />

          <div className="row no-gutters">
            <label className="text-right col-lg-3"></label>
            <div className="col-lg-9 mt-1"></div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="row ">
            <div className="col-lg-6 d-flex justify-content-end">
              <Button
                tabIndex={2}
                isTable={true}
                text="Save"
                type="button"
                onClick={(e) => {
                  if (change) handleUpdateTopic();
                }}
              />
            </div>
            <div className="col-lg-6 d-flex justify-content-start p-0">
              <Button
                tabIndex={3}
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

export default TopicList;
