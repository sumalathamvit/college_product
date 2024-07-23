import React, { useEffect, useState, useContext, useRef } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import * as Yup from "yup";

import empApi from "../../api/EmployeeApi";
import attendanceapi from "../../api/attendanceapi";

import AuthContext from "../../auth/context";

import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormFieldLibrary/DateFieldFormik";
import ErrorMessage from "../../component/common/ErrorMessage";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import SelectFieldFormik from "../../component/FormFieldLibrary/SelectFieldFormik";
import SelectField from "../../component/FormField/SelectFieldFormik";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import DisplayText from "../../component/FormField/DisplayText";
import ModalComponent from "../../component/ModalComponent";
import CheckboxField from "../../component/FormField/CheckboxField";
import ScreenTitle from "../../component/common/ScreenTitle";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import storage from "../../auth/storage";

function LeaveEntryAbsentee() {
  const formikRef = useRef();
  const modalFormikRef = useRef();

  const [load, setLoad] = useState(false);
  const [toDateError, setToDateError] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [fromDateOff, setFromDateOff] = useState(false);
  const [toDateOff, setToDateOff] = useState(false);

  const [toDateErrorMessage, setToDateErrorMessage] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveTypeList, setLeaveTypeList] = useState([]);
  const [allocatedLeave, setAllocatedLeave] = useState([]);

  const [historyArr, setHisroryArr] = useState([]);
  const [reasonlist, setReasonlist] = useState([]);
  const [day, setDay] = useState(0);
  const [reason, setReason] = useState("");

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const { setUnSavedChanges, collegeId } = useContext(AuthContext);
  const [formSchema, setFormSchema] = useState();
  const [ApplyFormSchema, setApplyFormSchema] = useState();
  const [applyLeaveItem, setApplyLeaveItem] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);

  const institueArr = storage.getInstituteArray();

  const handleSchema = (PAYROLL_DATE) => {
    console.log("PAYROLL_DATE---", moment(PAYROLL_DATE).format("DD-MM-YYYY"));
    if (PAYROLL_DATE == "") {
      let schema = Yup.object().shape({
        college: collegeConfig.is_university
          ? Yup.object().required("Please select College")
          : Yup.mixed().notRequired(),
      });
      setFormSchema(schema);
      return;
    }
    let schema = Yup.object().shape({
      college: collegeConfig.is_university
        ? Yup.object().required("Please select College")
        : Yup.mixed().notRequired(),
      fromDate: Yup.date()
        .min(
          moment(PAYROLL_DATE).add(1, "days"),
          `From Date must be after ${moment(PAYROLL_DATE).format("DD-MM-YYYY")}`
        )
        .max(
          moment().toDate(),
          `From Date must be before ${moment().format("DD-MM-YYYY")}`
        )
        .required("Please select From Date"),
      toDate: Yup.date()
        .min(
          moment(PAYROLL_DATE).add(1, "days"),
          `To Date must be after ${moment(PAYROLL_DATE).format("DD-MM-YYYY")}`
        )
        .max(
          moment().toDate(),
          `To Date must be before ${moment().format("DD-MM-YYYY")}`
        )
        .required("Please select To Date"),
    });
    console.log("schema---", schema);
    setFormSchema(schema);
  };

  const handleApplySchema = (PAYROLL_DATE) => {
    if (PAYROLL_DATE == "") return;
    console.log("PAYROLL_DATE", moment(PAYROLL_DATE).format("yyyy-MM-DD"));

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
          ? Yup.string().required("Please enter Other Reason")
          : Yup.mixed().notRequired(),
    });
    setApplyFormSchema(schema);
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

  const handleClearValues = async () => {
    modalFormikRef.current.resetForm();
    setToDateError(false);
    setFromDateOff(false);
    setToDateOff(false);
    setToDateErrorMessage("");
    setAttendanceData([]);
    setLeaveTypeList([]);
    setAllocatedLeave([]);
    setHisroryArr([]);
    setReasonlist([]);
    setDay(0);
    setReason("");
  };

  const handleApproveLeave = async () => {
    console.log("attendanceData---", attendanceData);
    let errorMessage = [];
    try {
      for (let i = 0; i < attendanceData.length; i++) {
        if (attendanceData[i].leaveType && attendanceData[i].reason) {
          const addLeaveRes = await empApi.addLeaveEntry(
            attendanceData[i].name,
            attendanceData[i].leaveType.value,
            moment(attendanceData[i].attendance_date).format("YYYY-MM-DD"),
            moment(attendanceData[i].attendance_date).format("YYYY-MM-DD"),
            attendanceData[i].status === "Half Day" ? true : false,
            attendanceData[i].reason.value,
            attendanceData[i].status === "Half Day"
              ? moment(attendanceData[i].attendance_date).format("YYYY-MM-DD")
              : ""
          );
          console.log("addLeaveRes----", addLeaveRes);
          if (!addLeaveRes.ok) {
            errorMessage.push(
              attendanceData[i].custom_employeeid +
                " - " +
                attendanceData[i].first_name +
                " - " +
                JSON.parse(
                  JSON.parse(addLeaveRes.data._server_messages)[0]
                ).message.split("<Br>")[0]
            );
          }
          if (attendanceData[i].status === "Half Day") {
            const ERPBulkcancelRes = await attendanceapi.ERPBulkcancel(
              "Attendance",
              [attendanceData[i].attendanceName]
            );
            console.log("ERPBulkcancelRes---", ERPBulkcancelRes);
            if (!ERPBulkcancelRes.ok) {
              errorMessage.push(
                attendanceData[i].custom_employeeid +
                  " - " +
                  attendanceData[i].employee_name +
                  " - " +
                  JSON.parse(
                    JSON.parse(ERPBulkcancelRes.data._server_messages)[0]
                  ).message.split("<Br>")[0]
              );
            }
            const addAttendanceWithLeaveTypeRes =
              await attendanceapi.addAttendanceWithLeaveType(
                attendanceData[i].name,
                attendanceData[i].attendance_date,
                attendanceData[i].in_time,
                attendanceData[i].out_time,
                attendanceData[i].working_hours,
                "Half Day",
                attendanceData[i].shift,
                attendanceData[i].late_entry,
                attendanceData[i].early_exit,
                attendanceData[i].custom_short_excess,
                addLeaveRes.data.data.name,
                addLeaveRes.data.data.leave_type
              );
            console.log(
              "addAttendanceWithLeaveTypeRes---",
              addAttendanceWithLeaveTypeRes
            );
            if (!addAttendanceWithLeaveTypeRes.ok) {
              errorMessage.push(
                attendanceData[i].custom_employeeid +
                  " - " +
                  attendanceData[i].first_name +
                  " - " +
                  JSON.parse(
                    JSON.parse(
                      addAttendanceWithLeaveTypeRes.data._server_messages
                    )[0]
                  ).message.split("<Br>")[0]
              );
            }
          }
        }
      }
      await handleShow(formikRef?.current?.values);
      if (errorMessage.length > 0) {
        setModalMessage(errorMessage.join(", "));
        setModalTitle("Message");
        setModalErrorOpen(true);
      }
      toast.success("Leave Approval Processed Successfully");
      setLoad(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleApplyLeaveProcess = async (item) => {
    setApplyLeaveItem(item);
    await handleGetLeaveDetail(item.name);
    await handleGetEmployeeLeaveDetails(item.name);
  };

  const handleSubmit = async (values) => {
    console.log("values---", values);
    if (load) return;
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
        // console.log("allocatedLeave---", allocatedLeave);
        // console.log(
        //   "allocatedLeave[values.leaveType.value]---",
        //   allocatedLeave[0][values.leaveType.value].remaining_leaves
        // );
        // console.log("day---", day);
        if (allocatedLeave[0][values.leaveType.value].remaining_leaves < day) {
          setModalErrorOpen(true);
          setModalMessage("You don't have enough leave balance");
          setModalTitle("Message");
          setLoad(false);
          return;
        }
        const checkLeaveRes = await empApi.checkLeave(
          applyLeaveItem.employee,
          values.leaveType.value
        );
        console.log("checkLeaveRes---", checkLeaveRes);

        if (
          !moment(values.fromDate).isBetween(
            moment(checkLeaveRes.data.data[0].from_date),
            moment(checkLeaveRes.data.data[0].to_date)
          ) ||
          !moment(values.toDate).isBetween(
            moment(checkLeaveRes.data.data[0].from_date),
            moment(checkLeaveRes.data.data[0].to_date)
          )
        ) {
          setModalMessage(
            "Please choose the date between " +
              moment(checkLeaveRes.data.data[0].from_date).format(
                "DD-MM-YYYY"
              ) +
              " and " +
              moment(checkLeaveRes.data.data[0].to_date).format("DD-MM-YYYY")
          );
          setModalTitle("Message");
          setModalErrorOpen(true);
          setLoad(false);
          return;
        }
      }

      // console.log("employeeNumber---", values.employeeNumber.name);
      const attendanceRes = await empApi.getAttendanceByEmployee(
        applyLeaveItem.employee,
        moment(values.fromDate).format("YYYY-MM-DD"),
        moment(values.toDate).format("YYYY-MM-DD")
      );
      // console.log("attendanceRes---", attendanceRes);
      var availAttendance = [];
      var halfDayAttendance = [];
      if (attendanceRes.data.data.length > 0) {
        for (let k = 0; k < attendanceRes.data.data.length; k++) {
          // console.log(
          //   "attendanceRes.data.data[k]---",
          //   attendanceRes.data.data[k]
          // );
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
      // console.log("availAttendance", availAttendance);
      // console.log("halfDayAttendance", halfDayAttendance);

      if (availAttendance.length > 0) {
        var presentArr = availAttendance.join(", ");
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
      // console.log("array", array);

      const permissionSameDay = await empApi.checkPermissionSameDay(
        applyLeaveItem.employee,
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

      const addLeaveRes = await empApi.addLeaveEntry(
        applyLeaveItem.name,
        values.leaveType.value,
        moment(values.fromDate).format("YYYY-MM-DD"),
        moment(values.toDate).format("YYYY-MM-DD"),
        fromDateOff ? fromDateOff : toDateOff ? toDateOff : false,
        values.reason.value == "Other Reason"
          ? values.otherReason
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
      setOpenModal(false);
      toast.success("Leave Added Successfully");
      handleClearValues();
      setShowRes(false);
      await handleShow(formikRef?.current?.values);

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

  const handleGetLeaveDetail = async (employeeID) => {
    setHisroryArr([]);
    const leaveList = await empApi.getLeaveDetails(employeeID);
    // console.log("leaveList", leaveList);
    if (leaveList.data.data.length > 0) {
      // console.log("leaveList", leaveList);
      setHisroryArr(leaveList.data.data);
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

      const leaveList = await empApi.getLeaveDetails(employeeID);
      console.log("leaveList", leaveList);
      if (leaveList.data.data.length > 0) {
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
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const handleShow = async (values) => {
    setAttendanceData([]);
    try {
      setLoad(true);
      console.log("values-------", values);

      const getReasonlist = await empApi.getReasonlist();
      console.log("getReasonlist", getReasonlist);
      setReasonlist(getReasonlist.data.data);

      const attendanceRes = await empApi.getAbsenteeEmployeeLeaveEntry(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        moment(values.fromDate).format("YYYY-MM-DD"),
        moment(values.toDate).format("YYYY-MM-DD")
      );
      console.log("attendanceRes---", attendanceRes);
      const getLeaveTypeWithoutPayRes = await empApi.getLeaveTypeWithoutPay();
      console.log("getLeaveTypeWithoutPayRes---", getLeaveTypeWithoutPayRes);

      for (
        let i = 0;
        i <
        attendanceRes.data.message.data.absentee_employee_leave_entry.length;
        i++
      ) {
        attendanceRes.data.message.data.absentee_employee_leave_entry[
          i
        ].allocated_leave = [];
        attendanceRes.data.message.data.absentee_employee_leave_entry[
          i
        ].allocated_leave.push(getLeaveTypeWithoutPayRes.data.data[0]);

        let leaveDetailsArr = attendanceRes.data.message.data
          .absentee_employee_leave_entry[i]?.leaveDetails
          ? attendanceRes.data.message.data.absentee_employee_leave_entry[
              i
            ]?.leaveDetails.split(",")
          : [];
        for (let p = 0; p < leaveDetailsArr.length; p++) {
          let leaveArrCntArr = leaveDetailsArr[p].split("-");
          const leaveCnt = parseFloat(leaveArrCntArr[1]).toFixed(1);

          attendanceRes.data.message.data.absentee_employee_leave_entry[
            i
          ].allocated_leave.push({
            label: leaveArrCntArr[0] + " - " + leaveCnt,
            value: leaveArrCntArr[0],
          });
        }
        attendanceRes.data.message.data.absentee_employee_leave_entry[
          i
        ].leaveType = null;
        attendanceRes.data.message.data.absentee_employee_leave_entry[
          i
        ].reason = null;
      }
      setAttendanceData(
        attendanceRes.data.message.data.absentee_employee_leave_entry
      );

      setLoad(false);
      setShowRes(true);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  useEffect(() => {
    console.log("collegeConfig.is_university", collegeConfig.is_university);
    if (!collegeConfig.is_university) {
      console.log("hello");
      institueArr.map((item) => {
        if (item.collegeID === collegeId) {
          handleSchema(
            item.PAYROLL_DATE ? moment(item.PAYROLL_DATE, "DD-MM-YYYY") : ""
          );
          handleApplySchema(
            item.PAYROLL_DATE ? moment(item.PAYROLL_DATE, "DD-MM-YYYY") : ""
          );
        }
      });
    } else {
      console.log("no hello");
      handleSchema("");
    }
  }, []);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
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
        <ScreenTitle titleClass="page-heading-position" />
        <div className="row no-gutters">
          <Formik
            innerRef={formikRef}
            enableReinitialize={false}
            initialValues={{
              college: null,
              fromDate: moment().subtract(1, "days"),
              toDate: moment().subtract(1, "days"),
              employeeCode: "",
            }}
            validationSchema={formSchema}
            onSubmit={handleShow}
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
                    {collegeConfig.is_university ? (
                      <div className="col-lg-4 pe-4">
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={0}
                          labelSize={3}
                          label="College"
                          id="college"
                          mandatory={1}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            institueArr.map((item) => {
                              if (item.collegeID === text.collegeID) {
                                handleSchema(
                                  item.PAYROLL_DATE
                                    ? moment(item.PAYROLL_DATE, "DD-MM-YYYY")
                                    : ""
                                );
                              }
                            });
                          }}
                        />
                      </div>
                    ) : null}
                    <div className="col-lg-2 pe-2">
                      <DateFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        label={"From"}
                        labelSize={5}
                        id="fromDate"
                        minDate={null}
                        maxDate={null}
                        tabIndex={1}
                        mandatory={1}
                        onChange={(e) => {
                          setFieldValue("fromDate", e.target.value);
                          setShowRes(false);
                          handleUnSavedChanges(0);
                        }}
                      />
                    </div>
                    <div className="col-lg-2 pe-2 ps-2">
                      <DateFieldFormik
                        label={"To"}
                        labelSize={5}
                        id="toDate"
                        minDate={null}
                        maxDate={null}
                        tabIndex={2}
                        mandatory={1}
                        onChange={(e) => {
                          setFieldValue("toDate", e.target.value);
                          setShowRes(false);
                          handleUnSavedChanges(0);
                        }}
                      />
                    </div>
                    <div className="col-lg-2 pe-2 ps-2">
                      <div class="row no-gutters mt-3">
                        <label>&nbsp;</label>
                      </div>
                      <div>
                        <Button
                          tabIndex={3}
                          isTable={true}
                          frmButton={false}
                          text="Show"
                          onClick={(e) => {
                            preFunction.handleErrorFocus(errors);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {showRes ? (
                    <>
                      <div className="subhead-row">
                        <div className="subhead">Leave Details</div>
                        <div className="col line-div"></div>
                      </div>
                      <div className="row no-gutters">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th width="8%">Date</th>
                              <th width="5%">Employee No.</th>
                              <th>Employee Name</th>
                              <th width="5%">Hours</th>
                              <th width="5%">Absent Type</th>
                              <th width="18%">Leave Type</th>
                              <th width="18%">Reason</th>
                              <th width="10%">Get Detail</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceData.length == 0 ? (
                              <tr>
                                <td colspan={9} align="center">
                                  No data found
                                </td>
                              </tr>
                            ) : (
                              attendanceData.map((item, index) => {
                                return (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                      {moment(item?.attendance_date).format(
                                        "DD-MM-yyyy"
                                      )}
                                    </td>
                                    <td>{item.custom_employeeid}</td>
                                    <td>{item.employee_name}</td>
                                    <td>
                                      {preFunction.convertDecimalToTime(
                                        item?.working_hours
                                      )}
                                    </td>
                                    <td>{item?.status}</td>
                                    <td>
                                      <ReactSelectField
                                        placeholder="Leave Type"
                                        id={"leaveType" + index}
                                        options={item.allocated_leave}
                                        searchIcon={false}
                                        clear={true}
                                        value={item?.leaveType}
                                        onChange={(text) => {
                                          attendanceData[index].leaveType =
                                            text;
                                          setAttendanceData([
                                            ...attendanceData,
                                          ]);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <ReactSelectField
                                        placeholder={"Reason"}
                                        id="reason"
                                        tabIndex={13}
                                        mandatory={1}
                                        maxlength={15}
                                        options={reasonlist}
                                        clear={true}
                                        search={false}
                                        onChange={(text) => {
                                          attendanceData[index].reason = text;
                                          setAttendanceData([
                                            ...attendanceData,
                                          ]);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <Button
                                        text="Get Detail"
                                        isTable={true}
                                        className={"btn-3"}
                                        type="button"
                                        onClick={(e) => {
                                          handleApplyLeaveProcess(item);
                                          setOpenModal(true);
                                        }}
                                      />
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                        {attendanceData.length > 0 && (
                          <Button
                            text="F4 - Approve Leave"
                            id="save"
                            isTable={true}
                            type="button"
                            onClick={(e) => {
                              handleApproveLeave();
                            }}
                          />
                        )}
                      </div>
                    </>
                  ) : null}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
      <Modal
        show={openModal}
        dialogClassName="title-modal"
        onEscapeKeyDown={(e) => setOpenModal(false)}
      >
        <Modal.Header>
          <Modal.Title>Apply Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "600px", overflowY: "auto" }}>
          <div className="">
            <Formik
              innerRef={modalFormikRef}
              enableReinitialize={false}
              initialValues={{
                employeeNumber: "",
                leaveType: "",
                fromDate: moment(applyLeaveItem?.attendance_date),
                toDate: "",
                reason: "",
                otherReason: "",
              }}
              validationSchema={ApplyFormSchema}
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
                    <DisplayText
                      label={"Employee"}
                      value={
                        applyLeaveItem.custom_employeeid +
                        " - " +
                        applyLeaveItem.employee_name
                      }
                      labelSize={4}
                    />
                    <SelectField
                      autoFocus
                      label={"Leave Type"}
                      id="leaveType"
                      mandatory={1}
                      tabIndex={10}
                      labelSize={4}
                      style={{ width: "60%" }}
                      maxlength={20}
                      options={leaveTypeList}
                      search={true}
                      onChange={(text) => {
                        setFieldValue("leaveType", text);
                        handleUnSavedChanges(1);
                        handleValidateDate(
                          applyLeaveItem.name,
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
                        allocatedLeave?.length > 0
                          ? allocatedLeave[0][values?.leaveType.value]
                              ?.remaining_leaves ?? "-"
                          : ""
                      }
                      labelSize={4}
                    />
                    <div className="row no-gutters  mt-1">
                      <div className="col-lg-4 text-right pe-3 mt-2">
                        <label>From Date</label>
                      </div>
                      <div className={"col-lg-4"}>
                        <DateFieldFormik
                          placeholder="From Date"
                          id="fromDate"
                          tabIndex={11}
                          maxDate={null}
                          minDate={null}
                          style={{ width: "90%" }}
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("fromDate", e.target.value);
                            handleUnSavedChanges(1);
                            setToDateError(false);
                            handleValidateDate(
                              applyLeaveItem.name,
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
                              applyLeaveItem.name,
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
                      <div className="col-lg-4 text-right pe-3 mt-2">
                        <label>To Date</label>
                      </div>
                      <div className={"col-lg-4"}>
                        <DateFieldFormik
                          placeholder="To Date"
                          id="toDate"
                          tabIndex={12}
                          maxDate={null}
                          minDate={null}
                          style={{ width: "90%" }}
                          mandatory={1}
                          onChange={(e) => {
                            setFieldValue("toDate", e.target.value);
                            handleUnSavedChanges(1);
                            setToDateError(false);
                            handleValidateDate(
                              applyLeaveItem.name,
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
                              applyLeaveItem.name,
                              values.leaveType,
                              fromDateOff,
                              !toDateOff,
                              values.fromDate,
                              values.toDate
                            );
                          }}
                          disabled={!fromDateOff ? false : true}
                        />
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
                        labelSize={4}
                        value={day ?? "-"}
                      />
                    </div>

                    <SelectField
                      label={"Reason"}
                      id="reason"
                      tabIndex={13}
                      mandatory={1}
                      maxlength={15}
                      labelSize={4}
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
                    {values.reason && values.reason.value == "Other Reason" ? (
                      <TextFieldFormik
                        id="otherReason"
                        tabIndex={
                          values.reason.value == "Other Reason" ? 14 : ""
                        }
                        placeholder="Other Reason"
                        mandatory={1}
                        labelSize={4}
                        label="Other Reason"
                        onChange={(e) => {
                          setFieldValue("otherReason", e.target.value);
                          handleUnSavedChanges(1);
                        }}
                        maxlength={25}
                        style={{ width: "70%" }}
                      />
                    ) : null}

                    <div className="text-center">
                      <Button
                        id="save"
                        frmButton={false}
                        tabIndex={
                          values.reason.value == "Other Reason" ? 15 : 14
                        }
                        text="F4 - Save"
                        type="submit"
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                      &nbsp;&nbsp;
                      <Button
                        frmButton={false}
                        tabIndex={
                          values.reason.value == "Other Reason" ? 16 : 15
                        }
                        text="Close"
                        type="button"
                        onClick={(e) => {
                          setOpenModal(false);
                        }}
                      />
                    </div>
                    <div className="row mt-1">
                      <div className="subhead-row p-0">
                        <div className="subhead">Allocated Leaves</div>
                        <div className="col line-div"></div>
                      </div>
                      <div className="row no-gutters mt-2">
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
                          {allocatedLeave.length === 0 ? (
                            <tbody>
                              <tr>
                                <td colspan={9} align="center">
                                  No data found
                                </td>
                              </tr>
                            </tbody>
                          ) : (
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
                          )}
                        </table>
                      </div>
                    </div>
                    <div className="row mt-1">
                      <div className="subhead-row p-0">
                        <div className="subhead">Applied Leaves</div>
                        <div className="col line-div"></div>
                      </div>
                      <div className="row no-gutters mt-2">
                        <div className="row">
                          <table className="table table-bordered table-hover">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th width="20%">From Date</th>
                                <th width="20%">To Date</th>
                                <th>Leave Type</th>
                                <th width="1%">Days</th>
                              </tr>
                            </thead>
                            {historyArr.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td colspan={9} align="center">
                                    No data found
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
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
                            )}
                          </table>
                        </div>
                      </div>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default LeaveEntryAbsentee;
