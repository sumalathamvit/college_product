import React, { useEffect, useState, useRef, useContext } from "react";
import { Formik } from "formik";
import { Modal } from "react-bootstrap";
import moment from "moment";
import * as Yup from "yup";

import libraryApi from "../api/libraryapi";

import TextField from "../component/FormFieldLibrary/TextField";
import ReactSelectField from "../component/FormFieldLibrary/ReactSelectField";
import DateField from "../component/FormFieldLibrary/DateField";
import Button from "../component/FormField/Button";
import ErrorMessage from "../component/common/ErrorMessage";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";

import CheckboxField from "./../component/FormFieldLibrary/CheckboxField";
import string from "../string";
import ScreenTitle from "../component/common/ScreenTitle";
import SelectFieldFormik from "../component/FormFieldLibrary/SelectFieldFormik";
import AuthContext from "../auth/context";
import { useSelector } from "react-redux";

const formSchema = Yup.object().shape({
  edition: Yup.string().test(
    "is-valid-edition",
    "Please enter valid Edition",
    (value) => {
      if (value && value.trim() !== "") {
        return /^[a-zA-Z0-9\s]+$/.test(String(value));
      }
      return true;
    }
  ),

  callNumber: Yup.string().test(
    "is-valid-callnumber",
    "Please enter valid Call Number",
    (value) => {
      if (value && value.trim() !== "") {
        return /^[a-zA-Z0-9.-]+$/.test(String(value));
      }
      return true;
    }
  ),
});

