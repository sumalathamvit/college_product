import React, { useEffect, useState, useContext } from "react";
import { Formik } from "formik";
import moment from "moment";
import * as Yup from "yup";

import libraryApi from "../../api/libraryapi";

import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import DateField from "../../component/FormFieldLibrary/DateField";
import ErrorMessage from "../../component/common/ErrorMessage";
import preFunction from "../../component/common/CommonFunction";
import TextField from "../../component/FormFieldLibrary/TextField";
import ReactSelectField from "../../component/FormFieldLibrary/ReactSelectField";
import Button from "../../component/FormField/Button";
import string from "../../string";
import ScreenTitle from "../../component/common/ScreenTitle";
import SelectFieldFormik from "../../component/FormFieldLibrary/SelectFieldFormik";
import AuthContext from "../../auth/context";
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

function BookPendingWeekWise() {
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [accNoList, setAccNoList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [bookTypeList, setBookTypeList] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const [titleList, setTitleList] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const [authorList, setAuthorList] = useState([]);
  const [publisherList, setPublisherList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const currentYear = new Date().getFullYear();

  const years = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push({ label: year, value: year });
  }
  const [filterError, setFilterError] = useState(false);
  const [accessNoError, setAccessNoError] = useState(false);
  const [enrollNumberList, setEnrollNumberList] = useState([]);
  const [dateError, setDateError] = useState(false);
  const [accessNoValidateError, setAccessNoValidateError] = useState(false);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const [college, setCollege] = useState();
  const [collegeError, setCollegeError] = useState(false);
  const RENAME = useSelector((state) => state.web.rename);

  const handleCSVData = async (values, type) => {
    try {
      console.log("csvDataList-----", data);

      if (type == 1) {
        var pdfData = [
          [
            { content: "No." },
            { content: "Access No." },
            { content: "Title" },
            { content: "Author Name" },
            { content: "Edition" },
            { content: "Member No." },
            { content: "Member Name" },
            { content: "Department" },
            { content: "Issue Date" },
            { content: "Return Date" },
            { content: "Pending Days" },
          ],
        ];
        values.map((item1, index1) => {
          let count = 0;
          for (let i = 0; i < index1; i++) {
            count += data[i].books.length;
          }
          const startCount = count + 1;
          const issueRow = {
            content: "",
            styles: { textColor: [50, 50, 50], fontStyle: "bold" },
            colSpan: 10,
          };

          issueRow.content =
            "Issue Week : " +
            moment(item1.issue_date).format("DD-MM-YYYY") +
            " to " +
            moment(item1.issue_date).add(6, "days").format("DD-MM-YYYY");

          pdfData.push([issueRow]);
          item1.books.map((item, index) => {
            const serialNumber = startCount + index;
            pdfData.push([
              {
                content: serialNumber,
              },
              {
                content: item.access_number,
              },
              {
                content: item.main_title,
              },
              {
                content: item.author_name,
              },
              {
                content: item.edition,
              },
              {
                content: item.member_number,
              },
              {
                content: item.member_name,
              },
              {
                content: item.member_department,
              },
              {
                content: moment(item.issue_date).format("DD-MM-YYYY"),
              },
              {
                content: moment(item.return_date).format("DD-MM-YYYY"),
              },
              {
                content: item.days_pending,
              },
            ]);
          });
        });
        var columnWidth = [3, 6, 20, 14, 4, 6, 10, 15, 5, 7, 9];
      } else {
        // TypeError: row.join is not a function
        var csvData = [
          [
            "No.",
            "Access No.",
            "Title",
            "Author Name",
            "Edition",
            "Member No.",
            "Member Name",
            "Department",
            "Issue Date",
            "Return Date",
            "Pending Days",
          ],
        ];
        values.map((item1, index1) => {
          let count = 0;
          for (let i = 0; i < index1; i++) {
            count += data[i].books.length;
          }
          const startCount = count + 1;
          const issueRow = [];
          issueRow[0] =
            "Issue Week : " +
            moment(item1.issue_date).format("DD-MM-YYYY") +
            " to " +
            moment(item1.issue_date).add(6, "days").format("DD-MM-YYYY");
          for (let i = 1; i < 10; i++) {
            issueRow[i] = ""; // Leave other cells empty to achieve colspan effect
          }
          csvData.push(issueRow);
          item1.books.map((item, index) => {
            const serialNumber = startCount + index;
            csvData.push([
              serialNumber,
              item.access_number,
              item.main_title,
              item.author_name.replace(/,/g, " / "),
              item.edition,
              item.member_number,
              item.member_name,
              item.member_department,
              moment(item.issue_date).format("DD-MM-YYYY"),
              moment(item.return_date).format("DD-MM-YYYY"),
              item.days_pending,
            ]);
          });
        });
      }

      if (type == 1) {
        preFunction.generatePDF(
          collegeConfig.is_university ? college.collegeName : collegeName,
          "Book Pending Week Wise",
          pdfData,
          columnWidth,
          false,
          "landscape"
        );
      } else {
        preFunction.downloadCSV(csvData, "Book Pending Week Wise");
      }
      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  const getBookDetailList = async (values, showAll = 0, report = 0) => {
    if (load) return;
    console.log("values", showAll, values);
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
      const getBookDetail = await libraryApi.getPendingBookReportSearch(
        collegeConfig.is_university ? college.collegeID : collegeId,
        "pending_week_wise",
        values.title ? values.title.value : null,
        values.author ? values.author.value : null,
        values.subject ? values.subject.value : null,
        values.callNumber ? values.callNumber : null,
        values.yearofPublish ? values.yearofPublish.value : null,
        values.edition ? values.edition : null,
        values.publisher ? values.publisher.value : null,
        values.supplier ? values.supplier.value : null,
        values.bookType ? values.bookType.value : null,
        accNoFromRes ? accNoFromRes : null,
        accNoToRes ? accNoToRes : null,
        values.department ? values.department.value : null,
        values.fromDate ? values.fromDate : null,
        values.toDate ? values.toDate : null,
        values.member ? values.member.value : null,
        showAll
      );
      console.log("getBookDetail", getBookDetail);
      if (report) {
        handleWeekWise(getBookDetail.data.message, report);
      } else {
        handleWeekWise(getBookDetail.data.message);

        setShowLoadMore(false);
        if (getBookDetail.data.message.length === string.PAGE_LIMIT) {
          setShowLoadMore(true);
        }
      }
      setLoad(false);
    } catch (error) {
      console.log("catch---", error);
      setLoad(false);
    }
  };

  // Function to group data by month
  const handleWeekWise = (messages, report) => {
    let filterList = [];
    let uniqueWeeks = {};

    for (let i = 0; i < messages.length; i++) {
      let currentDate = new Date(messages[i].issue_date);
      console.log("currentDate", currentDate);
      let weekKey = handleDate(currentDate);
      let weekStartDate = moment(currentDate)
        .startOf("isoWeek")
        .format("YYYY-MM-DD"); // Get the start date of the week
      if (!uniqueWeeks[weekKey]) {
        uniqueWeeks[weekKey] = {
          week: weekKey,
          issue_date: weekStartDate, // Assign the start date of the week
          books: [],
        };
      }
      uniqueWeeks[weekKey].books.push(messages[i]);
    }

    for (const weekKey in uniqueWeeks) {
      filterList.push(uniqueWeeks[weekKey]);
    }

    if (report) {
      handleCSVData(filterList, report);
    } else {
      setData(filterList);
    }
    console.log("filterList", filterList);
  };

  // Function to calculate ISO week number
  const handleDate = (date) => {
    const dt = date;
    dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() + 4 - (dt.getDay() || 7));
    const yearStart = new Date(dt.getFullYear(), 0, 1);
    return Math.ceil(((dt - yearStart) / 86400000 + 1) / 7);
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

  useEffect(() => {
    getSearchDetail();
  }, []);

  useEffect(() => {}, []);
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
            initialValues={{
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
            // onSubmit={getBookDetailList}
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
                            tabIndex={2}
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
                        tabIndex={3}
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
                          tabIndex={4}
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
                          tabIndex={5}
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
                              tabIndex={6}
                              maxlength={6}
                              searchIcon={true}
                              label="Access No From"
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
                          </div>
                          <div className="col-lg-4 ps-2 pe-2">
                            <ReactSelectField
                              tabIndex={7}
                              maxlength={6}
                              searchIcon={true}
                              label="Access No To"
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
                              tabIndex={8}
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
                        <div className="col-lg-3 pe-2">
                          <DateField
                            tabIndex={9}
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
                        <div className="col-lg-3 ps-2 pe-2">
                          <DateField
                            tabIndex={10}
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
                        <div className="col-lg-6 ps-2">
                          <ReactSelectField
                            tabIndex={11}
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
                        </div>
                      </div>
                      <ErrorMessage
                        Message={"Choose both Purchase Date From & To"}
                        view={dateError}
                      />
                    </div>
                    <div className="col-lg-6 p-0 ps-2">
                      <ReactSelectField
                        tabIndex={12}
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
                            tabIndex={13}
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
                            tabIndex={14}
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
                            tabIndex={15}
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
                        tabIndex={16}
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
                        tabIndex={17}
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

                    <div className="row no-gutters">
                      <div className="col-lg-6 text-right pe-1">
                        <Button
                          type="submit"
                          text={"Show"}
                          isCenter={false}
                          tabIndex={18}
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
                            setData([]);
                            setShowRes(false);
                            setFilterError(false);
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
                          <table
                            className="table report-table table-bordered"
                            id="pdf-table"
                          >
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="5%">Access No.</th>
                                <th>Title</th>
                                <th width="20%">Author Name</th>
                                <th width="5%">Edition</th>
                                <th width="5%">Member No.</th>
                                <th width="10%">Member Name</th>
                                <th width="20%">{RENAME.dept}</th>
                                <th width="5%">Issue Date</th>
                                <th width="5%">Return Date</th>
                                <th width="5%">Days Pending</th>
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
                                data.map((item1, index1) => {
                                  let count = 0;
                                  for (let i = 0; i < index1; i++) {
                                    count += data[i].books.length;
                                  }
                                  const startCount = count + 1;
                                  return (
                                    <>
                                      {item1.issue_date ? (
                                        <tr key={index1}>
                                          <td
                                            colSpan={11}
                                            className="table-total"
                                          >
                                            {"Issue Week : " +
                                              moment(item1.issue_date).format(
                                                "DD-MM-YYYY"
                                              ) +
                                              " to " +
                                              moment(item1.issue_date)
                                                .add(6, "days")
                                                .format("DD-MM-YYYY")}
                                          </td>
                                        </tr>
                                      ) : null}
                                      {item1.books.map((item, index) => {
                                        const serialNumber = startCount + index;
                                        return (
                                          <tr key={index}>
                                            <td>{serialNumber}</td>
                                            <td>{item.access_number}</td>
                                            <td>{item.main_title}</td>
                                            <td>{item.author_name}</td>
                                            <td>{item.edition}</td>
                                            <td>{item.member_number}</td>
                                            <td>{item.member_name}</td>
                                            <td>{item.member_department}</td>
                                            <td>
                                              {moment(item.issue_date).format(
                                                "DD-MM-YYYY"
                                              )}
                                            </td>
                                            <td>
                                              {moment(item.return_date).format(
                                                "DD-MM-YYYY"
                                              )}
                                            </td>
                                            <td>{item.days_pending}</td>
                                          </tr>
                                        );
                                      })}
                                    </>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                        {showLoadMore && (
                          <Button
                            text="Show All"
                            className={"btn mt-3"}
                            isTable={true}
                            type="button"
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
export default BookPendingWeekWise;
