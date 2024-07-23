import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import moment from "moment";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import $ from "jquery";

import StudentApi from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import ErrorMessage from "../../component/common/ErrorMessage";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import StudentCard from "../../component/StudentCard";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "../../component/common/ScreenTitle";
import PDFDetail from "../../component/PDFDetail";
import PdfComponent from "../../component/common/PdfComponent";
import CommonApi from "../../component/common/CommonApi";

import PaymentDetails from "./PaymentDetail";

import AuthContext from "../../auth/context";

import string from "../../string";
import storage from "../../auth/storage";

const isRequiredWhenNotCash = function (value) {
  const paymentMode = this.parent.paymentMode;
  return !(paymentMode && paymentMode.paymentMode !== "Cash") || !!value;
};

const isRequiredWhenNotNeftUPI = function (value) {
  const paymentMode = this.parent.paymentMode;
  return (
    !(
      paymentMode &&
      paymentMode?.paymentMode !== "Cash" &&
      paymentMode?.paymentMode != "NEFT/RTGS" &&
      paymentMode?.paymentMode != "Credit Card" &&
      paymentMode?.paymentMode != "Razorpay" &&
      paymentMode?.paymentMode != "UPI"
    ) || !!value
  );
};

const FormSchema = Yup.object().shape({
  student: Yup.object().required("Please select Student"),
  paymentMode: Yup.object().required("Please select Payment Mode"),
  bankName: Yup.object().test(
    "isRequired",
    "Please enter Bank Name",
    isRequiredWhenNotNeftUPI
  ),
  branch: Yup.string()
    .min(3, "Must be at least 3 characters long", isRequiredWhenNotCash)
    .matches(
      /^[A-Za-z0-9\s,.'\-&@#]+$/,
      "Please enter valid Branch Name",
      isRequiredWhenNotNeftUPI
    )
    .trim(isRequiredWhenNotNeftUPI)
    .test("isRequired", "Please enter Branch", isRequiredWhenNotNeftUPI),

  paidAmount: Yup.number().test(
    "isRequired",
    "Please enter Amount",
    isRequiredWhenNotCash
  ),
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
});

function Billing() {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [enrollNumber, setEnrollNumber] = useState("");

  const [paymentModeList, setPaymentModeList] = useState([]);
  const [amountMismatchError, setAmountMismatchError] = useState(false);
  const [amountMismatchMessage, setAmountMismatchMessage] = useState("");

  const [totalAmount, setTotalAmount] = useState(0);
  const [bankList, setBankList] = useState([]);
  const [studentInfo, setStudentInfo] = useState();

  const [excessAmount, setExcessAmount] = useState(0);
  const [exessFeeDue, setExessFeeDue] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [changeDateLabel, setChangedDateLabel] = useState("");
  const [changeRefNumberLabel, setChangedRefNumberLabel] = useState("");

  const [extraAmtError, setExtraAmtError] = useState(false);
  const [sendConcessionAmt, setSendConcessionAmt] = useState(false);
  const [oldTerm1Amt, setOldTerm1Amt] = useState(0);
  const [showDiscountMessage, setShowDiscountMessage] = useState(false);
  const [eligibleFullDiscountParticulars, setEligibleFullDiscountParticulars] =
    useState([]);
  const [discountJSON, setDiscountJSON] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const collegeConfig = useSelector((state) => state.web.college);
  const { setUnSavedChanges, collegeId, role } = useContext(AuthContext);

  const RENAME = useSelector((state) => state.web.rename);
  const formikRef = useRef();

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const closeErrors = () => {
    setAmountMismatchError(false);
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

  const handleSave = async (values) => {
    if (load) return;
    closeErrors();
    console.log("---", exessFeeDue, "totalAmount--", totalAmount);
    let err = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i].amountError) {
        document.getElementById("amount" + i)?.select();
        return;
      }
    }

    if (totalAmount <= 0) {
      for (let i = 0; i < data.length; i++) {
        data[i].amountError = false;
        data[i].amountErrorMessage = "";
      }
      setData([...data]);
      document.getElementById("amount0")?.focus();
      setAmountMismatchMessage("Please enter atleast one Amount");
      setAmountMismatchError(true);
      err = true;
      return;
    }

    let excess = 0;

    if (extraAmtError) {
      setAmountMismatchMessage("DD/Cheque Amount is mismatch");
      setAmountMismatchError(true);
      document.getElementById("amount0")?.focus();
      return;
    }
    if (totalAmount < values.paidAmount) {
      excess = parseInt(values.paidAmount) - parseInt(totalAmount);
    }

    if (excess > 0) {
      for (let i = 1; i < data.length; i++) {
        if (data[i].amount < data[i].balance || !data[i].amount) {
          setAmountMismatchMessage("DD/Cheque Amount is mismatch");
          setAmountMismatchError(true);
          err = true;
        }
      }
      document.getElementById("amount0")?.focus();
    }
    console.log("values.paidAmount---", values.paidAmount);
    console.log("excess---", excess);
    console.log("totalAmount---", totalAmount);
    const totAmtToCompare = sendConcessionAmt
      ? totalAmount - discountJSON.CONCESSION_AMOUNT
      : totalAmount;
    console.log("totAmtToCompare---", totAmtToCompare);
    if (parseInt(values.paidAmount) < parseInt(totAmtToCompare)) {
      setAmountMismatchMessage("DD/Cheque Amount is mismatch");
      setAmountMismatchError(true);
      err = true;
    }

    if (err) return;

    try {
      setLoad(true);
      let feeCollection = [];
      let totPaidAmt = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i].amount > 0) {
          totPaidAmt += parseInt(data[i].amount);
          let obj = {
            feesDueID: data[i].feesDueID,
            particularID: data[i].particularID,
            amount: parseInt(data[i].amount),
          };
          feeCollection.push(obj);
        }
      }
      console.log("feeCollection---", feeCollection);

      const paymode = values?.paymentMode?.paymentMode;
      console.log("paymode---", paymode);
      // setLoad(false);
      // return;
      const addFeesCollection = await StudentApi.addFeesCollection(
        enrollNumber.studentID,
        enrollNumber.name,
        enrollNumber.studyYear,
        enrollNumber.batchID,
        values.paymentMode.id,
        values.paymentMode.paymentMode,
        enrollNumber.courseID,
        enrollNumber.semester,
        parseInt(totPaidAmt) + parseInt(excessAmount),
        values.paidDate ? moment(values.paidDate).format("YYYY-MM-DD") : null,
        values.bankName ? values.bankName.id : null,
        values.branch ? values.branch : null,
        values.referenceNumber ? values.referenceNumber : null,
        excessAmount,
        enrollNumber?.collegeID,
        feeCollection,
        sendConcessionAmt
      );
      console.log("addFeesCollection---", addFeesCollection);

      if (!addFeesCollection.data.message.success) {
        setModalMessage(addFeesCollection.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      const viewPaymententryRes = await StudentApi.feesCollectionDetail(
        addFeesCollection?.data?.message?.data?.billingID
      );
      console.log("viewPaymententryRes---", viewPaymententryRes);
      // let pdfContent = (
      //   <PDFDetail
      //     feesCollectionDetail={
      //       viewPaymententryRes.data.message.data.feesCollectionDetail
      //     }
      //     feesCollection={
      //       viewPaymententryRes?.data?.message?.data.feesCollection[0]
      //     }
      //   />
      // );
      let AOText = "Administrative Officer";
      let hideAdmin = false;
      const pageConfigData = storage.getPageConfig();
      if (pageConfigData.length == 0) return;
      pageConfigData.forEach((item) => {
        item.link = item.link.replace(/\s/g, "");
        if ("/" + item.link == location.pathname) {
          hideAdmin = true;
          const currentPageConfig = JSON.parse(item.config);
          console.log("currentPageConfig", currentPageConfig);
          for (let i = 0; i < currentPageConfig?.length; i++) {
            for (let key in currentPageConfig[i].attribute) {
              if (currentPageConfig[i].id == "cadministrativeOfficer") {
                $("#" + currentPageConfig[i].id).attr(
                  key,
                  currentPageConfig[i].attribute[key] +
                    ";justify-content:center;"
                );
              } else if (currentPageConfig[i].id == "administrativeOfficer") {
                AOText = currentPageConfig[i].attribute["alt"];
              }
            }
          }
        }
      });

      let pdfContent =
        viewPaymententryRes.data.message.data.feesCollectionDetail.map(
          (item, index) => {
            return index % string.PRINT_PER_PAGE === 0 ? (
              <PDFDetail
                startNo={index}
                hideAdmin={hideAdmin}
                AOText={AOText}
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
      handleUnSavedChanges(0);
      toast.success(addFeesCollection.data.message.message);

      if (excessAmount > 0) {
        navigate("/bill-refund", {
          state: { billNo: addFeesCollection.data.message.data.billingID },
        });
        return;
      }
      if (formikRef.current) {
        formikRef.current.resetForm();
      }

      setData([]);
      setExtraAmtError(false);
      setLoad(false);
      setStudentList([]);
      setEnrollNumber("");
      setPaymentModeList([]);
      setAmountMismatchError(false);
      setTotalAmount(0);

      setBankList([]);
      setStudentInfo();
      setExcessAmount(0);
      setExessFeeDue(0);
      setModalErrorOpen(false);
      setModalMessage("");
      setModalTitle("");
      handleUnSavedChanges(0);

      document.getElementById("student")?.focus();

      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelectStudent = async (value) => {
    try {
      setLoad(true);
      setData([]);
      setBankList([]);
      handleUnSavedChanges(0);
      setTotalAmount(0);
      setStudentInfo();
      setSendConcessionAmt(false);
      setShowDiscountMessage(false);
      setEligibleFullDiscountParticulars([]);
      setDiscountJSON(false);
      setExcessAmount(0);
      if (value) {
        const getStudentFeeDueDetailRes =
          await StudentApi.getStudentFeeDueDetail(
            value.id,
            collegeConfig.institution_type
          );
        console.log("getStudentFeeDueDetailRes--", getStudentFeeDueDetailRes);

        if (!getStudentFeeDueDetailRes.data.message.success) {
          setModalMessage(getStudentFeeDueDetailRes.data.message.message);
          setModalErrorOpen(true);
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        let discParticulars = [];
        let discountJson = {};
        if (
          collegeConfig.institution_type === 1 &&
          getStudentFeeDueDetailRes.data.message.data.discount[0].discount
        ) {
          discountJson = JSON.parse(
            getStudentFeeDueDetailRes.data.message.data.discount[0].discount
          );
          console.log("discount-------", discountJson);
          for (let i = 0; i < discountJson.PARTICULARS.length; i++) {
            discParticulars.push(discountJson.PARTICULARS[i].particularID);
          }
          discParticulars.sort();
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
                getStudentFeeDueDetailRes.data.message.data.feesDue[i]
                  .particular
              );
            }
            getStudentFeeDueDetailRes.data.message.data.feesDue[i].amount = "";
            getStudentFeeDueDetailRes.data.message.data.feesDue[
              i
            ].amountError = false;
            getStudentFeeDueDetailRes.data.message.data.feesDue[
              i
            ].amountErrorMessage = "";
            if (
              getStudentFeeDueDetailRes.data.message.data.feesDue[i]
                .particular == "Excess Fees"
            ) {
              setExessFeeDue(
                getStudentFeeDueDetailRes.data.message.data.feesDue[i]
              );
              getStudentFeeDueDetailRes.data.message.data.feesDue =
                getStudentFeeDueDetailRes.data.message.data.feesDue.filter(
                  (m) =>
                    m !== getStudentFeeDueDetailRes.data.message.data.feesDue[i]
                );
              continue;
            }

            totalAmount += parseInt(
              getStudentFeeDueDetailRes.data.message.data.feesDue[i].balance
            );
            totalGrandTotal += parseInt(
              getStudentFeeDueDetailRes.data.message.data.feesDue[i]
                .openingBalance
            );
          }
        }
        eligibleFullDiscount.sort();
        console.log("eligibleFullDiscount---", eligibleFullDiscount);
        console.log("discParticulars---", discParticulars);
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
        if (getStudentFeeDueDetailRes.data.message.data.feesDue.length === 0) {
          setModalMessage("No Due found");
          setModalErrorOpen(true);
          setModalTitle("No Due");
          setLoad(false);
          handleUnSavedChanges(0);
          return;
        }
        setBankList(getStudentFeeDueDetailRes.data.message.data.bank);
        setEnrollNumber(getStudentFeeDueDetailRes.data.message.data.student[0]);
        setStudentInfo(
          getStudentFeeDueDetailRes?.data?.message?.data.student[0]
        );

        handleUnSavedChanges(1);
        setData(getStudentFeeDueDetailRes.data.message.data.feesDue);

        setPaymentModeList(
          getStudentFeeDueDetailRes.data.message.data.paymentMode
        );
        for (
          let l = 0;
          l < getStudentFeeDueDetailRes.data.message.data.paymentMode.length;
          l++
        ) {
          if (
            getStudentFeeDueDetailRes.data.message.data.paymentMode[l]
              .paymentMode == "Cash"
          ) {
            formikRef.current.setFieldValue(
              "paymentMode",
              getStudentFeeDueDetailRes.data.message.data.paymentMode[l]
            );
            break;
          }
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleTotalAmountCalculation = async () => {
    let tot = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].amount) tot = parseInt(tot) + parseInt(data[i].amount);
    }
    setTotalAmount(tot);
    calculateExcessAmount(formikRef.current.values.paidAmount);
  };
  useEffect(() => {
    handleTotalAmountCalculation();
  }, [sendConcessionAmt, data]);

  // const handleAmount = async (item, index, amount) => {
  //   setExtraAmtError(false);
  //   setSendConcessionAmt(false);
  //   let err = false;
  //   for (let i = 0; i < data.length; i++) {
  //     data[i].amountError = false;
  //     data[i].amountErrorMessage = "";
  //     if (i == index) {
  //       if (amount > data[i].balance) {
  //         data[i].amount = amount;
  //         data[i].amountError = true;
  //         data[i].amountErrorMessage =
  //           data[i].amount +
  //           " > " +
  //           data[i].balance +
  //           ". Please enter valid Amount";
  //         err = true;
  //         setExtraAmtError(true);
  //       } else {
  //         data[i].amount = amount;
  //       }
  //     } else if (data[i].amount > data[i].balance) {
  //       data[i].amountError = true;
  //       data[i].amountErrorMessage =
  //         data[i].amount +
  //         " > " +
  //         data[i].balance +
  //         ". Please enter valid Amount";
  //       err = true;
  //     }
  //   }
  //   setData([...data]);
  //   if (err) return;
  //   totalBill = totalBill + amount;

  //   // console.log("dueArr---", data);
  //   // console.log("discountJson---", discountJSON);
  //   if (showDiscountMessage) {
  //     let concessionCount = 0;
  //     for (let i = 0; i < data.length; i++) {
  //       if (
  //         data[i].amount > 0 &&
  //         discountJSON.PARTICULARIDS.includes(data[i].particularID) &&
  //         (data[i].amount == data[i].balance ||
  //           parseInt(data[i].amount) +
  //             parseInt(discountJSON.CONCESSION_AMOUNT) ==
  //             data[i].balance)
  //       ) {
  //         concessionCount++;
  //       }
  //     }
  //     console.log("concessionCount---", concessionCount);
  //     // return;
  //     if (concessionCount == discountJSON.PARTICULARIDS.length) {
  //       setSendConcessionAmt(true);
  //       setOldTerm1Amt(data[0].amount);
  //       if (data[0].amount == data[0].balance) {
  //         data[0].amount =
  //           parseInt(data[0].amount) - parseInt(discountJSON.CONCESSION_AMOUNT);
  //       }
  //       setData([...data]);
  //     } else {
  //       setSendConcessionAmt(false);
  //       data[0].amount = oldTerm1Amt > 0 ? oldTerm1Amt : data[0].amount;
  //       setData([...data]);
  //     }
  //   }
  // };

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
          data[i].amount >= 0 &&
          discountJSON.PARTICULARIDS.includes(data[i].particularID) &&
          data[i].amount == data[i].balance
        ) {
          concessionCount++;
        }
      }
      console.log("concessionCount---", concessionCount);
      setSendConcessionAmt(false);
      if (concessionCount == discountJSON.PARTICULARIDS.length) {
        setSendConcessionAmt(true);
        setData([...data]);
      }
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

  const setErrorClose = () => {
    for (let i = 0; i < data.length; i++) {
      data[i].amountError = false;
      data[i].amountErrorMessage = "";
    }
    setData([...data]);
  };

  const calculateExcessAmount = (value) => {
    let excess = 0;
    let tot = sendConcessionAmt
      ? outstandTot - discountJSON.CONCESSION_AMOUNT
      : outstandTot;
    if (tot < value) {
      console.log("total-------", tot);
      excess = parseInt(value) - parseInt(tot);
    }
    console.log("excess", excess);
    setExcessAmount(excess);
  };

  const handleChangeLabel = (text) => {
    console.log("text---", text);

    setChangedDateLabel("");
    setChangedRefNumberLabel("");

    // Change Date Label for NEFT/RTGS and UPI
    if (
      text.paymentMode == "NEFT/RTGS" ||
      text.paymentMode == "UPI" ||
      text.paymentMode == "Credit Card" ||
      text.paymentMode == "Razorpay"
    ) {
      setChangedDateLabel("Payment Date");
    }
    // Change Reference Number Label
    if (text.paymentMode == "NEFT/RTGS") {
      setChangedRefNumberLabel("Transaction Reference ID");
    }
    if (
      text.paymentMode == "UPI" ||
      text.paymentMode == "Credit Card" ||
      text.paymentMode == "Razorpay"
    ) {
      setChangedRefNumberLabel("UPI Transaction ID");
    }
  };

  const clearValues = (setFieldValue, text, setFieldTouched) => {
    setFieldValue("paymentMode", text);
    setFieldValue("bankName", "");
    setFieldValue("branch", "");
    setFieldValue("paidAmount", "");
    setFieldValue("paidDate", "");
    setFieldValue("referenceNumber", "");
    setFieldTouched("paymentMode", false);
    setFieldTouched("bankName", false);
    setFieldTouched("branch", false);
    setFieldTouched("paidAmount", false);
    setFieldTouched("paidDate", false);
    setFieldTouched("referenceNumber", false);

    setExcessAmount(0);
    for (let i = 0; i < data.length; i++) {
      data[i].amountError = false;
      data[i].amountErrorMessage = "";
    }
    setData([...data]);
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
        <div className="row no-gutters mt-1">
          <Formik
            innerRef={formikRef}
            initialValues={{
              student: "",
              paymentMode: "",
              bankName: "",
              branch: "",
              paidAmount: "",
              paidDate: "",
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
                    <div className="col-lg-9 mt-2">
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
                        style={{ width: "80%" }}
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
                          closeErrors();
                        }}
                      />
                    </div>
                    {studentInfo ? (
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

                    {data.length > 0 && values.student ? (
                      <div className="row no-gutters">
                        <div className="subhead-row">
                          <div className="subhead">Paymode Detail</div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="col-lg-9">
                          <SelectFieldFormik
                            autoFocus={
                              data.length > 0 && values.student ? true : false
                            }
                            label="Payment Mode"
                            placeholder=" "
                            labelSize={3}
                            tabIndex={2}
                            maxlength={20}
                            id="paymentMode"
                            mandatory={1}
                            options={paymentModeList}
                            getOptionLabel={(option) => option.paymentMode}
                            getOptionValue={(option) => option.id}
                            style={{ width: "25%" }}
                            onChange={(text) => {
                              clearValues(setFieldValue, text, setFieldTouched);
                              handleChangeLabel(text);
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                    {values.paymentMode &&
                    values.paymentMode.paymentMode != "Cash" &&
                    values.student ? (
                      <div className="col-lg-9">
                        {values.paymentMode.paymentMode != "NEFT/RTGS" &&
                        values.paymentMode.paymentMode != "UPI" &&
                        values.paymentMode.paymentMode != "Credit Card" &&
                        values.paymentMode.paymentMode != "Razorpay" ? (
                          <>
                            <SelectFieldFormik
                              label="Bank Name"
                              labelSize={3}
                              id="bankName"
                              mandatory={1}
                              style={{ width: "60%" }}
                              tabIndex={
                                values.paymentMode.paymentMode != "Cash"
                                  ? 3
                                  : ""
                              }
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
                              tabIndex={
                                values.paymentMode.paymentMode != "Cash"
                                  ? 4
                                  : ""
                              }
                              mandatory={1}
                              maxlength={40}
                              style={{ width: "60%" }}
                              onChange={(e) => {
                                setFieldValue("branch", e.target.value);
                              }}
                            />
                          </>
                        ) : null}
                        <TextFieldFormik
                          id="paidAmount"
                          label="Amount (₹)"
                          placeholder=" "
                          labelSize={3}
                          tabIndex={
                            values.paymentMode.paymentMode != "Cash" ? 5 : ""
                          }
                          mandatory={1}
                          isAmount={true}
                          maxlength={7}
                          style={{ width: "14%" }}
                          onChange={(e) => {
                            if (preFunction.amountValidation(e.target.value)) {
                              setFieldValue("paidAmount", e.target.value);
                              calculateExcessAmount(e.target.value);
                              setErrorClose();
                              setAmountMismatchError(false);
                            }
                          }}
                        />
                        <DateFieldFormik
                          label={
                            changeDateLabel
                              ? changeDateLabel
                              : values?.paymentMode?.paymentMode + " Date"
                          }
                          labelSize={3}
                          id="paidDate"
                          tabIndex={
                            values.paymentMode.paymentMode != "Cash" ? 6 : ""
                          }
                          maxDate={moment().add(1, "months")}
                          minDate={new Date(moment().subtract(1, "months"))}
                          style={{ width: "20%" }}
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("paidDate", e.target.value);
                          }}
                        />
                        <TextFieldFormik
                          labelSize={3}
                          id="referenceNumber"
                          label={
                            changeRefNumberLabel
                              ? changeRefNumberLabel
                              : values?.paymentMode?.paymentMode + " Number"
                          }
                          mandatory={1}
                          tabIndex={
                            values.paymentMode.paymentMode != "Cash" ? 7 : ""
                          }
                          maxlength={45}
                          // maxlength={18}
                          style={{ width: "25%" }}
                          onChange={(e) => {
                            if (preFunction.amountValidation(e.target.value)) {
                              setFieldValue("referenceNumber", e.target.value);
                            }
                          }}
                        />
                      </div>
                    ) : null}
                    {data.length > 0 && values.student ? (
                      <div className="row p-0">
                        <div className="subhead-row p-0">
                          <div className="subhead"> Fees Detail</div>
                          <div className="col line-div"></div>
                        </div>
                        {showDiscountMessage && (
                          <div className="row no-gutters border p-3 mb-2">
                            <div style={{ color: "green", fontWeight: "bold" }}>
                              Eligible to get Discount of ₹
                              {discountJSON.CONCESSION_AMOUNT}, if pay full fee
                              of the particulars{" "}
                              {eligibleFullDiscountParticulars.join(", ")}.
                              Offer Ends on{" "}
                              {moment(discountJSON.DUE_DATE).format(
                                "DD-MM-YYYY"
                              )}
                            </div>
                          </div>
                        )}
                        <div className="row p-0 mt-1">
                          <div className="table-responsive row p-0">
                            <table className="table table-bordered table-hover">
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width={"8%"}>{RENAME?.sem}</th>
                                  <th>Particular</th>
                                  <th width="10%">Opening Balance (₹)</th>
                                  <th width="5%">Concession (₹)</th>
                                  <th width="5%">Paid (₹)</th>
                                  <th width="5%">Refund (₹)</th>
                                  <th width="10%">Outstanding Balance (₹)</th>
                                  <th width="5%">Amount to Pay (₹)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.map((item, index) => (
                                  <PaymentDetails
                                    key={index}
                                    item={item}
                                    index={index}
                                    handleAmount={handleAmount}
                                    sendConcessionAmt={sendConcessionAmt}
                                    oldTerm1Amt={oldTerm1Amt}
                                    initialAmount={""}
                                    closeErrors={closeErrors}
                                    tabIndex={
                                      values.paymentMode.paymentMode != "Cash"
                                        ? 8
                                        : 3
                                    }
                                  />
                                ))}
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
                                <tr>
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
                                    {concessionTot}
                                  </td>
                                  <td align="right" className="student-text">
                                    {paidOldTot}
                                  </td>

                                  <td align="right" className="student-text">
                                    {refundTot}
                                  </td>
                                  <td align="right" className="student-text">
                                    {outstandTot}
                                  </td>
                                  <td align="right" className="student-text">
                                    {sendConcessionAmt
                                      ? totalAmount -
                                        discountJSON.CONCESSION_AMOUNT
                                      : totalAmount}
                                  </td>
                                </tr>
                                {excessAmount > 0 && (
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
                          <ErrorMessage
                            Message={amountMismatchMessage}
                            view={amountMismatchError}
                          />
                        </div>
                      </div>
                    ) : null}
                    {data.length > 0 && values.student ? (
                      <div className="row">
                        <Button
                          tabIndex={
                            values.paymentMode.paymentMode != "Cash"
                              ? 8 + data.length
                              : 3 + data.length
                          }
                          onClick={(e) => preFunction.handleErrorFocus(errors)}
                          id="save"
                          text="F4 - Save"
                        />
                      </div>
                    ) : null}
                  </div>
                </form>
              );
            }}
          </Formik>
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
    </div>
  );
}
export default Billing;
