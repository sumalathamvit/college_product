import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { timePickerList } from "../component/common/CommonArray";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import CustomTextInput from "../component/common/CustomTextInput";
import ErrorMessage from "../component/common/ErrorMessage";
import ShowMessage from "../component/common/ShowMessage";
import blankProfile from "../assests/png/blank-profile-picture.png";
import empApi from "../api/EmployeeApi";
import moment from "moment";
import string from "../string";
import Select from "../component/common/select";
import { toast } from "react-toastify";

function Shift() {
  const navigate = useNavigate();

  const [load, setLoad] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [shiftCodeError, setShiftCodeError] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [leaveTypeError, setLeaveTypeError] = useState(false);
  const [fromDateError, setFromDateError] = useState(false);
  const [toDateError, setToDateError] = useState(false);
  const [shiftCode, setShiftCode] = useState("");
  const [message, setMessage] = useState("");
  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [leaveAllocationArr, setLeaveAllocationArr] = useState([]);
  const [empDetail, setEmpDetail] = useState([]);
  const [librarySettingTotalCount, setLibrarySettingTotalCount] = useState(0);
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [halfDayDate, setHalfDayDate] = useState();
  const [halfDayDateError, setHalfDayDateError] = useState(false);

  const [displayImage, setDisplayImage] = useState(blankProfile);
  const [morningOff, setMorningOff] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveReasonError, setLeaveReasonError] = useState(false);
  const [days, setDays] = useState();
  const [inTime, setInTime] = useState();
  const [outTime, setOutTime] = useState();
  const [lunchInTime, setLunchInTime] = useState();
  const [lunchOutTime, setLunchOutTime] = useState();
  const date = new Date();
  const years = preFunction.range(
    date.getFullYear() - 1,
    date.getFullYear() + 1,
    1
  );

  const closeErrors = () => {
    setShiftCodeError(false);
    setLeaveReasonError(false);
    setLeaveTypeError(false);
    setFromDateError(false);
    setToDateError(false);
  };

  const handleSubmit = async () => {
    if (load) return;
    let err = false;
    closeErrors();
    if (shiftCode == "") {
      err = true;
      setShiftCodeError(true);
      document.getElementById("shiftCode")?.focus();
    }
    // if (leaveReason == "") {
    //   err = true;
    //   setLeaveReasonError(true);
    // }
    if (err) return;
    try {
      setLoad(true);
      for (let i = 0; i < leaveAllocationArr.length; i++) {
        const addBookIssueRes = await empApi.addLeaveEntry(
          shiftCode.value,
          leaveAllocationArr[i].leave_type,
          moment(leaveAllocationArr[i].from_date).format("YYYY-MM-DD"),
          moment(leaveAllocationArr[i].to_date).format("YYYY-MM-DD"),
          leaveAllocationArr[i].morning_off,
          leaveReason,
          moment(leaveAllocationArr[i].half_day_date).format("YYYY-MM-DD")
        );
        console.log("addBookIssueRes----", addBookIssueRes);
      }
      toast.success("Leave Entry Added Successfully");

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async () => {
    try {
      const leaveType = await empApi.getLeaveType();
      console.log("leaveType---", leaveType);
      setLeaveTypeList(leaveType.data.data);
    } catch (error) {
      console.log("error----", error);
    }
  };

  useEffect(() => {
    getAllList();
  }, []);

  return (
    <div className="col-lg-10">
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row mb-4" onClick={preFunction.hideNavbar}>
        <div className="pd mb-4">
          <div className="row">
            <div className="col-lg-2"></div>
            <div className="bg-white pb-5 col-lg-8">
              <div className="row">
                <h4 className="text-center mt-4">Shift</h4>
              </div>
              <ShowMessage Message={message} view={showMessage} />
              <div className="row">
                <div className="row mt-2">
                  <label className="control-label col-lg-5">Shift Code :</label>
                  <div className="col-lg-4 ps-1">
                    <CustomTextInput
                      type="text"
                      name="shiftCode"
                      id="shiftCode"
                      className="form-control non-mandatory-input"
                      value={shiftCode}
                      onChange={(e) => {
                        setShiftCode(e.target.value);
                      }}
                      placeholder="Shift Code"
                    />
                    <ErrorMessage
                      Message={"Please enter Shift Code"}
                      view={shiftCodeError}
                    />
                  </div>
                </div>
                <div className="row mt-3">
                  <label className="control-label col-lg-5">In Time :</label>
                  <div className="col-lg-2 ps-1">
                    <Select
                      name="inTime"
                      id="inTime"
                      className={
                        inTime
                          ? "form-control select-control"
                          : "form-control select-control opacity"
                      }
                      options={timePickerList}
                      value={inTime}
                      onChange={(e) => {
                        //   setShowFromTime(false);
                        setInTime(e.target.value);
                      }}
                      // onClick={() => setOpen1(false)}
                      placeholder="In Time"
                    />
                    {/* <ErrorMessage
                                error={"Please select From Time"}
                                visible={showFromTime}
                              /> */}
                  </div>
                </div>
                <div className="row mt-3">
                  <label className="control-label col-lg-5">Lunch Out :</label>
                  <div className="col-lg-2 ps-1">
                    <Select
                      name="outTime"
                      id="outTime"
                      className={
                        outTime
                          ? "form-control select-control"
                          : "form-control select-control opacity"
                      }
                      options={timePickerList}
                      value={outTime}
                      onChange={(e) => {
                        //   setShowFromTime(false);
                        setOutTime(e.target.value);
                      }}
                      // onClick={() => setOpen1(false)}
                      placeholder="Lunch Out"
                    />
                    {/* <ErrorMessage
                                error={"Please select From Time"}
                                visible={showFromTime}
                              /> */}
                  </div>
                </div>
                <div className="row mt-3">
                  <label className="control-label col-lg-5">Lunch In :</label>
                  <div className="col-lg-2 ps-1">
                    <Select
                      name="lunchInTime"
                      id="lunchInTime"
                      className={
                        lunchInTime
                          ? "form-control select-control"
                          : "form-control select-control opacity"
                      }
                      options={timePickerList}
                      value={lunchInTime}
                      onChange={(e) => {
                        //   setShowFromTime(false);
                        setLunchInTime(e.target.value);
                      }}
                      // onClick={() => setOpen1(false)}
                      placeholder="Lunch In"
                    />
                    {/* <ErrorMessage
                                error={"Please select From Time"}
                                visible={showFromTime}
                              /> */}
                  </div>
                </div>
                <div className="row mt-3">
                  <label className="control-label col-lg-5">Out Time :</label>
                  <div className="col-lg-2 ps-1">
                    <Select
                      name="lunchOutTime"
                      id="lunchOutTime"
                      className={
                        lunchOutTime
                          ? "form-control select-control"
                          : "form-control select-control opacity"
                      }
                      options={timePickerList}
                      value={lunchOutTime}
                      onChange={(e) => {
                        //   setShowFromTime(false);
                        setLunchOutTime(e.target.value);
                      }}
                      // onClick={() => setOpen1(false)}
                      placeholder="Out Time"
                    />
                    {/* <ErrorMessage
                                error={"Please select From Time"}
                                visible={showFromTime}
                              /> */}
                  </div>
                </div>
                <div className="row mt-3">
                  <label className="control-label col-lg-5"></label>
                  <div className="col-2 ps-1">
                    <div className="form-group col-lg-6">
                      <button
                        className="btn"
                        title="Save"
                        onClick={(e) => {
                          handleSubmit();
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shift;
