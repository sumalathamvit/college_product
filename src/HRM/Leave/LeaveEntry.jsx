import React, { useEffect, useState, useContext, useRef } from "react";
import HeadingIcon from "@mui/icons-material/DateRange";
import moment from "moment";
import { toast } from "react-toastify";
import { Formik } from "formik";
import * as Yup from "yup";

import empApi from "../../api/EmployeeApi";
import attendanceapi from "../../api/attendanceapi";

import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import ErrorMessage from "../../component/common/ErrorMessage";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import DisplayText from "../../component/FormField/DisplayText";
import ModalComponent from "../../component/ModalComponent";

import AuthContext from "../../auth/context";
import EmployeeCard from "../EmployeeCard";
import CheckboxField from "../../component/FormField/CheckboxField";
import { useSelector } from "react-redux";
import ScreenTitle from "../../component/common/ScreenTitle";
import storage from "../../auth/storage";

function LeaveEntry() {
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [toDateError, setToDateError] = useState(false);
  const [toDateErrorMessage, setToDateErrorMessage] = useState("");
  const [empCodeList, setEmpCodeList] = useState([]);
  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [allocatedLeave, setAllocatedLeave] = useState([]);

  const [fromDateOff, setFromDateOff] = useState(false);
  const [toDateOff, setToDateOff] = useState(false);
  const [historyArr, setHisroryArr] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState();
  const [showError, setShowError] = useState(false);
  const [reasonlist, setReasonlist] = useState([]);
  // const [validateError, setValidateError] = useState(false);
  const [attendanceArr, setAttendanceArr] = useState([]);
  const [day, setDay] = useState(0);
  const [otherReason, setOtherReason] = useState("");
  const [otherReasonError, setOtherReasonError] = useState(false);
  const [reason, setReason] = useState("");

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { collegeId, setUnSavedChanges } = useContext(AuthContext);
  const [formSchema, setFormSchema] = useState();
  const collegeConfig = useSelector((state) => state.web.college);

  const institueArr = storage.getInstituteArray();

  const handleSchema = (PAYROLL_DATE) => {
    if (PAYROLL_DATE == "") return;
    console.log("PAYROLL_DATE--", PAYROLL_DATE);

    let schema = Yup.object().shape({
      leaveType: Yup.object().required("Please select Leave Type"),
      fromDate: Yup.date()
        .min(
          moment(PAYROLL_DATE).add(1, "days"),
          `From Date must be after ${moment(PAYROLL_DATE).format("DD-MM-YYYY")}`
        )
        .max(
          moment().add(2, "months").toDate(),
          `From Date must be before ${moment()
            .add(2, "months")
            .format("DD-MM-YYYY")}`
        )
        .required("Please select From Date"),
      toDate: Yup.date()
        .min(
          moment(PAYROLL_DATE).add(1, "days"),
          `To Date must be after ${moment(PAYROLL_DATE).format("DD-MM-YYYY")}`
        )
        .max(
          moment().add(2, "months").toDate(),
          `To Date must be before ${moment()
            .add(2, "months")
            .format("DD-MM-YYYY")}`
        )
        .required("Please select To Date"),
      reason: Yup.object().required("Please enter Reason"),
      otherReason:
        reason?.value == "Other Reason"
          ? Yup.object().required("Please enter Other Reason")
          : Yup.mixed().notRequired(),
    });
    setFormSchema(schema);
  };

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const handleSubmit = async (values) => {
    if (load) return;

    if (moment(values.fromDate).isAfter(values.toDate)) {
      setToDateError(true);
      setToDateErrorMessage("To Date should be greater than From Date");
      return;
    }

    if (day == 0) {
      setToDateError(true);
      setToDateErrorMessage(
        "The given dates are Holiday. Please change the Dates."
      );
      return;
    }
    try {
      setLoad(true);

      if (values.leaveType.value != "Leave Without Pay") {
        const leaveAllocationRes = await empApi.checkLeave(
          values.employeeNumber.name,
          values.leaveType.value
        );
        console.log("leaveAllocationRes---", leaveAllocationRes);
        let tourBalance = leaveAllocationRes.data.data;

        if (
          !moment(values.fromDate).isBetween(
            moment(tourBalance[0].from_date),
            moment(tourBalance[0].to_date)
          ) ||
          !moment(values.toDate).isBetween(
            moment(tourBalance[0].from_date),
            moment(tourBalance[0].to_date)
          )
        ) {
          setModalMessage(
            "Please choose the date between " +
              moment(tourBalance[0].from_date).format("DD-MM-YYYY") +
              " and " +
              moment(tourBalance[0].to_date).format("DD-MM-YYYY")
          );
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
      } else {
        if (
          moment(values.fromDate).isBefore(
            moment(employeeInfo?.date_of_joining)
          )
        ) {
          setModalMessage(
            `Please choose after the date of joining ${moment(
              employeeInfo?.date_of_joining
            ).format("DD-MM-YYYY")}`
          );
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
      }

      console.log("employeeNumber---", values.employeeNumber.name);
      const attendanceRes = await empApi.getAttendanceByEmployee(
        values.employeeNumber.name,
        moment(values.fromDate).format("YYYY-MM-DD"),
        moment(values.toDate).format("YYYY-MM-DD")
      );
      console.log("attendanceRes---", attendanceRes);
      var availAttendance = [];
      var halfDayAttendance = [];
      if (attendanceRes.data.data.length > 0) {
        for (let k = 0; k < attendanceRes.data.data.length; k++) {
          console.log(
            "attendanceRes.data.data[k]---",
            attendanceRes.data.data[k]
          );
          if (attendanceRes.data.data[k].status == "Half Day") {
            halfDayAttendance.push(attendanceRes.data.data[k]);
          } else {
            availAttendance.push(
              moment(attendanceRes.data.data[k].attendance_date).format(
                "DD-MM-YYYY"
              )
            );
          }
        }
      }
      console.log("availAttendance", availAttendance);
      console.log("halfDayAttendance", halfDayAttendance);

      setAttendanceArr([]);
      if (availAttendance.length > 0) {
        var presentArr = availAttendance.join(", ");
        setAttendanceArr(presentArr);
        setModalMessage(
          availAttendance.length == 1
            ? "Attendance for this Date " +
                presentArr +
                " is already marked. Please change date"
            : "Attendance for Dates " +
                presentArr +
                " are already marked. Please change dates"
        );
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      let array = [];
      for (
        let m = moment(values.fromDate);
        m.isBefore(moment(values.toDate).add(1, "days"));
        m.add(1, "days")
      ) {
        array.push(m.format("YYYY-MM-DD"));
      }
      console.log("array", array);

      const permissionSameDay = await empApi.checkPermissionSameDay(
        values.employeeNumber.name,
        array
      );
      console.log("permissionSameDay---", permissionSameDay);

      if (permissionSameDay.data.data.length > 0) {
        let dates = [];
        permissionSameDay.data.data.map((item) => {
          dates.push(moment(item.date).format("DD-MM-yyyy"));
        });

        setModalMessage("Permission already entered on  " + dates);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      // setLoad(false);
      // return;

      const addLeaveRes = await empApi.addLeaveEntry(
        values.employeeNumber.name,
        values.leaveType.value,
        moment(values.fromDate).format("YYYY-MM-DD"),
        moment(values.toDate).format("YYYY-MM-DD"),
        fromDateOff ? fromDateOff : toDateOff ? toDateOff : false,
        values.reason.value == "Other Reason"
          ? otherReason
          : values.reason.value,
        fromDateOff
          ? moment(values.fromDate).format("YYYY-MM-DD")
          : toDateOff
          ? moment(values.toDate).format("YYYY-MM-DD")
          : null
      );
      console.log("addLeaveRes----", addLeaveRes);
      if (!addLeaveRes.ok) {
        setLoad(false);
        setModalMessage(
          JSON.parse(
            JSON.parse(addLeaveRes.data._server_messages)[0]
          ).message.split("<Br>")[0]
        );
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      //Process of Half Day process after attendance processed
      halfDayAttendance.map(async (item) => {
        console.log("item---", item);
        const ERPBulkcancelRes = await attendanceapi.ERPBulkcancel(
          "Attendance",
          [item.name]
        );
        console.log("ERPBulkcancelRes---", ERPBulkcancelRes);
        if (!ERPBulkcancelRes.ok) {
          setLoad(false);
          setModalMessage(
            JSON.parse(
              JSON.parse(ERPBulkcancelRes.data._server_messages)[0]
            ).message.split("<Br>")[0]
          );
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
        const addAttendanceWithLeaveTypeRes =
          await attendanceapi.addAttendanceWithLeaveType(
            item.employee,
            item.attendance_date,
            item.in_time,
            item.out_time,
            item.working_hours,
            "Half Day",
            item.shift,
            item.late_entry,
            item.early_exit,
            item.custom_short_excess,
            addLeaveRes.data.data.name,
            addLeaveRes.data.data.leave_type
          );
        console.log(
          "addAttendanceWithLeaveTypeRes---",
          addAttendanceWithLeaveTypeRes
        );
        if (!addAttendanceWithLeaveTypeRes.ok) {
          setLoad(false);
          setModalMessage(
            JSON.parse(
              JSON.parse(addAttendanceWithLeaveTypeRes.data._server_messages)[0]
            ).message.split("<Br>")[0]
          );
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
      });
      handleUnSavedChanges(0);
      toast.success("Leave Added Successfully");
      handleGetEmployeeLeaveDetails(values.employeeNumber.name);
      document?.getElementById("employeeNumber")?.focus();

      values.leaveType = "";
      values.toDate = "";
      values.fromDate = "";
      values.reason = "";
      // setOtherReason();
      setFromDateOff(false);
      setToDateOff(false);
      setDay();
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleValidateDate = async (
    employeID,
    leaveType,
    firstDayOff,
    lastDayOff,
    fromDate,
    toDate
  ) => {
    try {
      if (fromDate && toDate) {
        console.log("fromDate------", fromDate);

        const halfDay = firstDayOff
          ? firstDayOff
          : lastDayOff
          ? lastDayOff
          : false;
        const halfDayDate = firstDayOff ? fromDate : lastDayOff ? toDate : null;

        if (leaveType && fromDate && toDate) {
          setDay();
          const calculateDays = await empApi.calculateLeaveDays(
            employeID,
            leaveType.value,
            moment(fromDate).format("YYYY-MM-DD"),
            moment(toDate).format("YYYY-MM-DD"),
            halfDay,
            halfDayDate ? moment(halfDayDate).format("YYYY-MM-DD") : null
          );
          console.log("calculateDays", calculateDays.data.message);
          setDay(calculateDays.data.message);
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleGetEmployeeLeaveDetails = async (employeeID) => {
    try {
      setLoad(true);
      const leaveAllocation = await empApi.viewEmployeeLeveAllocation(
        employeeID,
        moment().format("yyyy-MM-DD")
      );

      console.log("leaveAllocation", leaveAllocation);
      const getReasonlist = await empApi.getReasonlist();
      console.log("getReasonlist", getReasonlist);
      setReasonlist(getReasonlist.data.data);
      const leaveList = await empApi.getLeaveDetails(employeeID);
      console.log("leaveList", leaveList);
      if (leaveList.data.data.length > 0) {
        console.log("leaveList", leaveList);
        setHisroryArr(leaveList.data.data);
      } else {
        setHisroryArr([]);
      }
      setAllocatedLeave([]);
      const getLeaveTypeWithoutPayRes = await empApi.getLeaveTypeWithoutPay();
      console.log("getLeaveTypeWithoutPayRes---", getLeaveTypeWithoutPayRes);

      let leaveTypeArr = getLeaveTypeWithoutPayRes.data.data;
      if (
        Object.keys(leaveAllocation.data.message.leave_allocation).length > 0
      ) {
        setShowError(false);
        delete leaveAllocation.data.message.leave_allocation["Tour"];
        setAllocatedLeave([leaveAllocation.data.message.leave_allocation]);
        let leaveAllocateArr = Object.keys(
          leaveAllocation.data.message.leave_allocation
        );
        console.log("leaveAllocateArr", leaveAllocateArr);

        for (let i = 0; i < leaveAllocateArr.length; i++) {
          if (
            leaveAllocation.data.message.leave_allocation[leaveAllocateArr[i]]
              .remaining_leaves > 0
          ) {
            leaveTypeArr.push({
              label: leaveAllocateArr[i],
              value: leaveAllocateArr[i],
              is_lwp: 0,
            });
          }
        }
        setLeaveTypeList(leaveTypeArr);
      } else {
        setShowError(true);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const handleGetEmployeeDetails = async (employeeDetail) => {
    try {
      setLoad(true);
      formikRef.current.setFieldValue("leaveType", "");
      formikRef.current.setFieldValue("fromDate", "");
      formikRef.current.setFieldValue("toDate", "");
      formikRef.current.setFieldValue("reason", "");
      formikRef.current.setFieldValue("otherReason", "");
      formikRef.current.setFieldTouched("leaveType", false);
      formikRef.current.setFieldTouched("fromDate", false);
      formikRef.current.setFieldTouched("toDate", false);
      formikRef.current.setFieldTouched("reason", false);
      formikRef.current.setFieldTouched("otherReason", false);
      setReason("");
      setFromDateOff(false);
      setToDateOff(false);
      setDay();
      setEmployeeInfo(employeeDetail);
      handleGetEmployeeLeaveDetails(employeeDetail.name);
      console.log("employeeDetail---", employeeDetail);
      institueArr.map((item) => {
        if (item.name === employeeDetail.company) {
          handleSchema(
            item.PAYROLL_DATE ? moment(item.PAYROLL_DATE, "DD-MM-YYYY") : ""
          );
        }
      });
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const employeeSearch = async (value) => {
    setEmpCodeList([]);
    try {
      if (value.length > 2) {
        const employeeRes = await empApi.employeeSearch(value);
        console.log("employeeRes", employeeRes);
        setEmpCodeList(employeeRes.data.message.employee_data);
      }
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  useEffect(() => {
    console.log("collegeConfig2", collegeConfig);
    institueArr.map((item) => {
      if (item.collegeID === collegeId) {
        handleSchema(
          item.PAYROLL_DATE ? moment(item.PAYROLL_DATE, "DD-MM-YYYY") : ""
        );
      }
    });
  }, [collegeConfig.is_university]);

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
        <div className="row no-gutters">
          <Formik
            innerRef={formikRef}
            enableReinitialize={false}
            initialValues={{
              employeeNumber: "",
              leaveType: "",
              fromDate: "",
              toDate: "",
              reason: "",
              otherReason: "",
            }}
            validationSchema={formSchema}
            onSubmit={handleSubmit}
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
                  <div className="col-lg-9">
                    <SelectFieldFormik
                      autoFocus
                      label="Employee No. / Name"
                      id="employeeNumber"
                      mandatory={1}
                      tabIndex={1}
                      labelSize={3}
                      style={{ width: "70%" }}
                      options={empCodeList}
                      searchIcon={true}
                      clear={true}
                      getOptionLabel={(option) =>
                        option.custom_employeeid + " - " + option.employee_name
                      }
                      getOptionValue={(option) => option.name}
                      onInputChange={(inputValue) => {
                        employeeSearch(inputValue);
                      }}
                      onChange={(text) => {
                        setFieldValue("employeeNumber", text);
                        handleGetEmployeeDetails(text);
                        handleUnSavedChanges(0);
                      }}
                    />
                  </div>
                  {values.employeeNumber ? (
                    <>
                      <div className="subhead-row">
                        <div className="subhead">Employee Details</div>
                        <div className="col line-div"></div>
                      </div>

                      {employeeInfo && (
                        <EmployeeCard employeeInfo={employeeInfo} />
                      )}
                      <div className="text-center mt-2">
                        <ErrorMessage
                          Message={"First allocate leave for this Employee"}
                          view={showError}
                        />
                      </div>
                    </>
                  ) : null}

                  {values.employeeNumber && allocatedLeave.length > 0 ? (
                    <>
                      <div className="subhead-row p-0">
                        <div className="subhead">Apply Leave</div>
                        <div className="col line-div"></div>
                      </div>
                      <div className="col-lg-9">
                        <SelectFieldFormik
                          label={"Leave Type"}
                          id="leaveType"
                          mandatory={1}
                          tabIndex={2}
                          labelSize={3}
                          style={{ width: "40%" }}
                          maxlength={20}
                          options={leaveTypeList}
                          search={true}
                          onChange={(text) => {
                            setFieldValue("leaveType", text);
                            handleUnSavedChanges(1);
                            handleValidateDate(
                              values.employeeNumber.name,
                              text,
                              fromDateOff,
                              toDateOff,
                              values.fromDate,
                              values.toDate
                            );
                          }}
                        />
                        <DisplayText
                          label={"Leave Balance"}
                          value={
                            allocatedLeave[0][values?.leaveType.value]
                              ?.remaining_leaves ?? "-"
                          }
                          labelSize={3}
                        />
                        <>
                          <div className="row no-gutters  mt-1">
                            <div className="col-lg-3 text-right pe-3 mt-2">
                              <label>From Date</label>
                            </div>
                            <div className={"col-lg-3"}>
                              <DateFieldFormik
                                placeholder="From Date"
                                id="fromDate"
                                tabIndex={3}
                                maxDate={null}
                                minDate={null}
                                style={{ width: "90%" }}
                                mandatory={1}
                                onChange={(e) => {
                                  setFieldValue("fromDate", e.target.value);
                                  handleUnSavedChanges(1);
                                  setToDateError(false);
                                  handleValidateDate(
                                    values.employeeNumber.name,
                                    values.leaveType,
                                    fromDateOff,
                                    toDateOff,
                                    e.target.value,
                                    values.toDate
                                  );
                                }}
                              />
                            </div>
                            <div className="col-lg-3 mt-2">
                              <CheckboxField
                                label={"Half Day"}
                                checked={fromDateOff}
                                onChange={() => {
                                  setFromDateOff(!fromDateOff);
                                  if (!fromDateOff) {
                                    setToDateOff(false);
                                  }
                                  handleValidateDate(
                                    values.employeeNumber.name,
                                    values.leaveType,
                                    !fromDateOff,
                                    toDateOff,
                                    values.fromDate,
                                    values.toDate
                                  );
                                }}
                                disabled={!toDateOff ? false : true}
                              />
                            </div>
                          </div>
                          <div className="row no-gutters  mt-1">
                            <div className="col-lg-3 text-right pe-3 mt-2">
                              <label>To Date</label>
                            </div>
                            <div className={"col-lg-3"}>
                              <DateFieldFormik
                                placeholder="To Date"
                                id="toDate"
                                tabIndex={4}
                                maxDate={null}
                                minDate={null}
                                style={{ width: "90%" }}
                                mandatory={1}
                                onChange={(e) => {
                                  setFieldValue("toDate", e.target.value);
                                  handleUnSavedChanges(1);
                                  setToDateError(false);
                                  handleValidateDate(
                                    values.employeeNumber.name,
                                    values.leaveType,
                                    fromDateOff,
                                    toDateOff,
                                    values.fromDate,
                                    e.target.value
                                  );
                                }}
                                // error={toDateError ? toDateErrorMessage : ""}
                              />
                            </div>
                            <div className="col-lg-3 mt-2">
                              <CheckboxField
                                label={"Half Day"}
                                checked={toDateOff}
                                onChange={() => {
                                  setToDateOff(!toDateOff);
                                  if (!toDateOff) {
                                    setFromDateOff(false);
                                  }
                                  handleValidateDate(
                                    values.employeeNumber.name,
                                    values.leaveType,
                                    fromDateOff,
                                    !toDateOff,
                                    values.fromDate,
                                    values.toDate
                                  );
                                }}
                                disabled={!fromDateOff ? false : true}
                              />

                              {/* <CustomTextInput
                                type="checkbox"
                                name="toDateOff"
                                id="toDateOff"
                                className="me-1 text-right"
                                value={toDateOff}
                                checked={toDateOff ? "checked" : ""}
                                onChange={() => {
                                  setToDateOff(!toDateOff);
                                  handleValidateDate(
                                    values.employeeNumber.name,
                                    values.leaveType,
                                    fromDateOff,
                                    !toDateOff,
                                    values.fromDate,
                                    values.toDate
                                  );
                                }}
                                disabled={!fromDateOff ? false : true}
                              />

                              <label className="ps-1">Half Day</label> */}
                            </div>
                            <div className="row mt-2">
                              <div className="col-lg-3"></div>
                              <div className="col-lg-9 pe-5 p-0">
                                <ErrorMessage
                                  Message={toDateErrorMessage}
                                  view={toDateError}
                                />
                              </div>
                            </div>
                            <DisplayText
                              label={"Number of Days"}
                              labelSize={3}
                              value={day ?? "-"}
                            />
                          </div>
                        </>
                        <SelectFieldFormik
                          label={"Reason"}
                          id="reason"
                          tabIndex={5}
                          mandatory={1}
                          maxlength={15}
                          labelSize={3}
                          style={{ width: "40%" }}
                          options={reasonlist}
                          search={false}
                          onChange={(text) => {
                            setFieldValue("reason", text);
                            handleUnSavedChanges(1);
                            if (text?.value == "Other Reason") {
                              setReason(text);
                            } else {
                              setReason("");
                            }
                          }}
                        />
                        {values.reason &&
                        values.reason.value == "Other Reason" ? (
                          <TextFieldFormik
                            id="otherReason"
                            tabIndex={
                              values.reason.value == "Other Reason" ? 6 : ""
                            }
                            placeholder="Other Reason"
                            mandatory={1}
                            labelSize={3}
                            label="Other Reason"
                            onChange={(e) => {
                              setFieldValue("otherReason", e.target.value);
                              handleUnSavedChanges(1);
                            }}
                            maxlength={25}
                            style={{ width: "70%" }}
                          />
                        ) : null}
                      </div>
                      <Button
                        id="save"
                        tabIndex={values.reason.value == "Other Reason" ? 7 : 6}
                        text="F4 - Save"
                        type="submit"
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                    </>
                  ) : null}
                  {values.employeeNumber && allocatedLeave.length > 0 ? (
                    <div className="row mt-1">
                      <div className="subhead-row p-0">
                        <div className="subhead">Allocated Leaves</div>
                        <div className="col line-div"></div>
                      </div>
                      <div className=" col-lg-2"></div>
                      <div className="col-lg-8 mt-2">
                        <table className="table table-bordered table-hover">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th>Leave Type</th>
                              <th width="5%">Opening Balance</th>
                              <th width="5%">Availed</th>
                              <th width="5%">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allocatedLeave.map((item, index) => {
                              return Object.keys(item).map((data, index) => {
                                return (
                                  <tr>
                                    <td>{index + 1}</td>
                                    <td>{data}</td>
                                    <td align="right">
                                      {item[data].total_leaves}
                                    </td>
                                    <td align="right">
                                      {item[data].leaves_taken}
                                    </td>
                                    <td align="right">
                                      {item[data].remaining_leaves}
                                    </td>
                                  </tr>
                                );
                              });
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                  {values.employeeNumber &&
                  historyArr &&
                  historyArr.length > 0 ? (
                    <div className="row mt-1">
                      <div className="subhead-row p-0">
                        <div className="subhead">Applied Leaves</div>
                        <div className="col line-div"></div>
                      </div>
                      <div className=" col-lg-2"></div>
                      <div className="col-lg-8 mt-2">
                        <div className="row">
                          <table className="table table-bordered table-hover">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="15%">From Date</th>
                                <th width="15%">To Date</th>
                                <th>Leave Type</th>
                                <th width="1%">Days</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historyArr.map((item, index) => {
                                return (
                                  <tr>
                                    <td>{index + 1}</td>
                                    <td>
                                      {moment(item.from_date).format(
                                        "DD-MM-yyyy"
                                      )}
                                    </td>
                                    <td>
                                      {moment(item.to_date).format(
                                        "DD-MM-yyyy"
                                      )}
                                    </td>
                                    <td>{item.leave_type}</td>
                                    <td align="right">
                                      {item.total_leave_days}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default LeaveEntry;
