import React, { useEffect, useState, useContext, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik } from "formik";
import moment from "moment";
import * as Yup from "yup";

import empApi from "../../api/EmployeeApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import {
  compensationDayList,
  leaveTypeList,
} from "../../component/common/CommonArray";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import Button from "../../component/FormField/Button";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import ErrorMessage from "../../component/common/ErrorMessage";
import ModalComponent from "../../component/ModalComponent";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import AuthContext from "../../auth/context";
import ScreenTitle from "../../component/common/ScreenTitle";

function CompensationOff() {
  const navigate = useNavigate();
  const formikRef = useRef();
  const todyaDate = new Date();
  const oneWeekBefore = new Date();
  oneWeekBefore.setTime(todyaDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [load, setLoad] = useState(false);
  const [day, setDay] = useState("");
  const [attendanceArr, setAttendanceArr] = useState([]);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);

  const [showDayError, setShowDayError] = useState(false);
  const [showEmpError, setShowEmpError] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const [dateError, setDateError] = useState(false);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    fromDate: Yup.date().required("Please select From Date"),
    toDate: Yup.date().required("Please select To Date"),
  });

  const handleUnSavedChanges = (changed) => {
    if (changed == 1) {
      sessionStorage.setItem("unSavedChanges", true);
      setUnSavedChanges(true);
    } else {
      sessionStorage.setItem("unSavedChanges", false);
      setUnSavedChanges(false);
    }
  };

  const extractYear = (dateString) => {
    const dateParts = dateString.split(/[\-\/]/);
    let yearIndex = -1;

    dateParts.forEach((part, index) => {
      if (part.length === 4 && !isNaN(parseInt(part))) {
        yearIndex = index;
      }
    });

    if (yearIndex !== -1) {
      return parseInt(dateParts[yearIndex]);
    } else {
      return null;
    }
  };

  const validate = async (fromDate, toDate) => {
    if (fromDate && toDate && fromDate > toDate) {
      setDateError(true);
      return false;
    }
    return true;
  };

  const handleShow = async (values) => {
    if (load) return;
    setShowEmpError(false);
    setShowDayError(false);
    setDateError(false);

    if (values.fromDate && values.toDate && values.fromDate > values.toDate) {
      setDateError(true);
      document.getElementById("fromDate").focus();
      setLoad(false);
      return false;
    }

    console.log("values---", values);
    try {
      let fromYear = extractYear(values.fromDate);
      let toYear = extractYear(values.toDate);
      setLoad(true);
      let arr = [];

      for (let i = fromYear; i <= toYear; i++) {
        const holidayList = await empApi.holidayList(i);
        console.log("holidayList---", holidayList);
        arr.push(...holidayList.data.data);
      }
      console.log("arr---", arr);

      let dayList = [];

      for (let k = 0; k < arr.length; k++) {
        if (
          arr[k].holiday_date >= values.fromDate &&
          arr[k].holiday_date <= values.toDate
        ) {
          if (
            values.leaveType?.value === "Week Off" &&
            arr[k].weekly_off === 1
          ) {
            dayList.push(arr[k].holiday_date);
          } else if (
            values.leaveType?.value === "Festival" &&
            arr[k].weekly_off === 0
          ) {
            dayList.push(arr[k].holiday_date);
          } else if (!values.leaveType) {
            dayList.push(arr[k].holiday_date);
          }
        }
      }
      console.log("dayList---", dayList);

      let searchStr = [];
      searchStr.push(
        `["status","=","Present"],["custom_is_compensation_off","=",0]`
      );
      if (values.college) {
        searchStr.push(`["company", "=", "${values.college.collegeName}"]`);
      } else {
        searchStr.push(`["company", "=", "${collegeName}"]`);
      }
      if (values.department) {
        searchStr.push(
          `["department", "=", "${values.department.department_id}"]`
        );
      }
      if (values.designation) {
        searchStr.push(
          `["designation", "=", "${values.designation.designation}"]`
        );
      }
      if (values.employeeNumber) {
        searchStr.push(`["employee", "=", "${values.employeeNumber.name}"]`);
      }
      if (dayList.length > 0) {
        searchStr.push(`["attendance_date", "in", "${dayList.join(",")}"]`);
      }

      console.log("searchStr---", searchStr.join(","));
      if (dayList.length > 0) {
        const attendanceDetail = await empApi.getAttendanceCompOff(
          searchStr.join(",")
        );
        console.log("attendanceDetail----", attendanceDetail);
        for (let i = 0; i < attendanceDetail.data.data.length; i++) {
          attendanceDetail.data.data[i].check = false;
        }
        setAttendanceArr(attendanceDetail.data.data);
      }
      setShowRes(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleSubmit = async () => {
    if (load) return;
    try {
      setShowEmpError(false);
      setShowDayError(false);
      let checkCnt = 0;
      for (let i = 0; i < attendanceArr.length; i++) {
        if (attendanceArr[i].check) {
          checkCnt++;
        }
      }
      let err = false;
      if (checkCnt === 0) {
        setShowEmpError(true);
        err = true;
      }
      if (!day) {
        setShowDayError(true);
        err = true;
      }
      if (err) return;
      setLoad(true);
      let success = false;
      for (let i = 0; i < attendanceArr.length; i++) {
        if (attendanceArr[i].check) {
          const checkLeaveAllocation = await empApi.checkLeave(
            attendanceArr[i].employee,
            "Compensatory Off"
          );
          console.log(
            "checkLeaveAllocation----",
            checkLeaveAllocation.data.data,
            day.value
          );

          if (checkLeaveAllocation.data.data.length > 0) {
            const leaveCount =
              parseFloat(day.value) +
              parseFloat(
                checkLeaveAllocation.data.data[0].new_leaves_allocated
              );
            console.log("leaveCount----", leaveCount);

            const editLeaveAllocation = await empApi.editLeaveAllocation(
              checkLeaveAllocation.data.data[0].name,
              leaveCount
            );
            console.log("editLeaveAllocation----", editLeaveAllocation);

            const editAttendanceCompOffRes = await empApi.editAttendanceCompOff(
              attendanceArr[i].name
            );
            console.log(
              "editAttendanceCompOffRes---",
              editAttendanceCompOffRes
            );
            handleUnSavedChanges(0);
            success = true;
          } else {
            setModalMessage("Compensatory Off not allocated");
            setModalTitle("Message");
            setModalErrorOpen(true);
            setLoad(false);
            return;
          }
        }
      }
      if (success) toast.success("Compensatory Off Allocated Successfully");
      handleShow(formikRef.current.values);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const checkAll = (e) => {
    console.log("e---", e.target.checked);
    console.log("attendanceArr---", attendanceArr);
    let arr = attendanceArr;
    if (e.target.checked) {
      for (let i = 0; i < arr.length; i++) {
        attendanceArr[i].check = 1;
      }
    } else {
      for (let i = 0; i < arr.length; i++) {
        attendanceArr[i].check = 0;
      }
    }
    console.log("---", attendanceArr);
    setAttendanceArr([...attendanceArr]);
  };

  const getAllList = async (collegeId) => {
    try {
      const masterRes = await empApi.getAllMasters(2, collegeId);
      console.log("masterRes---", masterRes);
      setDesignationList(masterRes.data.message.data.designation);
      setDepartmentList(masterRes.data.message.data.department);
    } catch (error) {
      console.log("error----", error);
    }
  };

  const employeeSearch = async (value) => {
    try {
      if (value.length > 2) {
        const employeeRes = await empApi.employeeSearch(value);
        console.log("employeeRes", employeeRes.data.message.employee_data);
        setEmpCodeList(employeeRes.data.message.employee_data);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
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
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              college: "",
              fromDate: "",
              toDate: "",
              employeeNumber: "",
              department: "",
              designation: "",
              leaveType: "",
            }}
            validationSchema={FormSchema}
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
            }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="row">
                    <div className="col-lg-10">
                      {collegeConfig.is_university ? (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={1}
                          label="College"
                          id="college"
                          mandatory={1}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            console.log("text---", text);
                            setFieldValue("college", text);
                            getAllList(text?.collegeID);
                            setShowRes(false);
                          }}
                        />
                      ) : null}

                      <DateFieldFormik
                        autoFocus={!collegeConfig.is_university}
                        tabIndex={2}
                        label="From Date"
                        id="fromDate"
                        style={{ width: "30%" }}
                        minDate={moment()
                          .subtract(1, "years")
                          .format("YYYY-MM-DD")}
                        maxDate={new Date()}
                        mandatory={1}
                        onChange={(e) => {
                          setShowRes(false);
                          setDateError(false);
                          // validate(e.target.value, values.toDate);
                          setFieldValue("fromDate", e.target.value);
                        }}
                      />
                      <DateFieldFormik
                        tabIndex={3}
                        label="To Date"
                        id="toDate"
                        style={{ width: "30%" }}
                        minDate={moment()
                          .subtract(1, "years")
                          .format("YYYY-MM-DD")}
                        maxDate={new Date()}
                        mandatory={1}
                        onChange={(e) => {
                          setShowRes(false);
                          setDateError(false);
                          // validate(values.fromDate, e.target.value);
                          setFieldValue("toDate", e.target.value);
                        }}
                        error={
                          dateError
                            ? "From Date should be less than To Date"
                            : ""
                        }
                        touched={dateError ? true : false}
                      />
                      <SelectFieldFormik
                        tabIndex={4}
                        label="Department"
                        id="department"
                        options={departmentList}
                        style={{ width: "60%" }}
                        clear={true}
                        getOptionLabel={(option) => option.department}
                        getOptionValue={(option) => option.department_id}
                        onChange={(text) => {
                          setFieldValue("department", text);
                          setShowRes(false);
                        }}
                      />
                      <SelectFieldFormik
                        tabIndex={5}
                        label="Designation"
                        id="designation"
                        options={designationList}
                        style={{ width: "60%" }}
                        clear={true}
                        getOptionLabel={(option) => option.designation}
                        getOptionValue={(option) => option.designation}
                        onChange={(text) => {
                          setFieldValue("designation", text);
                          setShowRes(false);
                        }}
                      />
                      <SelectFieldFormik
                        tabIndex={6}
                        label="Leave Type"
                        id="leaveType"
                        options={leaveTypeList}
                        style={{ width: "60%" }}
                        clear={true}
                        onChange={(text) => {
                          setFieldValue("leaveType", text);
                          setShowRes(false);
                        }}
                      />
                      <SelectFieldFormik
                        tabIndex={7}
                        label="Employee No. / Name"
                        id="employeeNumber"
                        options={empCodeList}
                        style={{ width: "60%" }}
                        clear={true}
                        searchIcon={true}
                        getOptionLabel={(option) =>
                          option.custom_employeeid +
                          " - " +
                          option.employee_name
                        }
                        getOptionValue={(option) => option.name}
                        onInputChange={(inputValue) => {
                          employeeSearch(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("employeeNumber", text);
                          setShowRes(false);
                        }}
                      />
                    </div>
                    <Button
                      tabIndex={8}
                      type="submit"
                      text="Show"
                      onClick={() => {
                        preFunction.handleErrorFocus(errors);
                      }}
                    />
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
        {showRes && (
          <>
            <div className="row no-gutters">
              <div className="subhead-row">
                <div className="subhead">Employee Details</div>
                <div className="col line-div"></div>
              </div>

              <div className="table-responsive row no-gutters">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th width="1%">No.</th>
                      <th width="5%">Employee No.</th>
                      <th>Name</th>
                      <th width="15%">Department</th>
                      <th width="5%">Worked Date</th>
                      <th width="5%">Status</th>
                      <th width="5%">Leave Day</th>
                      <th width="5%">In Time</th>
                      <th width="5%">Out Time</th>
                      <th width="3%">
                        <input
                          type="checkbox"
                          name="selectAll"
                          id="selectAll"
                          onClick={(e) => {
                            checkAll(e);
                            setShowEmpError(false);
                            setShowDayError(false);
                            handleUnSavedChanges(1);
                          }}
                        />
                      </th>
                    </tr>
                  </thead>
                  {attendanceArr.length === 0 ? (
                    <tbody>
                      <tr>
                        <td align="center" colSpan={10}>
                          No records found
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {attendanceArr.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.custom_employeeid}</td>
                            <td>{item.employee_name}</td>
                            <td>{item.department.split("-")[0]}</td>
                            <td>
                              {moment(item.attendance_date).format(
                                "DD-MM-YYYY"
                              )}
                            </td>
                            <td>{item.status}</td>
                            <td>
                              {item.status == "Half Day"
                                ? "Half Day"
                                : "Full Day"}
                            </td>
                            <td>
                              {item.in_time &&
                                moment(item.in_time).format("HH:mm")}
                            </td>
                            <td>
                              {item.out_time &&
                                moment(item.out_time).format("HH:mm")}
                            </td>
                            <td className="text-center">
                              <input
                                type="checkbox"
                                checked={item.check}
                                onClick={(e) => {
                                  if (!e.target.checked) {
                                    document.getElementById(
                                      "selectAll"
                                    ).checked = false;
                                  }
                                  attendanceArr[index].check =
                                    !attendanceArr[index].check;
                                  setAttendanceArr([...attendanceArr]);
                                  setShowEmpError(false);
                                  setShowDayError(false);
                                  handleUnSavedChanges(1);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
                </table>
              </div>
              <ErrorMessage
                view={showEmpError}
                Message={
                  "Please choose atleast one Employee to add Compansation"
                }
              />
            </div>
            {attendanceArr.length > 0 && (
              <>
                <div className="col-lg-10">
                  <ReactSelectField
                    tabIndex={9}
                    id="day"
                    label={"Compensation Day"}
                    style={{ width: "50%" }}
                    value={day}
                    maxlength={8}
                    mandatory={1}
                    searchIcon={false}
                    options={compensationDayList}
                    onChange={(etxt) => {
                      setDay(etxt);
                      setShowEmpError(false);
                      setShowDayError(false);
                      handleUnSavedChanges(1);
                    }}
                    error={showDayError && "Please choose a day"}
                    touched={showDayError ? true : false}
                  />
                </div>

                <Button
                  tabIndex={10}
                  text="Save"
                  onClick={(e) => {
                    handleSubmit();
                  }}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CompensationOff;
