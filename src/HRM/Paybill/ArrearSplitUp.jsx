import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik } from "formik";
import moment from "moment";
import * as Yup from "yup";
import { useSelector } from "react-redux";

import employeeApi from "../../api/EmployeeApi";
import attendanceApi from "../../api/attendanceapi";

import CommonApi from "../../component/common/CommonApi";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import { arrearReasonList } from "../../component/common/CommonArray";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import TextFieldFormik from "./../../component/FormField/TextFieldFormik";
import Button from "../../component/FormField/Button";
import ModalComponent from "../../component/ModalComponent";
import ScreenTitle from "./../../component/common/ScreenTitle";

import AuthContext from "../../auth/context";

import EmployeeCard from "../../HRM/EmployeeCard";
import storage from "../../auth/storage";

function ArrearSplitUp() {
  const formikRef = useRef();
  const [load, setLoad] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState();
  const [amountError, setAmountError] = useState(false);
  const [FormSchema, setFormSchema] = useState();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const { collegeName, setUnSavedChanges } = useContext(AuthContext);
  const institueArr = storage.getInstituteArray();

  const handleSchema = (PAYROLL_DATE) => {
    console.log("PAYROLL_DATE---", moment(PAYROLL_DATE).format("DD-MM-YYYY"));
    if (PAYROLL_DATE == "") {
      return;
    }
    let schema = Yup.object().shape({
      amount: Yup.number("Please enter valid Amount").required(
        "Please enter Amount"
      ),
      reason: Yup.object().required("Please select Reason"),
      payrollDate: Yup.date()
        .required("Please select Month/Year")
        .min(
          moment(PAYROLL_DATE).add(1, "days"),
          `From Date must be after ${moment(PAYROLL_DATE).format("DD-MM-YYYY")}`
        ),
    });
    console.log("schema---", schema);
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

  const checkPayrollEntry = async (emp, date) => {
    console.log("date---", date);
    let pDate = "";
    institueArr.map((item) => {
      if (item.name === emp.company) {
        pDate = item.PAYROLL_DATE;
      }
    });
    if (moment(date).startOf("month") <= moment(pDate)) {
      setModalMessage(
        "Salary already processed for this month  " +
          moment(date).format("MMMM-yyyy")
      );
      setModalTitle("Message");
      setModalErrorOpen(true);
      setLoad(false);
      return false;
    }
    return true;
  };

  const handleSave = async (values, { resetForm }) => {
    if (load) return;
    console.log("values----", values);
    console.log("values.employeeCode.name----", values.employeeCode.name);
    if (parseInt(values.amount) === 0) {
      document.getElementById("amount").focus();
      setAmountError(true);
      setLoad(false);
      return;
    }
    try {
      const payrollEntry = await checkPayrollEntry(
        values.employeeCode,
        values.payrollDate
      );
      if (!payrollEntry) return;
      setLoad(true);

      const arrearGetRes = await employeeApi.checkSameMonthArrearSplitup(
        values.employeeCode.name,
        moment(values.payrollDate).endOf("month").format("yyyy-MM-DD")
      );
      console.log("arrearGetRes---", arrearGetRes);

      if (arrearGetRes.data.data.length > 0) {
        setModalMessage(
          "Arrear already entered for " +
            values.employeeCode.employee_name +
            " on  " +
            moment(values.payrollDate).format("MMM-yyyy")
        );
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }

      const addAdditionalSalaryRes = await employeeApi.addAdditionalSalary(
        collegeName,
        values.employeeCode.name,
        moment(values.payrollDate).endOf("month").format("yyyy-MM-DD"),
        parseInt(values.amount),
        values.reason.value,
        "Arrear"
      );
      console.log("addAdditionalSalaryRes---", addAdditionalSalaryRes);

      if (!addAdditionalSalaryRes.ok) {
        setModalMessage(addAdditionalSalaryRes.data.exception);
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      toast.success("Arrear Added Successfully");
      resetForm();
      document.getElementById("employeeCode").focus();

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const handleGetEmployeeDetails = async (employeeDetail) => {
    formikRef.current.setFieldValue("payrollDate", "");
    formikRef.current.setFieldValue("amount", "");
    formikRef.current.setFieldValue("reason", "");
    try {
      setLoad(true);

      console.log("employeeInfo", employeeInfo);
      console.log("enrollNo---", employeeDetail);
      setEmployeeInfo(employeeDetail);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  const searchEmployee = async (text) => {
    setEmpCodeList(await CommonApi.searchEmployee(text));
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
        <div className="row no-gutters mt-1">
          <Formik
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={{
              employeeCode: "",
              reason: "",
              amount: "",
              payrollDate: "",
            }}
            validationSchema={FormSchema}
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
                        tabIndex={1}
                        labelSize={3}
                        clear={true}
                        style={{ width: "60%" }}
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
                        <div className="col-lg-10 mt-3">
                          <TextFieldFormik
                            id="amount"
                            label="Amount (₹)"
                            placeholder=" "
                            tabIndex={2}
                            mandatory={1}
                            labelSize={3}
                            style={{ width: "17%" }}
                            maxlength={7}
                            isAmount={true}
                            error={
                              amountError ? "Please enter valid amount" : ""
                            }
                            onChange={(e) => {
                              if (preFunction.amountValidation(e.target.value))
                                setFieldValue("amount", e.target.value);
                              handleUnSavedChanges(1);
                              setAmountError(false);
                            }}
                          />
                          <SelectFieldFormik
                            label="Reason"
                            id="reason"
                            tabIndex={3}
                            mandatory={1}
                            labelSize={3}
                            options={arrearReasonList}
                            style={{ width: "35%" }}
                            onChange={(text) => {
                              setFieldValue("reason", text);
                              handleUnSavedChanges(1);
                            }}
                          />

                          <DateFieldFormik
                            label="Payroll Month"
                            id="payrollDate"
                            type="month"
                            tabIndex={4}
                            labelSize={3}
                            mandatory={1}
                            style={{ width: "25%" }}
                            maxDate={new Date(moment().add(2, "months"))}
                            minDate={new Date(moment().subtract(4, "months"))}
                            onChange={(e) => {
                              setFieldValue("payrollDate", e.target.value);
                              // checkPayrollEntry(e.target.value);
                              handleUnSavedChanges(1);
                            }}
                          />
                        </div>

                        <Button
                          id="save"
                          text="F4 - Save"
                          type="submit"
                          tabIndex={5}
                          onClick={(e) => preFunction.handleErrorFocus(errors)}
                        />
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

export default ArrearSplitUp;
