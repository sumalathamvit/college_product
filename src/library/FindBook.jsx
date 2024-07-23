import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";

import libraryApi from "../api/libraryapi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import moment from "moment";
import ReactSelectField from "../component/FormField/ReactSelectField";
import RadioInputField from "../component/FormFieldLibrary/RadioInputField";
import ReadOnlyField from "../component/ReadOnlyField";
import TextField from "../component/FormField/TextField";
import Button from "./../component/FormField/Button";
import ErrorMessage from "../component/common/ErrorMessage";
import ScreenTitle from "../component/common/ScreenTitle";
import ModalComponent from "../component/ModalComponent";

function FindBook() {
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [currentMember, setCurrentMember] = useState("");
  const [previousMemberList, setPreviousMemberList] = useState([]);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAccNo, setBookAccNo] = useState("");
  const [bookTitleList, setBookTitleList] = useState([]);
  const [accessFromTitle, setAccessFromTitle] = useState([]);
  const [delayinDays, setDelayinDays] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [accessRadio, setAccessRadio] = useState(false);
  const [titleRadio, setTitleRadio] = useState(true);
  const [accessNumberError, setAccessNumberError] = useState(false);

  const handleGetBook = async (value) => {
    setAccessFromTitle([]);
    setData([]);

    try {
      console.log("value----", value, bookTitle);
      const getBookByIdRes = await libraryApi.findAccessFromTitle(value);
      console.log("getBookByIdRes-------", getBookByIdRes);
      if (getBookByIdRes.data.message.access_number_detail.length > 0) {
        setAccessFromTitle(getBookByIdRes.data.message.access_number_detail);
      }
      if (getBookByIdRes.data.message.book_detail.length > 0) {
        setData(getBookByIdRes.data.message.book_detail);
      }
      return;
    } catch (error) {
      console.log("catch---", error);
    }
  };

  const handleSelectAccess = async (value, checkData, viewButton = 0) => {
    console.log("value---", value, checkData);
    try {
      setCurrentMember("");
      setPreviousMemberList([]);
      setAccessNumberError(false);
      if (checkData == 0) {
        setData([]);
      }

      setLoad(true);
      const getAccessNumberDetailRes = await libraryApi.getAccessNumberDetail(
        value
      );
      console.log("getAccessNumberDetailRes-----", getAccessNumberDetailRes);
      if (getAccessNumberDetailRes.data.message.book_detail.length == 0) {
        setAccessNumberError(true);
        setLoad(false);
        return;
      }
      if (checkData == 0) {
        setData(getAccessNumberDetailRes.data.message.book_detail);
      }
      if (
        viewButton &&
        getAccessNumberDetailRes.data.message.current_issue.length == 0 &&
        getAccessNumberDetailRes.data.message.issue_history.length == 0
      ) {
        setModalMessage("No Issue History found");
        setErrorOpen(true);
        setLoad(false);
        return;
      }
      var targetElement = document.getElementById("currentBook");
      targetElement?.scrollIntoView({ behavior: "smooth" });
      setCurrentMember(getAccessNumberDetailRes.data.message.current_issue[0]);
      setPreviousMemberList(
        getAccessNumberDetailRes.data.message.issue_history
      );
      if (getAccessNumberDetailRes?.data?.message?.current_issue.length > 0) {
        let delayDays = 0;
        let expectedReturnDate =
          getAccessNumberDetailRes?.data?.message?.current_issue[0]
            .expected_return_date;
        if (
          moment(expectedReturnDate).format("YYYY-MM-DD") <
          moment().format("YYYY-MM-DD")
        ) {
          delayDays = Math.abs(
            Math.ceil(
              (new Date(expectedReturnDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );
          console.log("delayDays", delayDays);
        }
        setDelayinDays(delayDays);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleModalMessage = (issueDetail) => {
    if (
      issueDetail?.current_issue.length == 0 &&
      issueDetail?.issue_history.length == 0
    ) {
      setModalMessage("No issue history found");
      setErrorOpen(true);
    }
  };

  const handleSearchTitleWithAuthor = async (text) => {
    if (text.length > 2) {
      try {
        const mainTitleRes = await libraryApi.getBookAuthorPublisherByKeyword(
          text
        );
        console.log("mainTitleRes---", mainTitleRes);
        setBookTitleList(mainTitleRes.data.message);
      } catch (error) {
        console.log("catch---", error);
      }
    }
  };

  const handleShow = () => {
    setShowError(false);
    if (bookTitle) {
      handleGetBook(bookTitle?.book_id);
      // getBookDetailsByMainTitle(bookTitle?.split(" - ")[0]);
    } else if (bookAccNo) {
      handleSelectAccess(bookAccNo, 0);
    } else {
      setShowError(true);
      setAccessRadio(false);
      setTitleRadio(false);
    }
  };

  const clearForm = () => {
    setData([]);
    setCurrentMember("");
    setPreviousMemberList([]);
    setBookTitleList([]);
    setAccessFromTitle([]);
    setDelayinDays("");
  };

  useEffect(() => {
    // clearForm();
    document.getElementById("bookAccNo")?.setAttribute("maxlength", 7);
    document.getElementById("bookTitle")?.setAttribute("maxlength", 40);
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        title={"Issue History"}
        isOpen={errorOpen}
        message={modalMessage}
        okClick={() => {
          setErrorOpen(false);
        }}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters">
          <div className="row">
            <div className="col-3 p-0">
              <RadioInputField
                label={"Title"}
                id={"titleRadio"}
                name={"titleRadio"}
                findBook={true}
                className="radio-input"
                value={titleRadio}
                checked={titleRadio}
                onClick={(e) => {
                  setTitleRadio(true);
                  document.getElementById("bookTitle")?.focus();
                  setAccessRadio(false);
                  setBookAccNo("");
                  clearForm();
                }}
              />
            </div>
            <div className="col-8 p-0">
              <ReactSelectField
                autoFocus
                id="bookTitle"
                // labelSize={3}
                tabIndex={1}
                mandatory={1}
                value={bookTitle}
                placeholder="Title"
                options={bookTitleList}
                getOptionLabel={(option) => option.search}
                getOptionValue={(option) => option.book_id}
                style={{ width: "90%" }}
                searchIcon={true}
                onInputChange={(inputValue) => {
                  // getBookList(inputValue);
                  handleSearchTitleWithAuthor(inputValue);
                  setBookAccNo("");
                  setTitleRadio(true);
                  setAccessRadio(false);
                  setShowError(false);
                }}
                onChange={(text) => {
                  setBookTitle(text);
                  // handleGetBook(text ? text.book_id : "");
                  clearForm();
                }}
                noOptionsMessage={(text) =>
                  preFunction.reactSelectNoOptionsMessage(text)
                }
              />
            </div>
          </div>
          {/* <div className="row mt-1"> */}
          <div className="row mt-1">
            <div className="col-3 p-0">
              <RadioInputField
                label={"Access No."}
                id={"accessRadio"}
                name={"accessRadio"}
                findBook={true}
                className="radio-input"
                value={accessRadio}
                checked={accessRadio}
                onClick={(e) => {
                  setAccessRadio(true);
                  document.getElementById("bookAccNo")?.focus();
                  setTitleRadio(false);
                  setBookTitle("");
                  clearForm();
                }}
              />
            </div>
            <div className="col-8 p-0">
              <TextField
                autoFocus
                // labelSize={3}
                placeholder="Access No."
                id="bookAccNo"
                value={bookAccNo}
                mandatory={1}
                maxlength={7}
                tabIndex={2}
                style={{ width: "20%" }}
                onChange={(e) => {
                  setData([]);
                  if (!isNaN(e.target.value)) {
                    setBookAccNo(e.target.value);
                    setBookTitle("");
                    clearForm();
                    setAccessRadio(true);
                    setTitleRadio(false);
                    setShowError(false);
                    setAccessNumberError(false);
                  }
                }}
                // onKeyUp={(e) => {
                //   if (e.keyCode == 13 && e.target.value != "") {
                //     handleSelectAccess(e.target.value, 0);
                //   }
                // }}
                error={
                  accessNumberError ? "Please enter valid Access Number" : ""
                }
                touched={accessNumberError ? true : false}
              />
            </div>
          </div>
          {/* </div> */}
          {showError ? (
            <div className="text-center mt-3">
              <ErrorMessage
                Message={"Please enter Title or Access Number"}
                view={showError}
              />
            </div>
          ) : null}
          <Button
            // type="button"
            onClick={() => {
              handleShow();
              clearForm();
            }}
            text="Show"
          />
        </div>
        {data.length > 0 ? (
          <>
            <div className="subhead-row p-0 mt-3 pt-1">
              <div className="subhead">Book Details</div>
              <div className="col line-div"></div>
            </div>
            <div className="row p-0">
              <div className="col-lg-6 pe-2 p-0">
                {data[0]?.main_title ? (
                  <div className="col-lg-12">
                    <ReadOnlyField
                      label="Title"
                      title={true}
                      value={data[0]?.main_title}
                    />
                  </div>
                ) : null}
                {data[0]?.author_origin ? (
                  <div className="col-lg-12">
                    <ReadOnlyField
                      label="Author Origin"
                      value={data[0]?.author_origin}
                    />
                  </div>
                ) : null}

                {data[0]?.book_department ? (
                  <div className="col-lg-12">
                    <ReadOnlyField
                      label="Department"
                      value={data[0]?.book_department}
                    />
                  </div>
                ) : null}
                <div className="row p-0">
                  <div className="col-lg-6 p-0 pe-2">
                    {data[0]?.call_number ? (
                      <div className="col-lg-12">
                        <ReadOnlyField
                          label="Call number"
                          value={data[0]?.call_number}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="col-lg-6 p-0 ps-2">
                    {data[0]?.rack_number ? (
                      <div className="col-lg-12">
                        <ReadOnlyField
                          label="Rack Number"
                          value={data[0]?.rack_number}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="col-lg-6 ps-2 p-0">
                {data[0]?.author_name ? (
                  <div className="col-lg-12">
                    <ReadOnlyField
                      label="Author"
                      title={true}
                      value={data[0]?.author_name}
                    />
                  </div>
                ) : null}
                {data[0]?.publisher ? (
                  <div className="col-lg-12">
                    <ReadOnlyField
                      label="Publisher"
                      value={data[0]?.publisher}
                    />
                  </div>
                ) : null}
                {data[0]?.book_type ? (
                  <div className="col-lg-12">
                    <ReadOnlyField label="Type" value={data[0]?.book_type} />
                  </div>
                ) : null}
                {data[0]?.isbn ? (
                  <div className="col-lg-12">
                    <ReadOnlyField label="ISBN" value={data[0]?.isbn} />
                  </div>
                ) : null}
              </div>
              {data[0]?.subject_name ? (
                <div className="col-lg-12 p-0">
                  <ReadOnlyField
                    label="Subject"
                    value={data[0]?.subject_name}
                  />
                </div>
              ) : null}
            </div>
            {bookTitle ? (
              <>
                <div className="subhead-row p-0 pt-1">
                  <div className="subhead">Access Number Details</div>
                  <div className="col line-div"></div>
                </div>
                <div className="row no-gutters mt-2">
                  <div className="col-lg-3"></div>
                  <div className="col-lg-6">
                    <div className="table-responsive">
                      <table className="table table-bordered m-0">
                        <thead>
                          <tr>
                            <th width="1%">No.</th>
                            <th>Access Number</th>
                            <th width="10%">Available</th>
                            <th width="5%">View Issue Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accessFromTitle.length == 0 ? (
                            <tr>
                              <td colspan={5} align="center">
                                Book not available in Library
                              </td>
                            </tr>
                          ) : (
                            accessFromTitle.map((item, index) => {
                              return (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>{item.access_number}</td>
                                  <td>{item.is_available ? "Yes" : "No"}</td>
                                  <td style={{ paddingRight: "25px" }}>
                                    <Button
                                      className={"btn-3"}
                                      text={"View"}
                                      isTable={true}
                                      type="button"
                                      onClick={(e) =>
                                        handleSelectAccess(
                                          item.access_number,
                                          1,
                                          1
                                        )
                                      }
                                    />
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
            <div id="currentBook"></div>
            {currentMember ? (
              <>
                <div className="subhead-row p-0 pt-1" id="currentBook">
                  <div className="subhead">Current Book Issue Details</div>
                  <div className="col line-div"></div>
                </div>
                <div className="row p-0">
                  <div className="col-lg-6 p-0">
                    <ReadOnlyField
                      label="Member Number"
                      title={true}
                      value={currentMember?.member_number}
                    />
                    <ReadOnlyField
                      label="Member Name"
                      value={currentMember?.member_name}
                    />
                    <ReadOnlyField
                      label="Department"
                      value={currentMember?.member_department}
                    />
                  </div>
                  <div className="col-lg-6">
                    <ReadOnlyField
                      label="Issue Date"
                      title={true}
                      value={moment(currentMember?.issue_date).format(
                        "DD-MM-YYYY"
                      )}
                    />
                    <ReadOnlyField
                      label="Expected Return Date"
                      value={moment(currentMember?.expected_return_date).format(
                        "DD-MM-YYYY"
                      )}
                    />
                    {delayinDays ? (
                      <ReadOnlyField
                        label="Delay in Days"
                        value={delayinDays}
                      />
                    ) : null}
                  </div>
                </div>
              </>
            ) : null}
            {previousMemberList.length > 0 ? (
              <div>
                <div className="subhead-row mt-3">
                  <div className="subhead">Book Issue History</div>
                  <div className="col line-div"></div>
                </div>
                <div className="row no-gutters mt-2 table-responsive">
                  <table className="table table-bordered report-table table-bordered">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th width="10%">Member Number</th>
                        <th width="20%">Member Name</th>
                        <th>Department</th>
                        <th width="5%">Issue Date</th>
                        <th width="5%">Return Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previousMemberList.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.member_number}</td>
                            <td>{item.member_name}</td>
                            <td>{item.member_department}</td>
                            <td>{item.issue_date}</td>
                            <td>{item.return_date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default FindBook;
