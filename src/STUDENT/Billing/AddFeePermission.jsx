import React, { useState, useRef, useContext } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import * as Yup from "yup";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import { Modal } from "react-bootstrap";

import StudentApi from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import TextAreaFieldFormik from "../../component/FormField/TextareaFieldFormik";
import FileField from "../../component/FormField/FileField";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import StudentCard from "../../component/StudentCard";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import { allowedFileExtensions } from "../../component/common/CommonArray";
import CommonApi from "../../component/common/CommonApi";

import string from "../../string";

import AuthContext from "../../auth/context";

const FormSchema = Yup.object().shape({
  permissionUpto: Yup.date().required("Please select Permision Upto date"),
  amount: Yup.number().required("Please enter Amount"),
  refDoc: Yup.string().required("Please choose Document Proof"),
  note: Yup.string().required("Please enter Note"),
});

function AddFeePermission() {
  //#region const
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [studentInfo, setStudentInfo] = useState();
  const [studentId, setStudentId] = useState();
  const [permissionList, setPermissionList] = useState([]);
  const [documentProof, setDocumentProof] = useState();
  const [fileError, setFileError] = useState(false);
  const [fileType, setFileType] = useState();
  const [feeDueList, setFeeDueList] = useState([]);
  const [totalBalance, setTotalBalance] = useState("");
  const [amountError, setAmountError] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { setUnSavedChanges, collegeId, role } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  //#endregion

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
      setModalMessage("Please choose file size less than 2MB");
      setModalErrorOpen(true);
      setModalTitle("File Size");
      setLoad(false);
      return false;
    }

    if (!allowedFileExtensions.includes(e.target.files[0].name.split(".")[1])) {
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      setModalErrorOpen(true);
      setModalTitle("File Type");
      setLoad(false);
      return false;
    }
    setFileType(e.target.files[0].name.split(".")[1]);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setDocumentProof(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    return true;
  };

  const searchStudent = async (value) => {
    setStudentList(
      await CommonApi.searchStudent(
        value,
        collegeConfig.common_cashier == 1 || role == "SuperAdmin"
          ? null
          : collegeId
      )
    );
  };

  const handleSave = async (values) => {
    if (load) return;
    console.log("values---", values);
    if (values.amount > totalBalance) {
      setAmountError(true);
      document.getElementById("amount")?.focus();
      return;
    }

    try {
      setLoad(true);

      console.log("documentProof--", documentProof);
      let proofUrl = values.refDoc;
      if (documentProof) {
        const response = await StudentApi.uploadFile(
          "permission",
          fileType,
          documentProof.split(",")[1]
        );
        console.log("response--", response);
        if (!response.data.message.success) {
          setModalMessage(response.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        proofUrl = response.data.message.data.file_url;
      }
      console.log("proofUrl---", proofUrl);
      const addFeesPermissionRes = await StudentApi.addFeesPermission(
        null,
        studentInfo.studentID,
        studentInfo.semester,
        values.amount,
        moment(values.permissionUpto).format("yyyy-MM-DD"),
        values.note,
        proofUrl
      );
      console.log("addFeesPermissionRes---", addFeesPermissionRes);
      if (!addFeesPermissionRes.data.message.success) {
        setModalMessage(addFeesPermissionRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(addFeesPermissionRes.data.message.message);
      document.getElementById("student")?.focus();
      setOpenModal(false);
      setLoad(false);

      setDocumentProof();
      formikRef.current.setFieldValue("feesPermissionID", "");
      formikRef.current.setFieldValue("permissionUpto", "");
      formikRef.current.setFieldValue("note", "");
      formikRef.current.setFieldValue("refDoc", "");
      handleSelectStudent(studentId);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelectStudent = async (value) => {
    try {
      setLoad(true);
      setStudentInfo();
      setPermissionList([]);
      handleUnSavedChanges(0);

      if (value) {
        const getStudentFeePermissionDetail =
          await StudentApi.getStudentFeePermissionDetail(value.id);
        console.log(
          "getStudentFeePermissionDetail--",
          getStudentFeePermissionDetail
        );
        if (!getStudentFeePermissionDetail.data.message.success) {
          setModalMessage(getStudentFeePermissionDetail.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        setStudentInfo(getStudentFeePermissionDetail.data.message.data.student);
        setPermissionList(
          getStudentFeePermissionDetail.data.message.data.feesPermission
        );
        setFeeDueList(getStudentFeePermissionDetail.data.message.data.feesDue);
        let totalBal = 0;
        for (
          let i = 0;
          i < getStudentFeePermissionDetail.data.message.data.feesDue.length;
          i++
        ) {
          totalBal +=
            getStudentFeePermissionDetail.data.message.data.feesDue[i].balance;
        }
        console.log("totalBalance", totalBal);
        setTotalBalance(totalBal);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

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
        <div className="row no-gutters">
          <div className="col-lg-9">
            <ReactSelectField
              autoFocus
              label={"Student No. / Name"}
              labelSize={3}
              id="student"
              mandatory={1}
              clear={true}
              value={studentId}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              options={studentList}
              onInputChange={(text) => {
                searchStudent(text);
              }}
              onChange={(etxt) => {
                setStudentId(etxt);
                handleSelectStudent(etxt);
              }}
            />
          </div>
          {studentId &&
          feeDueList?.length > 0 &&
          (permissionList?.length == 0 ||
            new Date(
              permissionList[permissionList.length - 1]?.permissionUpto
            ) < new Date()) ? (
            <div className="col-lg-3 text-right">
              <Button
                autoFocus
                className={"btn-green"}
                type="button"
                frmButton={false}
                text={"Add Permission"}
                onClick={() => {
                  handleUnSavedChanges(1);
                  setOpenModal(true);
                  setAmountError(false);
                }}
              />
            </div>
          ) : null}
        </div>
        {studentInfo && (
          <>
            <div className="row no-gutters">
              <div className="subhead-row">
                <div className="subhead">Student Detail</div>
                <div className="col line-div"></div>
              </div>
            </div>
            <StudentCard studentInfo={studentInfo} />
            <>
              <div className="row no-gutters">
                <div className="subhead-row">
                  <div className="subhead">Fees Due Detail</div>
                  <div className="col line-div"></div>
                </div>
                <div className="table-responsive mt-1">
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th>Particular</th>
                        <th width="10%">Opening Balance (₹)</th>
                        <th width="10%">Concession (₹)</th>
                        <th width="5%">Paid (₹)</th>
                        <th width="5%">Refund (₹)</th>
                        <th width="10%">Outstanding Balance (₹)</th>
                      </tr>
                    </thead>
                    {feeDueList.length === 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan={9} align="center">
                            No Fees Due found
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody>
                        {feeDueList.map((item, index) => {
                          return (
                            <>
                              <tr>
                                <td>{index + 1}</td>
                                <td>{item.particular}</td>
                                <td align="right">{item.openingBalance}</td>
                                <td align="right">{item.concession}</td>
                                <td align="right">{item.paid}</td>
                                <td align="right">{item.refund}</td>
                                <td align="right">{item.balance}</td>
                              </tr>
                            </>
                          );
                        })}
                        <tr>
                          <td
                            colSpan="6"
                            align="right"
                            className="student-text"
                          >
                            Total
                          </td>
                          <td
                            colSpan="5"
                            align="right"
                            className="student-text"
                          >
                            {totalBalance}
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
            </>
            <div className="row no-gutters">
              <div className="subhead-row">
                <div className="subhead">Permission History</div>
                <div className="col line-div"></div>
              </div>
              <div className="row no-gutters">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th width="10%">Permission Upto</th>
                        <th width="13%">{RENAME.sem}</th>
                        <th width="7%">Amount (₹)</th>
                        <th width="20%">Document</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    {permissionList?.length > 0 ? (
                      <tbody>
                        {permissionList.map((item, index) => (
                          <tr>
                            <td>{index + 1}</td>
                            <td>
                              {moment(item.permissionUpto).format("DD-MM-yyyy")}
                            </td>
                            <td>
                              {collegeConfig.institution_type == 1
                                ? item.className
                                : item.semester}
                            </td>
                            <td align="right">{item.amount}</td>
                            <td>
                              <a
                                href={string.FILEURL + item.filepath}
                                target="_blank"
                              >
                                Permission Letter
                              </a>
                            </td>
                            <td>{item.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    ) : (
                      <tbody>
                        <tr>
                          <td colSpan={6} align="center">
                            No history Found
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Modal
        show={openModal}
        dialogClassName="my-modal"
        onEscapeKeyDown={() => setOpenModal(false)}
      >
        <Modal.Header>
          <Modal.Title>Add Permission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              feesPermissionID: null,
              permissionUpto: null,
              note: null,
              refDoc: "",
              amount: "",
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
                  <div className="row no-gutters p-3">
                    <DateFieldFormik
                      autoFocus
                      tabIndex={1}
                      label="Permission Upto"
                      labelSize={4}
                      id="permissionUpto"
                      mandatory={1}
                      maxDate={new Date(moment().add(1, "years"))}
                      minDate={new Date(moment().add(1, "day"))}
                      style={{ width: "40%" }}
                      onChange={(e) => {
                        setFieldValue("permissionUpto", e.target.value);
                      }}
                    />
                    <TextFieldFormik
                      id="amount"
                      label="Amount (₹)"
                      labelSize={4}
                      placeholder=" "
                      mandatory={1}
                      isAmount={true}
                      maxlength={7}
                      style={{ width: "30%" }}
                      tabIndex={2}
                      error={
                        amountError
                          ? `Amount exceeded the Due Balance ( ${totalBalance} )`
                          : ""
                      }
                      onChange={(e) => {
                        if (preFunction.amountValidation(e.target.value)) {
                          setFieldValue("amount", e.target.value);
                          setAmountError(false);
                        }
                      }}
                    />
                    <FileField
                      label="Document Proof"
                      labelSize={4}
                      tabIndex={3}
                      type="file"
                      id="refDoc"
                      name="refDoc"
                      accept=".pdf, image/*"
                      onChange={(event) => {
                        setFileError(false);
                        if (event.target.files[0] && handleFileUpload(event))
                          setFieldValue("refDoc", event.target.files[0]);
                        else setFieldValue("refDoc", null);
                      }}
                      error={
                        errors.refDoc
                          ? errors.refDoc
                          : fileError
                          ? "Please choose Proof document"
                          : ""
                      }
                      touched={
                        touched.refDoc
                          ? touched.refDoc
                          : fileError
                          ? true
                          : false
                      }
                    />
                    <TextAreaFieldFormik
                      maxlength={140}
                      labelSize={4}
                      id={`note`}
                      name="note"
                      tabIndex={4}
                      label="Note"
                      placeholder="Note"
                      value={values.note}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("note", e.target.value);
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <Button
                      className={"btn me-4"}
                      frmButton={false}
                      tabIndex={5}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                      }}
                      id="save"
                      text="F4 - Save"
                    />
                    <Button
                      text="Close"
                      type="button"
                      frmButton={false}
                      onClick={(e) => {
                        setOpenModal(false);
                      }}
                    />
                  </div>
                </form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default AddFeePermission;
