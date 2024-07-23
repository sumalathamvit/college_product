import React, { useState, useEffect, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import Modal from "react-bootstrap/Modal";
import * as Yup from "yup";
import { toast } from "react-toastify";

import StudentApi from "../api/StudentApi";

import Button from "../component/FormField/Button";
import AuthContext from "../auth/context";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ScreenTitle from "../component/common/ScreenTitle";
import SwitchField from "../component/FormField/SwitchField";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import ModalComponent from "../component/ModalComponent";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import { get } from "jquery";

function AdmissionFeesList() {
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editAdmissionFee, setEditAdmissionFee] = useState("");
  const [noChange, setNoChange] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [admissionTypeList, setAdmissionTypeList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const RENAME = useSelector((state) => state.web.rename);
  const [modalCourseList, setModalCourseList] = useState([]);
  const [modalAdmissionTypeList, setModalAdmissionTypeList] = useState([]);
  const [modalSemesterList, setModalSemesterList] = useState([]);

  const formikRef = useRef();
  const collegeRef = useRef();

  const ShowSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    course: Yup.object().required("Please select " + RENAME?.course),
  });

  const FormSchema = Yup.object().shape({
    addCollege: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    addCourse: Yup.object().required("Please select " + RENAME?.course),
    addSemester: Yup.object().required("Please select " + RENAME?.sem),
    addAdmissionType: Yup.object().required("Please select Admission Type"),
    addFees: Yup.string().required("Please enter Amount"),
  });

  const handleSave = async (values) => {
    console.log("values", values);
    if (!noChange) {
      setModalErrorOpen(true);
      setModalTitle("Message");
      setModalMessage("No changes made");
      return;
    }

    try {
      setLoad(true);
      const addorUpdateAdmissionFees = await StudentApi.addorUpdateAdmissionFee(
        editAdmissionFee ? editAdmissionFee.id : null,
        values.addCourse.id,
        values.addSemester.studyYear,
        values.addAdmissionType.id,
        values.addFees,
        editAdmissionFee ? values.active : true
      );
      console.log("addorUpdateGrade", addorUpdateAdmissionFees);
      if (!addorUpdateAdmissionFees.data.message.success) {
        setModalErrorOpen(true);
        setModalTitle("Message");
        setModalMessage(addorUpdateAdmissionFees.data.message.message);
        setLoad(false);
        return;
      }
      toast.success(addorUpdateAdmissionFees.data.message.message);
      setOpenModal(false);
      handleShow(collegeRef.current.values);

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleShow = async (values) => {
    console.log("values", values);
    try {
      setLoad(true);
      const getAdmissionFeesList = await StudentApi.getAdmissionFeesList(
        values.course.id,
        values.admissionType ? values.admissionType.id : null,
        values.semester.studyYear
      );
      console.log("getAdmissionFeesList", getAdmissionFeesList);
      setShowResult(true);
      setData(getAdmissionFeesList.data.message.data.fees_structure);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleEdit = async (values) => {
    console.log("values", values);
    setEditAdmissionFee(values);
    setOpenModal(true);
  };

  const getAllList = async (college_id) => {
    try {
      const masterList = await StudentApi.getMaster(5, college_id);
      console.log("masterList", masterList);

      if (!masterList.data.message.success) {
        setModalMessage(masterList.data.message.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setModalCourseList(masterList?.data?.message?.data?.course_data);
      setModalAdmissionTypeList(
        masterList?.data?.message?.data?.admission_type_data
      );
      setCourseList(masterList?.data?.message?.data?.course_data);
      setAdmissionTypeList(
        masterList?.data?.message?.data?.admission_type_data
      );
      getSemesterMaster(masterList?.data?.message?.data?.course_data[0]);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  const getSemesterMaster = async (text) => {
    console.log("text---", text);

    if (text) {
      try {
        const getPersonalMasterRes = await StudentApi.getMaster(
          collegeConfig.institution_type === 1 ? 8 : 5,
          collegeId,
          text.id
        );
        console.log("getPersonalMasterRes---", getPersonalMasterRes);
        if (openModal) {
          setModalSemesterList(
            collegeConfig.institution_type === 1
              ? getPersonalMasterRes.data.message.data.semester_data
              : getPersonalMasterRes.data.message.data.batch_data
          );
        } else {
          setSemesterList(
            collegeConfig.institution_type === 1
              ? getPersonalMasterRes.data.message.data.semester_data
              : getPersonalMasterRes.data.message.data.batch_data
          );
        }
      } catch (error) {
        setLoad(false);
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />

      <ModalComponent
        title={modalTitle}
        isOpen={modalErrorOpen}
        message={modalMessage}
        okClick={() => {
          setModalErrorOpen(false);
        }}
      />

      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={collegeRef}
            initialValues={{
              college: "",
              course: "",
              semester: "",
              admissionType: "",
            }}
            validationSchema={ShowSchema}
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
                  <div className="row">
                    <div className="col-lg-12 text-right p-0">
                      <Button
                        frmButton={false}
                        className={"btn-green"}
                        type={"button"}
                        text={`Add Admission Fees`}
                        isTable={true}
                        onClick={(e) => {
                          setOpenModal(true);
                          setEditAdmissionFee("");
                        }}
                      />
                    </div>
                    <div className="col-lg-10 p-0">
                      {collegeConfig.is_university ? (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={0}
                          label="College"
                          id="college"
                          mandatory={1}
                          labelSize={3}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            getAllList(text.collegeID);
                            setFieldValue("course", "");
                            setFieldValue("semester", "");
                            setData([]);
                            setShowResult(false);
                          }}
                          style={{ width: "90%" }}
                        />
                      ) : null}
                      <SelectFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        label={RENAME?.course}
                        id="course"
                        tabIndex={1}
                        labelSize={3}
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
                          setFieldValue("semester", "");
                          setData([]);
                          getSemesterMaster(text);
                          setShowResult(false);
                        }}
                      />
                      <SelectFieldFormik
                        label={RENAME?.sem}
                        id="semester"
                        labelSize={3}
                        tabIndex={2}
                        maxlength={10}
                        matchFrom="start"
                        style={{ width: "45%" }}
                        options={semesterList}
                        clear={true}
                        getOptionLabel={(option) =>
                          collegeConfig.institution_type === 1
                            ? option.className
                            : option.semester
                        }
                        getOptionValue={(option) => option.semester}
                        onChange={(text) => {
                          setFieldValue("semester", text);
                          setData([]);
                          setShowResult(false);
                        }}
                      />
                      <SelectFieldFormik
                        label="Adm. Type"
                        id="admissionType"
                        placeholder={"Admission Type"}
                        clear={true}
                        labelSize={3}
                        maxlength={10}
                        tabIndex={3}
                        options={admissionTypeList}
                        matchFrom="start"
                        style={{ width: "45%" }}
                        getOptionLabel={(option) => option.admissionType}
                        getOptionValue={(option) => option.id}
                        onChange={(text) => {
                          setFieldValue("admissionType", text);
                          setData([]);
                          setShowResult(false);
                        }}
                      />
                    </div>
                  </div>
                  {!showResult && (
                    <Button
                      tabIndex={5}
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
        {showResult ? (
          <>
            <div className="subhead-row">
              <div className="subhead">Admission Fees Detail</div>
              <div className="col line-div"></div>
            </div>
            <div className="table-responsive p-0">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th width="2%">No.</th>
                    <th>Admission Type</th>
                    <th width="20%">{RENAME?.sem}</th>
                    <th width="15%">Amount</th>
                    <th width="10%">Active</th>
                    <th width="10%">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="7" align="center">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.admissionType}</td>
                          {collegeConfig.institution_type === 1 ? (
                            <td>{item.className}</td>
                          ) : (
                            <td>{item.studyYear}</td>
                          )}
                          <td align="right">{item.fees}</td>
                          <td align="center">{item.isActive ? "Yes" : "No"}</td>
                          <td align="center">
                            <Button
                              text={"Edit"}
                              className={"btn-3"}
                              type="button"
                              isTable={true}
                              onClick={() => {
                                handleEdit(item);
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
          </>
        ) : null}

        <Modal
          show={openModal}
          dialogClassName="my-modal"
          onEscapeKeyDown={() => setOpenModal(false)}
        >
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              addCollege:
                collegeConfig.is_university && editAdmissionFee
                  ? { collegeName: collegeName, collegeID: collegeId }
                  : "",
              addCourse: editAdmissionFee
                ? {
                    id: editAdmissionFee.courseID,
                    courseName: editAdmissionFee.courseName,
                  }
                : "",
              addSemester: editAdmissionFee
                ? {
                    className: editAdmissionFee.className,
                    semester: editAdmissionFee.studyYear,
                    studyYear: editAdmissionFee.studyYear,
                  }
                : "",
              addAdmissionType: editAdmissionFee
                ? {
                    id: editAdmissionFee.admissionTypeID,
                    admissionType: editAdmissionFee.admissionType,
                  }
                : "",
              addFees: editAdmissionFee ? editAdmissionFee.fees : "",
              active: editAdmissionFee ? editAdmissionFee.isActive : false,
            }}
            validationSchema={FormSchema}
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
                    <Modal.Title>
                      {editAdmissionFee ? "Edit " : "Add "}Admission Fees
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="row px-5">
                      <div className="row no-gutters pb-2 mt-1 ">
                        {collegeConfig.is_university ? (
                          <SelectFieldFormik
                            autoFocus
                            tabIndex={0}
                            label="College"
                            id="addCollege"
                            mandatory={1}
                            labelSize={3}
                            options={collegeConfig.collegeList}
                            getOptionLabel={(option) => option.collegeName}
                            getOptionValue={(option) => option.collegeID}
                            searchIcon={false}
                            clear={false}
                            onChange={(text) => {
                              setFieldValue("addCollege", text);
                              getAllList(text.collegeID);
                              setFieldValue("addCourse", "");
                              setFieldValue("addSemester", "");
                            }}
                          />
                        ) : null}
                        <SelectFieldFormik
                          autoFocus={!collegeConfig.is_university}
                          label={RENAME?.course}
                          id="addCourse"
                          tabIndex={1}
                          labelSize={3}
                          mandatory={1}
                          maxlength={40}
                          matchFrom="start"
                          options={modalCourseList}
                          getOptionLabel={(option) => option.courseName}
                          getOptionValue={(option) => option.id}
                          onChange={(text) => {
                            setFieldValue("addCourse", text);
                            setFieldValue("addSemester", "");
                            getSemesterMaster(text);
                          }}
                        />
                        <SelectFieldFormik
                          label={RENAME?.sem}
                          id="addSemester"
                          mandatory={1}
                          labelSize={3}
                          tabIndex={2}
                          maxlength={10}
                          matchFrom="start"
                          style={{ width: "60%" }}
                          options={modalSemesterList}
                          getOptionLabel={(option) =>
                            collegeConfig.institution_type === 1
                              ? option.className
                              : option.semester
                          }
                          getOptionValue={(option) => option.semester}
                          onChange={(text) => {
                            setFieldValue("addSemester", text);
                          }}
                        />
                        <SelectFieldFormik
                          label="Admission Type"
                          id="addAdmissionType"
                          mandatory={1}
                          labelSize={3}
                          maxlength={10}
                          tabIndex={3}
                          options={modalAdmissionTypeList}
                          matchFrom="start"
                          style={{ width: "60%" }}
                          getOptionLabel={(option) => option.admissionType}
                          getOptionValue={(option) => option.id}
                          onChange={(text) => {
                            setFieldValue("addAdmissionType", text);
                          }}
                        />
                        <TextFieldFormik
                          tabIndex={2}
                          labelSize={3}
                          id="addFees"
                          label="Amount"
                          mandatory={1}
                          isAmount={true}
                          maxlength={5}
                          style={{ width: "40%" }}
                          onChange={(e) => {
                            if (
                              !isNaN(e.target.value) &&
                              !e.target.value.includes(" ") &&
                              !e.target.value.includes(".")
                            ) {
                              setFieldValue("addFees", e.target.value);
                            }
                            setNoChange(true);
                          }}
                        />
                        {editAdmissionFee ? (
                          <SwitchField
                            label="Active"
                            labelSize={3}
                            tabIndex={5}
                            yesOption={"Yes"}
                            noOption={"No"}
                            checked={values.active}
                            onChange={() => {
                              setFieldValue("active", !values.active);
                              setNoChange(true);
                            }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="row my-1 py-2">
                      <div className="col-lg-6 d-flex justify-content-end">
                        <Button
                          tabIndex={editAdmissionFee ? 6 : 5}
                          isTable={true}
                          text="Save"
                          onClick={(e) => {
                            preFunction.handleErrorFocus(errors);
                          }}
                        />
                      </div>

                      <div className="col-lg-6 d-flex justify-content-start p-0">
                        <Button
                          tabIndex={9}
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
    </div>
  );
}
export default AdmissionFeesList;
