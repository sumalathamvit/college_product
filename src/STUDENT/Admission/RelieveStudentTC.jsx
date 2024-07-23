import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import moment from "moment";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import * as Yup from "yup";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import StudentCard from "../../component/StudentCard";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import PdfComponent from "../../component/common/PdfComponent";
import CommonApi from "../../component/common/CommonApi";
import { allowedFileExtensions } from "../../component/common/CommonArray";
import FileField from "../../component/FormField/FileField";
import AuthContext from "../../auth/context";
import TCPdfDetail from "../../component/TCPdfDetail";
import string from "../../string";

function RelieveStudentTC() {
  //#region const
  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();
  const newReasonRef = useRef();
  const [load, setLoad] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [studentInfo, setStudentInfo] = useState();
  const [feeDueList, setFeeDueList] = useState([]);
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

  const [showEnrollNo, setShowEnrollNo] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [openModal, setOpenModal] = useState(false);
  //#endregion

  const FormSchema = Yup.object().shape({
    reason: Yup.object().required("Please select Reason"),
    refDoc: Yup.string().required("Please choose Document Proof"),
    relieveDate: Yup.string().required("Please select Relieve Date"),
    issueDate: Yup.string().required("Please select Issue Date"),
  });

  const ReasonSchema = Yup.object().shape({
    newReason: Yup.string().required("Please enter Reason"),
  });

  const paidOldTot = feeDueList.reduce((total, item) => total + item.paid, 0);
  const refundTot = feeDueList.reduce((total, item) => total + item.refund, 0);
  const outstandTot = feeDueList.reduce(
    (total, item) => total + item.balance,
    0
  );
  const concessionTot = feeDueList.reduce(
    (total, item) => total + item.concession,
    0
  );
  const openBalTot = feeDueList.reduce(
    (total, item) => total + item.openingBalance,
    0
  );

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

  const handleReprint = async () => {
    setOpenModal(true);
    setTimeout(() => {
      setOpenModal(false);
    }, 100);
  };

  const searchStudent = async (value) => {
    setStudentList(await CommonApi.searchStudent(value));
  };

  const handleAddNewReason = async (values) => {
    console.log("values", values);
    try {
      setLoad(true);
      const addNewReason = await StudentApi.addNewLeavingReason(
        values.newReason,
        0
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

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("values", values);

    try {
      let proofUrl = null;

      if (file) {
        const response = await StudentApi.uploadFile(
          "tc_approve_letter",
          fileType,
          file.split(",")[1]
        );
        console.log("response--", response);
        proofUrl = response.data.message.data.file_url;
      }
      console.log("proofUrl--------", proofUrl);
      setLoad(true);

      const adjustStudentDueTC = await StudentApi.adjustStudentDue(
        studentInfo?.studentID,
        studentInfo?.semester,
        values.issueDate,
        values.relieveDate,
        values.relieveDate,
        values.reason.id,
        proofUrl,
        collegeConfig.institution_type
      );
      console.log("adjustStudentDueTC--->", adjustStudentDueTC);

      if (!adjustStudentDueTC.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(adjustStudentDueTC.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFileType("");
      setFile("");
      setFeeDueList([]);
      handleUnSavedChanges(0);

      const getTcDetails = await StudentApi.getTransferCertificate(
        studentInfo?.studentID,
        collegeConfig.institution_type
      );
      console.log("getStudentFeeDueDetailRes--", getTcDetails);
      if (!getTcDetails.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(getTcDetails.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      setShowEnrollNo(true);
      let pdfContent = <TCPdfDetail viewTCdetails={getTcDetails} />;
      setPdfContent(pdfContent);
      setStudentInfo([]);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleSelectStudent = async (value) => {
    try {
      setLoad(true);
      handleUnSavedChanges(0);
      setStudentInfo();
      if (value) {
        const getFeeDueDetailRes = await StudentApi.getTransferCertificate(
          value.id,
          collegeConfig.institution_type
        );
        console.log("getStudentFeeDueDetailRes--", getFeeDueDetailRes);
        if (!getFeeDueDetailRes.data.message.success) {
          setModalErrorOpen(true);
          setModalMessage(getFeeDueDetailRes.data.message.message);
          setModalTitle("Message");
          setLoad(false);
          return;
        }

        if (getFeeDueDetailRes.data.message.data.feesDue.length > 0) {
          for (
            let i = 0;
            i < getFeeDueDetailRes.data.message.data.feesDue.length;
            i++
          ) {
            if (
              getFeeDueDetailRes.data.message.data.feesDue[i].particular ==
              "Excess Fees"
            ) {
              getFeeDueDetailRes.data.message.data.feesDue =
                getFeeDueDetailRes.data.message.data.feesDue.filter(
                  (m) => m !== getFeeDueDetailRes.data.message.data.feesDue[i]
                );
              continue;
            }
          }
        }
        setStudentInfo(
          getFeeDueDetailRes?.data?.message?.data.transfer_certificate[0]
        );
        setFeeDueList(getFeeDueDetailRes?.data?.message?.data.feesDue);
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
      setReasonList(masterList.data.message.data.transfer_leaving_reason);
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
          {!showEnrollNo ? (
            <Formik
              enableReinitialize={true}
              innerRef={formikRef}
              initialValues={{
                studentId: "",
                refDoc: "",
                reason: "",
                relieveDate: moment().format("YYYY-MM-DD"),
                issueDate: moment().format("YYYY-MM-DD"),
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
                              handleSelectStudent(text);
                              setFieldValue("reason", "");
                              setFieldValue("refDoc", "");
                            }}
                          />
                        </div>
                        {values?.student && feeDueList?.length == 0 ? (
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
                        </>
                      ) : null}
                      {values?.student && studentInfo ? (
                        <>
                          {feeDueList.length > 0 ? (
                            <>
                              <div className="row p-0">
                                <div className="subhead-row p-0">
                                  <div className="subhead"> Fees Detail</div>
                                  <div className="col line-div"></div>
                                </div>
                                <div className="row p-0 mt-1">
                                  <div className="table-responsive row p-0">
                                    <table className="table table-bordered table-hover">
                                      <thead>
                                        <tr>
                                          <th width="1%">No.</th>
                                          <th width="10%">{RENAME?.sem}</th>
                                          <th>Particular</th>
                                          <th width="10%">
                                            Opening Balance (₹)
                                          </th>
                                          <th width="5%">Concession (₹)</th>
                                          <th width="5%">Paid (₹)</th>
                                          <th width="5%">Refund (₹)</th>
                                          <th width="10%">
                                            Outstanding Balance (₹)
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {feeDueList.map((item, index) => {
                                          return (
                                            <tr>
                                              <td>{index + 1}</td>
                                              <td>
                                                {collegeConfig.institution_type ===
                                                1
                                                  ? item.className
                                                  : item.semester}
                                              </td>
                                              <td>{item.particular}</td>
                                              <td align="right">
                                                {item.openingBalance}
                                              </td>
                                              <td align="right">
                                                {item.concession}
                                              </td>
                                              <td align="right">{item.paid}</td>
                                              <td align="right">
                                                {item.refund}
                                              </td>
                                              <td align="right">
                                                {item.balance}
                                              </td>
                                            </tr>
                                          );
                                        })}

                                        <tr>
                                          <td
                                            colSpan="3"
                                            align="right"
                                            className="student-text"
                                          >
                                            Total
                                          </td>
                                          <td
                                            align="right"
                                            className="student-text"
                                          >
                                            {openBalTot}
                                          </td>
                                          <td
                                            align="right"
                                            className="student-text"
                                          >
                                            {concessionTot}
                                          </td>
                                          <td
                                            align="right"
                                            className="student-text"
                                          >
                                            {paidOldTot}
                                          </td>

                                          <td
                                            align="right"
                                            className="student-text"
                                          >
                                            {refundTot}
                                          </td>
                                          <td
                                            align="right"
                                            className="student-text"
                                          >
                                            {outstandTot}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                                <div
                                  className="error-message text-center"
                                  style={{ fontSize: "18px" }}
                                >
                                  Transfer Certificate will be issued only after
                                  the due amount is cleared
                                </div>
                              </div>
                            </>
                          ) : (
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
                                  getOptionLabel={(option) =>
                                    option.leavingReason
                                  }
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
                                    handleUnSavedChanges(1);
                                  }}
                                />
                                <DateFieldFormik
                                  tabIndex={4}
                                  label="Relieve Date"
                                  id="relieveDate"
                                  labelSize={3}
                                  minDate={
                                    new Date(moment().subtract(1, "months"))
                                  }
                                  maxDate={new Date()}
                                  mandatory={1}
                                  style={{ width: "25%" }}
                                  onChange={(e) => {
                                    handleUnSavedChanges(1);
                                    setFieldValue(
                                      "relieveDate",
                                      e.target.value
                                    );
                                  }}
                                />
                                <DateFieldFormik
                                  tabIndex={5}
                                  label="Issue Date"
                                  id="issueDate"
                                  labelSize={3}
                                  minDate={
                                    new Date(moment().subtract(1, "months"))
                                  }
                                  maxDate={new Date()}
                                  mandatory={1}
                                  style={{ width: "25%" }}
                                  onChange={(e) => {
                                    handleUnSavedChanges(1);
                                    setFieldValue("issueDate", e.target.value);
                                  }}
                                />
                              </div>
                              <Button
                                tabIndex={6}
                                text="Issue"
                                type="submit"
                                onClick={(e) => {
                                  preFunction.handleErrorFocus(errors);
                                }}
                              />
                            </>
                          )}
                        </>
                      ) : null}
                    </div>
                  </form>
                );
              }}
            </Formik>
          ) : (
            <>
              {pdfContent}

              <div className="text-center">
                <Button
                  frmButton={false}
                  tabIndex={1}
                  type="button"
                  onClick={() => handleReprint()}
                  text="RePrint"
                />
                <Button
                  tabIndex={2}
                  className={"btn ms-2"}
                  frmButton={false}
                  text={"View Another Student"}
                  onClick={() => {
                    setShowEnrollNo(false);
                    formikRef?.current?.resetForm();
                  }}
                />
              </div>
            </>
          )}
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
                        tabIndex={8}
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
                        tabIndex={9}
                        isTable={true}
                        text="Save"
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                    </div>

                    <div className="col-lg-6 d-flex justify-content-start p-0">
                      <Button
                        tabIndex={10}
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
      <div
        style={{
          display: "none",
        }}
      >
        {openModal ? (
          <PdfComponent
            printContent={pdfContent}
            paperSize="a4"
            orientation="portrait"
            handleClick={() => {
              setOpenModal(false);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default RelieveStudentTC;
