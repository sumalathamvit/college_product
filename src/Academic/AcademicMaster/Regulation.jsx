import React, { useEffect, useState, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import $ from "jquery";

import academicApi from "../../api/AcademicApi";
import StudentApi from "../../api/StudentApi";

import AuthContext from "../../auth/context";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import DisplayText from "../../component/FormField/DisplayText";
import ScreenTitle from "../../component/common/ScreenTitle";
import Icon from "../../component/Icon";

function Regulation() {
  const RENAME = useSelector((state) => state.web.rename);
  const [load, setLoad] = useState(false);
  const [regulationList, setRegulationList] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [courseList, setCourseList] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [editFile, setEditFile] = useState(false);
  const [classList, setClassList] = useState([]);
  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const { setUnSavedChanges } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState(false);
  const formikRef = useRef();

  const FormSchema = Yup.object().shape({
    course: Yup.object().required("Please select " + RENAME?.course),
    semester: $("#semester").attr("class")?.includes("non-mandatory")
      ? Yup.mixed().notRequired()
      : Yup.object().required(
          `Please select ${$("#semester").attr("alt") ?? RENAME?.sem}`
        ),
    regulation: Yup.object().required("Please select Regulation"),
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
  });

  const modalSchema = Yup.object().shape({
    regulation: Yup.string().required("Please enter Regulation"),
    description: Yup.string().required("Please enter Description"),
  });

  const getRegulationList = async () => {
    try {
      const response = await academicApi.getAllRegulation();
      console.log("Regulation List", response.data.message.data.regulation);
      setRegulationList(response.data.message.data.regulation);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
    }
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    try {
      setLoad(true);
      console.log("values---", values);
      const res = await academicApi.addRegulation(
        values.regulation,
        values.description
      );
      if (!res.data.message.success) {
        setModalTitle("Message");
        setModalMessage(res.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      toast.success(res.data.message.message);
      getRegulationList();
      resetForm();
      setLoad(false);
      setOpenModal(false);
    } catch (error) {
      setLoad(false);
      setOpenModal(false);
      console.log("Exception---", error);
    }
  };

  const handleUpdate = async (values, { resetForm }) => {
    if (load) return;
    console.log("values---", values);
    formikRef.current.setFieldTouched("regulation", false);
    setUnSavedChanges(false);

    if (!selectedBatch) {
      setModalTitle("Message");
      setModalMessage(RENAME?.batch + " not found");
      setModalErrorOpen(true);
      return;
    }

    try {
      setLoad(true);
      const res = await academicApi.getAssignRegulation(
        collegeConfig.institution_type,
        values.regulation.regulation,
        collegeConfig.institution_type !== 1
          ? selectedBatch.batchID
          : selectedBatch.semester,
        values.course.courseID
      );

      console.log("assign regulation", res);
      if (!res.data.message.success) {
        setModalTitle("Message");
        setModalMessage(res.data.message.message);
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      toast.success(res.data.message.message);
      if (collegeConfig.institution_type !== 1) {
        handleCourse(values.course);
      } else {
        formikRef.current.resetForm();
        setSelectedBatch();
      }

      setEditFile(false);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception---", error);
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

  const handleCourse = async (values) => {
    formikRef.current.setFieldValue("batch", null);

    console.log("values---", values.courseID);
    if (values) {
      const batchRes = await StudentApi.getMaster(
        5,
        values.collegeID,
        values.courseID
      );
      console.log("batchRes----", batchRes);
      if (!batchRes.data.message.success) {
        setModalMessage(batchRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        return;
      }

      if (batchRes.data.message.data.new_batch_data.length > 0) {
        setEditFile(false);
        if (collegeConfig.institution_type !== 1)
          setSelectedBatch(batchRes.data.message.data.new_batch_data[0]);
      }
      if (batchRes.data.message.data?.new_batch_data[0]?.regulation) {
        setEditFile(false);
      } else {
        setEditFile(true);
      }
    }
  };

  const getClassList = async (course) => {
    if (course) {
      try {
        const res = await academicApi.getMasterSubjectStaff(
          collegeId,
          "batch",
          course.courseID
        );
        console.log("res---", res);
        setClassList(res.data.message.data.batch);
      } catch (error) {
        console.log("error", error);
        setLoad(false);
      }
    }
  };

  useEffect(() => {
    getRegulationList();
    if (!collegeConfig.is_university) {
      getCourseList(collegeId);
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
          <div className="p-0 mb-2 text-right">
            <Button
              text={"Add Regulation"}
              className={"btn-green"}
              type="button"
              frmButton={false}
              isTable={true}
              onClick={(e) => {
                setOpenModal(true);
              }}
            />
          </div>
        </div>
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: null,
              course: null,
              semester: null,
              regulation: null,
            }}
            validationSchema={FormSchema}
            onSubmit={handleUpdate}
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
                  <>
                    <div className="col-lg-8">
                      {collegeConfig.is_university ? (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={1}
                          label="College"
                          id="college"
                          mandatory={1}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          options={collegeConfig.collegeList}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            setFieldTouched("college", false);
                            setFieldValue("course", "");
                            setFieldValue("regulation", "");
                            setFieldValue("semester", "");
                            getCourseList(text.collegeID);
                            setUnSavedChanges(true);
                            setEditFile(false);
                            setSelectedBatch(null);
                          }}
                        />
                      ) : null}
                      <SelectFieldFormik
                        tabIndex={2}
                        label={RENAME?.course}
                        id="course"
                        mandatory={1}
                        getOptionLabel={(option) => option.courseName}
                        getOptionValue={(option) => option.courseID}
                        options={courseList}
                        style={{ width: "100%" }}
                        onChange={(text) => {
                          setFieldValue("course", text);
                          setFieldTouched("course", false);
                          setSelectedBatch(null);
                          setFieldValue("batch", "");
                          setFieldValue("regulation", "");
                          setUnSavedChanges(true);
                          setEditFile(false);
                          setFieldValue("semester", "");
                          collegeConfig.institution_type !== 1
                            ? handleCourse(text)
                            : getClassList(text);
                        }}
                      />
                      {collegeConfig.institution_type !== 1 ? (
                        <DisplayText
                          label={RENAME?.batch}
                          labelSize={5}
                          value={selectedBatch ? selectedBatch.batch : "-"}
                        />
                      ) : null}
                      <SelectFieldFormik
                        tabIndex={3}
                        label={RENAME?.sem}
                        id="semester"
                        mandatory={1}
                        getOptionLabel={(option) => option.className}
                        getOptionValue={(option) => option.semester}
                        options={classList}
                        style={{ width: "50%" }}
                        onChange={(text) => {
                          console.log(text, "text");
                          setFieldValue("semester", text);
                          setSelectedBatch(text);
                          setFieldTouched("semester", false);
                        }}
                      />

                      {!editFile ? (
                        <div className={"row no-gutters mt-1"}>
                          <div
                            className={`col-lg-5 ${
                              window.innerWidth > 992 ? "text-right" : ""
                            } pe-3 mt-2`}
                          >
                            <label>Regulation </label>
                          </div>
                          <div className={`col-lg-7 mt-2`}>
                            <div
                              className="row"
                              onClick={() => setEditFile(true)}
                              style={{
                                cursor: "pointer",
                              }}
                            >
                              {selectedBatch ? selectedBatch.regulation : "-"}
                              {selectedBatch && (
                                <div className="col">
                                  <Icon iconName={"Edit"} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <SelectFieldFormik
                          tabIndex={4}
                          label="Regulation"
                          id="regulation"
                          mandatory={1}
                          getOptionLabel={(option) => option.regulation}
                          getOptionValue={(option) => option.regulation}
                          options={regulationList}
                          placeholder="Regulation"
                          style={{ width: "50%" }}
                          onChange={(text) => {
                            setFieldValue("regulation", text);
                            setUnSavedChanges(true);
                          }}
                        />
                      )}
                    </div>
                    {editFile && !openModal && (
                      <Button
                        tabIndex={5}
                        id={openModal ? "save" : ""}
                        text="F4 - Save"
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                    )}
                  </>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>

      <Modal
        show={openModal}
        dialogClassName="my-modal"
        onEscapeKeyDown={() => setOpenModal(false)}
      >
        <Formik
          enableReinitialize={true}
          initialValues={{
            regulation: "",
            description: "",
          }}
          validationSchema={modalSchema}
          onSubmit={handleSave}
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
                <Modal.Header>
                  <Modal.Title>New Regulation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="row px-5">
                    <div className="row no-gutters">
                      <TextFieldFormik
                        tabIndex={1}
                        autoFocus
                        id="regulation"
                        onChange={(e) => {
                          if (
                            !isNaN(e.target.value) &&
                            !e.target.value.includes(" ")
                          ) {
                            setFieldValue("regulation", e.target.value);
                          }
                        }}
                        style={{ width: "70%" }}
                        maxlength={10}
                        mandatory={1}
                        label={"Regulation"}
                        placeholder="Regulation"
                      />
                      <TextFieldFormik
                        tabIndex={2}
                        id="description"
                        onChange={(e) => {
                          setFieldValue("description", e.target.value);
                        }}
                        style={{ width: "70%" }}
                        maxlength={50}
                        mandatory={1}
                        label={"Description"}
                        placeholder="Description"
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
                          setOpenModal(false);
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
  );
}

export default Regulation;
