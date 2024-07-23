import React, { useState, useContext, useRef } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { useSelector } from "react-redux";
import * as Yup from "yup";

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
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import { Formik } from "formik";

function PermissionCancel() {
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [reasonError, setReasonError] = useState(false);
  const [empCode, setEmpCode] = useState("");
  const [empCodeList, setEmpCodeList] = useState([]);
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState(
    moment().startOf("month").format("YYYY-MM-DD")
  );
  const [toDate, setToDate] = useState(
    moment().endOf("month").format("YYYY-MM-DD")
  );
  const [toDateError, setToDateError] = useState(false);
  const [fromDateError, setFromDateError] = useState(false);
  const [empCodeError, setEmpCodeError] = useState(false);

  const [permissionArr, setPermissionArr] = useState([]);
  const [checkIndex, setCheckIndex] = useState(-1);
  const [employeeInfo, setEmployeeInfo] = useState();
  const [permissionCancelError, setPermissionCancelError] = useState(false);
  const [dateValidationerror, setDateValidationerror] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const { setUnSavedChanges } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);
  const [formSchema, setFormSchema] = useState();

  const institueArr = storage.getInstituteArray();

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
    setEmpCodeError(false);
    setPermissionCancelError(false);
    setDateValidationerror(false);
    setToDateError(false);
    setFromDateError(false);
  };

  const handleSchema = (PAYROLL_DATE) => {
    if (PAYROLL_DATE == "") return;
    console.log("PAYROLL_DATE--", PAYROLL_DATE);

    let schema = Yup.object().shape({
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
    });
    setFormSchema(schema);
  };

  const handleShow = async (values) => {
    if (load) return;
    setPermissionArr([]);
    closeErrors();
    let err = false;
    if (!empCode) {
      document.getElementById("empCode")?.focus();
      setEmpCodeError(true);
      return;
    }

    try {
      setLoad(true);
      const permissionApplication = await empApi.getPermissionApplication(
        moment(values.fromDate).format("YYYY-MM-DD"),
        moment(values.toDate).format("YYYY-MM-DD"),
        empCode.name
      );
      console.log("permissionApplication", permissionApplication);
      if (permissionApplication.data.data.length == 0) {
        setModalMessage("No Permission found");
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      } else {
        setPermissionArr(permissionApplication.data.data);
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
      setPermissionCancelError(true);
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
      console.log("permissionArr", permissionArr);

      setLoad(true);
      const editPermissionApplication =
        await empApi.cancelPermissionApplication(
          permissionArr[checkIndex].name,
          reason
        );
      console.log("editLeaveApplication", editPermissionApplication);
      if (!editPermissionApplication.ok) {
        setLoad(false);
        return;
      }
      const fiterAttendence = await empApi.getPermissionAttendence(
        employeeInfo.name,
        moment(permissionArr[checkIndex].date).format("YYYY-MM-DD")
      );
      console.log("fiterAttendence", fiterAttendence);
      if (!fiterAttendence.ok) {
        setLoad(false);
        return;
      }
      if (fiterAttendence.data.data.length > 0) {
        const cancelAttendance = await empApi.cancelPermisssionAttendance(
          fiterAttendence.data.data[0].name
        );
        console.log("cancelAttendance", cancelAttendance);
        if (!cancelAttendance.ok) {
          setLoad(false);
          return;
        }
      }

      handleUnSavedChanges(0);
      toast.success("Permission Cancelled Successfully");

      setEmpCode("");
      setFromDate(moment().startOf("month").format("YYYY-MM-DD"));
      setToDate(moment().endOf("month").format("YYYY-MM-DD"));
      setEmployeeInfo("");
      setPermissionArr([]);
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
    setFromDate(moment().startOf("month").format("YYYY-MM-DD"));
    setToDate(moment().endOf("month").format("YYYY-MM-DD"));
    setPermissionArr([]);
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
        <div className="row no-gutters">
          <ScreenTitle titleClass="page-heading-position-report" />
        </div>
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
            error={empCodeError ? "Please select Employee" : ""}
          />
        </div>
        {empCode ? (
          <>
            <div className="subhead-row">
              <div className="subhead">Employee Details</div>
              <div className="col line-div"></div>
            </div>

            {employeeInfo && <EmployeeCard employeeInfo={employeeInfo} />}

            <Formik
              innerRef={formikRef}
              enableReinitialize={false}
              initialValues={{
                fromDate: "",
                toDate: "",
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
                    <div className="col-lg-9 mt-3">
                      <DateFieldFormik
                        label="From Date"
                        id="fromDate"
                        labelSize={3}
                        maxDate={moment().endOf("month").add(1, "months")}
                        minDate={moment().subtract(1, "months")}
                        mandatory={1}
                        tabIndex={2}
                        style={{ width: "30%" }}
                        onChange={(e) => {
                          setFieldValue("fromDate", e.target.value);
                          handleUnSavedChanges(1);
                          setPermissionArr([]);
                          setDateValidationerror(false);
                          setFromDateError(false);
                        }}
                      />

                      <DateFieldFormik
                        label="To Date"
                        id="toDate"
                        labelSize={3}
                        tabIndex={3}
                        style={{ width: "30%" }}
                        maxDate={moment().add(1, "months").endOf("months")}
                        minDate={moment().subtract(1, "months")}
                        mandatory={1}
                        onChange={(e) => {
                          setFieldValue("toDate", e.target.value);
                          handleUnSavedChanges(1);
                          setPermissionArr([]);
                          setDateValidationerror(false);
                          setToDateError(false);
                        }}
                      />
                    </div>
                    {permissionArr.length === 0 ? (
                      <Button
                        text={"Show"}
                        tabIndex={4}
                        onClick={(e) => preFunction.handleErrorFocus(errors)}
                      />
                    ) : null}
                  </form>
                );
              }}
            </Formik>
          </>
        ) : null}
        {permissionArr.length > 0 ? (
          <>
            <div className="subhead-row">
              <div className="subhead">Applied Permission Details</div>
              <div className="col line-div"></div>
            </div>
            <div className="table-responsive row mt-1 p-0">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th width="1%">No.</th>
                    <th width="10%">Permission Date</th>
                    <th width="15%">From Time</th>
                    <th width="15%">To Time</th>
                    <th>Reason</th>
                    <th width="5%">Cancel</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionArr.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{moment(item.date).format("DD-MM-YYYY")}</td>
                        <td>{item.from_time}</td>
                        <td>{item.to_time}</td>
                        <td>{item.reason}</td>
                        <td className="text-center">
                          <CustomTextInput
                            name="cancel"
                            type="radio"
                            onChange={(e) => {
                              console.log("-----", e.target.checked);
                              permissionArr[index] = {
                                ...permissionArr[index],
                                check: !permissionArr[index].check,
                              };
                              setCheckIndex(index);
                              setPermissionCancelError(false);
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
              Message={"Please select atleast one Permission"}
              view={permissionCancelError}
            />
            <div className="col-lg-9">
              <TextAreaField
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
                maxlength={200}
                placeholder="Note"
                error={reasonError ? "Please enter Reason" : ""}
                touched={reasonError ? true : false}
              />
            </div>
            <Button
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

export default PermissionCancel;
