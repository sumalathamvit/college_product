import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";
import moment from "moment";
import { Modal } from "react-bootstrap";

import libraryApi from "../api/libraryapi";
import StudentApi from "../api/StudentApi";

import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import DateFieldFormik from "../component/FormField/DateFieldFormik";
import preFunction from "../component/common/CommonFunction";
import TextFieldFormik from "../component/FormField/TextFieldFormik";
import TextAreaFieldFormik from "../component/FormField/TextFieldFormik";
import SelectFieldFormik from "../component/FormField/SelectFieldFormik";
import TextField from "../component/FormField/TextField";
import ScreenTitle from "../component/common/ScreenTitle";
import SwitchField from "../component/FormField/SwitchField";
import ModalComponent from "../component/ModalComponent";
import AuthContext from "../auth/context";
import { useSelector } from "react-redux";

function JournalOrder() {
  const [load, setLoad] = useState(false);

  const [publisherList, setPublisherList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [frequencyList, setFrequencyList] = useState([]);
  const [editorList, setEditorList] = useState([]);
  const [journalList, setJournalList] = useState([]);
  const [subscriptionTypeList, setSubscriptionTypeList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [paymentModeList, setPaymentModeList] = useState([]);

  const [masterError, setMasterError] = useState(false);
  const [masterErrorMessage, setMasterErrorMessage] = useState("");
  const [errorModal, setErrorModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [master, setMaster] = useState("");
  const [masterLabel, setMasterLabel] = useState();
  const [error, setError] = useState(false);
  const formikRef = useRef();
  const collegeConfig = useSelector((state) => state.web.college);

  const isRequiredWhenNotCash = function (value) {
    const paymentMode = this.parent.paymentMode;
    return !(paymentMode && paymentMode.paymentMode !== "Cash") || !!value;
  };

  const journalOrderSchema = () => {
    if (collegeConfig.is_university) {
      return Yup.object().shape({
        college: Yup.object().required("Please select College"),
        subscriptionType: Yup.object().required(
          "Please select Subscription Type"
        ),
        journalName: Yup.object().required("Please select Journal Name"),
        issn: Yup.string()
          .required("Please enter ISSN / Sub.No")
          .matches(/^[A-Za-z0-9-]+$/, "Please enter valid ISSN/Sub.No"),
        subscriptionFromDate: Yup.date().required(
          "Please select Subscription From Date"
        ),
        subscriptionToDate: Yup.date().required(
          "Please select Subscription To Date"
        ),
        frequency: Yup.object().required("Please select Frequency"),
        publisher: Yup.object().required("Please enter Publisher"),
        supplier: Yup.object().required("Please enter Supplier Name"),
        journalSubject: Yup.object().required("Please enter Journal Subject"),
        purchaseNo: Yup.string().required("Please enter Purchase Number"),
        poDate: Yup.date().required("Please select PO Date"),
        amount: Yup.string().required("Please enter Amount"),
        ddChequeNo: Yup.date().test(
          "isRequired",
          "Please enter DD / Cheque Number",
          isRequiredWhenNotCash
        ),
        ddChequeDate: Yup.date().test(
          "isRequired",
          "Please select DD / Cheque Date",
          isRequiredWhenNotCash
        ),
        bank: Yup.object().test(
          "isRequired",
          "Please select Bank",
          isRequiredWhenNotCash
        ),
        paymentMode: Yup.object().required("Please select Payment Mode"),
      });
    } else {
      return Yup.object().shape({
        subscriptionType: Yup.object().required(
          "Please select Subscription Type"
        ),
        journalName: Yup.object().required("Please select Journal Name"),
        issn: Yup.string()
          .required("Please enter ISSN / Sub.No")
          .matches(/^[A-Za-z0-9-]+$/, "Please enter valid ISSN/Sub.No"),
        subscriptionFromDate: Yup.date().required(
          "Please select Subscription From Date"
        ),
        subscriptionToDate: Yup.date().required(
          "Please select Subscription To Date"
        ),
        frequency: Yup.object().required("Please select Frequency"),
        publisher: Yup.object().required("Please enter Publisher"),
        supplier: Yup.object().required("Please enter Supplier Name"),
        journalSubject: Yup.object().required("Please enter Journal Subject"),
        purchaseNo: Yup.string().required("Please enter Purchase Number"),
        poDate: Yup.date().required("Please select PO Date"),
        amount: Yup.string().required("Please enter Amount"),
        ddChequeNo: Yup.date().test(
          "isRequired",
          "Please enter DD / Cheque Number",
          isRequiredWhenNotCash
        ),
        ddChequeDate: Yup.date().test(
          "isRequired",
          "Please select DD / Cheque Date",
          isRequiredWhenNotCash
        ),
        bank: Yup.object().test(
          "isRequired",
          "Please select Bank",
          isRequiredWhenNotCash
        ),
        paymentMode: Yup.object().required("Please select Payment Mode"),
      });
    }
  };

  const { unSavedChanges, setUnSavedChanges, collegeId } =
    useContext(AuthContext);

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("values---", values);
    try {
      setLoad(true);

      // const checkJournalRes = await libraryApi.checkJournalOrder(
      //   values.journalName.value
      // );
      // console.log("checkJournalRes---", checkJournalRes);

      // if (checkJournalRes.data.data.length > 0) {
      //   setErrorModal(true);
      //   setModalErrorMessage(
      //     "Active Subscription already exists fot this Journal"
      //   );
      //   setLoad(false);
      //   return;
      // }

      // let count = 0;
      // let errDate = [];
      // for (let i = 0; i < checkJournalRes.data.data.length; i++) {
      //   if (
      //     checkJournalRes.data.data[i].subscriptionfrom <=
      //       values.subscriptionToDate &&
      //     checkJournalRes.data.data[i].subscriptionto >=
      //       values.subscriptionFromDate
      //   ) {
      //     count++;
      //     errDate.push(
      //       checkJournalRes.data.data[i].subscriptionfrom +
      //         " - " +
      //         checkJournalRes.data.data[i].subscriptionto
      //     );
      //   }
      // }

      // if (count > 0) {
      //   console.log("errDate---", errDate);
      //   setErrorModal(true);
      //   let errorDates = errDate.join(" , ");
      //   setModalErrorMessage(
      //     `Subscription already exists between these dates ( <span style="color: #2455b7;">${errorDates}</span> )`
      //   );
      //   setLoad(false);
      //   return;
      // }

      const addJournalOrder = await libraryApi.addJournalOrder(
        values.subscriptionType.value,
        values.journalName.value,
        values.issn.replace(/\s\s+/g, " ").trim(),
        values.foreignJournal,
        values.subscriptionFromDate,
        values.subscriptionToDate,
        values.frequency.value,
        values.editor?.value ? values.editor.value : null,
        values.publisher.value,
        values.supplier.value,
        values.journalSubject.value,
        values.purchaseNo.replace(/\s\s+/g, " ").trim(),
        values.poDate,
        values.amount,
        values.paymentMode !== "Cash"
          ? values.ddChequeNo.replace(/\s\s+/g, " ").trim()
          : null,
        values.paymentMode !== "Cash" ? values.ddChequeDate : null,
        values.paymentMode.id,
        values.paymentMode !== "Cash" ? values.bank.id : null,
        values.remarks ? values.remarks.replace(/\s\s+/g, " ").trim() : null,
        collegeConfig.is_university ? values.college.collegeID : collegeId
      );
      console.log("addJournalOrder---", addJournalOrder);
      if (addJournalOrder.ok) {
        handleUnSavedChanges(0);
        toast.success("Journal Order Added Successfully");
        resetForm();
        const payModeRes = paymentModeList.filter((item) => {
          if (item.paymentMode === "Cash") {
            return item;
          }
        });
        formikRef.current.setFieldValue("paymentMode", payModeRes[0]);

        document.getElementById("subscriptionType")?.focus();
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  // const payModeRes = paymentModeList.filter((item) => {
  //   if (item.paymentMode === "Cash") {
  //     return item;
  //   }
  // });

  // console.log("payModeRes---", payModeRes);

  const handleSearchSubject = async (text) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const subjectRes = await libraryApi.getSearchJournalSubject(text);
        console.log("subjectRes---", subjectRes);
        setSubjectList(subjectRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setSubjectList([]);
    }
  };

  const handleSearchPublisher = async (text) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const publisher = await libraryApi.getPublisherBySearch(text);
        console.log("publisherres---", publisher);
        setPublisherList(publisher.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setPublisherList([]);
    }
  };

  const handleSearchSupplier = async (text) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const supplierRes = await libraryApi.getSupplierBySearch(text);
        console.log("supplierRes---------", supplierRes);
        setSupplierList(supplierRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setSupplierList([]);
    }
  };

  const handleSearchEditor = async (text) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const supplierRes = await libraryApi.getSearchEditor(text);
        console.log("supplierRes---------", supplierRes);
        setEditorList(supplierRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setEditorList([]);
    }
  };

  const handleSearchJournal = async (text) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const supplierRes = await libraryApi.getSearchJoural(text);
        console.log("supplierRes---------", supplierRes);
        setJournalList(supplierRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setJournalList([]);
    }
  };

  const handleAddMaster = async () => {
    console.log("master---", master);
    let err = false;
    const masterRegEx = /^[A-Za-z0-9@(). \-+/]+$/;
    if (master.trim() === "") {
      err = true;
      setMasterError(true);
      setMasterErrorMessage(
        `Please enter ${
          masterLabel === 1
            ? "Journal Name"
            : masterLabel === 2
            ? "Journal Subject"
            : "Editor"
        }`
      );
      document.getElementById("master")?.focus();
    } else if (!masterRegEx.test(master.trim())) {
      err = true;
      setMasterError(true);
      setMasterErrorMessage(
        `Please enter valid ${
          masterLabel === 1
            ? "Journal Name"
            : masterLabel === 2
            ? "Journal Subject"
            : "Editor"
        }`
      );
      document.getElementById("master")?.focus();
    }
    if (err) {
      return;
    }
    try {
      let masterDoctype = "";
      if (masterLabel === 1) {
        masterDoctype = "Lib JJournal";
      } else if (masterLabel === 2) {
        masterDoctype = "Lib JJournalSubject";
      } else {
        masterDoctype = "Lib JEditor";
      }

      const addJournalRes = await libraryApi.addJournalMaster(
        masterDoctype,
        master.replace(/\s\s+/g, " ").trim()
      );
      console.log("addJournalRes---", addJournalRes);
      if (addJournalRes.status === 200) {
        toast.success(
          ` ${
            masterLabel === 1
              ? "Journal Name"
              : masterLabel === 2
              ? "Journal Subject"
              : "Editor"
          } added successfully`
        );
        setOpenModal(false);
        setMaster("");
      } else {
        setMasterError(true);
        setMasterErrorMessage(
          `${
            masterLabel === 1
              ? "Journal Name"
              : masterLabel === 2
              ? "Journal Subject"
              : "Editor"
          } already exists`
        );
        document.getElementById("master")?.focus();
      }
      setLoad(false);
    } catch (error) {
      console.log("catch---", error);
    }
  };

  const getAllList = async () => {
    try {
      const frequencyRes = await libraryApi.getFrequencyList();
      console.log("frequencyRes---", frequencyRes);
      setFrequencyList(frequencyRes.data.data);
      const subscriptionTypeRes = await libraryApi.getSubscriptionTypeList();
      console.log("subscriptionTypeRes---", subscriptionTypeRes);
      setSubscriptionTypeList(subscriptionTypeRes.data.data);
      const getMaster = await StudentApi.getMaster(5);
      console.log("bankres---", getMaster);
      setBankList(getMaster.data.message.data.bank_data);
      const payMode = getMaster.data.message.data.payment_mode_data;
      setPaymentModeList(payMode);
      payMode.map((item) => {
        if (item.paymentMode === "Cash") {
          console.log(item);
          formikRef.current.setFieldValue("paymentMode", item);
        }
      });
    } catch (error) {
      console.log("catch---", error);
    }
  };

  useEffect(() => {
    getAllList();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        title={"Subscription"}
        isOpen={errorModal}
        message={modalErrorMessage}
        okClick={() => {
          setErrorModal(false);
        }}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position" />
        <div className="row no-gutters">
          <Formik
            innerRef={formikRef}
            enableReinitialize={false}
            initialValues={{
              college: "",
              subscriptionType: "",
              journalName: "",
              issn: "",
              foreignJournal: false,
              subscriptionFromDate: "",
              subscriptionToDate: "",
              frequency: "",
              editor: "",
              publisher: "",
              supplier: "",
              journalSubject: "",
              purchaseNo: "",
              poDate: "",
              amount: "",
              ddChequeNo: "",
              ddChequeDate: "",
              paymentMode: "",
              bank: "",
              remarks: "",
              active: false,
            }}
            validationSchema={journalOrderSchema}
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
                    <div className="col-lg-12  text-right mb-3">
                      <Button
                        type="button"
                        frmButton={false}
                        className={"btn-green me-3"}
                        text="Add Journal Name"
                        onClick={() => {
                          setMasterLabel(1);
                          setOpenModal(true);
                        }}
                      />
                      <Button
                        type="button"
                        frmButton={false}
                        className={"btn-green me-3"}
                        text="Add Editor"
                        onClick={() => {
                          setMasterLabel(3);
                          setOpenModal(true);
                        }}
                      />
                      <Button
                        type="button"
                        frmButton={false}
                        className={"btn-green"}
                        text="Add Journal Subject"
                        onClick={() => {
                          setMasterLabel(2);
                          setOpenModal(true);
                        }}
                      />
                    </div>
                    {collegeConfig.is_university && (
                      <SelectFieldFormik
                        autoFocus
                        label="College"
                        id="college"
                        mandatory={1}
                        title={true}
                        clear={false}
                        tabIndex={1}
                        labelSize={3}
                        maxLength={15}
                        style={{ width: "75%" }}
                        getOptionLabel={(option) => option.collegeName}
                        getOptionValue={(option) => option.collegeID}
                        options={collegeConfig.collegeList}
                        onChange={(text) => {
                          setFieldValue("college", text);
                          handleUnSavedChanges(1);
                        }}
                      />
                    )}
                    <SelectFieldFormik
                      autoFocus={!collegeConfig.is_university}
                      tabIndex={2}
                      label="Subscription Type"
                      id="subscriptionType"
                      options={subscriptionTypeList}
                      clear={false}
                      search={false}
                      mandatory={1}
                      labelSize={3}
                      onChange={(text) => {
                        setFieldValue("subscriptionType", text);
                        handleUnSavedChanges(1);
                      }}
                      style={{ width: "35%" }}
                    />

                    <SelectFieldFormik
                      tabIndex={3}
                      label="Journal Name"
                      id="journalName"
                      labelSize={3}
                      searchIcon={true}
                      options={journalList}
                      mandatory={1}
                      onInputChange={(inputValue) => {
                        handleSearchJournal(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("journalName", text);
                        setJournalList([]);
                        handleUnSavedChanges(1);
                      }}
                      style={{ width: "75%" }}
                    />
                    <TextFieldFormik
                      tabIndex={4}
                      id="issn"
                      label="ISSN/Subscription No."
                      placeholder="ISSN/Sub No."
                      onChange={(e) => {
                        setFieldValue("issn", e.target.value);
                        handleUnSavedChanges(1);
                      }}
                      maxLength={10}
                      mandatory={1}
                      labelSize={3}
                      style={{ width: "23%" }}
                    />
                    <SwitchField
                      tabIndex={5}
                      label="Foreign Journal"
                      labelSize={3}
                      yesOption={"Yes"}
                      noOption={"No"}
                      checked={values.foreignJournal}
                      value={values.foreignJournal}
                      onChange={(e) => {
                        setFieldValue("foreignJournal", !values.foreignJournal);
                        handleUnSavedChanges(1);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={6}
                      label="Frequency"
                      id="frequency"
                      options={frequencyList}
                      clear={false}
                      search={false}
                      mandatory={1}
                      labelSize={3}
                      onChange={(text) => {
                        setFieldValue("frequency", text);
                        setFieldValue("subscriptionFromDate", "");
                        setFieldValue("subscriptionToDate", "");
                        handleUnSavedChanges(1);
                      }}
                      style={{ width: "23%" }}
                    />

                    <DateFieldFormik
                      tabIndex={7}
                      label="Subscription From Date"
                      id="subscriptionFromDate"
                      maxDate={new Date()}
                      minDate={new Date(moment().subtract(1, "month"))}
                      mandatory={1}
                      labelSize={3}
                      style={{ width: "30%" }}
                      onChange={(e) => {
                        setFieldValue("subscriptionFromDate", e.target.value);
                        setErrorModal(false);
                        setModalErrorMessage("");
                        handleUnSavedChanges(1);
                      }}
                    />

                    <DateFieldFormik
                      tabIndex={8}
                      label="Subscription To Date"
                      id="subscriptionToDate"
                      maxDate={new Date(moment().add(10, "year"))}
                      minDate={
                        values.subscriptionFromDate
                          ? new Date(
                              moment(values.subscriptionFromDate).add(
                                values.frequency.days,
                                "days"
                              )
                            )
                          : new Date()
                      }
                      mandatory={1}
                      labelSize={3}
                      style={{ width: "30%" }}
                      onChange={(e) => {
                        console.log("e.target.value---", e.target.value);
                        // setDateError(false);
                        setFieldValue("subscriptionToDate", e.target.value);
                        setErrorModal(false);
                        setModalErrorMessage("");
                        handleUnSavedChanges(1);
                      }}
                      // error={dateError ? "Please choose valid Date" : ""}
                      // touched={dateError ? true : false}
                    />

                    <SelectFieldFormik
                      tabIndex={9}
                      label="Editor"
                      id="editor"
                      labelSize={3}
                      searchIcon={true}
                      clear={true}
                      options={editorList}
                      onInputChange={(inputValue) => {
                        handleSearchEditor(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("editor", text);
                        setEditorList([]);
                        handleUnSavedChanges(1);
                      }}
                      style={{ width: "45%" }}
                    />

                    <SelectFieldFormik
                      tabIndex={10}
                      label="Publisher"
                      id="publisher"
                      searchIcon={true}
                      labelSize={3}
                      mandatory={1}
                      options={publisherList}
                      onInputChange={(inputValue) => {
                        handleSearchPublisher(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("publisher", text);
                        setPublisherList([]);
                        handleUnSavedChanges(1);
                      }}
                      style={{ width: "75%" }}
                    />
                    <SelectFieldFormik
                      tabIndex={11}
                      label="Supplier Name"
                      id="supplier"
                      options={supplierList}
                      labelSize={3}
                      mandatory={1}
                      searchIcon={true}
                      onChange={(text) => {
                        setSupplierList([]);
                        setFieldValue("supplier", text);
                        handleUnSavedChanges(1);
                      }}
                      onInputChange={(inputValue) => {
                        handleSearchSupplier(inputValue);
                      }}
                      style={{ width: "75%" }}
                    />
                    <SelectFieldFormik
                      tabIndex={12}
                      label="Journal Subject"
                      id="journalSubject"
                      labelSize={3}
                      searchIcon={true}
                      options={subjectList}
                      mandatory={1}
                      onInputChange={(inputValue) => {
                        handleSearchSubject(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("journalSubject", text);
                        setSubjectList([]);
                        handleUnSavedChanges(1);
                      }}
                      style={{ width: "45%" }}
                    />
                    <TextFieldFormik
                      tabIndex={13}
                      id="purchaseNo"
                      label="PO No."
                      onChange={(e) => {
                        setFieldValue("purchaseNo", e.target.value);
                        handleUnSavedChanges(1);
                      }}
                      maxLength={10}
                      mandatory={1}
                      labelSize={3}
                      style={{ width: "23%" }}
                    />
                    <DateFieldFormik
                      tabIndex={14}
                      label="PO Date"
                      id="poDate"
                      labelSize={3}
                      mandatory={1}
                      minDate={
                        values.subscriptionFromDate
                          ? new Date(
                              moment(values.subscriptionFromDate).subtract(
                                1,
                                "week"
                              )
                            )
                          : new Date(moment().subtract(1, "month"))
                      }
                      maxDate={new Date(moment().add(1, "week"))}
                      style={{ width: "30%" }}
                      onChange={(e) => {
                        setFieldValue("poDate", e.target.value);
                        handleUnSavedChanges(1);
                      }}
                    />
                    <SelectFieldFormik
                      tabIndex={15}
                      label="Payment Mode"
                      id="paymentMode"
                      options={paymentModeList}
                      clear={false}
                      search={false}
                      getOptionLabel={(option) => option.paymentMode}
                      getOptionValue={(option) => option.id}
                      mandatory={1}
                      labelSize={3}
                      onChange={(text) => {
                        setFieldValue("paymentMode", text);
                        handleUnSavedChanges(1);
                      }}
                      style={{ width: "23%" }}
                    />
                    <TextFieldFormik
                      tabIndex={16}
                      id="amount"
                      label="Amount (₹)"
                      onChange={(e) => {
                        if (preFunction.amountValidation(e.target.value)) {
                          handleChange(e);
                        }
                        handleUnSavedChanges(1);
                      }}
                      maxLength={7}
                      isAmount={true}
                      mandatory={1}
                      labelSize={3}
                      style={{ width: "23%" }}
                    />
                    {values.paymentMode &&
                    values.paymentMode.paymentMode !== "Cash" ? (
                      <>
                        <SelectFieldFormik
                          tabIndex={
                            values.paymentMode &&
                            values.paymentMode.paymentMode !== "Cash"
                              ? 17
                              : ""
                          }
                          label="Bank"
                          id="bank"
                          options={bankList}
                          clear={false}
                          getOptionLabel={(option) => option.bank}
                          getOptionValue={(option) => option.id}
                          labelSize={3}
                          mandatory={1}
                          onChange={(text) => {
                            setFieldValue("bank", text);
                          }}
                          style={{ width: "75%" }}
                        />
                        <TextFieldFormik
                          tabIndex={
                            values.paymentMode &&
                            values.paymentMode.paymentMode !== "Cash"
                              ? 18
                              : ""
                          }
                          id="ddChequeNo"
                          label="DD / Cheque Number"
                          onChange={handleChange}
                          maxLength={20}
                          mandatory={1}
                          labelSize={3}
                          style={{ width: "35%" }}
                        />
                        <DateFieldFormik
                          label="DD / Cheque Date"
                          id="ddChequeDate"
                          maxDate={new Date()}
                          labelSize={3}
                          minDate={new Date(moment().subtract(1, "month"))}
                          bottom={true}
                          style={{ width: "30%" }}
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("ddChequeDate", e.target.value);
                          }}
                          tabIndex={
                            values.paymentMode &&
                            values.paymentMode.paymentMode !== "Cash"
                              ? 19
                              : ""
                          }
                        />
                      </>
                    ) : null}

                    <TextAreaFieldFormik
                      tabIndex={
                        values.paymentMode &&
                        values.paymentMode.paymentMode !== "Cash"
                          ? 20
                          : 17
                      }
                      maxlength={45}
                      labelSize={3}
                      id="remarks"
                      label="Remarks"
                      placeholder="Remarks"
                      style={{ width: "75%" }}
                      value={values.remarks}
                      onChange={(e) => {
                        setFieldValue("remarks", e.target.value);
                        handleUnSavedChanges(1);
                      }}
                    />
                  </div>
                  <Button
                    tabIndex={
                      values.paymentMode &&
                      values.paymentMode.paymentMode !== "Cash"
                        ? 21
                        : 18
                    }
                    id="save"
                    onClick={(e) => preFunction.handleErrorFocus(errors)}
                    text="F4 - Save"
                  />
                </form>
              );
            }}
          </Formik>
          <Modal
            show={openModal}
            dialogClassName="my-modal"
            onEscapeKeyDown={() => {
              setOpenModal(false);
              setMaster("");
              setMasterError(false);
              setMasterErrorMessage("");
            }}
          >
            <Modal.Header>
              <Modal.Title>{`${
                masterLabel === 1
                  ? "Add Journal Name"
                  : masterLabel === 2
                  ? "Add Journal Subject"
                  : "Add Editor"
              }`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="col-lg-10">
                <TextField
                  tabIndex={51}
                  autoFocus={openModal ? true : false}
                  id="master"
                  label={
                    masterLabel === 1
                      ? "New Journal Name"
                      : masterLabel === 2
                      ? "New Journal Subject"
                      : "New Editor"
                  }
                  value={master}
                  mandatory={1}
                  maxlength={45}
                  labelSize={4}
                  onChange={(e) => {
                    console.log("e.target.value---", e.target.value);
                    setMaster(e.target.value);
                    setMasterError(false);
                  }}
                  style={{ width: "80%" }}
                  error={masterError ? masterErrorMessage : ""}
                  touched={masterError ? true : false}
                />
              </div>
              {/* <div className="row">
                <div className="col-lg-5"></div>
                <div className="col-lg-7 p-0 mt-2">
                  <ErrorMessage
                    Message={masterErrorMessage}
                    view={masterError}
                  />
                </div>
              </div> */}
            </Modal.Body>
            <Modal.Footer>
              <Button
                tabIndex={52}
                type="button"
                text="Save"
                frmButton={false}
                isTable={true}
                onClick={handleAddMaster}
              />
              <Button
                type="button"
                text={"Close"}
                frmButton={false}
                onClick={(e) => {
                  setOpenModal(false);
                  setMaster("");
                  setMasterError(false);
                  setMasterErrorMessage("");
                }}
                isTable={true}
              />
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default JournalOrder;
