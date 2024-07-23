import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import moment from "moment";
import * as Yup from "yup";

import libraryapi from "../../api/libraryapi";
import StudentApi from "../../api/StudentApi";

import SelectFieldFormik from "../../component/FormFieldLibrary/SelectFieldFormik";
import TextFieldFormik from "../../component/FormFieldLibrary/TextFieldFormik";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormFieldLibrary/DateFieldFormik";
import ReactSelectField from "../../component/FormFieldLibrary/ReactSelectField";
import ErrorMessage from "../../component/common/ErrorMessage";
import ScreenTitle from "../../component/common/ScreenTitle";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import string from "../../string";
import AuthContext from "../../auth/context";
import { useSelector } from "react-redux";

import { journalReportList } from "../../component/common/CommonArray";

const formSchema = Yup.object().shape({
  subscriptionNo: Yup.string().matches(
    /^[A-Za-z0-9-]+$/,
    "Please enter valid Subscription No."
  ),
});

function JournalReport() {
  const [load, setLoad] = useState(false);
  const [exportLoad, setExportLoad] = useState(false);
  const [data, setData] = useState([]);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const [reportType, setReportType] = useState(journalReportList[0]);
  const [showRes, setShowRes] = useState(false);
  const [subjectList, setSubjectList] = useState([]);
  const [publisherList, setPublisherList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [editorList, setEditorList] = useState([]);
  const [journalList, setJournalList] = useState([]);
  const [frequencyList, setFrequencyList] = useState([]);
  const [subscriptionTypeList, setSubscriptionTypeList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [paymentModeList, setPaymentModeList] = useState([]);
  const [authorTypeList, setAuthorTypeList] = useState([
    { label: "Indian", value: "Indian" },
    { label: "Foreign", value: "Foreign" },
  ]);
  const [modeOfReceiptList, setModeOfReceiptList] = useState([]);

  const [filterError, setFilterError] = useState(false);
  const [filterErrorMessage, setFilterErrorMessage] = useState("");
  const [dateError, setDateError] = useState(false);
  const [dateErrorMessage, setDateErrorMessage] = useState("");

  const [dueStatusList, setDueStatusList] = useState([
    { label: "Received", value: "received" },
  ]);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const [college, setCollege] = useState();
  const [collegeError, setCollegeError] = useState(false);

  const formikRef = useRef();

  const handleCSVData = async (values, type) => {
    // try {
    console.log("csvDataList-----", values);
    if (reportType.key == 1) {
      var csvData = [
        ["No.", "Journal Name", "Frequency", "Author Type", "Year"],
      ];
      values.map((item, index) => {
        csvData.push([
          index + 1,
          item.journal_name,
          item.frequency,
          item.author_type,
          item.year,
        ]);
      });
      console.log("csvData---", csvData);
    } else if (reportType.key == 2) {
      if (type == 1) {
        var csvData = [
          [
            { content: "No." },
            { content: "Journal Name" },
            { content: "Editor" },
            { content: "Supplier" },
            { content: "Author Type" },
            { content: "Year" },
          ],
        ];

        values.map((item, index) => {
          if (
            index === 0 ||
            values[index - 1].journal_subject !== item.journal_subject
          ) {
            csvData.push([
              {
                content: `Subject: ${item.journal_subject}`,
                styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                colSpan: 6,
              },
            ]);
          }
          csvData.push([
            { content: index + 1 },
            { content: item.journal_name },
            { content: item.editor },
            { content: item.supplier_name },
            { content: item.author_type },
            { content: item.year },
          ]);
        });
      } else {
        var csvData = [
          ["No.", "Journal Name", "Editor", "Supplier", "Author Type", "Year"],
        ];
        values.map((item, index) => {
          if (
            index === 0 ||
            values[index - 1].journal_subject !== item.journal_subject
          ) {
            csvData.push(["Subject: " + item.journal_subject + ", , , , ,"]);
          }
          csvData.push([
            index + 1,
            item.journal_name,
            item.editor,
            item.supplier_name,
            item.author_type,
            item.year,
          ]);
        });
        console.log("csvData---", csvData);
      }
    } else if (reportType.key == 3) {
      var csvData = [
        [
          "No.",
          "Journal Name",
          "Editor",
          "Subject",
          "Supplier",
          "Author Type",
          "Year",
        ],
      ];
      if (type == 1) {
        values.map((item, index) => {
          if (index === 0 || values[index - 1].publisher !== item.publisher) {
            csvData.push([
              {
                content: `Publisher: ${item.publisher}`,
                styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                colSpan: 7,
              },
            ]);
          }
          csvData.push([
            { content: index + 1 },
            { content: item.journal_name },
            { content: item.editor },
            { content: item.journal_subject },
            { content: item.supplier_name },
            { content: item.author_type },
            { content: item.year },
          ]);
        });
      } else {
        values.map((item, index) => {
          if (index === 0 || values[index - 1].publisher !== item.publisher) {
            csvData.push(["Publisher: " + item.publisher + ", , , , , ,"]);
          }
          csvData.push([
            index + 1,
            item.journal_name,
            item.editor,
            item.journal_subject,
            item.supplier_name,
            item.author_type,
            item.year,
          ]);
        });
        console.log("csvData---", csvData);
      }
    } else if (reportType.key == 4) {
      var csvData = [
        ["No.", "Journal Name", "Editor", "Subject", "Author Type", "Year"],
      ];
      if (type == 1) {
        values.map((item, index) => {
          if (
            index === 0 ||
            values[index - 1].supplier_name !== item.supplier_name
          ) {
            csvData.push([
              {
                content: `Supplier: ${item.supplier_name}`,
                styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                colSpan: 7,
              },
            ]);
          }
          csvData.push([
            { content: index + 1 },
            { content: item.journal_name },
            { content: item.editor },
            { content: item.journal_subject },
            { content: item.author_type },
            { content: item.year },
          ]);
        });
      } else {
        values.map((item, index) => {
          if (
            index === 0 ||
            values[index - 1].supplier_name !== item.supplier_name
          ) {
            csvData.push(["Supplier: " + item.supplier_name + ", , , , ,"]);
          }
          csvData.push([
            index + 1,
            item.journal_name,
            item.editor,
            item.journal_subject,
            item.author_type,
            item.year,
          ]);
        });
        console.log("csvData---", csvData);
      }
    } else if (reportType.key == 5) {
      var csvData = [
        [
          "No.",
          "Journal Name",
          "Editor",
          "Subject",
          "Supplier",
          "Author Type",
          "Year",
        ],
      ];
      if (type == 1) {
        values.map((item, index) => {
          if (index === 0 || values[index - 1].frequency !== item.frequency) {
            csvData.push([
              {
                content: `Frequency: ${item.frequency}`,
                styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                colSpan: 7,
              },
            ]);
          }
          csvData.push([
            { content: index + 1 },
            { content: item.journal_name },
            { content: item.editor },
            { content: item.journal_subject },
            { content: item.supplier_name },
            { content: item.author_type },
            { content: item.year },
          ]);
        });
      } else {
        values.map((item, index) => {
          if (index === 0 || values[index - 1].frequency !== item.frequency) {
            csvData.push(["Frequency: " + item.frequency + ", , , , , ,"]);
          }
          csvData.push([
            index + 1,
            item.journal_name,
            item.editor,
            item.journal_subject,
            item.supplier_name,
            item.author_type,
            item.year,
          ]);
        });
        console.log("csvData---", csvData);
      }
    }

    if (type == 1) {
      preFunction.generatePDF(
        collegeConfig.is_university ? college.collegeName : collegeName,
        reportType.label,
        csvData
      );
    } else {
      preFunction.downloadCSV(csvData, reportType.label + ".csv");
    }

    setLoad(false);
    // } catch (error) {
    //   console.log(error);
    //   setLoad(false);
    // }
  };

  const getBookDetailList = async (values, showAll, report) => {
    if (load) return;
    if (!college && collegeConfig.is_university) {
      setCollegeError(true);
      document.getElementById("college").focus();
      return;
    }

    if (
      !values.subscriptionType &&
      !values.journalName &&
      !values.subscriptionNo &&
      !values.frequency &&
      !values.editor &&
      !values.publisher &&
      !values.supplier &&
      !values.journalSubject &&
      !values.authorType &&
      !values.dueStatus &&
      !values.modeOfReceipt &&
      !values.amount &&
      !values.paymentMode &&
      !values.bank &&
      !values.fromDate &&
      !values.toDate
    ) {
      console.log("error--------");
      setFilterError(true);
      setFilterErrorMessage("Please apply atleast one filter");
      setData([]);
      setLoad(false);
      return;
    }

    let fromDateRes = "";
    let toDateRes = "";
    if (values.fromDate || values.toDate) {
      if (values.fromDate && values.toDate) {
        if (moment(values.fromDate).isAfter(values.toDate)) {
          setDateError(true);
          setDateErrorMessage("From Date should be less than To Date");
          setShowRes(false);
          setData([]);
          setLoad(false);
          return;
        }
        fromDateRes = moment(values.fromDate).format("YYYY-MM-DD");
        toDateRes = moment(values.toDate).format("YYYY-MM-DD");
      } else {
        setDateError(true);
        setDateErrorMessage("Please select From Date and To Date");
        setShowRes(false);
        setData([]);
        setLoad(false);
        return;
      }
    }

    console.log("values---", values);

    try {
      setShowRes(true);
      setLoad(true);

      const journalReportRes = await libraryapi.getJournalReport(
        collegeConfig.is_university ? college.collegeID : collegeId,
        reportType.value,
        values.subscriptionType ? values.subscriptionType.value : null,
        values.journalName ? values.journalName.value : null,
        values.subscriptionNo ? values.subscriptionNo : null,
        values.frequency ? values.frequency.value : null,
        values.editor ? values.editor.value : null,
        values.publisher ? values.publisher.value : null,
        values.supplier ? values.supplier.value : null,
        values.journalSubject ? values.journalSubject.value : null,
        values.authorType ? values.authorType.value : null,
        values.dueStatus ? values.dueStatus.value : null,
        values.modeOfReceipt ? values.modeOfReceipt.value : null,
        values.amount ? values.amount : null,
        values.paymentMode ? values.paymentMode.id : null,
        values.bank ? values.bank.id : null,
        values.fromDate ? moment(values.fromDate) : null,
        values.toDate ? moment(values.toDate) : null,
        showAll
      );
      console.log("journalReportRes---", journalReportRes);
      if (report) {
        handleCSVData(
          journalReportRes.data.message.data.journal_report_details,
          report
        );
      } else {
        setData(journalReportRes.data.message.data.journal_report_details);
        setShowLoadMore(false);
        if (
          journalReportRes.data.message.data.journal_report_details.length ===
          string.PAGE_LIMIT
        ) {
          setShowLoadMore(true);
        }
      }
      setLoad(false);
    } catch (error) {
      console.log("catch---", error);
      setLoad(false);
    }
  };

  const handleSearchSubject = async (text) => {
    if (text.replace(/\s\s+/g, " ").trim().length > 2) {
      try {
        const subjectRes = await libraryapi.getSearchJournalSubject(text);
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
        const publisher = await libraryapi.getPublisherBySearch(text);
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
        const supplierRes = await libraryapi.getSupplierBySearch(text);
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
        const supplierRes = await libraryapi.getSearchEditor(text);
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
        const supplierRes = await libraryapi.getSearchJoural(text);
        console.log("supplierRes---------", supplierRes);
        setJournalList(supplierRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setJournalList([]);
    }
  };

  const getAllList = async () => {
    try {
      const frequencyRes = await libraryapi.getFrequencyList();
      console.log("frequencyRes---", frequencyRes);
      setFrequencyList(frequencyRes.data.data);
      const modeOfReceiptRes = await libraryapi.getModeOfReceiptList();
      console.log("modeOfReceiptRes", modeOfReceiptRes);
      setModeOfReceiptList(modeOfReceiptRes.data.data);
      const subscriptionTypeRes = await libraryapi.getSubscriptionTypeList();
      console.log("subscriptionTypeRes---", subscriptionTypeRes);
      setSubscriptionTypeList(subscriptionTypeRes.data.data);
      const getMaster = await StudentApi.getMaster(5);
      console.log("bankres---", getMaster);
      setBankList(getMaster.data.message.data.bank_data);
      setPaymentModeList(getMaster.data.message.data.payment_mode_data);
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
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters">
          <Formik
            enableReinitialize={false}
            initialValues={{
              reportType: journalReportList[0],
              subscriptionType: "",
              journalName: "",
              subscriptionNo: "",
              frequency: "",
              editor: "",
              publisher: "",
              supplier: "",
              journalSubject: "",
              authorType: "",
              dueStatus: "",
              modeOfReceipt: "",
              amount: "",
              paymentMode: "",
              bank: "",
              fromDate: "",
              toDate: "",
            }}
            validationSchema={formSchema}
            onSubmit={(values) => getBookDetailList(values)}
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
                  <div className="row no-gutters">
                    <div className="col-lg-6 pe-2">
                      {collegeConfig.is_university ? (
                        <>
                          <SelectFieldFormik
                            autoFocus
                            tabIndex={1}
                            //  labelSize={3}
                            label="College"
                            id="college"
                            mandatory={1}
                            options={collegeConfig.collegeList}
                            getOptionLabel={(option) => option.collegeName}
                            getOptionValue={(option) => option.collegeID}
                            style={{ width: "70%" }}
                            searchIcon={false}
                            clear={false}
                            onChange={(text) => {
                              setCollege(text);
                              setShowRes(false);
                              setFilterError(false);
                              setCollegeError(false);
                              setData([]);
                              resetForm();
                            }}
                          />
                          <ErrorMessage
                            Message={"Please select College"}
                            view={collegeError}
                          />
                        </>
                      ) : null}
                      <ReactSelectField
                        autoFocus={!collegeConfig.is_university}
                        tabIndex={2}
                        label="Report Type"
                        id="reportType"
                        clear={false}
                        search={false}
                        value={reportType}
                        placeholder="Report Type"
                        options={journalReportList}
                        mandatory={1}
                        onChange={(text) => {
                          setReportType(text);
                          setData([]);
                          setShowRes(false);
                        }}
                        style={{ width: "70%" }}
                      />
                    </div>
                    <div className="col-lg-6"></div>
                  </div>
                  <div className="row no-gutters">
                    <div className="col-lg-6 pe-2">
                      <div className="row no-gutters">
                        <div className="col-lg-6 pe-2">
                          <SelectFieldFormik
                            tabIndex={3}
                            label="Subscription Type"
                            id="subscriptionType"
                            options={subscriptionTypeList}
                            search={false}
                            onChange={(text) => {
                              setFieldValue("subscriptionType", text);
                              setFilterError(false);
                            }}
                          />
                        </div>
                        <div className="col-lg-6 ps-2">
                          <TextFieldFormik
                            tabIndex={4}
                            id="subscriptionNo"
                            label="Subscription No."
                            onChange={(e) => {
                              setFieldValue("subscriptionNo", e.target.value);
                              setFilterError(false);
                            }}
                            maxLength={10}
                          />
                        </div>
                      </div>
                      <SelectFieldFormik
                        tabIndex={5}
                        label="Journal Name"
                        id="journalName"
                        searchIcon={true}
                        options={journalList}
                        onInputChange={(inputValue) => {
                          handleSearchJournal(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("journalName", text);
                          setFilterError(false);
                          // setJournalList([]);
                        }}
                      />

                      <SelectFieldFormik
                        tabIndex={6}
                        label="Editor"
                        id="editor"
                        searchIcon={true}
                        clear={true}
                        options={editorList}
                        onInputChange={(inputValue) => {
                          handleSearchEditor(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("editor", text);
                          setFilterError(false);
                          // setEditorList([]);
                        }}
                      />
                      <SelectFieldFormik
                        tabIndex={7}
                        label="Publisher"
                        id="publisher"
                        searchIcon={true}
                        options={publisherList}
                        onInputChange={(inputValue) => {
                          handleSearchPublisher(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("publisher", text);
                          setFilterError(false);
                          // setPublisherList([]);
                        }}
                      />
                      <SelectFieldFormik
                        tabIndex={8}
                        label="Supplier Name"
                        id="supplier"
                        options={supplierList}
                        searchIcon={true}
                        onChange={(text) => {
                          // setSupplierList([]);
                          setFieldValue("supplier", text);
                          setFilterError(false);
                        }}
                        onInputChange={(inputValue) => {
                          handleSearchSupplier(inputValue);
                        }}
                      />
                      <SelectFieldFormik
                        tabIndex={9}
                        label="Journal Subject"
                        id="journalSubject"
                        searchIcon={true}
                        options={subjectList}
                        onInputChange={(inputValue) => {
                          handleSearchSubject(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("journalSubject", text);
                          setFilterError(false);
                          // setSubjectList([]);
                        }}
                      />
                    </div>

                    <div className="col-lg-6 p-0 ps-2">
                      <div className="row no-gutters">
                        <div className="col-lg-6 pe-2">
                          <SelectFieldFormik
                            tabIndex={10}
                            label="Frequency"
                            id="frequency"
                            options={frequencyList}
                            search={false}
                            onChange={(text) => {
                              setFieldValue("frequency", text);
                              setFilterError(false);
                            }}
                          />
                        </div>
                        <div className="col-lg-6 ps-2">
                          <SelectFieldFormik
                            tabIndex={11}
                            label="Author Tye"
                            id="authorType"
                            options={authorTypeList}
                            onChange={(text) => {
                              setFieldValue("authorType", text);
                              setFilterError(false);
                            }}
                          />
                        </div>
                      </div>
                      <div className="row no-gutters">
                        <div className="col-lg-6 pe-2">
                          <SelectFieldFormik
                            tabIndex={12}
                            label="Due Status"
                            id="dueStatus"
                            options={dueStatusList}
                            onChange={(text) => {
                              setFieldValue("dueStatus", text);
                              setFilterError(false);
                            }}
                          />
                        </div>
                        <div className="col-lg-6 ps-2">
                          <SelectFieldFormik
                            tabIndex={13}
                            id="modeOfReceipt"
                            label="Mode of Receipt"
                            search={false}
                            options={modeOfReceiptList}
                            onChange={(text) => {
                              setFieldValue("modeOfReceipt", text);
                              setFilterError(false);
                            }}
                          />
                        </div>
                      </div>
                      <div className="row no-gutters">
                        <div className="col-lg-6 pe-2">
                          <TextFieldFormik
                            tabIndex={14}
                            id="amount"
                            label="Amount (₹)"
                            onChange={(e) => {
                              if (
                                preFunction.amountValidation(e.target.value)
                              ) {
                                handleChange(e);
                              }
                              setFilterError(false);
                            }}
                            maxLength={7}
                            isAmount={true}
                          />
                        </div>
                        <div className="col-lg-6 ps-2">
                          <SelectFieldFormik
                            tabIndex={15}
                            label="Payment Mode"
                            id="paymentMode"
                            options={paymentModeList}
                            search={false}
                            getOptionLabel={(option) => option.paymentMode}
                            getOptionValue={(option) => option.id}
                            onChange={(text) => {
                              setFieldValue("paymentMode", text);
                              setFilterError(false);
                              if (text && text.paymentMode === "Cash") {
                                setFieldValue("bank", "");
                              }
                            }}
                          />
                        </div>
                      </div>
                      <SelectFieldFormik
                        tabIndex={16}
                        label="Bank"
                        id="bank"
                        options={
                          values.paymentMode &&
                          values.paymentMode.paymentMode !== "Cash"
                            ? bankList
                            : []
                        }
                        getOptionLabel={(option) => option.bank}
                        getOptionValue={(option) => option.id}
                        onChange={(text) => {
                          setFieldValue("bank", text);
                          setFilterError(false);
                        }}
                      />
                      <div className="row no-gutters">
                        <div className="col-lg-6 pe-2">
                          <DateFieldFormik
                            tabIndex={17}
                            label="Subscription Date From"
                            id="fromDate"
                            maxDate={new Date()}
                            minDate={new Date(moment().subtract(5, "years"))}
                            onChange={(e) => {
                              setFieldValue("fromDate", e.target.value);
                              setFilterError(false);
                              setDateError(false);
                            }}
                          />
                        </div>
                        <div className="col-lg-6 ps-2">
                          <DateFieldFormik
                            tabIndex={18}
                            label="Subscription Date To"
                            id="toDate"
                            maxDate={new Date()}
                            minDate={values.fromDate}
                            onChange={(e) => {
                              setFieldValue("toDate", e.target.value);
                              setFilterError(false);
                              setDateError(false);
                            }}
                          />
                        </div>
                        {dateError ? (
                          <div className="row text-center mt-2">
                            <ErrorMessage
                              Message={dateErrorMessage}
                              view={dateError}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="row text-center mt-2">
                      <ErrorMessage
                        Message={filterErrorMessage}
                        view={filterError}
                      />
                    </div>

                    <div className="row no-gutters">
                      <div className="col-lg-6 text-right pe-1">
                        <Button
                          type="submit"
                          text={"Show"}
                          isCenter={false}
                          tabIndex={19}
                          onClick={(e) => preFunction.handleErrorFocus(errors)}
                        />
                      </div>
                      <div className="col-lg-5 ms-2">
                        <Button
                          type="button"
                          text="Clear"
                          isCenter={false}
                          onClick={() => {
                            resetForm();
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {showRes && (
                    <>
                      <div className="row mt-4 border p-3">
                        <div className="row no-gutters">
                          <div className="col-lg-6"></div>
                          {data.length > 0 && (
                            <div className="col-lg-6">
                              <div className="text-right">
                                <Button
                                  frmButton={false}
                                  className={"btn me-3"}
                                  type="button"
                                  onClick={(e) =>
                                    getBookDetailList(values, 1, 2)
                                  }
                                  text="Export Excel"
                                />
                                <Button
                                  type="button"
                                  frmButton={false}
                                  onClick={(e) =>
                                    getBookDetailList(values, 1, 1)
                                  }
                                  text="Export PDF"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="table-responsive mt-4 p-0">
                          {reportType.key == 1 ? (
                            <table
                              className="table report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="5%">No.</th>
                                  <th>Journal Name</th>
                                  <th width="15%">Frequency</th>
                                  <th width="15%">Author Type</th>
                                  <th width="15%">Year</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.length == 0 ? (
                                  <tr>
                                    <td colSpan="10" className="text-center">
                                      No data found
                                    </td>
                                  </tr>
                                ) : (
                                  data.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.journal_name}</td>
                                        <td>{item.frequency}</td>
                                        <td>{item.author_type}</td>
                                        <td>{item.year}</td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          ) : null}
                          {reportType.key == 2 ? (
                            <table
                              className="table report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th width="25%">Journal Name</th>
                                  <th width="25%">Editor</th>
                                  <th>Supplier</th>
                                  <th width="10%">Author Type</th>
                                  <th width="10%">Year</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.length === 0 ? (
                                  <tr>
                                    <td colSpan="10" className="text-center">
                                      No data found
                                    </td>
                                  </tr>
                                ) : (
                                  data.map((item, index) => {
                                    return (
                                      <>
                                        {index === 0 ||
                                        data[index - 1].journal_subject !==
                                          item.journal_subject ? (
                                          <tr>
                                            <td
                                              colSpan={6}
                                              className="table-total"
                                            >
                                              Subject : {item.journal_subject}
                                            </td>
                                          </tr>
                                        ) : null}
                                        <tr key={index}>
                                          <td>{index + 1}</td>
                                          <td>{item.journal_name}</td>
                                          <td>{item.editor}</td>
                                          <td>{item.supplier_name}</td>
                                          <td>{item.author_type}</td>
                                          <td>{item.year}</td>
                                        </tr>
                                      </>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          ) : null}
                          {reportType.key == 3 ? (
                            <table
                              className="table report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th>Journal Name</th>
                                  <th width="20%">Editor</th>
                                  <th width="20%">Subject</th>
                                  <th width="20%">Supplier</th>
                                  <th width="7%">Author Type</th>
                                  <th width="7%">Year</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.length === 0 ? (
                                  <tr>
                                    <td colSpan="10" className="text-center">
                                      No data found
                                    </td>
                                  </tr>
                                ) : (
                                  data.map((item, index) => {
                                    return (
                                      <>
                                        {index === 0 ||
                                        data[index - 1].publisher !==
                                          item.publisher ? (
                                          <tr>
                                            <td
                                              colSpan={7}
                                              className="table-total"
                                            >
                                              Publisher : {item.publisher}
                                            </td>
                                          </tr>
                                        ) : null}
                                        <tr key={index}>
                                          <td>{index + 1}</td>
                                          <td>{item.journal_name}</td>
                                          <td>{item.editor}</td>
                                          <td>{item.journal_subject}</td>
                                          <td>{item.supplier_name}</td>
                                          <td>{item.author_type}</td>
                                          <td>{item.year}</td>
                                        </tr>
                                      </>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          ) : null}
                          {reportType.key == 4 ? (
                            <table
                              className="table report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th>Journal Name</th>
                                  <th width="20%">Editor</th>
                                  <th width="20%">Subject</th>
                                  <th width="20%">Author Type</th>
                                  <th width="7%">Year</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.length === 0 ? (
                                  <tr>
                                    <td colSpan="10" className="text-center">
                                      No data found
                                    </td>
                                  </tr>
                                ) : (
                                  data.map((item, index) => {
                                    return (
                                      <>
                                        {index === 0 ||
                                        data[index - 1].supplier_name !==
                                          item.supplier_name ? (
                                          <tr>
                                            <td
                                              colSpan={6}
                                              className="table-total"
                                            >
                                              Supplier : {item.supplier_name}
                                            </td>
                                          </tr>
                                        ) : null}
                                        <tr key={index}>
                                          <td>{index + 1}</td>
                                          <td>{item.journal_name}</td>
                                          <td>{item.editor}</td>
                                          <td>{item.journal_subject}</td>
                                          <td>{item.author_type}</td>
                                          <td>{item.year}</td>
                                        </tr>
                                      </>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          ) : null}
                          {reportType.key == 5 ? (
                            <table
                              className="table report-table table-bordered"
                              id="pdf-table"
                            >
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th>Journal Name</th>
                                  <th width="20%">Editor</th>
                                  <th width="20%">Subject</th>
                                  <th width="20%">Supplier</th>
                                  <th width="7%">Author Type</th>
                                  <th width="7%">Year</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.length === 0 ? (
                                  <tr>
                                    <td colSpan="10" className="text-center">
                                      No data found
                                    </td>
                                  </tr>
                                ) : (
                                  data.map((item, index) => {
                                    return (
                                      <>
                                        {index === 0 ||
                                        data[index - 1].frequency !==
                                          item.frequency ? (
                                          <tr>
                                            <td
                                              colSpan={7}
                                              className="table-total"
                                            >
                                              Frequency : {item.frequency}
                                            </td>
                                          </tr>
                                        ) : null}
                                        <tr key={index}>
                                          <td>{index + 1}</td>
                                          <td>{item.journal_name}</td>
                                          <td>{item.editor}</td>
                                          <td>{item.journal_subject}</td>
                                          <td>{item.supplier_name}</td>
                                          <td>{item.author_type}</td>
                                          <td>{item.year}</td>
                                        </tr>
                                      </>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          ) : null}
                        </div>
                        {showLoadMore && (
                          <Button
                            text="Show All"
                            className={"btn mt-3"}
                            isTable={true}
                            onClick={(e) => {
                              getBookDetailList(values, 1);
                            }}
                          />
                        )}
                      </div>
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
export default JournalReport;
