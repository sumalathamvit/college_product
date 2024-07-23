import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { toast } from "react-toastify";

import empApi from "../../api/EmployeeApi";

import { timePickerList } from "../../component/common/CommonArray";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import Button from "../../component/FormField/Button";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import TextField from "../../component/FormField/TextField";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import EmployeeCard from "../../HRM/EmployeeCard";
import ModalComponent from "../../component/ModalComponent";
import AuthContext from "../../auth/context";
import CommonApi from "../../component/common/CommonApi";
import ScreenTitle from "../../component/common/ScreenTitle";
import storage from "../../auth/storage";

const FormSchema = Yup.object().shape({});

function PermissionEntry() {
  const navigate = useNavigate();
  const formifRef = useRef();
  const [load, setLoad] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState();
  const [reasonlist, setReasonlist] = useState([]);
  const [otherReason, setOtherReason] = useState("");
  const [otherReasonError, setOtherReasonError] = useState(false);
  const [timeError, setTimeError] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { setUnSavedChanges, collegeId } = useContext(AuthContext);
  const [formSchema, setFormSchema] = useState();
  const collegeConfig = useSelector((state) => state.web.college);
  const [hrmsConfig, setHrmsConfig] = useState({});
  console.log("collegeConfig", collegeConfig);

  const institueArr = storage.getInstituteArray();

  const handleSchema = (PAYROLL_DATE) => {
    if (PAYROLL_DATE == "") return;
    console.log("PAYROLL_DATE--", PAYROLL_DATE);

    let schema = Yup.object().shape({
      permissiondate: Yup.date()
        .required("Please select Date")
        .min(
          moment(PAYROLL_DATE).add(1, "days"),
          `From Date must be after ${moment(PAYROLL_DATE).format("DD-MM-YYYY")}`
        ),
      fromTime: Yup.object().required("Please select From Time"),
      toTime: Yup.object().required("Please select To Time"),
      reason: Yup.object().required("Please select Reason"),
    });
    setFormSchema(schema);
  };

  const getHrmsConfig = async () => {
    try {
      const hrmsData = await empApi.hrmsConfigData(collegeId);
      console.log("hrmsData---", hrmsData);

      const hrmsIndex = hrmsData.data.message.data.config_data.findIndex(
        (item) => item.data === "HRMS_DATA"
      );
      if (hrmsIndex > -1) {
        const parsedValue = JSON.parse(
          hrmsData.data.message.data.config_data[hrmsIndex].value
        );
        console.log("parsedValue---", parsedValue);
        // set the value hrmsConfig to parsedValue
        setHrmsConfig(parsedValue);
      }
    } catch (error) {
      console.log("error", error);
    }
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

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("values-->", values);
    setOtherReasonError(false);
    setTimeError(false);

    if (values.reason.value == "Other Reason" && otherReason == "") {
      document.getElementById("otherReason")?.focus();
      setOtherReasonError(true);
      return;
    }

    const startTime = values.fromTime.value;
    const endTime = values.toTime.value;

    console.log("startTime", startTime);
    console.log("endTime", endTime);
    if (startTime >= endTime) {
      document.getElementById("toTime")?.focus();
      setTimeError(true);
      setLoad(false);
      return;
    }

    try {
      setLoad(true);

      const checkLeaveRes = await empApi.checkLeaveEntry(
        values.employeeCode.name,
        moment(values.permissiondate).format("yyyy-MM-DD")
      );
      console.log("checkLeaveRes---", checkLeaveRes);
      if (checkLeaveRes.data.data.length > 0) {
        setModalMessage(
          "Leave entered for " +
            values.employeeCode.employee_name +
            " on  " +
            moment(values.permissiondate).format("DD-MM-yyyy")
        );
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      const permissionSameDay = await empApi.checkPermissionSameDay(
        values.employeeCode.name,
        moment(values.permissiondate).format("yyyy-MM-DD")
      );
      console.log("permissionSameDay---", permissionSameDay);
      if (permissionSameDay.data.data.length > 0) {
        setModalMessage(
          "Permission already entered for " +
            values.employeeCode.employee_name +
            " on  " +
            moment(values.permissiondate).format("DD-MM-yyyy")
        );
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      const permissionGetRes = await empApi.checkForSameTimePermission(
        values.employeeCode.name,
        moment(values.permissiondate).startOf("month").format("yyyy-MM-DD"),
        moment(values.permissiondate).endOf("month").format("yyyy-MM-DD")
      );
      console.log("permissionGetRes---", permissionGetRes);

      if (
        permissionGetRes.data.data.length == 0 ||
        permissionGetRes.data.data.length == 1
      ) {
        var fromParts = startTime.split(":");
        var toParts = endTime.split(":");

        // Convert hours and minutes to numbers
        var fromHours = parseInt(fromParts[0], 10);
        var fromMinutes = parseInt(fromParts[1], 10);
        var toHours = parseInt(toParts[0], 10);
        var toMinutes = parseInt(toParts[1], 10);
        // Calculate the total minutes for each time
        var totalFromMinutes = fromHours * 60 + fromMinutes;
        var totalToMinutes = toHours * 60 + toMinutes;
        // Calculate the difference in minutes
        var differenceMinutes = totalToMinutes - totalFromMinutes;
        // permissionTime = differenceMinutes;
        // Convert minutes to hours and minutes
        var hours = Math.floor(differenceMinutes / 60);
        var minutes = differenceMinutes % 60;
        console.log("Time difference:", hours, "hours and", minutes, "minutes");
        // calculate the total minutes
        console.log("totalMinutes", differenceMinutes);

        console.log("startTime", startTime);
        console.log("endTime", endTime);
        if (
          differenceMinutes > parseInt(hrmsConfig.PERMISSION) ||
          differenceMinutes == 0
        ) {
          document.getElementById("toTime")?.focus();
          setTimeError(true);
          setLoad(false);
          return;
        }
      }

      if (permissionGetRes.data.data.length >= hrmsConfig.PERMISSIONLIMIT) {
        setModalMessage("Permission exceeded for this month");
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      const permissionRes = await empApi.addPermission(
        values.employeeCode.name,
        moment(values.permissiondate).format("yyyy-MM-DD"),
        employeeInfo.department,
        values.fromTime.value,
        values.toTime.value,
        values.reason.value == "Other Reason"
          ? otherReason
          : values.reason.value
      );
      console.log("permissionRes---", permissionRes);
      if (!permissionRes.ok) {
        setModalMessage(permissionRes.data.exception);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        setLoad(false);
        return;
      } else {
        handleUnSavedChanges(0);
        toast.success("Permission Added Successfully");
        resetForm();
        document?.getElementById("employeeCode")?.focus();
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleGetEmployeeDetails = async (employeeDetail) => {
    formifRef?.current.setFieldValue("permissiondate", new Date());
    formifRef?.current.setFieldValue("fromTime", "");
    formifRef?.current.setFieldValue("toTime", "");
    formifRef?.current.setFieldValue("reason", "");
    setOtherReason("");
    try {
      console.log("enrollNo---", employeeDetail);
      setEmployeeInfo(employeeDetail);
      const getReasonlist = await empApi.getReasonlist();
      console.log("getReasonlist", getReasonlist);
      setReasonlist(getReasonlist.data.data);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const searchEmployee = async (text) => {
    setEmpCodeList(await CommonApi.searchEmployee(text));
  };

  useEffect(() => {
    getHrmsConfig();
  }, []);

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
        <div className="row no-gutters">
          <ScreenTitle titleClass="page-heading-position-report" />
        </div>
        <div className="row no-gutters mt-1">
          <Formik
            innerRef={formifRef}
            enableReinitialize={false}
            initialValues={{
              employeeCode: "",
              permissiondate: new Date(),
              fromTime: "",
              toTime: "",
              reason: "",
            }}
            validationSchema={formSchema}
            onSubmit={handleSave}
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
                    <div className="col-lg-10">
                      <SelectFieldFormik
                        autoFocus
                        label="Employee No. / Name"
                        id="employeeCode"
                        mandatory={1}
                        labelSize={3}
                        tabIndex={1}
                        clear={true}
                        style={{ width: "70%" }}
                        options={empCodeList}
                        searchIcon={true}
                        getOptionLabel={(option) =>
                          option.custom_employeeid +
                          " - " +
                          option.employee_name
                        }
                        getOptionValue={(option) => option.name}
                        onInputChange={(inputValue) => {
                          searchEmployee(inputValue);
                        }}
                        onChange={(text) => {
                          setFieldValue("employeeCode", text);
                          handleGetEmployeeDetails(text);
                          institueArr.map((item) => {
                            if (item.name === text.company) {
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
                    {values.employeeCode ? (
                      <>
                        <div className="subhead-row">
                          <div className="subhead">Employee Details</div>
                          <div className="col line-div"></div>
                        </div>
                        {employeeInfo && (
                          <EmployeeCard employeeInfo={employeeInfo} />
                        )}
                        <div className="subhead-row">
                          <div className="subhead">Permission Details</div>
                          <div className="col line-div"></div>
                        </div>
                        <div className="col-lg-10">
                          <DateFieldFormik
                            label="Permission Date"
                            id="permissiondate"
                            labelSize={3}
                            tabIndex={2}
                            maxDate={moment().add(1, "months").endOf("month")}
                            minDate={moment()
                              .subtract(1, "months")
                              .startOf("months")}
                            mandatory={1}
                            style={{ width: "28%" }}
                            onChange={(e) => {
                              setFieldValue("permissiondate", e.target.value);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <div className="mt-2">
                            <SelectFieldFormik
                              label="From Time"
                              id="fromTime"
                              tabIndex={3}
                              labelSize={3}
                              mandatory={1}
                              maxlength={2}
                              clear={false}
                              options={timePickerList}
                              getOptionLabel={(option) => option.label}
                              getOptionValue={(option) => option.id}
                              style={{ width: "28%" }}
                              onChange={(text) => {
                                setFieldValue("fromTime", text);
                                setTimeError(false);
                                handleUnSavedChanges(1);
                              }}
                            />
                          </div>

                          <SelectFieldFormik
                            label="To Time"
                            id="toTime"
                            tabIndex={4}
                            labelSize={3}
                            mandatory={1}
                            maxlength={2}
                            clear={false}
                            options={timePickerList}
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.id}
                            customErrorMessage={
                              timeError
                                ? `Please select valid Time ${hrmsConfig.PERMISSION} Minutes`
                                : ""
                            }
                            style={{ width: "28%" }}
                            onChange={(text) => {
                              setFieldValue("toTime", text);
                              setTimeError(false);
                              handleUnSavedChanges(1);
                            }}
                          />
                          <SelectFieldFormik
                            label={"Reason"}
                            id="reason"
                            tabIndex={5}
                            labelSize={3}
                            mandatory={1}
                            maxlength={15}
                            style={{ width: "40%" }}
                            options={reasonlist}
                            search={false}
                            onChange={(text) => {
                              setFieldValue("reason", text);
                              handleUnSavedChanges(1);
                            }}
                          />
                          {values?.reason &&
                          values?.reason.value == "Other Reason" ? (
                            <TextField
                              id="otherReason"
                              name="otherReason"
                              tabIndex={
                                values?.reason.value == "Other Reason" ? 6 : ""
                              }
                              placeholder="Other Reason"
                              mandatory={1}
                              labelSize={3}
                              value={otherReason}
                              label="Other Reason"
                              onChange={(e) => {
                                setOtherReason(e.target.value);
                                setOtherReasonError(false);
                              }}
                              style={{ width: "70%" }}
                              maxlength={25}
                              error={
                                otherReasonError
                                  ? "Please enter Other Reason"
                                  : ""
                              }
                              touched={otherReasonError ? true : false}
                            />
                          ) : null}
                        </div>
                        <div className="row ms-2">
                          <Button
                            id="save"
                            tabIndex={
                              values.reason.value == "Other Reason" ? 7 : 6
                            }
                            text="F4 - Save"
                            type="submit"
                            onClick={(e) =>
                              preFunction.handleErrorFocus(errors)
                            }
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default PermissionEntry;
