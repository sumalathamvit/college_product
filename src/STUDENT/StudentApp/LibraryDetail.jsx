import React, { useEffect, useState } from "react";
import { json, useLocation, useNavigate } from "react-router-dom";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import moment from "moment";
import { Tab, Tabs } from "react-bootstrap";

import academicApi from "../../api/AcademicApi";
import empApi from "../../api/EmployeeApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import EmployeeCard from "../../HRM/EmployeeCard";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import string from "../../string";
import ScreenTitle from "../../component/common/ScreenTitle";

function LibraryDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [employeeNo, setEmployeeNo] = useState("");
  const [employeeInfo, setEmployeeInfo] = useState();
  const [empCodeList, setEmpCodeList] = useState([]);
  const [bookIssueDetailArr, setBookIssueDetailArr] = useState([]);
  const [bookList, setBookList] = useState([]);
  const [bookListArr, setBookListArr] = useState([]);
  const [book, setBook] = useState("");
  const [returnedBookList, setReturnedBookList] = useState([]);

  const handleGetEmployeeDetails = async (employeeDetail) => {
    try {
      setLoad(true);
      setEmployeeInfo(employeeDetail);
      const aquiredbooks = await academicApi.aquiredbooks(
        employeeDetail.custom_employeeid
      );
      console.log("aquiredbooks", aquiredbooks);
      setBookIssueDetailArr(aquiredbooks.data.message);
      const returnBooks = await academicApi.returnBooks(
        employeeDetail.custom_employeeid
      );
      console.log("returnBooks", returnBooks);
      setReturnedBookList(returnBooks.data.message);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const employeeSearch = async (value) => {
    try {
      if (value.length > 2) {
        const employeeRes = await empApi.employeeSearch(value);
        console.log("employeeRes", employeeRes.data.message.employee_data[0]);
        setEmpCodeList(employeeRes.data.message.employee_data);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  const bookSearch = async (value) => {
    try {
      console.log("value", value);

      if (value.length > 2) {
        const bookRes = await academicApi.bookSearch(value);
        console.log("bookRes", bookRes);
        setBookList(bookRes.data.message);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  const getEmployee = async () => {
    console.log("--------", sessionStorage.getItem("ROLE"));
    if (sessionStorage.getItem("ROLE") === string.STAFF_ROLE) {
      const empDetail = JSON.parse(sessionStorage.getItem("EMPLOYEE_DETAIL"));
      console.log("empDetail--", empDetail);
      handleGetEmployeeDetails(empDetail);
    }
  };
  useEffect(() => {
    getEmployee();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="col-lg-12 mt-1">
          <div className="col-lg-9">
            <ReactSelectField
              label="Employee No. / Name"
              id="employeeNumber"
              mandatory={1}
              options={empCodeList}
              searchIcon={true}
              getOptionLabel={(option) =>
                option.custom_employeeid + " - " + option.employee_name
              }
              getOptionValue={(option) => option.name}
              onInputChange={(inputValue) => {
                employeeSearch(inputValue);
              }}
              onChange={(text) => {
                setEmployeeNo(text);
                handleGetEmployeeDetails(text);
              }}
            />
          </div>
          {/* )} */}
          {employeeInfo && (
            <>
              <div className="subhead-row">
                <div className="subhead">Employee Details</div>
                <div className="col line-div"></div>
              </div>

              {employeeInfo && <EmployeeCard employeeInfo={employeeInfo} />}

              <Tabs
                id="uncontrolled-tab-example"
                className="text-center mt-4 pt-2"
                fill
              >
                <Tab eventKey={1} title="Acquired">
                  <div className="row p-4">
                    <div className="row p-0">
                      <div className="p-0">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th width="5%">Access No</th>
                              <th>Main Title</th>
                              <th width="15%">Author Name</th>
                              <th width="15%">Subject Name</th>
                              <th width="10%">Issue Date</th>
                              <th width="5%">Return Date</th>
                              <th width="6%">Delay Days</th>
                              <th width="5%">Fine Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookIssueDetailArr.length === 0 ? (
                              <tr>
                                <td colspan={9} align="center">
                                  No data found
                                </td>
                              </tr>
                            ) : (
                              bookIssueDetailArr.map((item, index) => {
                                return (
                                  <tr>
                                    <td>{index + 1}</td>
                                    <td>{item.access_number}</td>
                                    <td>{item.main_title}</td>
                                    <td>{item.author_name}</td>
                                    <td>{item.subject_name}</td>
                                    <td>
                                      {moment(item.issue_date).format(
                                        "DD-MM-yyyy"
                                      )}
                                    </td>
                                    <td>
                                      {moment(item.return_date).format(
                                        "DD-MM-YYYY"
                                      )}
                                    </td>
                                    <td>{item.pending_days}</td>
                                    <td>{item.fine_amount}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </Tab>
                <Tab eventKey={2} title="Available">
                  <div className="row py-4">
                    <div className="col-lg-8 p-0">
                      <ReactSelectField
                        label="Book Name"
                        placeholder="Book Name"
                        id="book"
                        mandatory={1}
                        options={bookList}
                        searchIcon={true}
                        getOptionLabel={(option) =>
                          option.access_number + " - " + option.main_title
                        }
                        getOptionValue={(option) => option.access_number}
                        onInputChange={(inputValue) => {
                          bookSearch(inputValue);
                        }}
                        onChange={(text) => {
                          setBook(text);
                          setBookListArr(text);
                        }}
                      />
                      {book ? (
                        <>
                          <div className="row mt-2">
                            <label className="text-right col-lg-5">
                              Access No :
                            </label>
                            <div className=" col-lg-7 ps-1">
                              {bookListArr?.access_number}
                            </div>
                          </div>
                          <div className="row mt-2">
                            <label className="text-right col-lg-5">
                              Main Title :
                            </label>
                            <div className=" col-lg-7 ps-1">
                              {bookListArr?.main_title}
                            </div>
                          </div>
                          <div className="row mt-2">
                            <label className="text-right col-lg-5">
                              Author Name :
                            </label>
                            <div className=" col-lg-7 ps-1">
                              {bookListArr?.author_name}
                            </div>
                          </div>
                          <div className="row mt-2">
                            <label className="text-right col-lg-5">
                              Subject Name :
                            </label>
                            <div className=" col-lg-7 ps-1">
                              {bookListArr?.subject_name}
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </Tab>
                <Tab eventKey={3} title="History">
                  <div className="row p-4">
                    <div className="row p-0">
                      <div className="p-0">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th width="5%">Access No</th>
                              <th>Main Title</th>
                              <th width="20%">Author Name</th>
                              <th width="20%">Subject Name</th>
                              <th width="10%">Issue Date</th>
                              <th width="10%">Return Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {returnedBookList.length === 0 ? (
                              <tr>
                                <td colspan={9} align="center">
                                  No data found
                                </td>
                              </tr>
                            ) : (
                              returnedBookList.map((item, index) => {
                                return (
                                  <tr>
                                    <td>{index + 1}</td>
                                    <td>{item.access_number}</td>
                                    <td>{item.main_title}</td>
                                    <td>{item.author_name}</td>
                                    <td>{item.subject_name}</td>
                                    <td>
                                      {moment(item.issue_date).format(
                                        "DD-MM-yyyy"
                                      )}
                                    </td>
                                    <td>
                                      {moment(item.return_date).format(
                                        "DD-MM-YYYY"
                                      )}
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
                </Tab>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LibraryDetail;
