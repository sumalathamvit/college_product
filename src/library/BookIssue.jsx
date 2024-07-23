import React, { useContext, useState, useRef } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import moment from "moment";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import libraryapi from "../api/libraryapi";
import empApi from "../api/EmployeeApi";

import Button from "../component/FormField/Button";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import DateField from "../component/FormFieldLibrary/DateField";
import ErrorMessage from "../component/common/ErrorMessage";
import EmployeeCard from "../HRM/EmployeeCard";
import ModalComponent from "../component/ModalComponent";
import preFunction from "../component/common/CommonFunction";
import ReactSelectField from "../component/FormFieldLibrary/ReactSelectField";
import StudentCard from "../component/StudentCard";
import AuthContext from "../auth/context";

import ScreenTitle from "../component/common/ScreenTitle";

const bookIssueSchema = Yup.object().shape({
  bookTitle: Yup.object().required("Please enter Access Number"),
});

function BookIssue() {
  const [load, setLoad] = useState(false);
  const [saveLoad, setSaveLoad] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [enrollNumberList, setEnrollNumberList] = useState([]);
  const [bookDetailArrError, setBookDetailArrError] = useState(false);

  const [bookTitleList, setBookTitleList] = useState([]);
  const [enrollNumber, setEnrollNumber] = useState("");
  const [bookIssueDetailArr, setBookIssueDetailArr] = useState([]);
  const [bookDetailArr, setBookDetailArr] = useState([]);
  const [studDetail, setStudDetail] = useState("");
  const [librarySettingTotalCount, setLibrarySettingTotalCount] = useState(0);
  const [dueDays, setDueDays] = useState(0);
  const [bookIssueCount, setBookIssueCount] = useState(0);
  const [dateofIssue, setDateofIssue] = useState(new Date());

  const [memberType, setMemberType] = useState("");
  const [dateError, setDateError] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [memberStatus, setMemberStatus] = useState("");
  const formikRef = useRef();
  const collegeConfig = useSelector((state) => state.web.college);

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

  const closeError = () => {
    setBookDetailArrError(false);
    setShowErrorMessage(false);
    setErrorOpen(false);
    setDateError(false);
  };

  const handleSave = async (values, modalMessage) => {
    if (load) return;
    closeError();
    if (
      dateofIssue == "" ||
      moment(dateofIssue).format("YYYY-MM-DD") <
        moment().subtract(3, "days").format("YYYY-MM-DD") ||
      moment(dateofIssue).format("YYYY-MM-DD") >
        moment(new Date()).format("YYYY-MM-DD")
    ) {
      setDateError(true);
      document.getElementById("dateofIssue")?.focus();
      return;
    }

    if (
      (!values.bookTitle || values.bookTitle == "") &&
      bookDetailArr.length == 0
    ) {
      setBookDetailArrError(true);
      return;
    } else {
      if (values.bookTitle != "" && values.bookTitle != null) {
        console.log("here");
        const addTitle = await handleBookIssue(
          values,
          formikRef.current,
          modalMessage
        );
        console.log("addTitle---", addTitle);
        if (!addTitle) return;
      }
    }

    try {
      setLoad(true);
      console.log("bookSaveArr---", bookDetailArr);
      for (let i = 0; i < bookDetailArr.length; i++) {
        const addBookIssueRes = await libraryapi.addBookIssue(
          enrollNumber.value,
          bookDetailArr[i].access_number,
          moment(dateofIssue).format("yyyy-MM-DD"),
          moment(dateofIssue).add(dueDays, "days").format("yyyy-MM-DD")
        );
        console.log("addBookIssueRes----", addBookIssueRes);
        if (addBookIssueRes.ok) {
          const updateAvailableAccessNoRes =
            await libraryapi.updateAvailableAccessNo(
              bookDetailArr[i].access_number
            );
          console.log(
            "updateAvailableAccessNoRes----",
            updateAvailableAccessNoRes
          );
        }
      }
      handleUnSavedChanges(0);
      toast.success("Book Issued Successfully");
      setEnrollNumber("");
      setBookDetailArr([]);
      formikRef.current.setFieldValue("bookTitle", "");
      setDateofIssue(new Date());
      document.getElementById("enrollNumber")?.focus();
      setLoad(false);
    } catch (error) {
      console.log("error--", error);
    }
  };

  const handleBookIssue = async (values, { resetForm }, modalMessage) => {
    console.log(
      "values---",
      dateofIssue,
      moment().subtract(3, "days"),
      new Date()
    );

    if (
      dateofIssue == "" ||
      moment(dateofIssue).format("YYYY-MM-DD") <
        moment().subtract(3, "days").format("YYYY-MM-DD") ||
      moment(dateofIssue).format("YYYY-MM-DD") >
        moment(new Date()).format("YYYY-MM-DD")
    ) {
      setDateError(true);
      document.getElementById("dateofIssue")?.focus();
      return false;
    } else {
      setBookDetailArrError(false);
      console.log("values---", values);
      setBookDetailArr([]);
      let bookArr = bookDetailArr;
      var newarr = {
        access_number: values.bookTitle.access_number,
        main_title: values.bookTitle.main_title,
        book_id: values.bookTitle.name,
      };
      bookArr.push(newarr);
      console.log("bookArr---", bookArr);
      if (!modalMessage) handleBookLimit(bookArr.length);
      setBookDetailArr(bookArr);
      setBookTitleList([]);

      resetForm();
      document.getElementById("bookTitle")?.focus();

      // if (bookIssueCount + bookArr.length >= librarySettingTotalCount) {
      //   document.getElementById("saveButton")?.focus();
      // } else {
      //   resetForm();
      //   document.getElementById("bookTitle")?.focus();
      // }
      return true;
    }
  };

  const handleBookLimit = async (bookArrLength) => {
    if (bookIssueCount + bookArrLength >= librarySettingTotalCount) {
      setModalMessage(
        "Maximum of book issue count " + librarySettingTotalCount + " reached"
      );
      setErrorOpen(true);
    }
  };

  const handleGetMemberDetails = async (enrollNo) => {
    console.log("enrollNo---", enrollNo);
    setDateofIssue(new Date());
    setBookDetailArrError(false);
    handleUnSavedChanges(0);
    if (enrollNo != "") {
      try {
        setLoad(true);
        handleClear();
        console.log("enrollNo.value---", enrollNo.value);
        const getMemberNumberDetail = await libraryapi.getMemberNumberDetail(
          enrollNo.value,
          enrollNo.college_id
        );
        console.log("getMemberNumberDetail---", getMemberNumberDetail);
        if (getMemberNumberDetail) {
          handleUnSavedChanges(1);
          getStudentorEmployeeDetails(
            getMemberNumberDetail.data.message.member_detail[0]
          );
          setMemberType(
            getMemberNumberDetail.data.message.member_detail[0].member_type
          );
          setLibrarySettingTotalCount(
            getMemberNumberDetail.data.message.member_detail[0].book_limit
          );
          setDueDays(
            getMemberNumberDetail.data.message.member_detail[0].due_day
          );
          setBookIssueDetailArr(getMemberNumberDetail.data.message.issued_book);
          setBookIssueCount(
            getMemberNumberDetail.data.message.issued_book.length
          );
          if (
            getMemberNumberDetail.data.message.issued_book.length >=
            getMemberNumberDetail.data.message.member_detail[0].book_limit
          ) {
            setModalMessage(
              "Maximum of book issue count " +
                getMemberNumberDetail.data.message.member_detail[0].book_limit +
                " reached"
            );
            setErrorOpen(true);
            setShowErrorMessage(true);
          }
        }

        setLoad(false);
      } catch (error) {
        setLoad(false);
        console.log("error----", error);
      }
    }
  };

  const getStudentorEmployeeDetails = async (memberDetail) => {
    try {
      setLoad(true);
      setStudDetail("");
      if (memberDetail.member_type == "Staff") {
        const employeeRes = await empApi.employeeSearch(
          memberDetail.member_number
        );
        console.log("employeeRes", employeeRes.data.message.employee_data[0]);
        setStudDetail(employeeRes?.data?.message?.employee_data[0]);
      } else {
        const studentRes = await libraryapi.studentDetailByEnrollNo(
          memberDetail.member_number
        );
        console.log("studentRes--", studentRes);
        setStudDetail(studentRes?.data?.message?.data?.student);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  const getBookTitleList = async (inputValue) => {
    console.log("inputValue---", inputValue);
    try {
      if (inputValue && inputValue.length > 0) {
        const bookAccNoRes = await libraryapi.getBookAccessNo(inputValue, 1);
        console.log("bookAccNoRes---", bookAccNoRes);
        console.log("bookDetailArr---", bookDetailArr);
        for (let i = 0; i < bookAccNoRes.data.message.length; i++) {
          let cnt = 0;
          for (let j = 0; j < bookDetailArr.length; j++) {
            if (
              bookDetailArr[j].access_number ==
                bookAccNoRes.data.message[i].access_number ||
              bookDetailArr[j].book_id == bookAccNoRes.data.message[i].name
            ) {
              cnt++;
            }
          }
          for (let j = 0; j < bookIssueDetailArr.length; j++) {
            if (
              bookIssueDetailArr[j].access_number ==
                bookAccNoRes.data.message[i].access_number ||
              bookIssueDetailArr[j].name == bookAccNoRes.data.message[i].name
            ) {
              cnt++;
            }
          }
          console.log("cnt---", cnt);
          if (cnt === 0) {
            bookAccNoRes.data.message[i].label =
              bookAccNoRes.data.message[i].access_number;
            bookAccNoRes.data.message[i].value =
              bookAccNoRes.data.message[i].access_number;
          }
        }
        setBookTitleList(bookAccNoRes.data.message);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  const getMemberList = async (inputValue) => {
    if (inputValue.length > 2) {
      try {
        const studentRes = await libraryapi.searchLibraryMember(
          inputValue,
          "current",
          collegeConfig.institution_type
        );
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

  const handleDeleteAccessNumber = (item) => {
    setBookDetailArrError(false);
    const deleteAccessNumber = bookDetailArr.filter((m) => m !== item);
    setBookDetailArr(deleteAccessNumber);
  };

  const handleClear = () => {
    setStudDetail([]);
    setBookIssueDetailArr([]);
    setBookIssueCount(0);
    setShowErrorMessage(false);
    setLibrarySettingTotalCount(0);
    setErrorOpen(false);
    setBookDetailArr([]);
    setMemberType("");
  };

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        title={"Book Issue Limit"}
        isOpen={errorOpen}
        message={modalMessage}
        okClick={() => {
          setErrorOpen(false);
        }}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters">
          <div className="col-lg-12">
            <Formik
              innerRef={formikRef}
              enableReinitialize={false}
              initialValues={{
                bookTitle: "",
              }}
              validationSchema={bookIssueSchema}
              onSubmit={handleBookIssue}
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
                        <div className="col-lg-10 row no-gutters">
                          <div className="col-lg-4">
                            <ReactSelectField
                              autoFocus
                              searchIcon={true}
                              label={"Member Number / Name"}
                              placeholder=""
                              id="enrollNumber"
                              value={enrollNumber}
                              options={enrollNumberList}
                              mandatory={1}
                              maxlength={15}
                              // style={{ width: "60%" }}
                              onInputChange={(inputValue) => {
                                getMemberList(inputValue);
                              }}
                              onChange={(text) => {
                                setEnrollNumber(text);
                                handleGetMemberDetails(text ? text : "");
                                setMemberStatus(text ? text.member_status : "");
                              }}
                              noOptionsMessage={(text) =>
                                preFunction.reactSelectNoOptionsMessage(text)
                              }
                            />
                          </div>
                          {memberStatus == "Close" ? (
                            <div
                              className="text-left col-lg-2 ms-5 mt-5"
                              style={{ color: "red" }}
                            >
                              Membership Closed
                            </div>
                          ) : null}
                        </div>
                        {memberStatus !== "Close" &&
                          enrollNumber &&
                          studDetail &&
                          !showErrorMessage && (
                            <div className="row col-lg-2 p-0">
                              <div className="col-lg-3"></div>
                              <div className="col-lg-9 p-0">
                                <DateField
                                  label={"Issue Date"}
                                  id="dateofIssue"
                                  maxDate={new Date()}
                                  minDate={moment().subtract(3, "days")}
                                  mandatory={1}
                                  value={dateofIssue}
                                  onChange={(e) => {
                                    setDateofIssue(e.target.value);
                                    closeError();
                                  }}
                                />
                                <ErrorMessage
                                  Message="Please select valid Date"
                                  view={dateError}
                                />
                              </div>
                            </div>
                          )}
                      </div>

                      {enrollNumber && studDetail && (
                        <>
                          {enrollNumber && memberType == "Staff" ? (
                            <>
                              <div className="subhead-row">
                                <div className="subhead">Employee Details</div>
                                <div className="col line-div"></div>
                              </div>

                              {studDetail && (
                                <EmployeeCard employeeInfo={studDetail} />
                              )}
                            </>
                          ) : (
                            <>
                              <div className="subhead-row">
                                <div className="subhead">Student Detail</div>
                                <div className="col line-div"></div>
                              </div>

                              {studDetail && (
                                <StudentCard studentInfo={studDetail} />
                              )}
                            </>
                          )}
                        </>
                      )}

                      <>
                        {enrollNumber && studDetail && (
                          <>
                            {memberStatus !== "Close" && !showErrorMessage && (
                              <>
                                <div className="col-lg-12 text-right p-0 mt-2 student-text">
                                  Eligible Issue Count :{" "}
                                  {librarySettingTotalCount - bookIssueCount}
                                </div>
                                <div className="row p-0 mt-2">
                                  <table className="table table-bordered report-table mb-1">
                                    <thead>
                                      <tr>
                                        <th width="1%">No.</th>
                                        <th width="20%">Access Number</th>
                                        <th>Title</th>
                                        <th width="5%">Add</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {bookDetailArr.map((item, index) => {
                                        return (
                                          <tr>
                                            <td>{index + 1}</td>
                                            <td>{item.access_number}</td>
                                            <td>{item.main_title}</td>
                                            <td align="center">
                                              <Button
                                                type="button"
                                                text={"-"}
                                                isTable={true}
                                                className={"plus-button"}
                                                onClick={() =>
                                                  handleDeleteAccessNumber(item)
                                                }
                                              />
                                            </td>
                                          </tr>
                                        );
                                      })}
                                      {bookIssueCount + bookDetailArr.length ===
                                      librarySettingTotalCount ? (
                                        document
                                          .getElementById("saveButton")
                                          ?.focus()
                                      ) : (
                                        <tr>
                                          <td>{bookDetailArr.length + 1}</td>
                                          <td>
                                            <ReactSelectField
                                              autoFocus
                                              isTable="true"
                                              searchIcon={true}
                                              placeholder="Access Number"
                                              id="bookTitle"
                                              error={errors.bookTitle}
                                              touched={touched.bookTitle}
                                              value={values.bookTitle}
                                              options={bookTitleList}
                                              style={{ width: "75%" }}
                                              mandatory={1}
                                              maxlength={6}
                                              onInputChange={(inputValue) => {
                                                getBookTitleList(inputValue);
                                                setBookTitleList([]);
                                              }}
                                              onChange={(text) => {
                                                setFieldValue(
                                                  "bookTitle",
                                                  text
                                                );
                                                setBookTitleList([]);
                                                setBookDetailArrError(false);
                                                document
                                                  .getElementById("addButton")
                                                  ?.focus();
                                              }}
                                              noOptionsMessage={(text) =>
                                                preFunction.reactSelectNoOptionsMessage(
                                                  text
                                                )
                                              }
                                            />
                                          </td>
                                          <td>
                                            {values?.bookTitle?.main_title}
                                          </td>
                                          <td align="center">
                                            <Button
                                              id="addButton"
                                              text={"+"}
                                              className={"plus-button"}
                                              type="submit"
                                              isTable={true}
                                              onClick={preFunction.handleErrorFocus(
                                                errors
                                              )}
                                            />
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>

                                  <ErrorMessage
                                    Message="Please select atleast one book to issue"
                                    view={bookDetailArrError}
                                  />
                                </div>
                              </>
                            )}
                            {memberStatus !== "Close" && !showErrorMessage && (
                              <Button
                                id="saveButton"
                                text={"Save"}
                                type="button"
                                onClick={(e) => {
                                  handleSave(values, 1);
                                }}
                              />
                            )}
                            {bookIssueDetailArr.length > 0 ? (
                              <div className="row no-gutters p-0 mt-3">
                                <div className="subhead-row">
                                  <div className="subhead">Issued Books</div>
                                  <div className="col line-div"></div>
                                </div>
                                <table className="table table-bordered mb-1 mt-2">
                                  <thead>
                                    <tr>
                                      <th width="1%">No.</th>
                                      <th>Access Number / Title</th>
                                      <th width="10%">Issue Date</th>
                                      <th width="10%">Expected Return Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {bookIssueDetailArr.map((item, index) => {
                                      return (
                                        <tr>
                                          <td>{index + 1}</td>
                                          <td>
                                            {item.access_number} -{" "}
                                            {item.main_title}
                                          </td>
                                          <td>
                                            {item.issue_date
                                              ? moment(item.issue_date).format(
                                                  "DD-MM-yyyy"
                                                )
                                              : ""}
                                          </td>
                                          {moment() >
                                          moment(item.expected_return_date) ? (
                                            <td className="text-danger">
                                              {moment(
                                                item.expected_return_date
                                              ).format("DD-MM-YYYY")}
                                            </td>
                                          ) : (
                                            <td className="text-success">
                                              {moment(
                                                item.expected_return_date
                                              ).format("DD-MM-YYYY")}
                                            </td>
                                          )}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : null}
                          </>
                        )}
                      </>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookIssue;
