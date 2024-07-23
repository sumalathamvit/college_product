import React, { useState, useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import EmployeeApi from "../api/EmployeeApi";

import AuthContext from "../auth/context";
import Button from "../component/FormField/Button";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ModalComponent from "../component/ModalComponent";
import preFunction from "../component/common/CommonFunction";
import ScreenTitle from "../component/common/ScreenTitle";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../component/FormField/TextFieldFormik";

import Modal from "react-bootstrap/Modal";

function SectionBatchMaster() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const { collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const [openModal, setOpenModal] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [editBatch, setEditBatch] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [yearOfAdmissionList, setYearOfAdmissionList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [duplicateValidation, setDuplicateValidation] = useState(false);
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const showFormikRef = useRef();

  const FormSchema = Yup.object().shape({
    addBatch: Yup.string().required("Please enter Batch"),
  });

  const ShowFormSchema = Yup.object().shape({
    // college: collegeConfig?.is_university
    //   ? Yup.object().required("Please select College")
    //   : Yup.object().notRequired(),
    course: Yup.object().required("Please select Course"),
    yearofAdmission: Yup.object().required("Please select Year of Admission"),
  });

  const handleAddorUpdateBatch = async (values) => {
    try {
      setLoad(true);
      console.log("values", values);
      const addorUpdateBatch = await EmployeeApi.addOrUpdateSectionBatchMaster(
        editBatch ? editBatch?.classID : null,
        showFormikRef.current.values.course.courseID,
        showFormikRef.current.values.yearofAdmission.batchID,
        showFormikRef.current.values.yearofAdmission.batch,
        values.addBatch.trim()
      );

      console.log("addorUpdateBatch", addorUpdateBatch);
      if (!addorUpdateBatch.data.message.success) {
        setDuplicateValidation(true);
        setModalMessage(addorUpdateBatch.data.message.message);
        setLoad(false);
        return;
      }
      setOpenModal(false);
      toast.success(addorUpdateBatch.data.message.message);
      handleShow(showFormikRef.current.values);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleValidateAddBatch = async () => {
    if (
      showFormikRef.current.values.course === "" ||
      showFormikRef.current.values.yearofAdmission === ""
    ) {
      setModalErrorOpen(true);
      setModalTitle("Message");
      setModalMessage("Please select Course and Year of Admission");
    } else {
      setOpenModal(true);
    }
  };

  const handleShow = async (values) => {
    console.log("values", values);
    try {
      setLoad(true);
      const getSectionBatchMaster = await EmployeeApi.getSectionBatchMaster(
        "section",
        values.college ? values.college.collegeID : collegeId,
        values.course.courseID,
        values.yearofAdmission.batchID
      );
      console.log("getSectionBatchMaster", getSectionBatchMaster);
      setData(getSectionBatchMaster.data.message.data.section);
      setShowRes(true);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const getYearOfAdmissionList = async (collegeId, courseId) => {
    try {
      const yearOfAdmissionList = await EmployeeApi.getSectionBatchMaster(
        "batch",
        collegeId,
        courseId
      );
      console.log("yearOfAdmissionList", yearOfAdmissionList);
      setYearOfAdmissionList(yearOfAdmissionList.data.message.data.batch);
    } catch (error) {
      console.log("error", error);
    }
  };

  const getCourseList = async (collegeId) => {
    try {
      const courseList = await EmployeeApi.getSectionBatchMaster(
        "course",
        collegeId
      );
      console.log("courseList", courseList);
      setCourseList(courseList.data.message.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig?.is_university) {
      getCourseList(collegeId);
    }
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
        okClick={() => {
          setModalErrorOpen(false);
        }}
      />

      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <Formik
          enableReinitialize={true}
          innerRef={showFormikRef}
          initialValues={{
            // college: "",
            course: "",
            yearofAdmission: "",
          }}
          validationSchema={ShowFormSchema}
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
                  <div className="row col-lg-10">
                    {/* {collegeConfig?.is_university ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={1}
                        labelSize={4}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig?.collegeList}
                        getOptionLabel={(option) => option?.collegeName}
                        getOptionValue={(option) => option?.collegeID}
                        style={{ width: "60%" }}
                        searchIcon={false}
                        clear={false}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          setFieldValue("course", null);
                          setFieldValue("yearofAdmission", null);
                          getCourseList(text?.collegeID);
                        }}
                      />
                    ) : null} */}

                    <SelectFieldFormik
                      tabIndex={2}
                      labelSize={3}
                      id="course"
                      label={RENAME.course}
                      mandatory={1}
                      options={courseList}
                      getOptionLabel={(option) => option.courseName}
                      getOptionValue={(option) => option.courseID}
                      onChange={(text) => {
                        setFieldValue("course", text);
                        getYearOfAdmissionList(
                          values.college
                            ? values.college?.collegeID
                            : collegeId,
                          text.courseID
                        );
                        setData([]);
                        setShowRes(false);
                      }}
                      style={{ width: "70%" }}
                    />

                    <SelectFieldFormik
                      tabIndex={3}
                      labelSize={3}
                      id="yearofAdmission"
                      label={RENAME.batch}
                      placeholder=" "
                      mandatory={1}
                      options={yearOfAdmissionList}
                      getOptionLabel={(option) => option.batch}
                      getOptionValue={(option) => option.batchID}
                      onChange={(text) => {
                        setFieldValue("yearofAdmission", text);
                        setData([]);
                        setShowRes(false);
                      }}
                      style={{ width: "30%" }}
                    />
                  </div>
                  <div className="col-lg-2 text-right pt-1 p-0">
                    <Button
                      isTable={true}
                      frmButton={false}
                      type="button"
                      className={"btn-green"}
                      text={"Add" + RENAME.section}
                      onClick={(e) => {
                        handleValidateAddBatch();
                        setEditBatch("");
                      }}
                    />
                  </div>
                </div>
                {!showRes ? (
                  <Button
                    tabIndex={3}
                    text={"Show"}
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                    }}
                  />
                ) : null}
              </form>
            );
          }}
        </Formik>

        {showRes ? (
          <>
            <div className="subhead-row">
              <div className="subhead">Batch Detail</div>
              <div className="col line-div"></div>
            </div>
            <div className="table-responsive p-0">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th width="5%">No.</th>
                    <th>{RENAME.section}</th>
                    <th width="15%">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="3" align="center">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.section}</td>
                          <td align="center">
                            <Button
                              text={"Edit"}
                              className={"btn-3"}
                              type="submit"
                              isTable={true}
                              onClick={() => {
                                setEditBatch(item);
                                setOpenModal(true);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              <Modal
                show={openModal}
                //   dialogClassName="my-modal"
                onEscapeKeyDown={() => setOpenModal(false)}
              >
                <Formik
                  enableReinitialize={true}
                  innerRef={formikRef}
                  initialValues={{
                    addBatch: editBatch ? editBatch.section : "",
                  }}
                  validationSchema={FormSchema}
                  onSubmit={handleAddorUpdateBatch}
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
                          <Modal.Title>Add Batch</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <div className="row px-5">
                            <div className="row no-gutters pb-2 mt-1 ">
                              <TextFieldFormik
                                tabIndex={1}
                                labelSize={4}
                                id="addBatch"
                                label="Batch"
                                mandatory={1}
                                maxlength={20}
                                style={{ width: "60%" }}
                                onChange={(e) => {
                                  setFieldValue("addBatch", e.target.value);
                                  setDuplicateValidation(false);
                                }}
                                touched={duplicateValidation ? true : false}
                                error={duplicateValidation ? modalMessage : ""}
                              />
                            </div>
                          </div>
                        </Modal.Body>
                        <Modal.Footer>
                          <div className="row my-1 py-2">
                            <div className="col-lg-6 d-flex justify-content-end">
                              <Button
                                tabIndex={8}
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
          </>
        ) : null}
      </div>
    </div>
  );
}
export default SectionBatchMaster;
