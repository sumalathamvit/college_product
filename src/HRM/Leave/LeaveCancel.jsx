import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import HeadingIcon from "@mui/icons-material/DateRange";
import { useSelector } from "react-redux";

import empApi from "../../api/EmployeeApi";

import Button from "../../component/FormField/Button";
import CustomTextInput from "../../component/common/CustomTextInput";
import DateField from "../../component/FormField/DateField";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import TextAreaField from "../../component/FormField/TextareaField";
import ErrorMessage from "../../component/common/ErrorMessage";
import ModalComponent from "../../component/ModalComponent";

import AuthContext from "../../auth/context";
import EmployeeCard from "../EmployeeCard";
import ScreenTitle from "../../component/common/ScreenTitle";
import storage from "../../auth/storage";

function LeaveCancel() {
  const [load, setLoad] = useState(false);
  const [reasonError, setReasonError] = useState(false);
  const [empCode, setEmpCode] = useState("");
  const [empCodeList, setEmpCodeList] = useState([]);
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState(moment().subtract(1, "months"));
  const [toDate, setToDate] = useState(moment());
  const [fromDateError, setFromDateError] = useState(false);
  const [fromDateErrorMessage, setFromDateErrorMessage] = useState("");
  const [toDateError, setToDateError] = useState(false);
  const [toDateErrorMessage, setToDateErrorMessage] = useState("");

  const [leaveArr, setLeaveArr] = useState([]);
  const [checkIndex, setCheckIndex] = useState(-1);
  const [employeeInfo, setEmployeeInfo] = useState();
  const [leaveCancelError, setLeaveCancelError] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [salaryDate, setSalaryDate] = useState("2024-05-05");
  const collegeConfig = useSelector((state) => state.web.college);

  const { setUnSavedChanges } = useContext(AuthContext);

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
    setReasonError(false);
    setLeaveCancelError(false);
  };

  const handleShow = async () => {
    if (load) return;
    setLeaveArr([]);
    closeErrors();

    //get payroll date from config
    const instituteArr = storage.getInstituteArray();
    let pDate = "";
    instituteArr.map((item) => {
      if (item.name == empCode.company) {
        pDate = item.PAYROLL_DATE;
      }
    });

    const PAYROLL_DATE = moment(pDate, "DD-MM-yyyy");
    let err = false;

    if (!toDate) {
      setToDateError(true);
      setToDateErrorMessage("Please select To Date");
      document.getElementById("toDate")?.focus();
      err = true;
    }
    if (!fromDate) {
      setFromDateError(true);
      setFromDateErrorMessage("Please select From Date");
      document.getElementById("fromDate")?.focus();
      err = true;
    }
    if (fromDate && toDate) {
      if (moment(fromDate).isBefore(PAYROLL_DATE)) {
        setFromDateError(true);
        setFromDateErrorMessage(
          "Please choose after " + moment(PAYROLL_DATE).format("DD-MM-YYYY")
        );
        document.getElementById("fromDate")?.focus();
        err = true;
      }
      if (moment(toDate).isBefore(PAYROLL_DATE)) {
        setToDateError(true);
        setToDateErrorMessage(
          "Please choose after " + moment(PAYROLL_DATE).format("DD-MM-YYYY")
        );
        document.getElementById("toDate")?.focus();
        err = true;
      }
      if (moment(fromDate).isAfter(toDate)) {
        setToDateError(true);
        setToDateErrorMessage("To Date should be greater than From Date");
        document.getElementById("toDate")?.focus();
        err = true;
      }
    }
    if (err) return;

    try {
      setLoad(true);
      const leaveApplication = await empApi.getLeaveApplication(
        moment(fromDate).format("YYYY-MM-DD"),
        moment(toDate).format("YYYY-MM-DD"),
        empCode.name
      );
      console.log("leaveApplicationDetail", leaveApplication.data.data);
      if (leaveApplication.data.data.length == 0) {
        setModalMessage("No Leave found");
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      } else {
        setLeaveArr(leaveApplication.data.data);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleSubmit = async () => {
    if (load) return;
    closeErrors();
    let err = false;

    if (checkIndex < 0) {
      setLeaveCancelError(true);
      err = true;
    }

    if (reason === "") {
      document.getElementById("reason")?.focus();
      setReasonError(true);
      err = true;
    }

    if (err) return;
    try {
      console.log("checkIndex---", checkIndex);

      setLoad(true);
      const editLeaveApplication = await empApi.cancelLeaveApplication(
        leaveArr[checkIndex].name,
        reason
      );
      console.log("editLeaveApplication", editLeaveApplication);

      const fiterAttendence = await empApi.fiterAttendence(
        leaveArr[checkIndex].name
      );
      for (let j = 0; j < fiterAttendence.data.data.length; j++) {
        const cancelAttendance = await empApi.cancelDoctype(
          "Attendance",
          fiterAttendence.data.data[j].name
        );
        console.log("report", cancelAttendance);
      }
      const cancelLeaveApplication = await empApi.cancelDoctype(
        "Leave Application",
        leaveArr[checkIndex].name
      );
      console.log("cancelLeaveApplication", cancelLeaveApplication);

      handleUnSavedChanges(0);
      toast.success("Leave Cancelled Successfully");

      setEmpCode("");
      setFromDate(moment().subtract(1, "weeks"));
      setToDate(moment());
      setEmployeeInfo("");
      setLeaveArr([]);
      setReason("");

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const employeeSearch = async (value) => {
    setEmpCodeList([]);
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

  const handleEmployeeChange = (text) => {
    setEmpCode(text);
    setEmployeeInfo(text);
    closeErrors();
    handleUnSavedChanges(0);
    setCheckIndex(-1);
    setReason("");
    setFromDate(moment().subtract(1, "months"));
    setToDate(moment());
    setLeaveArr([]);
  };
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
        <div className=" col-lg-9">
          <ReactSelectField
            autoFocus
            label="Employee No. / Name"
            id="empCode"
            style={{ width: "70%" }}
            mandatory={1}
            labelSize={3}
            tabIndex={1}
            value={empCode}
            search={true}
            clear={true}
            options={empCodeList}
            getOptionLabel={(option) =>
              option.custom_employeeid + " - " + option.employee_name
            }
            getOptionValue={(option) => option.name}
            onInputChange={(inputValue) => {
              employeeSearch(inputValue);
            }}
            onChange={(text) => {
              handleEmployeeChange(text);
            }}
          />
        </div>
        {empCode ? (
          <>
            <div className="subhead-row">
              <div className="subhead">Employee Details</div>
              <div className="col line-div"></div>
            </div>

            {employeeInfo && <EmployeeCard employeeInfo={employeeInfo} />}

            <div className="col-lg-9 mt-3">
              <DateField
                label="From Date"
                id="fromDate"
                labelSize={3}
                maxDate={null}
                minDate={null}
                mandatory={1}
                tabIndex={2}
                style={{ width: "30%" }}
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  handleUnSavedChanges(1);
                  setLeaveArr([]);
                  setFromDateError(false);
                }}
                error={fromDateError ? fromDateErrorMessage : ""}
                touched={fromDateError ? true : false}
              />

              <DateField
                label="To Date"
                id="toDate"
                labelSize={3}
                tabIndex={3}
                style={{ width: "30%" }}
                maxDate={null}
                minDate={null}
                mandatory={1}
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  handleUnSavedChanges(1);
                  setLeaveArr([]);
                  setToDateError(false);
                }}
                error={toDateError ? toDateErrorMessage : ""}
                touched={toDateError ? true : false}
              />
            </div>
            {leaveArr.length === 0 ? (
              <Button
                isTable={true}
                text={"Show"}
                tabIndex={4}
                type="submit"
                onClick={(e) => {
                  handleShow();
                }}
              />
            ) : null}
          </>
        ) : null}
        {leaveArr.length > 0 ? (
          <>
            <div className="subhead-row">
              <div className="subhead">Applied Leave Details</div>
              <div className="col line-div"></div>
            </div>
            <div className="table-responsive row mt-1 p-0">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th width="1%">No.</th>
                    <th width="10%">From Date</th>
                    <th width="10%">To Date</th>
                    {/* <th width="5%">Half Day</th> */}
                    <th>Leave Type</th>
                    <th width="5%">Approved Leave</th>
                    <th width="5%">Cancel</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveArr.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{moment(item.from_date).format("DD-MM-YYYY")}</td>
                        <td>{moment(item.to_date).format("DD-MM-YYYY")}</td>
                        {/* <td className="text-center">
                          <CustomTextInput
                            type="checkbox"
                            checked={item.half_day ? "Checked" : ""}
                            disabled
                          />
                        </td> */}
                        <td>{item.leave_type}</td>
                        <td align="right">{item.total_leave_days}</td>
                        <td className="text-center">
                          <CustomTextInput
                            name="cancel"
                            type="radio"
                            onChange={(e) => {
                              console.log("-----", e.target.checked);
                              leaveArr[index] = {
                                ...leaveArr[index],
                                check: !leaveArr[index].check,
                              };
                              setCheckIndex(index);
                              setLeaveCancelError(false);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ErrorMessage
              Message={"Please choose atleast one Leave"}
              view={leaveCancelError}
            />
            <div className="col-lg-9">
              <TextAreaField
                tabIndex={5}
                id="reason"
                name="reason"
                label="Reason"
                value={reason}
                labelSize={3}
                mandatory={1}
                onChange={(e) => {
                  closeErrors();
                  setReason(e.target.value);
                }}
                style={{ width: "70%" }}
                maxlength={140}
                placeholder="Note"
                error={reasonError ? "Please enter Reason" : ""}
                touched={reasonError ? true : false}
              />
            </div>
            <Button
              tabIndex={6}
              id="save"
              text="F4 - Save"
              type="submit"
              onClick={(e) => {
                handleSubmit();
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default LeaveCancel;
