import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import * as Yup from "yup";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import StudentCard from "../../component/StudentCard";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import CommonApi from "../../component/common/CommonApi";
import { allowedFileExtensions } from "../../component/common/CommonArray";
import FileField from "../../component/FormField/FileField";
import AuthContext from "../../auth/context";
import string from "../../string";

function AdmissionCancel() {
  //#region const
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const newReasonRef = useRef();
  const [load, setLoad] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [studentInfo, setStudentInfo] = useState();
  const [newReasonModel, setNewReasonModel] = useState(false);

  const [reasonlist, setReasonList] = useState([]);
  const [fileType, setFileType] = useState(null);
  const [file, setFile] = useState("");

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const fileInputRef = useRef(null);
  const { collegeId, setUnSavedChanges } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  //#endregion

  // Form Validation Schema
  const FormSchema = Yup.object().shape({
    reason: Yup.object().required("Please select Reason"),
    refDoc: Yup.string().required("Please choose Document Proof"),
  });

  const ReasonSchema = Yup.object().shape({
    newReason: Yup.string().required("Please enter Reason"),
  });

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleFileUpload = (e) => {
    console.log(e.target.files[0]);
    if (e.target.files[0].size > string.MAX_FILE_SIZE) {
      setModalErrorOpen(true);
      setModalMessage("Please choose file size less than 2MB");
      setModalTitle("File Size ");
      e.target.value = null;
      return false;
    }

    const fileExtension = e.target.files[0].name.split(".").pop();

    if (!allowedFileExtensions.includes(fileExtension)) {
      setModalErrorOpen(true);
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      setModalTitle("File Type");
      return false;
    }
    setFileType(fileExtension);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setFile(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    return true;
  };

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
  };

  // To add new reason
  const handleAddNewReason = async (values) => {
    console.log("values", values);
    try {
      setLoad(true);
      const addNewReason = await StudentApi.addNewLeavingReason(
        values.newReason,
        1
      );
      console.log("addNewReason--", addNewReason);
      if (!addNewReason.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(addNewReason.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(addNewReason.data.message.message);

      getReasonList();
      setNewReasonModel(false);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  // To save the Admission Cancel
  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("values", values);

    try {
      let proofUrl = null;

      if (file) {
        const response = await StudentApi.uploadFile(
          "admission_cancel",
          fileType,
          file.split(",")[1]
        );
        console.log("response--", response);
        proofUrl = response.data.message.data.file_url;
      }
      console.log("proofUrl--------", proofUrl);
      setLoad(true);
      const studentAdmissionCancel = await StudentApi.studentAdmissionCancel(
        studentInfo?.studentID,
        values.reason.id,
        proofUrl,
        collegeConfig.institution_type
      );
      console.log("studentAdmissionCancel--->", studentAdmissionCancel);

      if (!studentAdmissionCancel.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(studentAdmissionCancel.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(studentAdmissionCancel.data.message.message);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFileType("");
      setFile("");
      setStudentInfo();
      formikRef?.current?.setFieldValue("student", "");
      resetForm();

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleSelectStudent = async (value) => {
    console.log("value", value);
    try {
      setLoad(true);
      handleUnSavedChanges(0);
      setStudentInfo();
      if (value) {
        const getFeeDueDetailRes = await StudentApi.getTransferCertificate(
          value.id
        );
        console.log("getStudentFeeDueDetailRes--", getFeeDueDetailRes);
        setStudentInfo(
          getFeeDueDetailRes?.data?.message?.data.transfer_certificate[0]
        );
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getReasonList = async () => {
    try {
      const masterList = await StudentApi.getMaster(2, collegeId);
      console.log("masterList--", masterList);
      setReasonList(
        masterList.data.message.data.admission_cancel_leaving_reason
      );
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getReasonList();
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
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              studentId: "",
              refDoc: "",
              reason: "",
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
                  <div className="row no-gutters mt-1">
                    <div className="row no-gutters">
                      <div className="col-lg-9">
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={1}
                          label="Student No. / Name"
                          labelSize={3}
                          id="student"
                          mandatory={1}
                          maxlength={40}
                          clear={true}
                          searchIcon={true}
                          style={{ width: "90%" }}
                          options={studentList}
                          getOptionLabel={(option) => option.name}
                          getOptionValue={(option) => option.id}
                          onInputChange={(inputValue) => {
                            searchStudent(inputValue);
                          }}
                          onChange={(text) => {
                            setFieldValue("student", text);
                            setFieldTouched("student", false);
                            setFieldValue("reason", "");
                            handleSelectStudent(text);
                          }}
                        />
                      </div>
                      {values?.student ? (
                        <>
                          <div className="col-lg-3 text-right">
                            <Button
                              className={"btn-green"}
                              type="button"
                              isTable={true}
                              isCenter={false}
                              text={"New Reason"}
                              onClick={() => {
                                setNewReasonModel(true);
                              }}
                            />
                          </div>
                        </>
                      ) : null}
                    </div>

                    {studentInfo && values?.student ? (
                      <>
                        <div className="subhead-row mt-2 pt-1">
                          <div className="subhead">Student Details</div>
                          <div className="col line-div"></div>
                        </div>

                        {studentInfo && (
                          <StudentCard studentInfo={studentInfo} />
                        )}
                        <>
                          <div className="col-lg-9 mt-3">
                            <SelectFieldFormik
                              label={"Reason"}
                              id="reason"
                              tabIndex={2}
                              mandatory={1}
                              maxlength={15}
                              labelSize={3}
                              style={{ width: "50%" }}
                              options={reasonlist}
                              getOptionLabel={(option) => option.leavingReason}
                              getOptionValue={(option) => option.id}
                              search={false}
                              onChange={(text) => {
                                setFieldValue("reason", text);
                                handleUnSavedChanges(1);
                              }}
                            />
                            <FileField
                              ref={fileInputRef}
                              tabIndex={3}
                              labelSize={3}
                              label="Approval Letter"
                              type="file"
                              id="refDoc"
                              style={{ marginBottom: 5, width: "60%" }}
                              error={errors.refDoc}
                              touched={touched.refDoc}
                              name="refDoc"
                              accept=".pdf, image/*"
                              onChange={(event) => {
                                if (
                                  event.target.files.length > 0 &&
                                  handleFileUpload(event)
                                )
                                  setFieldValue(
                                    "refDoc",
                                    event.target.files[0]
                                  );
                                else setFieldValue("refDoc", null);
                              }}
                            />
                          </div>
                          <Button
                            id="save"
                            tabIndex={4}
                            text="F4 - Save"
                            type="submit"
                            onClick={(e) => {
                              preFunction.handleErrorFocus(errors);
                            }}
                          />
                        </>
                      </>
                    ) : null}
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
      <Modal
        show={newReasonModel}
        dialogClassName="my-modal"
        onEscapeKeyDown={(e) => setNewReasonModel(false)}
      >
        <Formik
          enableReinitialize={true}
          innerRef={newReasonRef}
          initialValues={{
            newReason: "",
          }}
          validationSchema={ReasonSchema}
          onSubmit={handleAddNewReason}
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
                  <Modal.Title>New Reason</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div style={{ width: "600px" }}>
                    <div className="row col-lg-9">
                      <TextFieldFormik
                        autoFocus
                        tabIndex={5}
                        label="Reason"
                        id="newReason"
                        mandatory={1}
                        style={{ width: "100%" }}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <div className="row ">
                    <div className="col-lg-6 d-flex justify-content-end">
                      <Button
                        tabIndex={6}
                        isTable={true}
                        text="Save"
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                    </div>

                    <div className="col-lg-6 d-flex justify-content-start p-0">
                      <Button
                        tabIndex={7}
                        isTable={true}
                        text="Close"
                        type="button"
                        onClick={(e) => {
                          setNewReasonModel(false);
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

export default AdmissionCancel;
