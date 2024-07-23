import React, { useContext, useEffect, useState, useRef } from "react";
import { Formik } from "formik";
import moment from "moment";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import $ from "jquery";

import StudentApi from "../../api/StudentApi";

import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";
import AuthContext from "../../auth/context";
import ErrorMessage from "../../component/common/ErrorMessage";
import PDFDetail from "../../component/PDFDetail";
import PdfComponent from "../../component/common/PdfComponent";
import string from "../../string";
import storage from "../../auth/storage";
import { useLocation } from "react-router-dom";

const isRequiredWhenNotCash = function (value) {
  const payMode = this.parent.payMode;
  return !(payMode && payMode.paymentMode !== "Cash") || !!value;
};

const isRequiredWhenNotNeftUPI = function (value) {
  const payMode = this.parent.payMode;
  return (
    !(
      payMode &&
      payMode?.paymentMode !== "Cash" &&
      payMode?.paymentMode != "NEFT/RTGS" &&
      payMode?.paymentMode != "UPI" &&
      payMode?.paymentMode != "Credit Card" &&
      payMode?.paymentMode != "Razorpay"
    ) || !!value
  );
};

function MiscellaneousBilling() {
  const location = useLocation();
  const [load, setLoad] = useState(false);
  const formikRef = useRef();

  const [openModal, setOpenModal] = useState(false);
  const [particularList, setParticularList] = useState([]);
  const [payModeList, setPayModeList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [particularToPass, setParticularToPass] = useState([]);
  const [particularError, setParticularError] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [changeDateLabel, setChangedDateLabel] = useState("");
  const [changeRefNumberLabel, setChangedRefNumberLabel] = useState("");

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [showRes, setShowRes] = useState(false);

  const { setUnSavedChanges } = useContext(AuthContext);

  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeId, collegeName, role } = useContext(AuthContext);

  const misSchema = Yup.object().shape({
    college:
      collegeConfig.is_university && collegeConfig.common_cashier == 1
        ? Yup.object().required("Please select College")
        : Yup.mixed().notRequired(),
    name: Yup.string()
      .min(3, "Must be at least 3 characters long")
      .matches(/^[A-Za-z@. ]+$/, "Please enter valid Name")
      .required("Please enter Name")
      .trim(),
    payMode: Yup.object().required("Please select PayMode"),
    bankName: Yup.object().test(
      "isRequired",
      "Please enter Bank Name",
      isRequiredWhenNotNeftUPI
    ),
    branch: Yup.string()
      .min(3, "Must be at least 3 characters long", isRequiredWhenNotNeftUPI)
      .trim(isRequiredWhenNotNeftUPI)
      .test("isRequired", "Please enter Branch", isRequiredWhenNotNeftUPI),
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

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
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

  const handleParticular = async (values) => {
    console.log("Values", values);
    let err = false;
    if (!values.particular || !values.amount) {
      err = true;
      setParticularError(true);
      return;
    }
    particularToPass.push({
      particularID: values.particular.id,
      particular: values.particular.particular,
      amount: values.amount,
    });
    setParticularToPass([...particularToPass]);
    let arr = particularList.filter((e) => e.id != values.particular.id);
    console.log("arr", arr);
    setParticularList(arr);
    console.log("ParticularToPass", particularToPass);

    formikRef.current.setFieldValue("particular", "");
    formikRef.current.setFieldValue("amount", "");
    document.getElementById("particular")?.focus();
    return err;
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    try {
      console.log("Values-----", values);
      console.log("ParticularToPass", particularToPass);
      let partToPass = particularToPass;
      if (values.particular && values.amount) {
        let err = await handleParticular(values);
        if (err) {
          return;
        }
        setParticularToPass([...particularToPass]);
      }
      if (particularToPass.length == 0) {
        setParticularError(true);
        if (!values.particular || values.particular === "")
          document.getElementById("particular")?.focus();
        else if (!values.amount) document.getElementById("amount")?.focus();
        return;
      }
      setLoad(true);
      let partsToPass = [],
        totalAmt = 0;
      particularToPass.map((item) => {
        totalAmt += parseInt(item.amount);
        partsToPass.push({
          particularID: item.particularID,
          amount: item.amount,
        });
      });
      console.log("particularToPass----------", particularToPass);
      console.log("partsToPass", partsToPass);

      const misRes = await StudentApi.addMisellaneousBilling(
        values.name,
        values.payMode.id,
        values.payMode.paymentMode,
        totalAmt,
        values.bankName ? values.bankName.id : null,
        values.branch ? values.branch : null,
        values.referenceNumber ? values.referenceNumber : null,
        values.paidDate ? moment(values.paidDate).format("yyyy-MM-DD") : null,
        collegeConfig.is_university &&
          (collegeConfig.common_cashier == 1 || role == "SuperAdmin")
          ? values.college.collegeID
          : collegeId,
        partsToPass
      );

      console.log("MisRes---", misRes);
      if (!misRes.data.message.success) {
        setModalMessage(misRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      const MISBillDetailRes = await StudentApi.MISBillDetail(
        misRes.data.message.data.billingID
      );
      console.log("MISBillDetailRes---", MISBillDetailRes);

      if (!MISBillDetailRes.data.message.success) {
        setModalMessage(MISBillDetailRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Not Exists");
        setLoad(false);
        return;
      }

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
        MISBillDetailRes.data.message.data.feesCollectionDetail.map(
          (item, index) => {
            return index % string.PRINT_PER_PAGE === 0 ? (
              <PDFDetail
                startNo={index}
                hideAdmin={hideAdmin}
                AOText={AOText}
                feesCollectionDetail={MISBillDetailRes.data.message.data.feesCollectionDetail.slice(
                  index,
                  index + string.PRINT_PER_PAGE
                )}
                feesCollection={
                  MISBillDetailRes?.data?.message?.data.feesCollection[0]
                }
                secondCopy={true}
                finalPage={
                  parseInt(
                    MISBillDetailRes.data.message.data.feesCollectionDetail
                      .length / string.PRINT_PER_PAGE
                  ) *
                    string.PRINT_PER_PAGE ===
                  index
                }
                MISCBill={true}
              />
            ) : null;
          }
        );
      setPdfContent(pdfContent);

      handleUnSavedChanges(0);
      handlePrint();
      setParticularToPass([]);
      if (!collegeConfig.is_university) getAllList(collegeId);
      resetForm();
      document.getElementById("name")?.focus();
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const clearValues = (setFieldValue, text, setFieldTouched) => {
    setFieldValue("payMode", text);
    setFieldValue("bankName", "");
    setFieldValue("branch", "");
    setFieldValue("amount", "");
    setFieldValue("paidDate", "");
    setFieldValue("referenceNumber", "");
    setFieldTouched("payMode", false);
    setFieldTouched("bankName", false);
    setFieldTouched("branch", false);
    setFieldTouched("amount", false);
    setFieldTouched("paidDate", false);
    setFieldTouched("referenceNumber", false);
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

  const getAllList = async (college_id) => {
    try {
      const masterRes = await StudentApi.getMaster(5, college_id);
      console.log("Miscellasneous Particular", masterRes);
      if (!masterRes.data.message.success) {
        setModalMessage(masterRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        return;
      }
      setPayModeList(masterRes.data.message.data.payment_mode_data);
      for (
        let i = 0;
        i < masterRes.data.message.data.payment_mode_data.length;
        i++
      ) {
        if (
          masterRes.data.message.data.payment_mode_data[i].paymentMode == "Cash"
        ) {
          formikRef?.current?.setFieldValue(
            "payMode",
            masterRes.data.message.data.payment_mode_data[i]
          );
          break;
        }
      }
      if (masterRes.data.message.data.particular_misc_data.length == 0) {
        setModalMessage("No Particulars Available");
        setModalErrorOpen(true);
        setModalTitle("Message");
        return;
      }
      setParticularList(masterRes.data.message.data.particular_misc_data);
      setBankList(masterRes.data.message.data.bank_data);
      formikRef.current.setFieldValue(
        "paymode",
        masterRes.data.message.data.payment_mode_data[0]
      );
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (
      !collegeConfig.is_university ||
      (collegeConfig.is_university == 1 && collegeConfig.common_cashier == 0)
    ) {
      getAllList(collegeId);
    }
  }, [collegeConfig.is_university]);

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
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={true}
            innerRef={formikRef}
            initialValues={{
              college: "",
              name: "",
              particular: "",
              payMode: "",
              amount: "",
              bankName: "",
              branch: "",
              referenceNumber: "",
              paidDate: "",
            }}
            validationSchema={misSchema}
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
                  <div className="col-lg-10">
                    {collegeConfig.is_university &&
                    (collegeConfig.common_cashier == 1 ||
                      role == "SuperAdmin") ? (
                      <SelectFieldFormik
                        autoFocus
                        tabIndex={0}
                        labelSize={3}
                        label="College"
                        id="college"
                        mandatory={1}
                        options={collegeConfig.collegeList}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        searchIcon={false}
                        clear={false}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          handleUnSavedChanges(1);
                          getAllList(text.collegeID);
                        }}
                        style={{ width: "60%" }}
                      />
                    ) : null}
                    <TextFieldFormik
                      autoFocus={
                        !collegeConfig.is_university ||
                        (collegeConfig.is_university == 1 &&
                          collegeConfig.common_cashier == 0 &&
                          role != "SuperAdmin")
                      }
                      labelSize={3}
                      tabIndex={1}
                      id="name"
                      label="Name"
                      mandatory={1}
                      maxlength={45}
                      style={{ width: "50%" }}
                      onChange={(e) => {
                        handleUnSavedChanges(1);
                        setFieldValue(
                          "name",
                          preFunction.capitalizeFirst(e.target.value)
                        );
                      }}
                    />
                    <SelectFieldFormik
                      label="Pay Mode"
                      placeholder={" "}
                      labelSize={3}
                      id="payMode"
                      tabIndex={2}
                      style={{ width: "28%" }}
                      mandatory={1}
                      getOptionLabel={(option) => option.paymentMode}
                      getOptionValue={(option) => option.id}
                      options={payModeList}
                      onChange={(text) => {
                        setFieldValue("payMode", text);
                        handleUnSavedChanges(1);
                        handleChangeLabel(text);
                        clearValues(setFieldValue, text, setFieldTouched);
                      }}
                      maxlength={15}
                    />
                    {values?.payMode &&
                    values?.payMode.paymentMode != "Cash" ? (
                      <>
                        {values?.payMode?.paymentMode != "NEFT/RTGS" &&
                        values?.payMode?.paymentMode != "UPI" &&
                        values?.payMode?.paymentMode != "Credit Card" &&
                        values?.payMode?.paymentMode != "Razorpay" ? (
                          <>
                            <SelectFieldFormik
                              label="Bank Name"
                              labelSize={3}
                              tabIndex={
                                values.payMode &&
                                values.payMode.paymentMode != "Cash"
                                  ? 3
                                  : ""
                              }
                              id="bankName"
                              mandatory={1}
                              style={{ width: "80%" }}
                              getOptionLabel={(option) => option.bank}
                              getOptionValue={(option) => option.id}
                              options={bankList}
                              onChange={(text) =>
                                setFieldValue("bankName", text)
                              }
                              maxlength={30}
                            />
                            <TextFieldFormik
                              id="branch"
                              label="Branch"
                              labelSize={3}
                              tabIndex={
                                values.payMode &&
                                values.payMode.paymentMode != "Cash"
                                  ? 4
                                  : ""
                              }
                              mandatory={1}
                              maxlength={40}
                              style={{ width: "80%" }}
                              onChange={handleChange}
                            />
                          </>
                        ) : null}
                        <DateFieldFormik
                          label={
                            changeDateLabel
                              ? changeDateLabel
                              : values?.payMode?.paymentMode + " Date"
                          }
                          // label="DD/Cheque Date"
                          labelSize={3}
                          mandatory={1}
                          id="paidDate"
                          style={{ width: "25%" }}
                          maxDate={moment().add(1, "months")}
                          minDate={new Date(moment().subtract(1, "months"))}
                          onChange={(e) => {
                            setFieldValue("paidDate", e.target.value);
                          }}
                          tabIndex={
                            values.payMode &&
                            values.payMode.paymentMode != "Cash"
                              ? 6
                              : ""
                          }
                        />
                        <TextFieldFormik
                          id="referenceNumber"
                          label={
                            changeRefNumberLabel
                              ? changeRefNumberLabel
                              : values?.payMode?.paymentMode + " Number"
                          }
                          // label="DD/Cheque No."
                          style={{ width: "40%" }}
                          labelSize={3}
                          mandatory={1}
                          tabIndex={
                            values.payMode &&
                            values.payMode.paymentMode != "Cash"
                              ? 5
                              : ""
                          }
                          onChange={(e) => {
                            {
                              if (preFunction.amountValidation(e.target.value))
                                setFieldValue(
                                  "referenceNumber",
                                  e.target.value
                                );
                            }
                          }}
                          maxlength={18}
                        />
                      </>
                    ) : null}
                  </div>
                  {particularList.length > 0 || particularToPass.length > 0 ? (
                    <table className="table table-bordered table-hover mt-2">
                      <thead>
                        <tr>
                          <th width="1%">No.</th>
                          <th>Particular</th>
                          <th width="10%">Amount (₹)</th>
                          <th width="1%"></th>
                        </tr>
                      </thead>
                      {/* {particularList.length === 0 ? (
                      <tbody>
                        <tr>
                          <td colSpan="4" align="center">
                            No Particulars Available
                          </td>
                        </tr>
                      </tbody>
                    ) : ( */}
                      <tbody>
                        {particularToPass.map((item, index) => (
                          <tr>
                            <td>{index + 1}</td>
                            <td>{item.particular}</td>
                            <td align="right">{item.amount}</td>
                            <td align="center">
                              <Button
                                className="plus-button"
                                type="button"
                                text="-"
                                isTable={true}
                                onClick={(e) => {
                                  let arr = particularToPass.filter(
                                    (e, i) => i != index
                                  );
                                  setParticularToPass(arr);
                                  let arr1 = particularList.concat({
                                    id: item.particularID,
                                    particular: item.particular,
                                  });
                                  setParticularList(arr1);
                                }}
                              />
                            </td>
                          </tr>
                        ))}

                        {particularList.length > 0 ? (
                          <tr>
                            <td>{particularToPass.length + 1}</td>
                            <td>
                              <SelectFieldFormik
                                id="particular"
                                isTable={true}
                                tabIndex={
                                  values.payMode &&
                                  values.payMode.paymentMode != "Cash"
                                    ? 7
                                    : 3
                                }
                                maxlength={30}
                                options={particularList}
                                getOptionLabel={(option) => option.particular}
                                getOptionValue={(option) => option.id}
                                mandatory={1}
                                onChange={(text) => {
                                  setParticularError(false);
                                  setFieldValue("particular", text);
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </td>
                            <td>
                              <TextFieldFormik
                                id="amount"
                                placeholder=" "
                                mandatory={1}
                                isAmount={true}
                                maxlength={7}
                                isTable={true}
                                tabIndex={
                                  values.payMode &&
                                  values.payMode.paymentMode != "Cash"
                                    ? 8
                                    : 4
                                }
                                onChange={(e) => {
                                  if (
                                    preFunction.amountValidation(e.target.value)
                                  ) {
                                    setParticularError(false);
                                    setFieldValue("amount", e.target.value);
                                    handleUnSavedChanges(1);
                                  }
                                }}
                              />
                            </td>
                            <td align="center">
                              <Button
                                className="plus-button"
                                type="button"
                                text="+"
                                tabIndex={
                                  values.payMode &&
                                  values.payMode.paymentMode != "Cash"
                                    ? 9
                                    : 5
                                }
                                isTable={true}
                                onClick={(e) => {
                                  handleParticular(values);
                                }}
                              />
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                      {/* )} */}
                    </table>
                  ) : null}
                  <ErrorMessage
                    Message={"Please enter Particular and Amount details"}
                    view={particularError}
                  />
                  {particularToPass.length > 0 && (
                    <Button
                      isTable={true}
                      onClick={(e) => {
                        preFunction.handleErrorFocus(errors);
                      }}
                      tabIndex={
                        values.payMode && values.payMode.paymentMode != "Cash"
                          ? 10
                          : 6
                      }
                      id="save"
                      text="F4 - Save"
                    />
                  )}
                </form>
              );
            }}
          </Formik>
        </div>
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
export default MiscellaneousBilling;
