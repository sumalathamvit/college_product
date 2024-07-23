import React, {
  createRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";
import { Formik } from "formik";
import * as Yup from "yup";

import StudentApi from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import TextField from "../../component/FormField/TextField";
import {
  allowedFileExtensions,
  authorizedByList,
} from "../../component/common/CommonArray";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextAreaFieldFormik from "../../component/FormField/TextareaFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import ErrorMessage from "../../component/common/ErrorMessage";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import StudentCard from "../../component/StudentCard";
import FileField from "../../component/FormField/FileField";

import AuthContext from "../../auth/context";
import string from "../../string";

const isRequiredWhenNotCash = function (value) {
  const paymentMode = this.parent.paymentMode;
  return !(paymentMode && paymentMode.paymentMode !== "Cash") || !!value;
};

const FormSchema = Yup.object().shape({
  paymentMode: Yup.object().required("Please select Payment Mode"),
  bankName: Yup.object().test(
    "isRequired",
    "Please enter Bank Name",
    isRequiredWhenNotCash
  ),
  branch: Yup.string()
    .min(3, "Must be at least 3 characters long", isRequiredWhenNotCash)
    .matches(
      /^[A-Za-z0-9\s,.'\-&@#]+$/,
      "Please enter valid Branch Name",
      isRequiredWhenNotCash
    )
    .trim(isRequiredWhenNotCash)
    .test("isRequired", "Please enter Branch", isRequiredWhenNotCash),

  paidDate: Yup.date().test(
    "isRequired",
    "Please enter Date",
    isRequiredWhenNotCash
  ),

  referenceNumber: Yup.number().test(
    "isRequired",
    "Please enter Reference Number",
    isRequiredWhenNotCash
  ),
  authorizedBy: Yup.object().required("Please select Authorized By"),
  documentProof: Yup.string().required("Please choose Document Proof"),
  note: Yup.string().required("Please enter Note"),
});

function BillRefund() {
  const fileInputRef = createRef(null);
  const location = useLocation();
  const [billParticularDetail, setBillParticularDetail] = useState([]);
  const [load, setLoad] = useState(false);
  const [OkRefund, setOkRefund] = useState(false);
  const [billNumber, setBillNumber] = useState();
  const [billDetail, setBillDetail] = useState(null);

  const [documentProof, setDocumentProof] = useState();
  const [proofErr, setProofErr] = useState();
  const [billNumberError, setBillNumberError] = useState(false);
  const [refundError, setRefundError] = useState(false);
  const formikRef = useRef();
  const [paymentModeList, setPaymentModeList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [fileType, setFileType] = useState(null);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);

  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);

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
    setFileType();
    setDocumentProof();
    if (e.target.files[0].size > string.MAX_FILE_SIZE) {
      setModalErrorOpen(true);
      setModalMessage("Please choose file size less than 2MB");
      setModalTitle("File Size");
      fileInputRef.current.value = "";
      setLoad(false);

      return false;
    }
    if (!allowedFileExtensions.includes(e.target.files[0].name.split(".")[1])) {
      setModalErrorOpen(true);
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
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
  };

  const handleSave = async (values) => {
    if (load) return;
    setRefundError(false);
    console.log("values----", values);
    console.log("billParticularDetail----", billParticularDetail);
    if (!fileType || !documentProof || documentProof === "") {
      document.getElementById("documentProof")?.focus();
      setProofErr("Please choose file size less than 2MB");
      formikRef.current.setFieldTouched("documentProof", true);
      return;
    }
    let refundAmt = 0;
    let refundDetail = [];
    let amtEntered = 0;
    for (let i = 0; i < billParticularDetail.length; i++) {
      if (
        billParticularDetail[i].refundAmount != "" &&
        billParticularDetail[i].refundAmount > 0
      ) {
        amtEntered = 1;
        break;
      }
    }
    if (amtEntered == 0) {
      document.getElementById("refundAmount0")?.focus();
      setRefundError(true);
      return;
    }
    for (let i = 0; i < billParticularDetail.length; i++) {
      if (
        billParticularDetail[i].refundAmount >
        billParticularDetail[i].amount - billParticularDetail[i].refundedAmount
      ) {
        document.getElementById("refundAmount" + i)?.focus();
        setRefundError(true);
        return;
      }
      if (
        billParticularDetail[i].refundAmount != "" &&
        billParticularDetail[i].refundAmount > 0
      ) {
        refundAmt =
          parseInt(refundAmt) + parseInt(billParticularDetail[i].refundAmount);
        refundDetail.push({
          particularID: billParticularDetail[i].particularID,
          paidAmount: billParticularDetail[i].amount,
          refundAmount: billParticularDetail[i].refundAmount
            ? parseInt(billParticularDetail[i].refundAmount)
            : 0,
          feesDueID: parseInt(billParticularDetail[i].feesDueID),
        });
      }
    }
    console.log("refundAmt---", refundAmt);
    console.log("refundDetail---", refundDetail);

    if (refundAmt === 0) {
      setRefundError(true);
      document.getElementById("refundAmount0")?.focus();
      return;
    }

    try {
      setLoad(true);
      let proofUrl = "";
      const response = await StudentApi.uploadFile(
        "refund",
        fileType,
        documentProof.split(",")[1]
      );
      console.log("response--", response);
      if (!response.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(response.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      proofUrl = response.data.message.data.file_url;
      console.log("proofUrl--------", proofUrl);

      const refundFeesCollectionRes = await StudentApi.refundFeesCollection(
        billNumber,
        refundAmt,
        values.note,
        values.authorizedBy.value,
        proofUrl,
        values.paymentMode.id,
        values.paymentMode.paymentMode,
        values.bankName.id,
        values.branch,
        values.referenceNumber,
        values.paidDate != ""
          ? moment(values.paidDate).format("yyyy-MM-DD")
          : null,
        refundDetail
      );
      console.log("refundFeesCollectionRes---", refundFeesCollectionRes);

      if (!refundFeesCollectionRes.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(refundFeesCollectionRes.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(refundFeesCollectionRes.data.message.message);
      handleCancelRefund();
      handleUnSavedChanges(0);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelectBillNumber = async (value) => {
    setRefundError(false);
    handleUnSavedChanges(0);
    console.log("bill NO---", value);
    if (!value || value == "" || value == undefined) {
      setBillNumberError(true);
      document.getElementById("billNumber")?.focus();
      return;
    }
    try {
      setLoad(true);
      const getBillDetail = await StudentApi.getFeesCollectionRefund(value);
      console.log("getBillDetail", getBillDetail);
      if (!getBillDetail.data.message.success) {
        setMessage(getBillDetail.data.message.message);
        setMessageError(true);
        // setModalErrorOpen(true);
        // setModalMessage(getBillDetail.data.message.message);
        // setModalTitle("Message");
        setLoad(false);
        return;
      }
      setOkRefund(false);
      let refundok = false;
      if (getBillDetail.data.message.success) {
        handleUnSavedChanges(1);
        for (
          let i = 0;
          i < getBillDetail.data.message.data.feesCollectionDetail.length;
          i++
        ) {
          getBillDetail.data.message.data.feesCollectionDetail[
            i
          ].refundedAmount =
            getBillDetail.data.message.data.feesCollectionDetail[i]
              .refundedAmount ?? 0;
          if (
            getBillDetail.data.message.data.feesCollectionDetail[i].amount !=
            getBillDetail.data.message.data.feesCollectionDetail[i]
              .refundedAmount
          ) {
            setOkRefund(true);
            refundok = true;
          }
          getBillDetail.data.message.data.feesCollectionDetail[i].refundAmount =
            "";
        }
        setBillParticularDetail(
          getBillDetail.data.message.data.feesCollectionDetail
        );
        setBillDetail(getBillDetail.data.message.data.feesCollection[0]);
        setPaymentModeList(getBillDetail.data.message.data.paymentMode);
        if (formikRef.current) {
          console.log("hello");
          for (
            let l = 0;
            l < getBillDetail.data.message.data.paymentMode.length;
            l++
          ) {
            if (
              getBillDetail.data.message.data.paymentMode[l].paymentMode ==
              "Cash"
            ) {
              formikRef.current.setFieldValue(
                "paymentMode",
                getBillDetail.data.message.data.paymentMode[l]
              );
              break;
            }
          }
        }
        setBankList(getBillDetail.data.message.data.bank);
        if (!refundok) {
          setModalErrorOpen(true);
          setModalMessage("No more amount in bill to Process Refund");
          setModalTitle("Message");
          setLoad(false);
          return;
        }
      } else {
        setModalErrorOpen(true);
        setModalMessage(getBillDetail.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleBillNumber = async (value) => {
    setRefundError(false);
    if (billNumber != value) {
      console.log("billNumber----", billNumber);
      setBillDetail();
      setBillParticularDetail([]);
    }
  };

  const getAllList = async () => {
    try {
      setLoad(true);
      if (location?.state && location?.state?.billNo) {
        setBillNumber(location.state.billNo);
        handleSelectBillNumber(location.state.billNo);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("catch------", error);
    }
  };

  const handleCancelRefund = () => {
    setBillNumber();
    if (location.state && location.state.billNo) location.state.billNo = null;
    setBillDetail(null);
    setBillParticularDetail([]);
    handleBillNumber();
    handleUnSavedChanges(0);
    formikRef.current.resetForm();
  };

  useEffect(() => {
    getAllList();
  }, []);

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
        <ScreenTitle titleClass="page-heading-position-report" />

        <Formik
          enableReinitialize={false}
          innerRef={formikRef}
          initialValues={{
            authorizedBy: null,
            documentProof: null,
            note: "",
            paymentMode: "",
            bankName: "",
            branch: "",
            paidAmount: "",
            paidDate: new Date(),
            referenceNumber: "",
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
                <div className="row no-gutters">
                  <div className="row no-gutters">
                    {!billDetail ? (
                      <div className="row no-gutters">
                        <div className="col-lg-2 pe-2">
                          <TextField
                            autoFocus
                            id="billNumber"
                            name="billNumber"
                            value={billNumber > 0 ? billNumber : ""}
                            label="Bill No."
                            mandatory={1}
                            // tabIndex={1}
                            maxlength={5}
                            onKeyUp={(e) => {
                              e.keyCode == 13 &&
                                handleSelectBillNumber(e.target.value);
                            }}
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e.target.value)
                              ) {
                                setBillNumber(e.target.value);
                                setMessageError(false);
                                setBillNumberError(false);
                              }
                            }}
                            error={
                              billNumberError
                                ? "Please enter Bill Number"
                                : messageError
                                ? message
                                : ""
                            }
                            touched={
                              billNumberError
                                ? true
                                : messageError
                                ? true
                                : false
                            }
                          />
                        </div>
                        <div className="col-lg-3 ps-2 mt-1">
                          <Button
                            frmButton={false}
                            isCenter={false}
                            isTable={true}
                            // tabIndex={2}
                            type="button"
                            text={"Show"}
                            onClick={(e) => {
                              handleSelectBillNumber(billNumber);
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="row no-gutters mt-3">
                        <div className="col-lg-3">
                          <text>Bill No.</text>
                          <text className="ps-3">{billNumber}</text>
                        </div>
                        <div className="col-lg-6"></div>
                        <div className="col-lg-3 text-right">
                          <text>Bill Date</text>
                          <text className="ps-3">
                            {moment(billDetail.billDate).format("DD-MM-YYYY")}
                          </text>
                        </div>
                      </div>
                    )}
                    {billDetail && (
                      <>
                        <div className="subhead-row">
                          <div className="subhead">Student Details</div>
                          <div className="col line-div"></div>
                        </div>
                        <StudentCard studentInfo={billDetail} />
                        <>
                          <div className="row no-gutters">
                            {OkRefund && (
                              <>
                                <div className="subhead-row">
                                  <div className="subhead">Refund Details</div>
                                  <div className="col line-div"></div>
                                </div>
                                <div className="col-lg-9">
                                  <SelectFieldFormik
                                    autoFocus
                                    label="Payment Mode"
                                    labelSize={3}
                                    id="paymentMode"
                                    mandatory={1}
                                    maxlength={20}
                                    tabIndex={1}
                                    options={paymentModeList}
                                    getOptionLabel={(option) =>
                                      option.paymentMode
                                    }
                                    getOptionValue={(option) => option.id}
                                    style={{ width: "20%" }}
                                    onChange={(text) => {
                                      setFieldValue("paymentMode", text);
                                    }}
                                  />
                                </div>
                                {values.paymentMode &&
                                values.paymentMode.paymentMode != "Cash" ? (
                                  <div className="col-lg-9">
                                    <SelectFieldFormik
                                      label="Bank Name"
                                      labelSize={3}
                                      id="bankName"
                                      mandatory={1}
                                      tabIndex={
                                        values.paymentMode.paymentMode != "Cash"
                                          ? 2
                                          : ""
                                      }
                                      maxlength={30}
                                      style={{ width: "80%" }}
                                      options={bankList}
                                      getOptionLabel={(option) => option.bank}
                                      getOptionValue={(option) => option.id}
                                      onChange={(text) => {
                                        setFieldValue("bankName", text);
                                      }}
                                    />
                                    <TextFieldFormik
                                      id="branch"
                                      label="Branch"
                                      labelSize={3}
                                      mandatory={1}
                                      maxlength={40}
                                      style={{ width: "80%" }}
                                      onChange={(e) => {
                                        setFieldValue("branch", e.target.value);
                                      }}
                                      tabIndex={
                                        values.paymentMode.paymentMode != "Cash"
                                          ? 3
                                          : ""
                                      }
                                    />

                                    <DateFieldFormik
                                      label="DD/Cheque Date"
                                      labelSize={3}
                                      id="paidDate"
                                      maxDate={moment().add(30, "days")}
                                      minDate={moment().subtract(30, "days")}
                                      style={{ width: "23%" }}
                                      onChange={(e) => {
                                        setFieldValue(
                                          "paidDate",
                                          e.target.value
                                        );
                                      }}
                                      tabIndex={
                                        values.paymentMode.paymentMode != "Cash"
                                          ? 4
                                          : ""
                                      }
                                    />
                                    <TextFieldFormik
                                      id="referenceNumber"
                                      label="DD/Cheque Number"
                                      labelSize={3}
                                      mandatory={1}
                                      maxlength={18}
                                      style={{ width: "30%" }}
                                      onChange={(e) => {
                                        if (!isNaN(e.target.value)) {
                                          setFieldValue(
                                            "referenceNumber",
                                            e.target.value
                                          );
                                        }
                                      }}
                                      tabIndex={
                                        values.paymentMode.paymentMode != "Cash"
                                          ? 5
                                          : ""
                                      }
                                    />
                                  </div>
                                ) : null}
                                <div className="subhead-row">
                                  <div className="subhead">
                                    Authorization Details
                                  </div>
                                  <div className="col line-div"></div>
                                </div>
                                <div className="col-lg-9">
                                  <SelectFieldFormik
                                    label={"Authorized By"}
                                    labelSize={3}
                                    id="authorizedBy"
                                    mandatory={1}
                                    tabIndex={
                                      values.paymentMode.paymentMode != "Cash"
                                        ? 6
                                        : 2
                                    }
                                    maxlength={30}
                                    options={authorizedByList}
                                    style={{ width: "30%" }}
                                    searchIcon={false}
                                    onChange={(etxt) => {
                                      setFieldValue("authorizedBy", etxt);
                                    }}
                                  />
                                  <FileField
                                    label="Document Proof"
                                    labelSize={3}
                                    type="file"
                                    ref={fileInputRef}
                                    id="documentProof"
                                    accept=".pdf, image/*"
                                    style={{ width: "60%" }}
                                    tabIndex={
                                      values.paymentMode.paymentMode != "Cash"
                                        ? 7
                                        : 3
                                    }
                                    onChange={(e) => {
                                      setFieldValue("documentProof", "");
                                      if (e.target.files[0]) {
                                        setFieldValue(
                                          "documentProof",
                                          e.target.value
                                        );
                                        handleFileUpload(e);
                                      }
                                    }}
                                    error={
                                      proofErr ? proofErr : errors.documentProof
                                    }
                                    touched={touched.documentProof}
                                  />

                                  <TextAreaFieldFormik
                                    id="note"
                                    label="Note"
                                    labelSize={3}
                                    value={values.note}
                                    mandatory={1}
                                    tabIndex={
                                      values.paymentMode.paymentMode != "Cash"
                                        ? 8
                                        : 4
                                    }
                                    onChange={(e) => {
                                      setFieldValue("note", e.target.value);
                                    }}
                                    style={{ width: "60%" }}
                                    maxlength={140}
                                  />
                                </div>
                              </>
                            )}
                            {billParticularDetail.length > 0 ? (
                              <div className="row no-gutters">
                                <div className="subhead-row p-0">
                                  <div className="subhead">Fees Details</div>
                                  <div className="col line-div"></div>
                                </div>
                                <div className="row no-gutters">
                                  <div className="table-responsive">
                                    <table className="table table-bordered table-hover">
                                      <thead>
                                        <tr>
                                          <th width="1%">No.</th>
                                          <th>Particular</th>
                                          <th width="5%">Amount (₹)</th>
                                          <th width="10%">
                                            Refunded Amount (₹)
                                          </th>
                                          {OkRefund && (
                                            <th width="5%">
                                              Refund Amount (₹)
                                            </th>
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {billParticularDetail.map(
                                          (item, index) => (
                                            <tr key={index}>
                                              <td>{index + 1}</td>
                                              <td>
                                                {item.particular ==
                                                "Excess Fees" ? (
                                                  <b style={{ color: "green" }}>
                                                    {item.particular}
                                                  </b>
                                                ) : (
                                                  item.particular
                                                )}
                                              </td>
                                              <td align="right">
                                                {item.particular ==
                                                "Excess Fees" ? (
                                                  <b style={{ color: "green" }}>
                                                    {item.amount}
                                                  </b>
                                                ) : (
                                                  item.amount
                                                )}
                                              </td>
                                              <td align="right">
                                                {item.particular ==
                                                "Excess Fees" ? (
                                                  <b style={{ color: "green" }}>
                                                    {item.refundedAmount}
                                                  </b>
                                                ) : (
                                                  item.refundedAmount
                                                )}
                                              </td>
                                              {OkRefund && (
                                                <td align="right">
                                                  {item.amount !=
                                                  item.refundedAmount ? (
                                                    <TextField
                                                      isAmount={true}
                                                      tabIndex={
                                                        values.paymentMode
                                                          .paymentMode != "Cash"
                                                          ? 9 + index
                                                          : 5 + index
                                                      }
                                                      value={item.refundAmount}
                                                      id={
                                                        "refundAmount" + index
                                                      }
                                                      maxlength={7}
                                                      onChange={(e) => {
                                                        setRefundError(false);
                                                        if (
                                                          !isNaN(
                                                            e.target.value
                                                          ) &&
                                                          !e.target.value.includes(
                                                            " "
                                                          ) &&
                                                          !e.target.value.includes(
                                                            "."
                                                          )
                                                        ) {
                                                          if (
                                                            parseInt(
                                                              e.target.value
                                                            ) >
                                                            parseInt(
                                                              item.amount -
                                                                item.refundedAmount
                                                            )
                                                          ) {
                                                            setRefundError(
                                                              true
                                                            );
                                                          }
                                                          billParticularDetail[
                                                            index
                                                          ].refundAmount =
                                                            e.target.value;

                                                          setBillParticularDetail(
                                                            [
                                                              ...billParticularDetail,
                                                            ]
                                                          );
                                                        }
                                                      }}
                                                      style={{ width: "60%" }}
                                                    />
                                                  ) : (
                                                    "0"
                                                  )}
                                                </td>
                                              )}
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                    <div className="text-right">
                                      <ErrorMessage
                                        Message={
                                          "Please enter valid Refund Amount"
                                        }
                                        view={refundError}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : null}

                            <div className="row no-gutters text-center">
                              <div>
                                {OkRefund && (
                                  <Button
                                    frmButton={false}
                                    className={"btn me-2"}
                                    tabIndex={
                                      values.paymentMode.paymentMode != "Cash"
                                        ? 9 + billParticularDetail.length
                                        : 5 + billParticularDetail.length
                                    }
                                    text={"F4 - Save"}
                                    id="save"
                                    onClick={(e) => {
                                      preFunction.handleErrorFocus(errors);
                                    }}
                                  />
                                )}
                                <Button
                                  autoFocus={OkRefund ? false : true}
                                  tabIndex={
                                    values.paymentMode.paymentMode != "Cash"
                                      ? 10 + billParticularDetail.length
                                      : 6 + billParticularDetail.length
                                  }
                                  frmButton={false}
                                  text={"Cancel"}
                                  className={"btn ms-2"}
                                  type="button"
                                  onClick={(e) => {
                                    handleCancelRefund();
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      </>
                    )}
                  </div>
                </div>
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default BillRefund;
