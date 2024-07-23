import React, { useEffect, useState, useContext } from "react";
import moment from "moment";
import { toast } from "react-toastify";

import libraryapi from "../api/libraryapi";
import empApi from "../api/EmployeeApi";

import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import EmployeeCard from "../HRM/EmployeeCard";
import ErrorMessage from "../component/common/ErrorMessage";
import preFunction from "../component/common/CommonFunction";
import ReadOnlyField from "../component/ReadOnlyField";
import TextField from "../component/FormFieldLibrary/TextField";
import StudentCard from "../component/StudentCard";
import ScreenTitle from "../component/common/ScreenTitle";
import AuthContext from "../auth/context";

function BookReturn() {
  const [load, setLoad] = useState(false);
  const [accessNumber, setAccessNumber] = useState("");
  const [studDetail, setStudDetail] = useState("");
  const [accessNoDetail, setAccessNoDetail] = useState([]);
  const [delayinDays, setDelayinDays] = useState(0);
  const [fineAmount, setFineAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [accessNoError, setAccessNoError] = useState(false);
  const [bookRenewal, setBookRenewal] = useState(0);
  const [paidAmountError, setPaidamountError] = useState(false);
  const [nochange, setNoChange] = useState(false);
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);

  const handleUnSavedChanges = (changed) => {
    console.log("changed", changed);
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleSave = async (renewal) => {
    if (load) return;
    console.log("renewal", renewal);
    if (fineAmount && !paidAmount) {
      setPaidamountError(true);
      return;
    }
    try {
      setLoad(true);
      console.log(
        "issueId---",
        accessNoDetail.name,
        moment(accessNoDetail.expected_return_date)
          .add(accessNoDetail.due_day, "days")
          .format("YYYY-MM-DD")
      );
      const bookReturn = await libraryapi.editBookIssue(
        accessNoDetail.name,
        renewal
          ? moment(accessNoDetail.expected_return_date)
              .add(accessNoDetail.due_day, "days")
              .format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
        renewal ? renewal : accessNoDetail.is_renewal,
        renewal ? 0 : 1
      );
      console.log("bookReturn---", bookReturn);
      if (bookReturn.ok) {
        updateAccessNumber(bookReturn.data.data.access_number, renewal);
        handleUnSavedChanges(0);
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const updateAccessNumber = async (value, renewal) => {
    try {
      setLoad(true);
      console.log("value---", value, renewal);
      if (renewal == 0) {
        const updateAccessNumber = await libraryapi.updateAccessnumber(value);
        console.log("updateAccessNumber---", updateAccessNumber);
        if (fineAmount != 0) {
          const bookIssueFineAmount = await libraryapi.addBookIssueFineAmount(
            accessNoDetail.name,
            fineAmount,
            paidAmount,
            moment().format("YYYY-MM-DD")
          );
          console.log("fineAmount---", bookIssueFineAmount);
        }
      }
      handleUnSavedChanges(0);
      if (renewal) toast.success("Book Renewed Successfully");
      else toast.success("Book Returned Successfully");
      setAccessNumber("");
      handleClear();
      document.getElementById("accessNumber")?.focus();
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleSelectAccess = async (value) => {
    if (!nochange) {
      document.getElementById("accessNumber")?.select();
      return;
    }
    handleUnSavedChanges(0);
    setAccessNoDetail([]);
    if (value == "") {
      document.getElementById("accessNumber")?.focus();
      setAccessNoError(true);
      handleUnSavedChanges(0);
      return;
    }
    try {
      // if (value == "") return;
      setLoad(true);
      console.log("value---", value);
      setAccessNoError(false);
      const getAccessNoDetail = await libraryapi.getAccessNoDetail(value);
      console.log("getAccessNoDetail", getAccessNoDetail);
      if (getAccessNoDetail.data.message.length > 0) {
        handleUnSavedChanges(1);
        setAccessNoDetail(getAccessNoDetail.data.message[0]);
      }
      setNoChange(false);
      if (getAccessNoDetail.data.message.length === 0) {
        setAccessNoError(true);
      } else {
        getStudentorEmployeeDetails(getAccessNoDetail.data.message[0]);
        calculateFineAndDelayDay(getAccessNoDetail.data.message[0]);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getStudentorEmployeeDetails = async (memberDetail) => {
    try {
      setLoad(true);
      setStudDetail("");
      console.log(
        "memberDetail",
        memberDetail,
        memberDetail.member_type.includes("Staff")
      );

      if (memberDetail.member_type.includes("Staff")) {
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

  const calculateFineAndDelayDay = async (accessNoDetail) => {
    let delayDays = 0;
    if (
      moment(accessNoDetail.expected_return_date).format("YYYY-MM-DD") <
      moment().format("YYYY-MM-DD")
    ) {
      delayDays = Math.abs(
        Math.ceil(
          (new Date(accessNoDetail.expected_return_date).getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      console.log("delayDays", delayDays);
    } else {
      if (accessNoDetail.member_status == "Open") {
        setBookRenewal(!accessNoDetail.is_renewal);
      }
    }
    if (delayDays) {
      let fineAmountRes = delayDays * accessNoDetail.fine_amount;
      console.log("fineAmountRes", fineAmountRes);
      setDelayinDays(delayDays);
      setFineAmount(fineAmountRes);
      setPaidAmount(fineAmountRes);
    }
  };

  const handleClear = () => {
    setStudDetail("");
    setAccessNoDetail([]);
    setDelayinDays(0);
    setFineAmount(0);
    setPaidAmount(0);
    setAccessNoError(false);
    setBookRenewal(0);
    setPaidamountError(false);
  };
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
          <div className="row p-0">
            <div className="col-lg-2 p-0 pe-2">
              <TextField
                autoFocus
                label="Access Number"
                placeholder=""
                id="accessNumber"
                value={accessNumber}
                mandatory={1}
                maxlength={6}
                onChange={(e) => {
                  if (!isNaN(e.target.value) && !e.target.value.includes(" ")) {
                    setAccessNumber(e.target.value);
                  }
                  if (!e.target.value || e.target.value == "") {
                    handleUnSavedChanges(0);
                  }
                  handleClear(e.target.value);
                  setNoChange(true);
                }}
                onKeyUp={(e) => {
                  if (e.keyCode == 13) {
                    handleSelectAccess(e.target.value);
                  }
                }}
                error={
                  accessNoError && accessNumber == ""
                    ? "Please enter Access Number"
                    : accessNoError
                    ? "Please enter valid Access Number"
                    : ""
                }
                touched={accessNoError ? true : false}
              />
            </div>

            {/* <div className="col-lg-2 ps-2">
              <Button
                type="button"
                label={true}
                isTable={true}
                isCenter={false}
                onClick={() => {
                  handleSelectAccess(accessNumber ? accessNumber : "");
                }}
                text="Search"
              />
            </div> */}
            <div className="col-lg-10 text-right mt-4 pt-2 p-0">
              {bookRenewal ? (
                <Button
                  type="button"
                  id="renew"
                  frmButton={false}
                  text={"Renew"}
                  onClick={(e) => {
                    handleSave(1);
                  }}
                />
              ) : null}
            </div>
          </div>
          {accessNoDetail && studDetail && (
            <>
              {accessNoDetail &&
              accessNoDetail?.member_type.includes("Staff") ? (
                <div className="mb-2 mt-1">
                  <div className="subhead-row">
                    <div className="subhead">Employee Details</div>
                    <div className="col line-div"></div>
                  </div>

                  {studDetail && <EmployeeCard employeeInfo={studDetail} />}
                </div>
              ) : (
                <div className="mb-2 mt-1">
                  <div className="subhead-row">
                    <div className="subhead">Student Details</div>
                    <div className="col line-div"></div>
                  </div>

                  {studDetail && <StudentCard studentInfo={studDetail} />}
                </div>
              )}
            </>
          )}
          {accessNoDetail && studDetail ? (
            <>
              <table className="table table-bordered mb-1 mt-2">
                <thead>
                  <tr>
                    <th width="1%">No.</th>
                    <th>Title</th>
                    <th width="10%">Issue Date</th>
                    <th width="10%">Expected Return Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{1}</td>
                    <td>{accessNoDetail?.main_title}</td>
                    <td>
                      {moment(accessNoDetail?.issue_date).format("DD-MM-yyyy")}
                    </td>
                    <td>
                      {moment(accessNoDetail?.expected_return_date).format(
                        "DD-MM-YYYY"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {fineAmount && delayinDays ? (
                <div className="row no-gutters">
                  <div className="subhead-row">
                    <div className="subhead">Fine Details</div>
                    <div className="col line-div"></div>
                  </div>
                  <div className="col-lg-2 pe-2">
                    <ReadOnlyField
                      label="Delay in Days"
                      title="true"
                      // bookReturn={true}
                      value={delayinDays}
                    />
                  </div>
                  <div className="col-lg-2 ps-2 pe-2">
                    <ReadOnlyField
                      label="Fine Amount (₹) "
                      title="true"
                      // bookReturn={true}
                      value={fineAmount}
                    />
                  </div>
                  <div className="col-lg-3 ps-2">
                    <TextField
                      autoFocus
                      title={true}
                      placeholder="Paid Amount"
                      id="paidAmount"
                      label="Paid Amount (₹)"
                      value={paidAmount}
                      style={{ width: "50%" }}
                      onChange={(e) => {
                        setPaidAmount(e.target.value.slice(0, 3));
                        setPaidamountError(false);
                      }}
                      maxlength={3}
                      mandatory={1}
                    />
                    <ErrorMessage
                      Message={"Please enter Paid Amount"}
                      view={paidAmountError}
                    />
                  </div>
                </div>
              ) : null}
              {studDetail ? (
                <div className="col-lg-12 p-0">
                  <Button
                    autoFocus={fineAmount ? false : true}
                    type="button"
                    id="return"
                    // className={!bookRenewal ? "btn mt-3" : ""}
                    text={"Return"}
                    onClick={(e) => {
                      handleSave(0);
                    }}
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default BookReturn;