function BookPurchaseReport() {
  const [load, setLoad] = useState(false);

  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [subjectList, setSubjectList] = useState([]);
  const [bookTypeList, setBookTypeList] = useState([
    { label: "All", value: "" },
  ]);
  const [deptList, setDeptList] = useState([{ label: "All", value: "" }]);
  const [titleList, setTitleList] = useState([]);
  const [authorList, setAuthorList] = useState([]);
  const [publisherList, setPublisherList] = useState([]);
  const [orderBy, setOrderBy] = useState({
    value: "Title",
    label: "Title",
  });
  const [supplierList, setSupplierList] = useState([]);
  const currentYear = new Date().getFullYear();

  const [openModel, setOpenModal] = useState(false);
  const [bookID, setBookID] = useState(true);
  const [titleCheck, setTitleCheck] = useState(true);
  const [authorCheck, setAuthorCheck] = useState(true);
  const [publisherCheck, setPublisherCheck] = useState(false);
  const [yearofPublishCheck, setYearofPublishCheck] = useState(true);
  const [authorType, setAuthorType] = useState(false);
  const [editionCheck, setEditionCheck] = useState(true);
  const [pages, setPages] = useState(false);
  const [dept, setDept] = useState(true);
  const [subjectName, setSubjectName] = useState(true);
  const [rackNumber, setRackNumber] = useState(false);
  const [bookTypeCheck, setBookTypeCheck] = useState(false);
  const [issueTo, setIssueTo] = useState(false);
  const [callNumberCheck, setCallNumberCheck] = useState(true);
  const [supplier, setSupplier] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(false);
  const [poNumber, setPoNumber] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(false);
  const [price, setPrice] = useState(true);
  const [amount, setAmount] = useState(false);
  const [remarks, setRemarks] = useState(false);
  const [dateofEntry, setDateofEntry] = useState(false);
  const [iSBNNumber, setISBNNumber] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [value, setValue] = useState();
  const formikRef = useRef();
  const [accNoList, setAccNoList] = useState([]);

  const years = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push({ label: year, value: year });
  }
  const [filterError, setFilterError] = useState(false);
  const [accessNoError, setAccessNoError] = useState(false);
  const [enrollNumberList, setEnrollNumberList] = useState([]);
  const [dateError, setDateError] = useState(false);
  const [accessNoValidateError, setAccessNoValidateError] = useState(false);
  const [selectedFieldList, setSelectedFieldList] = useState([]);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const [college, setCollege] = useState();
  const [collegeError, setCollegeError] = useState(false);

  function adjustPercentages(list) {
    // Step 1: Calculate total sum
    const totalSum = list.reduce((acc, val) => acc + val, 0);
    // Step 2: Calculate percentages and round
    const percentages = list.map((num) => Math.round((num / totalSum) * 100));
    // Step 3: Find the index of the maximum percentage
    const maxIndex = percentages.indexOf(Math.max(...percentages));
    // Step 4: Adjust the maximum percentage to make the sum 100
    percentages[maxIndex] +=
      100 - percentages.reduce((acc, val) => acc + val, 0);
    // console
    return percentages;
  }

  const handleBookPurchaseCSVData = async (values, type) => {
    setLoad(true);
    console.log("values---", values);

    let csvDatas = [];
    csvDatas[0] = ["No."];
    if (titleCheck) csvDatas[0].push("Title");
    if (authorCheck) csvDatas[0].push("Author");
    if (publisherCheck) csvDatas[0].push("Publisher");
    if (yearofPublishCheck) csvDatas[0].push("YoP");
    if (authorType) csvDatas[0].push("Author Type");
    if (editionCheck) csvDatas[0].push("Edition");
    if (pages) csvDatas[0].push("Pages");
    if (dept) csvDatas[0].push("Department");
    if (subjectName) csvDatas[0].push("Subject");
    if (rackNumber) csvDatas[0].push("Rack No.");
    if (bookTypeCheck) csvDatas[0].push("Book Type");
    if (issueTo) csvDatas[0].push("Issue To");
    if (callNumberCheck) csvDatas[0].push("Call No.");
    if (supplier) csvDatas[0].push("Supplier");
    if (invoiceNumber) csvDatas[0].push("Invoice No.");
    if (poNumber) csvDatas[0].push("PO No.");
    if (invoiceDate) csvDatas[0].push("Invoice Date");
    if (price) csvDatas[0].push("MRP");
    if (amount) csvDatas[0].push("Amount");
    if (dateofEntry) csvDatas[0].push("Date of Entry");
    if (iSBNNumber) csvDatas[0].push("ISBN");
    if (remarks) csvDatas[0].push("Remarks");

    console.log("csvData---", csvDatas);
    values.map((item, index) => {
      csvDatas[index + 1] = [];
      csvDatas[index + 1].push(index + 1);
      if (titleCheck)
        csvDatas[index + 1].push(
          type == 1 ? item.main_title : item.main_title.replace(/,/g, " / ")
        );
      if (authorCheck)
        csvDatas[index + 1].push(
          type == 1 ? item.author_name : item.author_name.replace(/,/g, " / ")
        );
      if (publisherCheck) csvDatas[index + 1].push(item.publisher);
      if (yearofPublishCheck) csvDatas[index + 1].push(item.year_of_publish);
      if (authorType) csvDatas[index + 1].push(item.author_origin);
      if (editionCheck) csvDatas[index + 1].push(item.edition);
      if (pages) csvDatas[index + 1].push(item.pages);
      if (dept) csvDatas[index + 1].push(item.book_department);
      if (subjectName)
        csvDatas[index + 1].push(
          type == 1 ? item.subject_name : item.subject_name.replace(/,/g, " / ")
        );
      if (rackNumber) csvDatas[index + 1].push(item.rack_number);
      if (bookTypeCheck) csvDatas[index + 1].push(item.book_type);
      if (issueTo) csvDatas[index + 1].push(item.handled_by);
      if (callNumberCheck) csvDatas[index + 1].push(item.call_number);
      if (supplier) csvDatas[index + 1].push(item.supplier);
      if (invoiceNumber) csvDatas[index + 1].push(item.invoice_number);
      if (poNumber) csvDatas[index + 1].push(item.po_number);
      if (invoiceDate)
        csvDatas[index + 1].push(
          item.invoice_date
            ? moment(item.invoice_date).format("DD-MM-YYYY")
            : item.invoice_date
        );
      if (price) csvDatas[index + 1].push(item.mrp);
      // if (amount) csvDatas[index + 1].push(item.unit_price);
      if (dateofEntry)
        csvDatas[index + 1].push(
          item.date_of_entry
            ? moment(item.date_of_entry).format("DD-MM-YYYY")
            : item.date_of_entry
        );
      if (iSBNNumber) csvDatas[index + 1].push(item.isbn);
      if (remarks) csvDatas[index + 1].push(item.remarks);
    });
    // var columnWidths = [3, 7, 32, 17, 17, 7, 5, 7, 5,dateofEntry?5:0,];
    var columnWidths = [];
    columnWidths.push(3);
    if (titleCheck) columnWidths.push(32);
    if (authorCheck) columnWidths.push(15);
    if (publisherCheck) columnWidths.push(10);
    if (yearofPublishCheck) columnWidths.push(5);
    if (authorType) columnWidths.push(10);
    if (editionCheck) columnWidths.push(7);
    if (pages) columnWidths.push(5);
    if (dept) columnWidths.push(15);
    if (subjectName) columnWidths.push(20);
    if (rackNumber) columnWidths.push(7);
    if (bookTypeCheck) columnWidths.push(7);
    if (issueTo) columnWidths.push(10);
    if (callNumberCheck) columnWidths.push(7);
    if (supplier) columnWidths.push(10);
    if (invoiceNumber) columnWidths.push(10);
    if (poNumber) columnWidths.push(7);
    if (invoiceDate) columnWidths.push(10);
    if (price) columnWidths.push(7);
    if (amount) columnWidths.push(7);
    if (dateofEntry) columnWidths.push(7);
    if (iSBNNumber) columnWidths.push(10);
    if (remarks) columnWidths.push(7);

    // const originalList = [3, 5, 30, 5];
    const adjustedPercentages = adjustPercentages(columnWidths);

    console.log(adjustedPercentages); // Output: [5, 9, 77, 9]

    console.log("csvDatas---", csvDatas, adjustedPercentages);
    if (type == 1)
      preFunction.generatePDF(
        collegeName,
        "Book Purchase Report",
        csvDatas,
        adjustedPercentages,
        false,
        "landscape",
        columnWidths.length > 10 ? true : false
      );
    else {
      preFunction.downloadCSV(csvDatas, "Book Purchase Report.csv");
    }
    setLoad(false);
  };

  const handleOpenModal = async (values) => {
    setData([]);
    setShowRes(false);
    setValue(values);
    if (!college && collegeConfig.is_university) {
      setCollegeError(true);
      document.getElementById("college").focus();
      return;
    }
    if (
      (values.title == "" || !values.title) &&
      (values.author == "" || !values.author) &&
      (values.callNumber == "" || !values.callNumber) &&
      (values.yearofPublish == "" || !values.yearofPublish) &&
      (values.subject == "" || !values.subject) &&
      (values.edition == "" || !values.edition) &&
      (values.publisher == "" || !values.publisher) &&
      (values.supplier == "" || !values.supplier) &&
      (values.bookType == "" || !values.bookType) &&
      (values.accNoFrom == "" || !values.accNoFrom) &&
      (values.accNoTo == "" || !values.accNoTo) &&
      (values.department == "" || !values.department) &&
      (values.fromDate == "" || !values.fromDate) &&
      (values.toDate == "" || !values.toDate) &&
      (values.member == "" || !values.member)
    ) {
      setFilterError(true);
      return;
    }
    setOpenModal(true);
  };

  const getBookDetailList = async (values, showAll = 0, report = 0) => {
    console.log("values", showAll, report, values);
    if (!college && collegeConfig.is_university) {
      setCollegeError(true);
      document.getElementById("college").focus();
      return;
    }

    if (
      (values.title == "" || !values.title) &&
      (values.author == "" || !values.author) &&
      (values.callNumber == "" || !values.callNumber) &&
      (values.yearofPublish == "" || !values.yearofPublish) &&
      (values.subject == "" || !values.subject) &&
      (values.edition == "" || !values.edition) &&
      (values.publisher == "" || !values.publisher) &&
      (values.supplier == "" || !values.supplier) &&
      (values.bookType == "" || !values.bookType) &&
      (values.accNoFrom == "" || !values.accNoFrom) &&
      (values.accNoTo == "" || !values.accNoTo) &&
      (values.department == "" || !values.department) &&
      (values.fromDate == "" || !values.fromDate) &&
      (values.toDate == "" || !values.toDate) &&
      (values.member == "" || !values.member)
    ) {
      setFilterError(true);
      return;
    }

    let accNoFromRes = "";
    let accNoToRes = "";
    if (
      (values.accNoFrom != "" && values.accNoFrom != null) ||
      (values.accNoTo != "" && values.accNoTo != null)
    ) {
      console.log("from to-------------");
      if (values.accNoFrom.value && values.accNoTo.value) {
        if (values.accNoFrom.value > values.accNoTo.value) {
          setAccessNoValidateError(true);
          return;
        } else {
          accNoFromRes = values.accNoFrom.value.toString();
          accNoToRes = values.accNoTo.value.toString();
        }
      } else {
        setAccessNoError(true);
        return;
      }
    }

    if (
      (values.fromDate != "" && values.fromDate != null) ||
      (values.toDate != "" && values.toDate != null)
    ) {
      console.log("from to-------------");
      if (
        values.fromDate == "" ||
        values.fromDate == null ||
        values.toDate == "" ||
        values.toDate == null
      ) {
        setDateError(true);
        return;
      }
    }

    setShowRes(true);
    try {
      setLoad(true);
      console.log("values", values);

      let fieldArray = [];
      if (bookID) fieldArray.push("book_id");
      if (titleCheck) fieldArray.push("main_title");
      if (authorCheck) fieldArray.push("author_name");
      if (publisherCheck) fieldArray.push("publisher");
      if (yearofPublishCheck) fieldArray.push("year_of_publish");
      if (authorType) fieldArray.push("author_origin");
      if (editionCheck) fieldArray.push("edition");
      if (pages) fieldArray.push("pages");
      if (dept) fieldArray.push("book_department");
      if (subjectName) fieldArray.push("subject_name");
      if (rackNumber) fieldArray.push("rack_number");
      if (bookTypeCheck) fieldArray.push("book_type");
      if (issueTo) fieldArray.push("handled_by");
      if (callNumberCheck) fieldArray.push("call_number");
      if (supplier) fieldArray.push("supplier");
      if (invoiceNumber) fieldArray.push("invoice_number");
      if (poNumber) fieldArray.push("po_number");
      if (invoiceDate) fieldArray.push("invoice_date");
      if (price) fieldArray.push("mrp");
      if (amount) fieldArray.push("unit_price");
      if (iSBNNumber) fieldArray.push("isbn");
      if (dateofEntry) fieldArray.push("date_of_entry");
      if (remarks) fieldArray.push("remarks");
      let selectedField = fieldArray.join(",");
      setSelectedFieldList(fieldArray);
      console.log("selectedField", fieldArray, selectedField, showAll);
      const bookList = await libraryApi.getBookPurchaseDetailReport(
        collegeConfig.is_university ? college.collegeID : collegeId,
        values.title ? values.title.value : null,
        values.author ? values.author.value : null,
        values.subject ? values.subject.value : null,
        values.callNumber ? values.callNumber : null,
        values.yearofPublish ? values.yearofPublish.value : null,
        values.edition ? values.edition : null,
        values.publisher ? values.publisher.value : null,
        values.supplier ? values.supplier.value : null,
        values.bookType ? values.bookType.value : null,
        values.department ? values.department.value : null,
        accNoFromRes ? accNoFromRes : null,
        accNoToRes ? accNoToRes : null,
        values.fromDate ? values.fromDate : null,
        values.toDate ? values.toDate : null,
        // values.member ? values.member.value : null,
        selectedField,
        showAll == 0 ? 100 : null
      );
      console.log("bookList---1", bookList);

      if (report) {
        console.log("bookList---2", bookList);
        handleBookPurchaseCSVData(bookList.data.message, report);
      } else {
        console.log("bookList---3", bookList);
        setData([]);
        setData(bookList.data.message);
        if (string.PAGE_LIMIT === bookList?.data?.message?.length) {
          console.log("bookList---4", bookList);
          setShowLoadMore(true);
        } else {
          console.log("bookList---5", bookList);
          setShowLoadMore(false);
        }
      }
      setOpenModal(false);
      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  const handleSearchSubject = async (text) => {
    if (text.length > 2) {
      try {
        const subjectRes = await libraryApi.getSearchSubjectList(text);
        setSubjectList(subjectRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const handleSearchAccessNo = async (text) => {
    if (text.length > 0 && text.length <= 6) {
      try {
        const accessNoRes = await libraryApi.getAccessNumberList(text);
        setAccNoList(accessNoRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const handleSearchSupplier = async (text) => {
    if (text.length > 2) {
      try {
        const supplierRes = await libraryApi.getSupplierBySearch(text);
        setSupplierList(supplierRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const handleSearchTitle = async (text) => {
    if (text.trim().length > 2) {
      try {
        const mainTitleRes = await libraryApi.getTitlebySearch(
          text?.trim(),
          "purchase"
        );

        console.log("mainTitleRes---", mainTitleRes);
        const distinctLabels = {};
        mainTitleRes.data.message.data.book_data.forEach((item) => {
          if (!distinctLabels.hasOwnProperty(item.main_title)) {
            distinctLabels[item.main_title] = item.main_title;
          }
        });
        const distinctLabelValuePairs = Object.keys(distinctLabels).map(
          (main_title) => ({
            value: distinctLabels[main_title],
            label: main_title,
          })
        );
        setTitleList(distinctLabelValuePairs);
      } catch (error) {
        console.log("catch---", error);
      }
    } else {
      setTitleList([]);
    }
  };

  const handleSearchAuthor = async (text) => {
    if (text.length > 2) {
      try {
        const authorRes = await libraryApi.getAuthorBySearch(text);
        setAuthorList(authorRes.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const handleSearchPublisher = async (text) => {
    if (text.length > 2) {
      try {
        const publisher = await libraryApi.getPublisherBySearch(text);
        setPublisherList(publisher.data.data);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const getSearchDetail = async () => {
    try {
      const bookTypeRes = await libraryApi.getBookTypeList();
      setBookTypeList(bookTypeRes.data.data);

      const deptRes = await libraryApi.getDeptList();
      setDeptList(deptRes.data.data);
    } catch (error) {
      console.log("catch----", error);
    }
  };

  const getMemberList = async (inputValue) => {
    if (inputValue.length > 2) {
      try {
        const studentRes = await libraryApi.searchLibraryMember(inputValue);
        console.log("studentRes---", studentRes);
        for (
          let i = 0;
          i < studentRes.data.message.data.member_data.length;
          i++
        ) {
          studentRes.data.message.data.member_data[i].value =
            studentRes.data.message.data.member_data[i].member_number;
          studentRes.data.message.data.member_data[i].label =
            studentRes.data.message.data.member_data[i].member_number +
            " - " +
            studentRes.data.message.data.member_data[i].member_name;
        }
        setEnrollNumberList(studentRes.data.message.data.member_data);
      } catch (error) {
        console.log("error----", error);
      }
    } else {
      setEnrollNumberList([]);
    }
  };

  const handleClear = () => {
    setData([]);
    setShowRes(false);
    setFilterError(false);
  };

  const setReactSelectMaxlength = () => {
    document.getElementById("title") &&
      document.getElementById("title").setAttribute("maxlength", 40);
    document.getElementById("department") &&
      document.getElementById("department").setAttribute("maxlength", 15);
    document.getElementById("publisher") &&
      document.getElementById("publisher").setAttribute("maxlength", 40);
    document.getElementById("subject") &&
      document.getElementById("subject").setAttribute("maxlength", 40);
    document.getElementById("supplier") &&
      document.getElementById("supplier").setAttribute("maxlength", 40);
    document.getElementById("yearofPublish") &&
      document.getElementById("yearofPublish").setAttribute("maxlength", 4);
    document.getElementById("author") &&
      document.getElementById("author").setAttribute("maxlength", 40);
  };

  useEffect(() => {
    getSearchDetail();
    setReactSelectMaxlength();
  }, []);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              // college: "",
              title: "",
              author: "",
              subject: "",
              callNumber: "",
              yearofPublish: "",
              edition: "",
              publisher: "",
              supplier: "",
              bookType: "",
              accNoFrom: "",
              accNoTo: "",
              department: "",
              fromDate: "",
              toDate: "",
              member: "",
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
                            style={{ width: "60%" }}
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
                    </div>
                    <div className="col-lg-6"></div>
                  </div>
                  <div className="row">
                    <div className="col-lg-6 p-0 pe-2">
                      <ReactSelectField
                        autoFocus={!collegeConfig.is_university}
                        tabIndex={2}
                        label="Title"
                        id="title"
                        error={errors.title}
                        touched={touched.title}
                        value={values.title}
                        placeholder="Title"
                        options={titleList}
                        searchIcon={true}
                        onInputChange={(text) => {
                          handleSearchTitle(text);
                        }}
                        onChange={(text) => {
                          setFieldValue("title", text);
                          setTitleList([]);
                          handleClear();
                        }}
                      />
                      <>
                        <ReactSelectField
                          tabIndex={3}
                          label="Author"
                          id="author"
                          error={errors.author}
                          touched={touched.author}
                          value={values.author}
                          placeholder="Author"
                          options={authorList}
                          searchIcon={true}
                          onInputChange={(text) => {
                            handleSearchAuthor(text);
                          }}
                          onChange={(text) => {
                            console.log("......", text);
                            setFieldValue("author", text);
                            setAuthorList([]);
                            handleClear();
                          }}
                        />
                      </>
                      <>
                        <ReactSelectField
                          tabIndex={4}
                          searchIcon={true}
                          label="Supplier Name"
                          placeholder="Supplier Name"
                          id="supplier"
                          value={values.supplier}
                          options={supplierList}
                          error={errors.supplier}
                          touched={touched.supplier}
                          onChange={(text) => {
                            setFieldValue("supplier", text);
                          }}
                          onInputChange={(inputValue) => {
                            handleSearchSupplier(inputValue);
                          }}
                        />
                        <div className="row no-gutters">
                          <div className="col-lg-4 pe-2">
                            <ReactSelectField
                              tabIndex={5}
                              maxlength={6}
                              searchIcon={true}
                              label="Access No From"
                              placeholder="From"
                              id="accNoFrom"
                              error={errors.accNoFrom}
                              touched={touched.accNoFrom}
                              value={values.accNoFrom}
                              // placeholder="Access Number From"
                              options={accNoList}
                              onInputChange={(text) => {
                                handleSearchAccessNo(text);
                              }}
                              onChange={(text) => {
                                setFieldValue("accNoFrom", text);
                                setAccNoList([]);
                                handleClear();
                                setAccessNoError(false);
                                setAccessNoValidateError(false);
                              }}
                            />
                            {/* <ErrorMessage
                              Message={"Choose both Access No From & To"}
                              view={accessNoError}
                            /> */}
                          </div>
                          <div className="col-lg-4 ps-2 pe-2">
                            <ReactSelectField
                              tabIndex={6}
                              maxlength={6}
                              searchIcon={true}
                              label="Access No To"
                              placeholder="To"
                              id="accNoTo"
                              error={errors.accNoTo}
                              touched={touched.accNoTo}
                              value={values.accNoTo}
                              // placeholder="Access Number To"
                              options={accNoList}
                              onInputChange={(text) => {
                                handleSearchAccessNo(text);
                              }}
                              onChange={(text) => {
                                setFieldValue("accNoTo", text);
                                setAccNoList([]);
                                handleClear();
                                setAccessNoError(false);
                                setAccessNoValidateError(false);
                              }}
                            />
                          </div>
                          <div className="col-lg-4 ps-2">
                            <ReactSelectField
                              tabIndex={7}
                              maxlength={10}
                              label="Book Type"
                              id="bookType"
                              error={errors.bookType}
                              touched={touched.bookType}
                              value={values.bookType}
                              placeholder="Book Type"
                              options={bookTypeList}
                              style={{ width: "100%" }}
                              onChange={(text) => {
                                setFieldValue("bookType", text);
                                handleClear();
                              }}
                            />
                          </div>
                        </div>
                        <ErrorMessage
                          Message={"Choose both Access No. From & To"}
                          view={accessNoError}
                        />
                        <ErrorMessage
                          Message={
                            "Access No. From should be lesser than Access No. To"
                          }
                          view={accessNoValidateError}
                        />
                      </>
                      <div className="row no-gutters">
                        <div className="col-lg-4 pe-2">
                          <DateField
                            tabIndex={8}
                            label="Purchase Date From"
                            id="fromDate"
                            error={errors.fromDate}
                            touched={touched.fromDate}
                            maxDate={new Date()}
                            minDate={new Date(moment().subtract(50, "years"))}
                            value={values.fromDate}
                            onChange={(e) => {
                              setFieldValue("fromDate", e.target.value);
                              handleClear();
                              setDateError(false);
                            }}
                          />
                        </div>
                        <div className="col-lg-4 ps-2 pe-2">
                          <DateField
                            tabIndex={9}
                            label="Purchase Date To"
                            id="toDate"
                            error={errors.toDate}
                            touched={touched.toDate}
                            maxDate={new Date()}
                            minDate={values.fromDate}
                            value={values.toDate}
                            onChange={(e) => {
                              setFieldValue("toDate", e.target.value);
                              handleClear();
                              setDateError(false);
                            }}
                          />
                        </div>
                        {/* <div className="col-lg-6 ps-2">
                          <ReactSelectField
                            tabIndex={10}
                            searchIcon={true}
                            label={"Member No."}
                            id="enrollNumber"
                            error={errors.member}
                            touched={touched.member}
                            value={values.member}
                            options={enrollNumberList}
                            // mandatory={1}
                            // style={{ width: "60%" }}
                            onInputChange={(inputValue) => {
                              getMemberList(inputValue);
                            }}
                            onChange={(text) => {
                              setFieldValue("member", text);
                              setEnrollNumberList([]);
                              handleClear();
                            }}
                          />
                        </div> */}
                      </div>
                      <ErrorMessage
                        Message={"Choose both Purchase Date From & To"}
                        view={dateError}
                      />
                    </div>
                    <div className="col-lg-6 p-0 ps-2">
                      <ReactSelectField
                        tabIndex={10}
                        searchIcon={true}
                        label="Subject"
                        id="subject"
                        error={errors.subject}
                        touched={touched.subject}
                        value={values.subject}
                        placeholder="Subject"
                        options={subjectList}
                        onInputChange={(inputValue) => {
                          handleSearchSubject(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("subject", text);
                          setSubjectList([]);
                          handleClear();
                        }}
                      />
                      <div className="row no-gutters">
                        <div className="col-lg-4 pe-2">
                          <ReactSelectField
                            tabIndex={11}
                            label="Year of Publish"
                            id="yearofPublish"
                            error={errors.yearofPublish}
                            touched={touched.yearofPublish}
                            value={values.yearofPublish}
                            placeholder="Year"
                            maxlength={10}
                            options={years}
                            onChange={(text) => {
                              setFieldValue("yearofPublish", text);
                              handleClear();
                            }}
                          />
                        </div>
                        <div className="col-lg-4 ps-2">
                          <TextField
                            tabIndex={12}
                            id="edition"
                            name="edition"
                            placeholder="Edition"
                            value={values.edition}
                            label="Edition"
                            error={errors.edition}
                            touched={touched.edition}
                            onChange={(e) => {
                              setFieldValue("edition", e.target.value);
                              handleClear();
                            }}
                            maxlength={6}
                          />
                        </div>
                        <div className="col-lg-4 ps-3">
                          <TextField
                            tabIndex={13}
                            id="callNumber"
                            name="callNumber"
                            placeholder="Call Number"
                            value={values.callNumber}
                            label="Call Number"
                            error={errors.callNumber}
                            touched={touched.callNumber}
                            onChange={(e) => {
                              setFieldValue("callNumber", e.target.value);
                              handleClear();
                            }}
                            maxlength={10}
                          />
                        </div>
                      </div>

                      <ReactSelectField
                        tabIndex={14}
                        searchIcon={true}
                        label="Publisher"
                        id="publisher"
                        error={errors.publisher}
                        touched={touched.publisher}
                        value={values.publisher}
                        placeholder="Publisher"
                        options={publisherList}
                        onInputChange={(text) => {
                          handleSearchPublisher(text);
                        }}
                        onChange={(text) => {
                          setFieldValue("publisher", text);
                          setPublisherList([]);
                          handleClear();
                        }}
                      />
                      <ReactSelectField
                        tabIndex={15}
                        label="Department"
                        id="department"
                        error={errors.department}
                        touched={touched.department}
                        value={values.department}
                        placeholder="Department"
                        options={deptList}
                        onChange={(text) => {
                          setFieldValue("department", text);
                          handleClear();
                        }}
                      />
                    </div>
                    <div className="row text-center mt-3">
                      <ErrorMessage
                        Message={"Please apply atleast one filter"}
                        view={filterError}
                      />
                    </div>

                    <div className="row mt-3">
                      <div className="text-center">
                        <Button
                          tabIndex={16}
                          frmButton={false}
                          className="btn me-1"
                          type="button"
                          onClick={(e) => handleOpenModal(values)}
                          text="Choose Fields"
                        />
                        <Button
                          type="submit"
                          text={"Show"}
                          className="btn ms-3 me-1"
                          frmButton={false}
                          tabIndex={17}
                          onClick={(e) => preFunction.handleErrorFocus(errors)}
                        />
                        <Button
                          type="button"
                          text="Clear"
                          className="btn ms-3"
                          frmButton={false}
                          tabIndex={19}
                          onClick={() => {
                            resetForm();
                            setData([]);
                            setShowRes(false);
                            setFilterError(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {showRes && (
                    <div className="row border mt-4 p-3">
                      <div className="row no-gutters">
                        <div className="col-lg-6"></div>
                        {data?.length > 0 ? (
                          <div className="col-lg-6 totcntstyle">
                            <div className="text-right">
                              <button
                                type="button"
                                className="btn mt-2"
                                onClick={(e) => getBookDetailList(values, 1, 2)}
                              >
                                Export Excel
                              </button>
                              <Button
                                frmButton={false}
                                className="btn ms-3"
                                type="button"
                                onClick={(e) => getBookDetailList(values, 1, 1)}
                                text="Export PDF"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <>
                        <div className="table-responsive mt-3 p-0">
                          <table className="table table-bordered report-table table-bordered">
                            <thead>
                              <tr>
                                <th>No.</th>
                                {/* {bookID && <th>Book ID</th>} */}
                                {titleCheck && <th>Title</th>}
                                {authorCheck && <th>Author Name</th>}
                                {authorType && <th>Author Type</th>}
                                {publisherCheck && <th>Publisher</th>}
                                {yearofPublishCheck && <th>Year of Publish</th>}
                                {editionCheck && <th>Edition</th>}
                                {pages && <th>Pages</th>}
                                {dept && <th>Department</th>}
                                {subjectName && <th>Subject</th>}
                                {rackNumber && <th>Rack Number</th>}
                                {bookTypeCheck && <th>Book Type</th>}
                                {issueTo && <th>Issue To</th>}
                                {callNumberCheck && <th>Call Number</th>}
                                {supplier && <th>Supplier Name</th>}
                                {invoiceNumber && <th>Invoice Number</th>}
                                {poNumber && <th>PO Number</th>}
                                {invoiceDate && <th>Invoice Date</th>}
                                {price && <th>MRP</th>}
                                {/* {amount && <th>Unit Price</th>} */}
                                {dateofEntry && <th>Date of Entry</th>}
                                {iSBNNumber && <th>ISBN</th>}
                                {remarks && <th>Remarks</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {data?.length == 0 ? (
                                <tr>
                                  <td colSpan="10" className="text-center">
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                data?.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      {/* {bookID && <td>{item.book_id}</td>} */}
                                      {titleCheck && <td>{item.main_title}</td>}
                                      {authorCheck && (
                                        <td>{item.author_name}</td>
                                      )}
                                      {authorType && (
                                        <td>{item.author_origin}</td>
                                      )}
                                      {publisherCheck && (
                                        <td>{item.publisher}</td>
                                      )}
                                      {yearofPublishCheck && (
                                        <td>{item.year_of_publish}</td>
                                      )}
                                      {editionCheck && <td>{item.edition}</td>}
                                      {pages && <td>{item.pages}</td>}
                                      {dept && <td>{item.book_department}</td>}
                                      {subjectName && (
                                        <td>{item.subject_name}</td>
                                      )}
                                      {rackNumber && (
                                        <td>{item.rack_number}</td>
                                      )}
                                      {bookTypeCheck && (
                                        <td>{item.book_type}</td>
                                      )}
                                      {issueTo && <td>{item.handled_by}</td>}
                                      {callNumberCheck && (
                                        <td>{item.call_number}</td>
                                      )}
                                      {supplier && <td>{item.supplier}</td>}
                                      {invoiceNumber && (
                                        <td>{item.invoice_number}</td>
                                      )}
                                      {poNumber && <td>{item.po_number}</td>}
                                      {invoiceDate && (
                                        <td>{item.invoice_date}</td>
                                      )}
                                      {price && <td>{item.mrp}</td>}
                                      {/* {amount && <td>{item.unit_price}</td>} */}
                                      {dateofEntry && (
                                        <td>
                                          {moment(item.date_of_entry).format(
                                            "DD-MM-yyyy"
                                          )}
                                        </td>
                                      )}
                                      {iSBNNumber && <td>{item.isbn}</td>}
                                      {remarks && <td>{item.remarks}</td>}
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                        {showLoadMore && (
                          <Button
                            text="Show All"
                            type="button"
                            className={"btn mt-3"}
                            isTable={true}
                            onClick={(e) => {
                              getBookDetailList(values, 1, 0);
                            }}
                          />
                        )}
                      </>
                    </div>
                  )}
                  <Modal show={openModel}>
                    <Modal.Header>
                      <Modal.Title>Choose Export Fields</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="row">
                        <div className="col-lg-6">
                          <CheckboxField
                            label="Title"
                            checked={titleCheck}
                            onChange={() => setTitleCheck(!titleCheck)}
                          />
                          <CheckboxField
                            label="Author"
                            checked={authorCheck}
                            onChange={() => setAuthorCheck(!authorCheck)}
                          />
                          <CheckboxField
                            label="Publisher"
                            checked={publisherCheck}
                            onChange={() => setPublisherCheck(!publisherCheck)}
                          />
                          <CheckboxField
                            label="Year of Publish"
                            checked={yearofPublishCheck}
                            onChange={() =>
                              setYearofPublishCheck(!yearofPublishCheck)
                            }
                          />
                          <CheckboxField
                            label="Author Type"
                            checked={authorType}
                            onChange={() => setAuthorType(!authorType)}
                          />
                          <CheckboxField
                            label="Edition"
                            checked={editionCheck}
                            onChange={() => setEditionCheck(!editionCheck)}
                          />
                          <CheckboxField
                            label="Pages"
                            checked={pages}
                            onChange={() => setPages(!pages)}
                          />
                          <CheckboxField
                            label="Department"
                            checked={dept}
                            onChange={() => setDept(!dept)}
                          />
                          <CheckboxField
                            label="Subject"
                            checked={subjectName}
                            onChange={() => setSubjectName(!subjectName)}
                          />
                          <CheckboxField
                            label="Rack No."
                            checked={rackNumber}
                            onChange={() => setRackNumber(!rackNumber)}
                          />
                          <CheckboxField
                            label="Book Type"
                            checked={bookTypeCheck}
                            onChange={() => setBookTypeCheck(!bookTypeCheck)}
                          />
                        </div>
                        <div className="col-lg-6">
                          <CheckboxField
                            label="Handled By"
                            checked={issueTo}
                            onChange={() => setIssueTo(!issueTo)}
                          />
                          <CheckboxField
                            label="Call No."
                            checked={callNumberCheck}
                            onChange={() =>
                              setCallNumberCheck(!callNumberCheck)
                            }
                          />
                          <CheckboxField
                            label="Supplier"
                            checked={supplier}
                            onChange={() => setSupplier(!supplier)}
                          />
                          <CheckboxField
                            label="Invoice No."
                            checked={invoiceNumber}
                            onChange={() => setInvoiceNumber(!invoiceNumber)}
                          />
                          <CheckboxField
                            label="PO No."
                            checked={poNumber}
                            onChange={() => setPoNumber(!poNumber)}
                          />
                          <CheckboxField
                            label="Invoice Date"
                            checked={invoiceDate}
                            onChange={() => setInvoiceDate(!invoiceDate)}
                          />
                          <CheckboxField
                            label="MRP"
                            checked={price}
                            onChange={() => setPrice(!price)}
                          />
                          <CheckboxField
                            label="Amount"
                            checked={amount}
                            onChange={() => setAmount(!amount)}
                          />
                          <CheckboxField
                            label="Date of Entry"
                            checked={dateofEntry}
                            onChange={() => setDateofEntry(!dateofEntry)}
                          />
                          <CheckboxField
                            label="ISBN"
                            checked={iSBNNumber}
                            onChange={() => setISBNNumber(!iSBNNumber)}
                          />
                          <CheckboxField
                            label="Remarks"
                            checked={remarks}
                            onChange={() => setRemarks(!remarks)}
                          />
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        autoFocus
                        type="submit"
                        text={"Show"}
                        className="btn ms-3 me-1"
                        frmButton={false}
                        // tabIndex={18}
                        onClick={() => getBookDetailList(values)}
                      />
                    </Modal.Footer>
                  </Modal>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
export default BookPurchaseReport;
