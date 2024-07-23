import React, { useContext, useRef, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import * as Yup from "yup";
import { Formik } from "formik";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import ErrorMessage from "../../component/common/ErrorMessage";
import FileField from "../../component/FormField/FileField";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import TextAreaFieldFormik from "../../component/FormField/TextareaFieldFormik";
import TextField from "../../component/FormField/TextField";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import CommonApi from "../../component/common/CommonApi";
import StudentCard from "../../component/StudentCard";
import {
  YesNoList,
  authorizedByList,
} from "../../component/common/CommonArray";

import AuthContext from "../../auth/context";
import string from "../../string";

const FormSchema = Yup.object().shape({
  authorizedBy: Yup.object().required("Please select Authorized By"),
  referenceNumber: Yup.number().required("Please enter Reference Number"),
  refDate: Yup.string().required("Please choose Reference Date"),
  refDoc: Yup.string().required("Please choose Document Proof"),
  note: Yup.string().required("Please enter Note"),
});

function FeeModification() {
  const [load, setLoad] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [studentInfo, setStudentInfo] = useState();
  const [feeDueList, setFeeDueList] = useState([]);
  const [documentProof, setDocumentProof] = useState();
  const [fileType, setFileType] = useState();
  const [showAmountError, setShowAmountError] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const formikRef = useRef();

  const collegeConfig = useSelector((state) => state.web.college);
  const { setUnSavedChanges, collegeId, role } = useContext(AuthContext);

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
      setModalTitle("File Type Error");
      setLoad(false);
      return false;
    }

    if (
      e.target.files[0].type != "application/pdf" &&
      !e.target.files[0].type.includes("image")
    ) {
      setModalMessage("Please upload Image / PDF file only");
      setModalErrorOpen(true);
      setModalTitle("File Type Error");
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
    console.log("values---", values);

    if (load) return;
    try {
      setShowAmountError(false);
      console.log("feeDueList----", feeDueList);
      let setModifyOutstanding = 0;
      for (let i = 0; i < feeDueList.length; i++) {
        if (feeDueList[i].modifiedBalance) {
          setModifyOutstanding = 1;
        }
      }
      console.log("setModifyOutstanding---", setModifyOutstanding);
      if (setModifyOutstanding == 0) {
        setShowAmountError(true);
        document.getElementById("amount0")?.focus();
        return;
      }

      setLoad(true);
      const response = await StudentApi.uploadFile(
        "fees_modification",
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
      let proofUrl = response.data.message.data.file_url;
      console.log("proofUrl--------", proofUrl);
      handleAddFeeModification(proofUrl, values);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleAddFeeModification = async (proofUrl, values) => {
    try {
      let feesModificationDetail = [];
      for (let i = 0; i < feeDueList.length; i++) {
        if (feeDueList[i].modifiedBalance > 0) {
          feesModificationDetail.push({
            feesDueID: feeDueList[i].id,
            modifyOpeningBalance: parseInt(feeDueList[i].modifiedBalance),
          });
        }
      }
      console.log("feesModificationDetail----", feesModificationDetail);
      console.log("feeDueList----", feeDueList);

      const addStudentFeeModificationRes = await StudentApi.addFeeModification(
        values.student.id,
        values.student.batchID,
        values.authorizedBy.value,
        values.referenceNumber,
        moment(values.refDate).format("yyyy-MM-DD"),
        values.note,
        0,
        proofUrl,
        feesModificationDetail
      );
      console.log(
        "addStudentFeeModificationRes---",
        addStudentFeeModificationRes
      );
      setLoad(false);
      if (!addStudentFeeModificationRes.data.message.success) {
        setModalMessage(addStudentFeeModificationRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(addStudentFeeModificationRes.data.message.message);
      handleUnSavedChanges(0);
      formikRef.current.resetForm();
      handleSelectStudent("");
      setShowRes(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelectStudent = async (value) => {
    try {
      setLoad(true);
      handleUnSavedChanges(0);
      setFeeDueList([]);
      if (value) {
        setShowRes(true);

        const getStudentFeeModificationDetail =
          await StudentApi.getModificationDetail(value.id);
        console.log(
          "getStudentFeeModificationDetail--",
          getStudentFeeModificationDetail
        );
        if (!getStudentFeeModificationDetail.data.message.success) {
          setModalMessage(getStudentFeeModificationDetail.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        // setStudentInfo(
        //   getStudentFeeModificationDetail.data.message.data.student_data[0]
        // );
        const updatedData =
          getStudentFeeModificationDetail.data.message.data.dueData.map(
            (item) => ({
              ...item,
              modifiedBalance: 0,
            })
          );
        setFeeDueList(updatedData);

        document.getElementById("authorizedBy")?.focus();
        handleUnSavedChanges(1);
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
        <Formik
          enableReinitialize={false}
          innerRef={formikRef}
          initialValues={{
            student: "",
            authorizedBy: "",
            referenceNumber: "",
            refDate: new Date(),
            refDoc: "",
            note: "",
            // isDiscount: false,
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
            resetForm,
          }) => {
            return (
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="row no-gutters mt-2">
                  <div className="col-lg-10">
                    <SelectFieldFormik
                      autoFocus
                      label={"Student No. / Name"}
                      labelSize={3}
                      id="student"
                      mandatory={1}
                      tabIndex="1"
                      clear={true}
                      searchIcon={true}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id}
                      options={studentList}
                      style={{ width: "90%" }}
                      onInputChange={(text) => {
                        searchStudent(text);
                      }}
                      onChange={(etxt) => {
                        setFieldValue("student", etxt);
                        handleSelectStudent(etxt);
                        if (!etxt) {
                          setFeeDueList([]);
                          setShowRes(false);
                          resetForm();
                        }
                      }}
                      maxlength={30}
                    />
                  </div>

                  {showRes && (
                    <>
                      <div className="subhead-row">
                        <div className="subhead">Student Detail </div>
                        <div className="col line-div"></div>
                      </div>

                      <StudentCard studentInfo={values.student} />
                      {feeDueList.length > 0 ? (
                        <>
                          <div className="row no-gutters">
                            <div className="subhead-row">
                              <div className="subhead">
                                Authorization Detail{" "}
                              </div>
                              <div className="col line-div"></div>
                            </div>
                          </div>
                          <div className="col-lg-10">
                            <SelectFieldFormik
                              autoFocus
                              tabIndex="2"
                              label={"Authorized By"}
                              labelSize={3}
                              id="authorizedBy"
                              mandatory={1}
                              options={authorizedByList}
                              style={{ width: "40%" }}
                              searchIcon={false}
                              onChange={(etxt) => {
                                setFieldValue("authorizedBy", etxt);
                              }}
                              maxlength={30}
                            />
                            <TextFieldFormik
                              maxlength={20}
                              id={`referenceNumber`}
                              label="Reference No."
                              labelSize={3}
                              tabIndex="3"
                              mandatory={1}
                              style={{ width: "40%" }}
                              onChange={(e) => {
                                if (
                                  preFunction.amountValidation(e.target.value)
                                ) {
                                  setFieldValue(
                                    "referenceNumber",
                                    e.target.value
                                  );
                                }
                              }}
                            />
                            <DateFieldFormik
                              label="Reference Date"
                              labelSize={3}
                              id="refDate"
                              tabIndex="4"
                              value={values.refDate}
                              style={{ width: "25%" }}
                              onChange={(e) => {
                                setFieldValue("refDate", e.target.value);
                              }}
                              minDate={moment().subtract(1, "months")}
                              maxDate={moment()}
                            />
                            <FileField
                              label="Document Proof"
                              labelSize={3}
                              type="file"
                              id="refDoc"
                              tabIndex="5"
                              mandatory={1}
                              error={errors.refDoc}
                              touched={touched.refDoc}
                              name="refDoc"
                              accept=".pdf, image/*"
                              style={{ width: "60%" }}
                              onChange={(event) => {
                                if (
                                  event.target.files[0] &&
                                  handleFileUpload(event)
                                )
                                  setFieldValue(
                                    "refDoc",
                                    event.target.files[0]
                                  );
                                else setFieldValue("refDoc", null);
                              }}
                            />

                            <TextAreaFieldFormik
                              id={`note`}
                              name="note"
                              label="Note"
                              tabIndex="6"
                              labelSize={3}
                              placeholder="Note"
                              style={{ width: "60%" }}
                              maxlength={140}
                              value={values.note}
                              mandatory={1}
                              onChange={(e) => {
                                setFieldValue("note", e.target.value);
                              }}
                            />
                          </div>
                        </>
                      ) : null}
                      <div className="row no-gutters">
                        <div className="subhead-row">
                          <div className="subhead">
                            Fees Modification Detail
                          </div>
                          <div className="col line-div"></div>
                        </div>
                        <table className="table table-bordered m-0">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th>Particular</th>
                              <th width="10%">Opening Bal. (₹)</th>
                              <th width="5%">Paid (₹)</th>
                              <th width="5%">Concession (₹)</th>
                              <th width="5%">Refund (₹)</th>
                              <th width="10%">Outstanding Bal.(₹)</th>
                              <th width="10%">Modify Opening Bal. (₹)</th>
                            </tr>
                          </thead>

                          <tbody>
                            {feeDueList.length === 0 ? (
                              <tr>
                                <td colspan={9} align="center">
                                  No Due Found
                                </td>
                              </tr>
                            ) : (
                              feeDueList.map((item, index) => {
                                return (
                                  <tr>
                                    <td>{index + 1}</td>
                                    <td>{item.particular}</td>
                                    <td align="right">{item.openingBalance}</td>
                                    <td align="right">{item.paid}</td>
                                    <td align="right">{item.concession}</td>
                                    <td align="right">{item.refund}</td>
                                    <td align="right">{item.balance}</td>
                                    <td align="right">
                                      <TextField
                                        isAmount={true}
                                        maxlength={7}
                                        id={`amount${index}`}
                                        placeholder=" "
                                        value={item.modifiedBalance}
                                        tabIndex={7 + index}
                                        error={
                                          item.modifiedBalance &&
                                          item.modifiedBalance <
                                            item.openingBalance - item.balance
                                            ? `Please enter greater than or equal to ${
                                                item.openingBalance -
                                                item.balance
                                              }`
                                            : ""
                                        }
                                        touched={
                                          item.modifiedBalance &&
                                          item.modifiedBalance <
                                            item.openingBalance - item.balance
                                            ? 1
                                            : 0
                                        }
                                        mandatory={1}
                                        onChange={(e) => {
                                          setShowAmountError(false);
                                          if (
                                            preFunction.amountValidation(
                                              e.target.value
                                            )
                                          ) {
                                            feeDueList[index].modifiedBalance =
                                              e.target.value;
                                            setFeeDueList([...feeDueList]);
                                          }
                                        }}
                                      />
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                        <div className="mt-1">
                          <ErrorMessage
                            Message={
                              "Please enter atleast one amount to Modify Opening Balance"
                            }
                            view={showAmountError}
                          />
                        </div>
                      </div>
                      {feeDueList.length > 0 ? (
                        <Button
                          tabIndex={7 + feeDueList.length}
                          onClick={(e) => {
                            preFunction.handleErrorFocus(errors);
                          }}
                          id="save"
                          text="F4 - Save"
                        />
                      ) : null}
                    </>
                  )}
                </div>
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default FeeModification;
