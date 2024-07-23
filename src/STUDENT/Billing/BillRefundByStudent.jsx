import React, {
  useState,
  useRef,
  useContext,
  createRef,
  useEffect,
} from "react";
import { Formik } from "formik";
import moment from "moment";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import $ from "jquery";

import AuthContext from "../../auth/context";

import StudentApi from "../../api/StudentApi";

import {
  allowedFileExtensions,
  authorizedByList,
} from "../../component/common/CommonArray";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import StudentCard from "../../component/StudentCard";
import CommonApi from "../../component/common/CommonApi";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import FileField from "../../component/FormField/FileField";
import TextAreaFieldFormik from "../../component/FormField/TextareaFieldFormik";
import TextField from "../../component/FormField/TextField";
import ErrorMessage from "../../component/common/ErrorMessage";
import DisplayText from "../../component/FormField/DisplayText";
import ReactSelectField from "../../component/FormField/ReactSelectField";

import string from "../../string";
import storage from "../../auth/storage";

function BillRefundByStudent() {
  const navigate = useNavigate();
  const location = useLocation();

  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);
  const { setUnSavedChanges, role, collegeId } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [studentInfo, setStudentInfo] = useState();
  const [load, setLoad] = useState(false);
  const [studentList, setStudentList] = useState([]);

  const [showRes, setShowRes] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [showAllRefund, setShowAllRefund] = useState(false);
  const [refundButton, setRefundButton] = useState(true);
  const [refundAllButton, setRefundAllButton] = useState(false);

  const [refundError, setRefundError] = useState(false);
  const [OkRefund, setOkRefund] = useState(false);
  const [billParticularDetail, setBillParticularDetail] = useState([]);
  const [billDetail, setBillDetail] = useState(null);
  const [paymentModeList, setPaymentModeList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [fileType, setFileType] = useState(null);
  const [documentProof, setDocumentProof] = useState();
  const [proofErr, setProofErr] = useState();
  const [enrollNumber, setEnrollNumber] = useState();

  const [appliedFullFeeConcession, setAppliedFullFeeConcession] =
    useState(false);
  const [discountJson, setDiscountJson] = useState(false);
  const [discountParticulars, setDiscountParticulars] = useState();

  const fileInputRef = createRef(null);
  const formikRef = useRef();

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
    let toCancelConcession = false;
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
        if (
          discountParticulars &&
          discountParticulars.includes(billParticularDetail[i].particularID) &&
          billParticularDetail[i].refundAmount > 0
        ) {
          toCancelConcession = true;
        }
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
      console.log(
        "proofUrl--------",
        billDetail?.id,
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
        refundDetail,
        toCancelConcession
      );
      // setLoad(false);
      // return;
      const refundFeesCollectionRes = await StudentApi.refundFeesCollection(
        billDetail?.id,
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
        refundDetail,
        toCancelConcession
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
      await handleShow(enrollNumber?.enrollNo);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleCancelRefund = () => {
    setBillDetail(null);
    setBillParticularDetail([]);
    handleUnSavedChanges(0);
    setShowRes(true);
    formikRef.current.resetForm();
  };

  const handleSelectBillNumber = async (billNo) => {
    setBillDetail(null);
    setBillParticularDetail([]);
    setRefundError(false);
    handleUnSavedChanges(0);
    try {
      setLoad(true);
      const getBillDetail = await StudentApi.getFeesCollectionRefund(
        billNo,
        collegeConfig.institution_type
      );
      console.log("getBillDetail", getBillDetail);
      if (!getBillDetail.data.message.success) {
        setModalErrorOpen(true);
        setModalMessage(getBillDetail.data.message.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setOkRefund(false);
      setShowRes(false);
      let refundok = false;
      handleUnSavedChanges(1);

      let discParticulars = [];
      let discountJSON = {};
      if (
        getBillDetail.data.message.data.discount.length > 0 &&
        getBillDetail.data.message.data.discount[0].discount
      ) {
        discountJSON = JSON.parse(
          getBillDetail.data.message.data.discount[0].discount
        );
        setDiscountJson(discountJSON);
        console.log("discountJSON---", discountJSON);
        for (let i = 0; i < discountJSON.PARTICULARS.length; i++) {
          discParticulars.push(discountJSON.PARTICULARS[i].particularID);
        }
        console.log("discParticulars---", discParticulars);
        setDiscountParticulars(discParticulars);
      }

      let concessionCount = 0;
      for (
        let i = 0;
        i < getBillDetail.data.message.data.feesCollectionDetail.length;
        i++
      ) {
        console.log(
          "------------",
          discParticulars.includes(
            getBillDetail.data.message.data.feesCollectionDetail[i].particularID
          ),
          getBillDetail.data.message.data.feesCollectionDetail[i]
            .refundedAmount,
          !getBillDetail.data.message.data.feesCollectionDetail[i]
            .refundedAmount ||
            getBillDetail.data.message.data.feesCollectionDetail[i]
              .refundedAmount == 0
        );
        if (
          discParticulars.includes(
            getBillDetail.data.message.data.feesCollectionDetail[i].particularID
          ) &&
          (!getBillDetail.data.message.data.feesCollectionDetail[i]
            .refundedAmount ||
            getBillDetail.data.message.data.feesCollectionDetail[i]
              .refundedAmount == 0)
        ) {
          concessionCount++;
        }

        getBillDetail.data.message.data.feesCollectionDetail[i].refundedAmount =
          getBillDetail.data.message.data.feesCollectionDetail[i]
            .refundedAmount ?? 0;
        if (
          getBillDetail.data.message.data.feesCollectionDetail[i].amount !=
          getBillDetail.data.message.data.feesCollectionDetail[i].refundedAmount
        ) {
          setOkRefund(true);
          refundok = true;
        }
        getBillDetail.data.message.data.feesCollectionDetail[i].refundAmount =
          "";
      }
      console.log("concessionCount---", concessionCount);
      setAppliedFullFeeConcession(false);
      if (concessionCount > 0 && concessionCount == discParticulars.length) {
        setAppliedFullFeeConcession(true);
      }
      setBillParticularDetail(
        getBillDetail.data.message.data.feesCollectionDetail
      );
      setBillDetail(getBillDetail.data.message.data.feesCollection[0]);
      setPaymentModeList(getBillDetail.data.message.data.paymentMode);
      if (formikRef.current) {
        for (
          let l = 0;
          l < getBillDetail.data.message.data.paymentMode.length;
          l++
        ) {
          if (
            getBillDetail.data.message.data.paymentMode[l].paymentMode == "Cash"
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

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handlePageConfig = async () => {
    console.log("handlePageConfig---");
    const pageConfigData = storage.getPageConfig();
    console.log("pageConfigData", pageConfigData);
    if (pageConfigData.length == 0) return;
    pageConfigData.forEach((item) => {
      item.link = item.link.replace(/\s/g, "");
      setRefundButton(true);
      setRefundAllButton(true);
      if ("/" + item.link == location.pathname) {
        const currentPageConfig = JSON.parse(item.config);
        for (let i = 0; i < currentPageConfig?.length; i++) {
          if (currentPageConfig[i].type === "text") {
            for (let key in currentPageConfig[i].attribute) {
              console.log("currentPageConfig", currentPageConfig);
              if (
                currentPageConfig[i].id == "crefund" &&
                currentPageConfig[i].attribute[key] == "display:none"
              ) {
                setRefundButton(false);
              }
              if (
                currentPageConfig[i].id == "crefundAll" &&
                currentPageConfig[i].attribute[key] == "display:none"
              ) {
                setRefundAllButton(false);
              }
            }
          }
        }
      }
    });

    const formElements = document.querySelectorAll(
      "input, select, textarea, button"
    );
    let tIndex = 0;
    formElements.forEach((element) => {
      document.getElementById("c" + element.id)?.style?.display != "none" &&
      document.getElementById(element.id)?.type != "file"
        ? element.setAttribute("tabindex", tIndex++)
        : element.setAttribute("tabindex", null);
    });
  };

  const handleShow = async (enrollNo) => {
    if (load) return;
    try {
      setLoad(true);
      setShowRes(false);
      setOkRefund(false);
      setBillDetail(null);
      console.log("enrollNo", enrollNo);
      const studentPaymentList = await StudentApi.studentBillDetail(
        parseInt(enrollNo)
      );
      console.log("PaymentList---", studentPaymentList);
      if (!studentPaymentList?.data?.message?.success) {
        setModalMessage(studentPaymentList?.data?.message?.message);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      setShowRes(true);
      setData(studentPaymentList?.data?.message?.data?.bill_details);

      setStudentInfo(
        studentPaymentList?.data?.message?.data?.student_detail[0]
      );

      let billDetail = studentPaymentList?.data?.message?.data?.bill_details;

      let refundAmount = 0;
      let billAmount = 0;
      for (let i = 0; i < billDetail.length; i++) {
        refundAmount += billDetail[i].refundAmount;
        billAmount += billDetail[i].amount;
      }

      console.log("refundAmount", refundAmount);
      console.log("billAmount", billAmount);

      if (refundAmount != billAmount) {
        setShowAllRefund(true);
      }

      handlePageConfig();
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
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

  useEffect(() => {
    console.log("location.state", location.state);
    // in location.state , i have enrollNo,id,name
    if (location.state) {
      handleShow(location.state.enrollNo);
      setEnrollNumber(location.state);
    }
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
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-2">
          <div className="col-lg-9">
            <ReactSelectField
              autoFocus
              label="Student No. / Name"
              labelSize={3}
              mandatory={1}
              tabIndex={1}
              id="enrollNumber"
              options={studentList}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              style={{ width: "80%" }}
              searchIcon={true}
              clear={true}
              value={enrollNumber}
              onInputChange={(inputValue) => {
                searchStudent(inputValue);
              }}
              onChange={(text) => {
                setShowRes(false);
                if (text) {
                  handleShow(text.enrollNo);
                  setEnrollNumber(text);
                } else {
                  setEnrollNumber(null);
                }
              }}
            />
          </div>
          <Formik
            innerRef={formikRef}
            enableReinitialize={false}
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
                  {showRes && (
                    <>
                      <div className="table-responsive mt-3">
                        <div className="subhead-row">
                          <div className="subhead">Student Detail </div>
                          <div className="col line-div"></div>
                        </div>

                        <div className="row">
                          <div className={"col-lg-11"}>
                            <StudentCard studentInfo={studentInfo} />
                          </div>
                          {showAllRefund && refundAllButton && (
                            <div className="col-lg-1 mt-3" id="crefundAll">
                              <a
                                id="refundAll"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  let billNumbers = data.map(
                                    (item) => item.billingID
                                  );

                                  navigate("/bill-refund-all", {
                                    state: {
                                      data: billNumbers,
                                      studentDetail: {
                                        id: enrollNumber.id,
                                        ...studentInfo,
                                      },
                                    },
                                  });

                                  console.log("billNumbers", billNumbers);
                                }}
                              >
                                Refund All
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="subhead-row mt-3">
                          <div className="subhead">Payment Detail </div>
                          <div className="col line-div"></div>
                        </div>

                        <table
                          className="table table-bordered table-hover mt-1 report-table"
                          id="pdf-table"
                        >
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th width="5%">Bill Date</th>
                              <th width="5%">Bill No.</th>
                              <th>Pay Mode</th>
                              <th width="5%">{RENAME.sem}</th>
                              {/* <th>Particulars</th> */}
                              <th width="5%">Refund Amount (₹)</th>
                              <th width="5%">Bill Amount (₹)</th>
                              {refundButton && (
                                <th width="5%" id="crefund">
                                  Refund
                                </th>
                              )}
                            </tr>
                          </thead>
                          {data.length === 0 ? (
                            <tbody>
                              <tr>
                                <td colSpan={20} align="center">
                                  No records found
                                </td>
                              </tr>
                            </tbody>
                          ) : (
                            <tbody>
                              {data.map((item, index) => {
                                return (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                      {item.billDate
                                        ? moment(item.billDate).format(
                                            "DD-MM-YYYY"
                                          )
                                        : ""}
                                    </td>
                                    <td>{item.billingID}</td>
                                    <td>{item.paymentMode}</td>
                                    <td>{item.className}</td>
                                    {/* <td>{item.particular}</td> */}
                                    <td align="right">
                                      {item.refundAmount
                                        ? preFunction.formatIndianNumber(
                                            item.refundAmount
                                          )
                                        : 0}
                                    </td>
                                    <td align="right">
                                      {preFunction.formatIndianNumber(
                                        item.amount
                                      )}
                                    </td>
                                    {refundButton && (
                                      <td>
                                        {item.refundAmount < item.amount && (
                                          <Button
                                            id="refund"
                                            type="button"
                                            className="btn-3"
                                            isTable={true}
                                            text="Refund"
                                            onClick={() => {
                                              handleSelectBillNumber(
                                                item.billingID
                                              );
                                            }}
                                          />
                                        )}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          )}
                        </table>
                      </div>
                    </>
                  )}
                  {billDetail && (
                    <>
                      <div className="subhead-row">
                        <div className="subhead">Bill Details</div>
                        <div className="col line-div"></div>
                      </div>
                      <div className="col-lg-9">
                        <DisplayText
                          label="Bill No."
                          labelSize={3}
                          value={billDetail?.id}
                        />
                        <DisplayText
                          label="Bill Date"
                          labelSize={3}
                          value={moment(billDetail.billDate).format(
                            "DD-MM-YYYY"
                          )}
                        />
                      </div>
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
                                    style={{ width: "50%" }}
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
                                      setFieldValue("paidDate", e.target.value);
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
                                    values?.paymentMode?.paymentMode != "Cash"
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
                                    values?.paymentMode?.paymentMode != "Cash"
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
                                    values?.paymentMode?.paymentMode != "Cash"
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
                              {appliedFullFeeConcession && (
                                <div className="row no-gutters border p-3 mb-2 error-message">
                                  This Bill includes PAY FULL FEE CONCESSION. If
                                  you refund the amount, the concession will be
                                  removed.
                                </div>
                              )}
                              <div className="row no-gutters">
                                <div className="table-responsive">
                                  <table className="table table-bordered table-hover">
                                    <thead>
                                      <tr>
                                        <th width="1%">No.</th>
                                        <th>Particular</th>
                                        <th width="5%">Amount (₹)</th>
                                        <th width="10%">Refunded Amount (₹)</th>
                                        {OkRefund && (
                                          <th width="5%">Refund Amount (₹)</th>
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
                                                    id={"refundAmount" + index}
                                                    maxlength={6}
                                                    onChange={(e) => {
                                                      setRefundError(false);
                                                      if (
                                                        preFunction.amountValidation(
                                                          e.target.value
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
                                                          setRefundError(true);
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
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
export default BillRefundByStudent;
