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

function FeeConcession() {
  const [load, setLoad] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [studentInfo, setStudentInfo] = useState();
  const [feeDueList, setFeeDueList] = useState([]);
  const [feeConcessionList, setFeeConcessionList] = useState([]);
  const [documentProof, setDocumentProof] = useState();
  const [fileType, setFileType] = useState();
  const [showAmountError, setShowAmountError] = useState(false);
  const [feeDueError, setFeeDueError] = useState(false);

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
    if (load) return;
    try {
      setShowAmountError(false);
      console.log("feeConcessionList----", feeConcessionList);
      let setConcession = 0;
      for (let i = 0; i < feeConcessionList.length; i++) {
        if (feeConcessionList[i].concession) {
          setConcession = 1;
        }
      }
      console.log("setConcession---", setConcession);
      if (setConcession == 0) {
        setShowAmountError(true);
        document.getElementById("amount0")?.focus();
        return;
      }
      for (let i = 0; i < feeConcessionList.length; i++) {
        if (feeConcessionList[i].concession > feeConcessionList[i].balance) {
          feeConcessionList[i].concessionError = true;
          setFeeConcessionList([...feeConcessionList]);
          document.getElementById(`amount${i}`)?.select();
          return;
        }
      }
      setLoad(true);
      const response = await StudentApi.uploadFile(
        "concession",
        fileType,
        documentProof.split(",")[1]
      );
      console.log("response--", response);
      if (!response.data.message.success) {
        setModalMessage(response.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Already Exists");
        setLoad(false);
        return;
      }
      let proofUrl = response.data.message.data.file_url;
      console.log("proofUrl--------", proofUrl);
      handleAddFeeConcession(proofUrl, values);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleAddFeeConcession = async (proofUrl, values) => {
    try {
      let feesConcessionDetail = [];
      for (let i = 0; i < feeConcessionList.length; i++) {
        if (feeConcessionList[i].concession > 0) {
          feesConcessionDetail.push({
            feesDueID: feeConcessionList[i].feesDueID,
            particularID: feeConcessionList[i].particularID,
            concessionAmount: feeConcessionList[i].concession,
            isEveryYear: feeConcessionList[i].repeat.value,
          });
        }
      }
      console.log("feeConcessionList----", feeConcessionList);
      console.log("feesConcessionDetail----", feesConcessionDetail);
      console.log("feeDueList----", feeDueList);

      const addStudentFeeConcessionRes =
        await StudentApi.addStudentFeeConcession(
          studentInfo.studentID,
          studentInfo.batchID,
          studentInfo.semester,
          studentInfo.studyYear,
          values.authorizedBy.value,
          proofUrl,
          values.referenceNumber,
          moment(values.refDate).format("yyyy-MM-DD"),
          values.note,
          feesConcessionDetail
        );
      console.log("addStudentFeeConcessionRes---", addStudentFeeConcessionRes);
      setLoad(false);
      if (!addStudentFeeConcessionRes.data.message.success) {
        setModalMessage(addStudentFeeConcessionRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Already Exists");
        setLoad(false);
        return;
      }
      toast.success(addStudentFeeConcessionRes.data.message.message);
      handleUnSavedChanges(0);
      formikRef.current.resetForm();
      handleSelectStudent("");
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelectStudent = async (value) => {
    try {
      setLoad(true);
      handleUnSavedChanges(0);

      setFeeDueError(false);
      setStudentInfo();
      setFeeDueList([]);
      setFeeConcessionList([]);
      if (value) {
        const getStudentFeeModificationDetail =
          await StudentApi.getConcessionDetail(value.id, 1);
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
        setStudentInfo(
          getStudentFeeModificationDetail.data.message.data.student[0]
        );
        setFeeDueList(
          getStudentFeeModificationDetail.data.message.data.fees_detail_history
        );
        if (
          getStudentFeeModificationDetail.data.message.data.fees_detail
            .length == 0
        ) {
          setFeeDueError(true);
          setLoad(false);
          return;
        }
        for (
          let i = 0;
          i <
          getStudentFeeModificationDetail.data.message.data.fees_detail.length;
          i++
        ) {
          getStudentFeeModificationDetail.data.message.data.fees_detail[
            i
          ].repeat = YesNoList[0];
        }
        setFeeConcessionList(
          getStudentFeeModificationDetail.data.message.data.fees_detail
        );
        console.log(
          "getStudentFeeModificationDetail---",
          getStudentFeeModificationDetail
        );
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
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
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
            studentId: "",
            authorizedBy: "",
            referenceNumber: "",
            refDate: new Date(),
            refDoc: "",
            particular: "",
            amount: "",
            note: "",
            isDiscount: false,
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
                <div className="row no-gutters mt-2">
                  <div className="col-lg-10">
                    <ReactSelectField
                      autoFocus
                      label={"Student No. / Name"}
                      labelSize={3}
                      id="student"
                      mandatory={1}
                      tabIndex="1"
                      clear={true}
                      value={values.studentId}
                      placeholder="Student No. / Name"
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id}
                      options={studentList}
                      style={{ width: "90%" }}
                      onInputChange={(text) => {
                        searchStudent(text);
                      }}
                      onChange={(etxt) => {
                        setFieldValue("studentId", etxt);
                        handleSelectStudent(etxt);
                      }}
                      maxlength={30}
                    />
                  </div>
                  {studentInfo && (
                    <>
                      <div className="subhead-row">
                        <div className="subhead">Student Detail </div>
                        <div className="col line-div"></div>
                      </div>

                      <StudentCard studentInfo={studentInfo} />
                      {feeDueList?.length > 0 ? (
                        <>
                          <div className="row no-gutters">
                            <div className="subhead-row">
                              <div className="subhead">Fees Detail</div>
                              <div className="col line-div"></div>
                            </div>
                            <div className="table-responsive mt-1">
                              <table className="table table-bordered table-hover report-table">
                                <thead>
                                  <tr>
                                    <th width="1%">No.</th>
                                    <th>Particular</th>
                                    <th width="10%">Opening Balance (₹)</th>
                                    <th width="5%">Paid (₹)</th>
                                    <th width="10%">Concession (₹)</th>
                                    <th width="5%">Refund (₹)</th>
                                    <th width="10%">Outstanding Balance (₹)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {feeDueList.map((item, index) => {
                                    return (
                                      <tr>
                                        <td>{index + 1}</td>
                                        <td>{item.particular}</td>
                                        <td align="right">
                                          {item.openingBalance}
                                        </td>
                                        <td align="right">{item.paid}</td>
                                        <td align="right">{item.concession}</td>
                                        <td align="right">{item.refund}</td>
                                        <td align="right">{item.balance}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          {feeDueError ? (
                            <div className="text-center">
                              <ErrorMessage
                                Message={
                                  "Cant apply Concession for this Student. Contact Administrator."
                                }
                                view={feeDueError}
                              />
                            </div>
                          ) : (
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
                                      preFunction.amountValidation(
                                        e.target.value
                                      )
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
                          )}
                          {feeConcessionList.length > 0 ? (
                            <div className="row no-gutters">
                              <div className="subhead-row">
                                <div className="subhead">
                                  Fees Concession Detail
                                </div>
                                <div className="col line-div"></div>
                              </div>
                              <div className="table-responsive">
                                <table className="table table-bordered report-table">
                                  <thead>
                                    <tr>
                                      <th width="1%">No.</th>
                                      <th>Particular</th>
                                      <th width="10%">Opening Bal. (₹)</th>
                                      <th width="5%">Paid (₹)</th>
                                      <th width="5%">Prev. Concession (₹)</th>
                                      <th width="5%">Refund (₹)</th>
                                      <th width="10%">Outstanding Bal.(₹)</th>
                                      <th width="10%">Concession (₹)</th>
                                      <th width="10%">Repeat Every Year</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {feeConcessionList.map((item, index) => {
                                      return (
                                        <tr>
                                          <td>{index + 1}</td>
                                          <td>{item.particular}</td>
                                          <td align="right">
                                            {item.openingBalance}
                                          </td>
                                          <td align="right">{item.paid}</td>
                                          <td align="right">
                                            {item.prevConcession}
                                          </td>
                                          <td align="right">{item.refund}</td>
                                          <td align="right">{item.balance}</td>
                                          <td align="right">
                                            <TextField
                                              isAmount={true}
                                              maxlength={7}
                                              id={`amount${index}`}
                                              placeholder=" "
                                              value={
                                                feeConcessionList[index]
                                                  .concession > 0
                                                  ? feeConcessionList[index]
                                                      .concession
                                                  : ""
                                              }
                                              tabIndex={7 + index}
                                              // style={{ width: "50%" }}
                                              error={
                                                feeConcessionList[index]
                                                  .concessionError
                                                  ? feeConcessionList[index]
                                                      .concession +
                                                    " > " +
                                                    feeConcessionList[index]
                                                      .balance +
                                                    ". Please enter valid Amount."
                                                  : ""
                                              }
                                              touched={
                                                feeConcessionList[index]
                                                  .concessionError
                                                  ? true
                                                  : false
                                              }
                                              mandatory={1}
                                              onChange={(e) => {
                                                setShowAmountError(false);
                                                feeConcessionList[
                                                  index
                                                ].concessionError = false;
                                                if (
                                                  preFunction.amountValidation(
                                                    e.target.value
                                                  )
                                                ) {
                                                  if (
                                                    e.target.value >
                                                    feeConcessionList[index]
                                                      .balance
                                                  ) {
                                                    feeConcessionList[
                                                      index
                                                    ].concessionError = true;
                                                  }
                                                  feeConcessionList[
                                                    index
                                                  ].concession = e.target.value;
                                                  setFeeConcessionList([
                                                    ...feeConcessionList,
                                                  ]);
                                                }
                                              }}
                                            />
                                          </td>
                                          <td>
                                            <ReactSelectField
                                              id="yesno"
                                              mandatory={1}
                                              search={false}
                                              value={
                                                feeConcessionList[index].repeat
                                              }
                                              options={YesNoList}
                                              searchIcon={false}
                                              clear={false}
                                              onChange={(etxt) => {
                                                feeConcessionList[
                                                  index
                                                ].repeat = etxt;
                                                setFeeConcessionList([
                                                  ...feeConcessionList,
                                                ]);
                                              }}
                                            />
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              <div className="mt-1">
                                <ErrorMessage
                                  Message={
                                    "Please enter atleast one Concession Amount"
                                  }
                                  view={showAmountError}
                                />
                              </div>
                            </div>
                          ) : null}
                          {!feeDueError && (
                            <Button
                              tabIndex={7 + feeConcessionList.length}
                              onClick={(e) => {
                                preFunction.handleErrorFocus(errors);
                              }}
                              id="save"
                              text="F4 - Save"
                            />
                          )}
                        </>
                      ) : (
                        <div className="error-message text-center">
                          No Due Found
                        </div>
                      )}
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

export default FeeConcession;
