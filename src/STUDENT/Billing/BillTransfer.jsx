import React, { useEffect, useContext, useState, createRef } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { useSelector } from "react-redux";

import StudentApi from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import TextField from "../../component/FormField/TextField";
import {
  allowedFileExtensions,
  authorizedByList,
} from "../../component/common/CommonArray";
import FileField from "../../component/FormField/FileField";
import TextAreaField from "../../component/FormField/TextareaField";
import ErrorMessage from "../../component/common/ErrorMessage";
import StudentCard from "../../component/StudentCard";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import PDFDetail from "../../component/PDFDetail";
import PdfComponent from "../../component/common/PdfComponent";
import CommonApi from "../../component/common/CommonApi";

import AuthContext from "../../auth/context";
import string from "../../string";

let oldTotalAmount = 0;
function BillTransfer() {
  const fileInputRef = createRef();
  const [load, setLoad] = useState(false);
  const [billNumberError, setBillNumberError] = useState(false);

  const [billNumber, setBillNumber] = useState();
  const [file, setFile] = useState("");
  const [note, setNote] = useState("");
  const [approvedBy, setApprovedBy] = useState("");

  const [billPersonDetail, setBillPersonDetail] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [excessAmount, setExcessAmount] = useState(null);
  const [data, setData] = useState([]);

  const [studentList, setStudentList] = useState([]);
  const [enrollNo, setEnrollNo] = useState("");

  const [amountError, setAmountError] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [noteError, setNoteError] = useState(false);
  const [approvedByError, setApprovedByError] = useState(false);
  const [fileType, setFileType] = useState(null);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [pdfContent, setPdfContent] = useState();
  const [totalAmount, setTotalAmount] = useState(0);

  const [sendConcessionAmt, setSendConcessionAmt] = useState(false);
  const [showDiscountMessage, setShowDiscountMessage] = useState(false);
  const [eligibleFullDiscountParticulars, setEligibleFullDiscountParticulars] =
    useState([]);
  const [discountJSON, setDiscountJSON] = useState(false);

  const collegeConfig = useSelector((state) => state.web.college);
  const RENAME = useSelector((state) => state.web.rename);

  const { setUnSavedChanges } = useContext(AuthContext);

  const handleUnSavedChanges = (changed) => {
    if (changed === 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const closeError = async () => {
    setNoteError(false);
    setFileError(false);
    setAmountError(false);
    setApprovedByError(false);
  };

  const handleCancel = async () => {
    setBillNumber("");
    setBillPersonDetail(null);
    setStudentDetail(null);
    setPaymentDetails([]);
    setData([]);
    setFile("");
    setNote("");
    setApprovedBy("");
    setEnrollNo("");
    handleUnSavedChanges(0);
  };

  const handleAmount = async (item, index, amount) => {
    setSendConcessionAmt(false);
    let err = false;
    data[index].amountError = false;
    data[index].amountErrorMessage = "";

    if (amount > data[index].balance) {
      data[index].amount = parseInt(amount);
      data[index].amountError = true;
      data[index].amountErrorMessage =
        data[index].amount +
        " > " +
        data[index].balance +
        ". Please enter valid Amount";
      err = true;
    } else {
      data[index].amount = amount;
    }

    setData([...data]);
    if (err) return;

    if (showDiscountMessage) {
      let concessionCount = 0;
      for (let i = 0; i < data.length; i++) {
        if (
          data[i].amount > 0 &&
          discountJSON.PARTICULARIDS.includes(data[i].particularID) &&
          (data[i].amount == data[i].balance ||
            parseInt(data[i].amount) +
              parseInt(discountJSON.CONCESSION_AMOUNT) ==
              data[i].balance)
        ) {
          concessionCount++;
        }
      }
      console.log("concessionCount---", concessionCount);
      if (concessionCount == discountJSON.PARTICULARIDS.length) {
        setSendConcessionAmt(true);
        if (data[0].amount == data[0].balance) {
          data[0].amount =
            parseInt(data[0].amount) - parseInt(discountJSON.CONCESSION_AMOUNT);
        }
        setData([...data]);
      } else {
        setSendConcessionAmt(false);
      }
    }
  };

  const handleTotalAmountCalculation = async () => {
    let tot = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].amount) tot = parseInt(tot) + parseInt(data[i].amount);
    }
    setTotalAmount(tot);
  };
  useEffect(() => {
    handleTotalAmountCalculation();
  }, [sendConcessionAmt, data]);

  const handleSave = async () => {
    if (load) return;
    closeError();
    let err = false;

    if (note === "") {
      document.getElementById("note")?.focus();
      setNoteError(true);
      err = true;
    }
    if (!fileType || !file || file === "") {
      document.getElementById("refDoc")?.focus();
      setFileError(true);
      err = true;
    }
    if (approvedBy === "") {
      setApprovedByError(true);
      document.getElementById("approvedBy")?.focus();
      err = true;
    }
    if (totalAmount == 0) {
      setAmountError(true);
      document.getElementById("amount0")?.focus();
      err = true;
    }
    if (err) return;
    setLoad(true);

    console.log("-----", paymentDetails, data);

    let oldBillDetail = paymentDetails.map(({ particular, ...rest }) => rest);
    let newBillDetail = data
      .filter((item) => item.amount !== null)
      .map(
        ({ amountError, balance, openingBalance, particular, ...rest }) => rest
      );
    console.log("oldBillDetail", oldBillDetail, newBillDetail);
    try {
      const response = await StudentApi.uploadFile(
        "transfer",
        fileType,
        file.split(",")[1]
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
      const transferBillRes = await StudentApi.addBillTransfer(
        parseInt(billNumber),
        totalAmount,
        excessAmount ? excessAmount : 0,
        studentDetail.studentID,
        studentDetail.courseID,
        studentDetail.semester,
        studentDetail.batchID,
        studentDetail.studyYear,
        note,
        approvedBy.value,
        proofUrl,
        oldBillDetail,
        newBillDetail
      );
      console.log("transferBillRes", transferBillRes);

      if (!transferBillRes.data.message.success) {
        setModalMessage(transferBillRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      const viewPaymententryRes = await StudentApi.feesCollectionDetail(
        transferBillRes?.data?.message?.billingID
      );
      console.log("viewPaymententryRes---", viewPaymententryRes);
      let pdfContent =
        viewPaymententryRes.data.message.data.feesCollectionDetail.map(
          (item, index) => {
            return index % string.PRINT_PER_PAGE === 0 ? (
              <PDFDetail
                startNo={index}
                feesCollectionDetail={viewPaymententryRes.data.message.data.feesCollectionDetail.slice(
                  index,
                  index + string.PRINT_PER_PAGE
                )}
                feesCollection={
                  viewPaymententryRes?.data?.message?.data.feesCollection[0]
                }
                totalDueAmount={
                  viewPaymententryRes?.data?.message?.data?.totalDueAmount
                }
                secondCopy={false}
                finalPage={
                  index + string.PRINT_PER_PAGE >=
                  viewPaymententryRes.data.message.data.feesCollectionDetail
                    .length
                }
              />
            ) : null;
          }
        );
      setPdfContent(pdfContent);
      handlePrint();
      toast.success(transferBillRes.data.message.message);
      setBillNumber("");
      setBillPersonDetail(null);
      setStudentDetail(null);
      setPaymentDetails([]);
      setData([]);
      setFile("");
      setNote("");
      setApprovedBy("");
      setEnrollNo("");
      handleUnSavedChanges(0);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handlePrint = async () => {
    setOpenModal(true);
    setTimeout(() => {
      setOpenModal(false);
    }, 1);
    setTimeout(() => {
      handleSecondPrint();
    }, 1000);
  };

  const handleSecondPrint = async () => {
    setOpenModal(true);
    setTimeout(() => {
      setOpenModal(false);
    }, 1);
  };

  const handleSelectBillNumber = async (value) => {
    handleUnSavedChanges(0);
    setBillNumberError(false);
    console.log("bill NO---", value);
    if (!value) {
      setBillNumberError(true);
      document.getElementById("billNumber")?.focus();
      return;
    }

    try {
      setLoad(true);
      const getBillDetail = await StudentApi.feesCollectionDetailCancel(
        value,
        1
      );
      console.log("getBillDetail", getBillDetail);
      if (!getBillDetail.data.message.success) {
        setMessage(getBillDetail.data.message.message);
        setMessageError(true);
        console.log(
          "message",
          message.toString(),
          getBillDetail.data.message.message.toString()
        );
        setLoad(false);
        return;
      }
      setBillPersonDetail(getBillDetail.data.message.data.feesCollection[0]);
      setPaymentDetails(getBillDetail.data.message.data.feesCollectionDetail);
      handleUnSavedChanges(1);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleFileUpload = (e) => {
    console.log(e.target.files[0]);
    if (e.target.files[0].size > string.MAX_FILE_SIZE) {
      setModalMessage("Please choose file size less than 2MB");
      setModalErrorOpen(true);
      setModalTitle("Max size reached");
      fileInputRef.current.value = "";
      setLoad(false);

      return false;
    }

    if (!allowedFileExtensions.includes(e.target.files[0].name.split(".")[1])) {
      setModalMessage("Please upload pdf, jpeg, jpg, png file only");
      setModalErrorOpen(true);
      setModalTitle("File Type Mismatch");
      setLoad(false);
      return false;
    }
    setFileType(e.target.files[0].name.split(".")[1]);
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

  const handleSelectStudent = async (value) => {
    setExcessAmount(null);
    setStudentDetail();
    setData([]);
    setFile("");
    setNote("");
    setApprovedBy("");
    try {
      if (billPersonDetail.studentID == value.id) {
        setModalMessage("Please select valid student to Transfer Bill");
        setModalErrorOpen(true);
        setModalTitle("Invalid Student");
        setLoad(false);
        return;
      }

      const getStudentFeeDueDetailRes = await StudentApi.getStudentFeeDueDetail(
        value.id,
        collegeConfig.institution_type
      );
      console.log("getStudentFeeDueDetailRes---", getStudentFeeDueDetailRes);
      if (!getStudentFeeDueDetailRes.data.message.success) {
        setModalMessage(getStudentFeeDueDetailRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      if (getStudentFeeDueDetailRes.data.message.data.length === 0) {
        setModalMessage(
          "No due found. Please select valid Student to Transfer Bill"
        );
        setModalErrorOpen(true);
        setModalTitle("No Due");
        setLoad(false);

        return;
      }
      let discParticulars = [];
      let discountJson = {};
      if (
        collegeConfig.institution_type === 1 &&
        getStudentFeeDueDetailRes.data.message.data.discount
      ) {
        discountJson = JSON.parse(
          getStudentFeeDueDetailRes.data.message.data.discount[0].discount
        );
        console.log("discount-------", discountJson);
        for (let i = 0; i < discountJson.PARTICULARS.length; i++) {
          discParticulars.push(discountJson.PARTICULARS[i].particularID);
        }
        discParticulars.sort();
        console.log("discParticulars", discParticulars);
        discountJson.PARTICULARIDS = discParticulars;
        setDiscountJSON(discountJson);
      }
      let totalAmount = 0;
      let totalGrandTotal = 0;
      let eligibleFullDiscount = [];
      let eligibleFullDiscountParticulars = [];
      if (getStudentFeeDueDetailRes.data.message.data.feesDue.length > 0) {
        let applyConcession = false;
        if (
          discountJson &&
          moment(discountJson.DUE_DATE) >= moment() &&
          getStudentFeeDueDetailRes.data.message.data.feesDue[0].balance >=
            discountJson.CONCESSION_AMOUNT
        ) {
          applyConcession = true;
        }
        for (
          let i = 0;
          i < getStudentFeeDueDetailRes.data.message.data.feesDue.length;
          i++
        ) {
          if (
            applyConcession &&
            discParticulars.includes(
              getStudentFeeDueDetailRes.data.message.data.feesDue[i]
                .particularID
            ) &&
            getStudentFeeDueDetailRes.data.message.data.feesDue[i]
              .openingBalance ==
              getStudentFeeDueDetailRes.data.message.data.feesDue[i].balance
          ) {
            eligibleFullDiscount.push(
              getStudentFeeDueDetailRes.data.message.data.feesDue[i]
                .particularID
            );
            eligibleFullDiscountParticulars.push(
              getStudentFeeDueDetailRes.data.message.data.feesDue[i].particular
            );
          }
        }
      }
      eligibleFullDiscount.sort();
      console.log("eligibleFullDiscount---", eligibleFullDiscount);
      const isEqualArrays =
        eligibleFullDiscount.length > 0 &&
        preFunction.arraysEqual(discParticulars, eligibleFullDiscount);
      console.log("isEqualArrays---", isEqualArrays);
      if (isEqualArrays) {
        setShowDiscountMessage(isEqualArrays);
        setEligibleFullDiscountParticulars(
          eligibleFullDiscountParticulars.sort()
        );
      }
      let array = getStudentFeeDueDetailRes.data.message.data.feesDue.map(
        (item) => ({
          ...item,
          amount: null,
          amountError: false,
        })
      );
      console.log("array---", array);
      array = array.filter((m) => m.particular !== "Excess Fees");
      console.log("array---", array);
      if (array.length === 0) {
        setModalMessage(
          "No due found. Please select valid Student to Transfer Bill"
        );
        setModalErrorOpen(true);
        setModalTitle("No Due");
        setLoad(false);
        return;
      }
      let dueAmt = 0;
      for (let i = 0; i < array.length; i++) {
        console.log("----", array[i]);
        dueAmt += parseInt(array[i].balance);
      }
      console.log("dueAmt---", dueAmt);
      console.log("totalAmount---", totalAmount);
      const exessAmt = totalAmount - dueAmt;
      console.log("exessAmt---", exessAmt);
      if (exessAmt > 0) {
        console.log("hello---", exessAmt);

        setExcessAmount(exessAmt);
      }
      setStudentDetail(getStudentFeeDueDetailRes.data.message.data.student[0]);
      setData(array);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const paidOldTot = data.reduce((total, item) => total + item.paid, 0);
  const refundTot = data.reduce((total, item) => total + item.refund, 0);
  const outstandTot = data.reduce((total, item) => total + item.balance, 0);
  const concessionTot = data.reduce(
    (total, item) => total + item.concession,
    0
  );
  const openBalTot = data.reduce(
    (total, item) => total + item.openingBalance,
    0
  );

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

        {!billPersonDetail ? (
          <>
            <div className="row no-gutters">
              <div className="col-lg-2 pe-2">
                <TextField
                  autoFocus
                  id="billNumber"
                  label="Bill No."
                  value={billNumber > 0 ? billNumber : ""}
                  mandatory={1}
                  maxlength={5}
                  // tabIndex={1}
                  error={
                    billNumberError
                      ? "Please enter valid Bill Number"
                      : messageError
                      ? message
                      : ""
                  }
                  touched={billNumberError ? true : messageError ? true : false}
                  onChange={(e) => {
                    console.log("e.target.value", e.target.value);
                    if (preFunction.amountValidation(e.target.value)) {
                      setBillNumber(e.target.value);
                      setMessageError(false);
                    }
                  }}
                  onKeyUp={(e) =>
                    e.keyCode == 13 && handleSelectBillNumber(e.target.value)
                  }
                />
              </div>
              <div className="col-lg-2 ps-2 mt-1">
                <Button
                  frmButton={false}
                  isCenter={false}
                  isTable={true}
                  text={"Show"}
                  // tabIndex={2}
                  onClick={(e) => {
                    handleSelectBillNumber(billNumber);
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="row no-gutters mt-3">
              <div className="col-lg-3">
                <text>Bill No.</text>
                <text className="ps-3">{billNumber}</text>
              </div>
              <div className="col-lg-6"></div>
              <div className="col-lg-3 text-right">
                <text>Bill Date</text>
                <text className="ps-3">
                  {moment(billPersonDetail.billDate).format("DD-MM-YYYY")}
                </text>
              </div>
            </div>
            {billPersonDetail && (
              <>
                <div className="subhead-row">
                  <div className="subhead">Student Details</div>
                  <div className="col line-div"></div>
                </div>

                <StudentCard studentInfo={billPersonDetail} />
                <div className="subhead-row">
                  <div className="subhead">Particular Details</div>
                  <div className="col line-div"></div>
                </div>
                <div className="mt-1 row no-gutters">
                  <div className="col-lg-2"></div>
                  <div className="col-lg-8">
                    <table className="table table-bordered table-hover">
                      <thead className="tableHead">
                        <tr>
                          <th width="1%">No.</th>
                          <th>Particular ID</th>
                          <th width="10%">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentDetails.map((item, index) => {
                          if (index === 0)
                            oldTotalAmount = parseInt(item.amount);
                          else oldTotalAmount += parseInt(item.amount);
                          return (
                            <>
                              <tr className="tableColor" key={index}>
                                <td>{index + 1}</td>
                                <td>{item.particular}</td>
                                <td align="right">{item.amount}</td>
                              </tr>
                            </>
                          );
                        })}

                        <tr className="tableColor">
                          <td colSpan="2" align="right">
                            Total
                          </td>
                          <td align="right">{oldTotalAmount}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="col-lg-9">
                  <ReactSelectField
                    autoFocus
                    label={"Student No. / Name"}
                    labelSize={3}
                    id="student"
                    mandatory={1}
                    maxlength={30}
                    clear={true}
                    value={enrollNo}
                    tabIndex={1}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                    options={studentList}
                    style={{ width: "80%" }}
                    onInputChange={(text) => {
                      searchStudent(text);
                    }}
                    onChange={(text) => {
                      setEnrollNo(text);
                      !text
                        ? setStudentDetail(null)
                        : handleSelectStudent(text);
                    }}
                  />
                </div>
              </>
            )}
            {studentDetail ? (
              <>
                <div className="subhead-row">
                  <div className="subhead">Student Details</div>
                  <div className="col line-div"></div>
                </div>
                <StudentCard studentInfo={studentDetail} />
                {data.length > 0 ? (
                  <div className="row no-gutters mt-2">
                    <div className="subhead-row p-0">
                      <div className="subhead"> Fees Detail</div>
                      <div className="col line-div"></div>
                    </div>
                    {showDiscountMessage && (
                      <div className="row no-gutters border p-3 mb-2">
                        <div style={{ color: "green", fontWeight: "bold" }}>
                          Eligible to get Discount of ₹
                          {discountJSON.CONCESSION_AMOUNT}, if pay full fee of
                          the particulars{" "}
                          {eligibleFullDiscountParticulars.join(", ")}. Offer
                          Ends on{" "}
                          {moment(discountJSON.DUE_DATE).format("DD-MM-YYYY")}
                        </div>
                      </div>
                    )}
                    <div className="row p-0 mt-1">
                      <div className="table-responsive row p-0">
                        <table className="table table-bordered table-hover">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              {/* <th width="3%">Sem</th> */}
                              <th width={"12%"}>{RENAME.sem}</th>
                              <th>Particular</th>
                              <th width="10%">Opening Balance (₹)</th>
                              <th width="5%">Paid (₹)</th>
                              <th width="5%">Concession (₹)</th>
                              <th width="5%">Refund (₹)</th>
                              <th width="10%">Outstanding Balance (₹)</th>
                              <th width="10%">Amount to Pay (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.map((item, index) => {
                              return (
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>
                                    {collegeConfig.institution_type === 1
                                      ? item.className
                                      : item.semester}
                                  </td>
                                  <td>{item.particular}</td>
                                  <td align="right">{item.openingBalance}</td>
                                  <td align="right">{item.paid}</td>
                                  <td align="right">{item.concession}</td>
                                  <td align="right">{item.refund}</td>
                                  <td align="right">{item.balance}</td>
                                  <td align="right">
                                    <TextField
                                      placeholder={" "}
                                      tabIndex={2 + index}
                                      id={"amount" + index}
                                      value={item.amount}
                                      isAmount={true}
                                      maxlength={7}
                                      onChange={(e) => {
                                        // closeError();
                                        // data[index].amountError = false;
                                        // if (
                                        //   preFunction.amountValidation(
                                        //     e.target.value
                                        //   )
                                        // ) {
                                        //   if (
                                        //     parseInt(e.target.value) >
                                        //     parseInt(item.balance)
                                        //   ) {
                                        //     data[index].amountError = true;
                                        //   }
                                        //   data[index].amount = e.target.value
                                        //     ? parseInt(e.target.value)
                                        //     : null;

                                        //   setData([...data]);
                                        // }
                                        closeError();
                                        if (
                                          preFunction.amountValidation(
                                            e.target.value
                                          )
                                        ) {
                                          handleAmount(
                                            item,
                                            index,
                                            e.target.value
                                          );
                                        }
                                      }}
                                      error={
                                        data[index].amountError
                                          ? item.amount +
                                            " > " +
                                            item.balance +
                                            ". Please enter valid amount"
                                          : ""
                                      }
                                      touched={
                                        data[index].amountError ? true : false
                                      }
                                      style={{ width: "60%" }}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                            {sendConcessionAmt && (
                              <tr>
                                <td colSpan={8} align="right">
                                  <span style={{ color: "green" }}>
                                    Discount Amount (Full Fee Pay)
                                  </span>
                                </td>
                                <td align="right" class="text-success">
                                  <span style={{ color: "green" }}>
                                    {discountJSON.CONCESSION_AMOUNT}
                                  </span>
                                </td>
                              </tr>
                            )}
                            <tr className="tableColor">
                              <td
                                colSpan="3"
                                align="right"
                                className="student-text"
                              >
                                Total
                              </td>
                              <td align="right" className="student-text">
                                {openBalTot}
                              </td>
                              <td align="right" className="student-text">
                                {paidOldTot}
                              </td>
                              <td align="right" className="student-text">
                                {concessionTot}
                              </td>
                              <td align="right" className="student-text">
                                {refundTot}
                              </td>
                              <td align="right" className="student-text">
                                {outstandTot}
                              </td>
                              <td align="right" className="student-text">
                                {totalAmount}
                              </td>
                            </tr>
                            {excessAmount && (
                              <tr>
                                <td colSpan={8} align="right">
                                  <span style={{ color: "green" }}>
                                    Excess Amount
                                  </span>
                                </td>
                                <td align="right" class="text-success">
                                  <span style={{ color: "green" }}>
                                    {excessAmount}
                                  </span>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="subhead-row">
                  <div className="subhead">Authorization Details</div>
                  <div className="col line-div"></div>
                </div>
                <div className="col-lg-9 mt-1">
                  <ReactSelectField
                    label="Approved By"
                    labelSize={3}
                    id="approvedBy"
                    mandatory={1}
                    tabIndex={2 + data.length}
                    maxlength={20}
                    value={approvedBy}
                    options={authorizedByList}
                    style={{ width: "40%" }}
                    searchIcon={false}
                    onChange={(text) => {
                      closeError();
                      setApprovedBy(text);
                    }}
                    error={approvedByError ? "Please select approved by" : ""}
                    touched={approvedByError ? true : false}
                  />
                  <FileField
                    label="File Attachment"
                    labelSize={3}
                    ref={fileInputRef}
                    type="file"
                    id="refDoc"
                    tabIndex={3 + data.length}
                    name="refDoc"
                    accept=".pdf, image/*"
                    style={{ width: "50%" }}
                    onChange={(event) => {
                      closeError();
                      if (handleFileUpload(event))
                        setFile(event?.target?.files[0]);
                      else setFile(null);
                    }}
                    error={fileError ? "Please attach document proof" : ""}
                    touched={fileError ? true : false}
                  />
                  <TextAreaField
                    id="note"
                    label="Note"
                    labelSize={3}
                    value={note}
                    tabIndex={4 + data.length}
                    style={{ width: "50%" }}
                    maxlength={140}
                    mandatory={1}
                    onChange={(e) => {
                      closeError();
                      setNote(e.target.value);
                    }}
                    error={noteError ? "Please enter Note" : ""}
                    touched={noteError ? true : false}
                  />
                </div>
                <div className="row no-gutters text-center mb-2 mt-1">
                  <ErrorMessage
                    Message={`Transfer Amount should be equal to ${totalAmount}`}
                    view={amountError}
                  />
                </div>
                <div className="row no-gutters text-center">
                  <div className="">
                    <Button
                      text={"F4 - Save"}
                      frmButton={false}
                      className={"btn me-2"}
                      tabIndex={5 + data.length}
                      onClick={(e) => {
                        handleSave();
                      }}
                      id="save"
                    />
                    <Button
                      frmButton={false}
                      type="button"
                      className={"btn ms-2"}
                      text={"Cancel"}
                      onClick={(e) => {
                        handleCancel();
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <Button
                text={"Cancel"}
                frmButton={true}
                onClick={(e) => {
                  handleCancel();
                }}
              />
            )}
          </>
        )}
      </div>
      <div
        style={{
          display: "none",
        }}
      >
        {openModal ? (
          <PdfComponent
            printContent={pdfContent}
            paperSize="a5"
            orientation="landscape"
            handleClick={() => {
              setOpenModal(false);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default BillTransfer;
