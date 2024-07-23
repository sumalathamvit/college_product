import React, { useEffect, useState, useContext, useRef } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import moment from "moment";
import { Formik } from "formik";
import { useSelector } from "react-redux";

import employeeApi from "../../api/EmployeeApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ErrorMessage from "../../component/common/ErrorMessage";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import TextField from "./../../component/FormField/TextField";
import ScreenTitle from "../../component/common/ScreenTitle";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";

import AuthContext from "../../auth/context";
import storage from "../../auth/storage";

function ResetAllowanceDeduction() {
  //#region const
  const [load, setLoad] = useState(false);
  const [employeeError, setEmployeeError] = useState(false);
  const [showRes, setShowRes] = useState(false);

  const { setUnSavedChanges, collegeName, collegeId } = useContext(AuthContext);

  const [empGroupList, setEmpGroupList] = useState([]);
  const [salaryComponentArr, setSalaryComponentArr] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [allowanceSchema, setAllowanceSchema] = useState();

  const collegeConfig = useSelector((state) => state.web.college);

  const institueArr = storage.getInstituteArray();

  const formikRef = useRef();

  const handleSchema = (PAYROLL_DATE) => {
    console.log("PAYROLL_DATE", PAYROLL_DATE);
    if (PAYROLL_DATE == "") {
      let schema = Yup.object().shape({
        college: collegeConfig.is_university
          ? Yup.object().required("Please select College")
          : Yup.mixed().notRequired(),
        payrollDate: Yup.date().required("Please select Payroll Month"),
        empGroup: Yup.object().required("Please select Employee Group"),
        allowance: Yup.object().required("Please select Allowance / Deduction"),
        resetAmount: Yup.number()
          .min(1, "Please enter valid Amount")
          .required("Please enter Amount"),
      });
      console.log("schema", schema);
      setAllowanceSchema(schema);
      return;
    }
    console.log("PAYROLL_DATE", PAYROLL_DATE);

    let schema = Yup.object().shape({
      college: collegeConfig.is_university
        ? Yup.object().required("Please select College")
        : Yup.mixed().notRequired(),
      payrollDate: Yup.date()
        .required("Please select Payroll Month")
        .min(
          moment(PAYROLL_DATE),
          `Payroll Month must be after ${moment(PAYROLL_DATE).format(
            "MMM-YYYY"
          )}`
        ),
      empGroup: Yup.object().required("Please select Employee Group"),
      allowance: Yup.object().required("Please select Allowance / Deduction"),
      resetAmount: Yup.number()
        .min(1, "Please enter valid Amount")
        .required("Please enter Amount"),
    });
    console.log("schema", schema);
    setAllowanceSchema(schema);
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

  const handleCheckBoxOnchange = () => {
    let arr = employeeList;
    setEmployeeList([]);
    console.log("arr", arr);
    for (let i = 0; i < arr.length; i++) {
      arr[i].amount = "";
    }
    console.log("arr------", arr);
    setEmployeeList([...arr]);
  };

  const checkPayrollEntry = async (date) => {
    if (!date || date === "") {
      formikRef.current.setFieldTouched("payrollDate", true);
      formikRef.current.setErrors({
        payrollDate: "Please select Payroll Month",
      });
      document.getElementById("payrollDate").focus();
      return false;
    }
    return true;
  };

  const checkSameMonthAdditionalSalary = async (employeeList, values) => {
    try {
      const payrollEntry = await checkPayrollEntry(values.payrollDate);
      if (!payrollEntry) return false;
      setLoad(true);
      let employeearr = [];
      for (let i = 0; i < employeeList.length; i++) {
        if (parseInt(employeeList[i].amount) > 0) {
          const checkSameMonthAdditionalSalaryRes =
            await employeeApi.checkSameMonthAdditionalSalary(
              employeeList[i].name,
              values.allowance.salary_component,
              moment(values.payrollDate).startOf("month").format("yyyy-MM-DD"),
              moment(values.payrollDate).endOf("month").format("yyyy-MM-DD")
            );
          console.log(
            "checkSameMonthAdditionalSalaryRes---",
            checkSameMonthAdditionalSalaryRes
          );
          if (checkSameMonthAdditionalSalaryRes.data.data.length == 0) {
            let obj = {
              amount: employeeList[i].amount,
              department: employeeList[i].department,
              designation: employeeList[i].designation,
              employeeActivityGroupDetailID:
                employeeList[i].employeeActivityGroupDetailID,
              employeeID: employeeList[i].employeeID,
              employeeName: employeeList[i].employeeName,
              isActive: employeeList[i].isActive,
              name: employeeList[i].name,
              dateofJoining: employeeList[i].date_of_joining,
            };
            employeearr.push(obj);
          }
        }
      }
      if (employeearr.length == 0) {
        setModalMessage(
          values.allowance.salary_component +
            " already added for this Employee Group in this month"
        );
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return false;
      }
      setLoad(false);
      return employeearr;
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  const handleGroupEmployee = async (values) => {
    if (load) return;
    setEmployeeList([]);
    setEmployeeError(false);
    console.log("text---", values);
    try {
      setLoad(true);
      const getAllAssignedStudentsRes =
        await employeeApi.getAllAssignedGroupEmployee(
          values.empGroup.employeeActivityGroupID
        );
      console.log("getAllAssignedStudentsRes---", getAllAssignedStudentsRes);
      if (getAllAssignedStudentsRes.data.message.data.employees.length === 0) {
        setModalMessage("No Employees found for this group");
        setModalTitle("Message");
        setModalErrorOpen(true);
        setLoad(false);
        return;
      }
      let empArr = getAllAssignedStudentsRes.data.message.data.employees.filter(
        (m) => m.isActive === 1
      );
      empArr = empArr.map((item) => {
        return {
          ...item,
          amount: values.resetAmount,
        };
      });
      console.log("empArr---", empArr);
      const checkAdditionalSalary = await checkSameMonthAdditionalSalary(
        empArr,
        values
      );
      console.log("checkAdditionalSalary---", checkAdditionalSalary);
      if (!checkAdditionalSalary) {
        setLoad(false);
        return;
      }
      setShowRes(true);
      setEmployeeList(checkAdditionalSalary);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleReset = async (values) => {
    setEmployeeError(false);
    if (load) return;
    console.log("values----", values);
    let amountEntered = false;
    for (let i = 0; i < employeeList.length; i++) {
      if (parseInt(employeeList[i].amount) > 0) {
        amountEntered = true;
        break;
      }
    }
    if (!amountEntered) {
      setEmployeeError("Please enter atleast one amount");
      document.getElementById("amount0")?.focus();
      setLoad(false);
      return;
    }

    try {
      setLoad(true);
      console.log("collegeName---", collegeName);
      for (let i = 0; i < employeeList.length; i++) {
        if (parseInt(employeeList[i].amount) > 0) {
          const addAdditionalSalaryRes = await employeeApi.addAdditionalSalary(
            collegeName,
            employeeList[i].name,
            moment(values.payrollDate).endOf("month").format("yyyy-MM-DD"),
            parseInt(employeeList[i].amount),
            "",
            values.allowance.salary_component
          );
          console.log("addAdditionalSalaryRes---", addAdditionalSalaryRes);
          if (!addAdditionalSalaryRes.ok) {
            setModalErrorOpen(true);
            setModalMessage(
              JSON.parse(
                JSON.parse(addAdditionalSalaryRes.data._server_messages)[0]
              ).message.split("<Br>")[0]
            );
            setLoad(false);
            return;
          }
        }
      }
      handleUnSavedChanges(0);
      toast.success("Allowance / Deduction Reset Successfully");
      setShowRes(false);
      setEmployeeList([]);
      formikRef.current.resetForm();
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async () => {
    try {
      const allowanceRes = await employeeApi.getAllowanceList(0);
      console.log("allowanceRes---", allowanceRes);
      setSalaryComponentArr(allowanceRes.data.data);
    } catch (error) {
      console.log("catch error---", error);
    }
  };

  const getEmployeeGroupList = async (collegeId) => {
    try {
      const getAllActivityGroupRes =
        await employeeApi.getAllEmployeeActivityGroup(collegeId);
      console.log("getAllActivityGroupRes---", getAllActivityGroupRes);
      setEmpGroupList(
        getAllActivityGroupRes.data.message.data.employee_activity_group
      );
    } catch (error) {
      console.log("catch error---", error);
    }
  };

  useEffect(() => {
    getAllList();
    console.log("collegeConfig", collegeConfig);
    if (collegeConfig.institution_type === 4) {
      handleSchema("");
    } else {
      console.log("institueArr", institueArr);
      institueArr.map((item) => {
        if (item.collegeID == collegeId) {
          handleSchema(
            item.PAYROLL_DATE ? moment(item.PAYROLL_DATE, "DD-MM-YYYY") : ""
          );
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getEmployeeGroupList(collegeId);
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
        <ScreenTitle titleClass="page-heading-position" />
        <Formik
          innerRef={formikRef}
          enableReinitialize={false}
          initialValues={{
            college: "",
            empGroup: "",
            allowance: "",
            resetAmount: "",
            payrollDate: moment(),
          }}
          validationSchema={allowanceSchema}
          onSubmit={handleGroupEmployee}
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
                <div className="col-lg-12">
                  {collegeConfig.is_university && (
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={0}
                      labelSize={4}
                      label="College"
                      id="college"
                      mandatory={1}
                      matchFrom="start"
                      options={collegeConfig?.collegeList}
                      getOptionLabel={(option) => option?.collegeName}
                      getOptionValue={(option) => option?.collegeID}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setFieldValue("college", text);
                        getEmployeeGroupList(text?.collegeID);
                        institueArr.map((item) => {
                          if (item.collegeID === text?.collegeID) {
                            handleSchema(
                              item.PAYROLL_DATE
                                ? moment(item.PAYROLL_DATE, "DD-MM-YYYY")
                                : ""
                            );
                          }
                        });
                      }}
                    />
                  )}
                  <DateFieldFormik
                    autofocus
                    label="Payroll Month"
                    id="payrollDate"
                    labelSize={4}
                    type="month"
                    mandatory={1}
                    tabIndex={1}
                    maxDate={new Date(moment().add(2, "months"))}
                    minDate={new Date(moment().subtract(5, "months"))}
                    style={{ width: "30%" }}
                    onChange={(e) => {
                      setFieldValue("payrollDate", e.target.value);
                      setShowRes(false);
                    }}
                  />
                </div>
                <div className="mt-2">
                  <SelectFieldFormik
                    label="Employee Group"
                    labelSize={4}
                    id="empGroup"
                    mandatory={1}
                    tabIndex={2}
                    style={{ width: "75%" }}
                    options={empGroupList}
                    getOptionLabel={(option) =>
                      option.employeeActivityGroupName
                    }
                    getOptionValue={(option) => option.employeeActivityGroupID}
                    onChange={(text) => {
                      setFieldValue("empGroup", text);
                      handleUnSavedChanges(1);
                      setShowRes(false);
                    }}
                  />
                  <SelectFieldFormik
                    id="allowance"
                    mandatory={1}
                    tabIndex={3}
                    searchIcon={false}
                    label="Allowance / Deduction"
                    style={{ width: "75%" }}
                    labelSize={4}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.name}
                    options={salaryComponentArr}
                    value={values.allowance}
                    onChange={(text) => {
                      setFieldValue("allowance", text);
                      handleUnSavedChanges(1);
                      setShowRes(false);
                    }}
                  />
                  <TextFieldFormik
                    id="resetAmount"
                    placeholder=" "
                    label="Amount (र)"
                    labelSize={4}
                    tabIndex={4}
                    mandatory={1}
                    maxlength={6}
                    isAmount={true}
                    onChange={(e) => {
                      setFieldValue("resetAmount", e.target.value);
                      handleUnSavedChanges(1);
                      setShowRes(false);
                    }}
                    style={{ width: "18%" }}
                  />
                  {!showRes ? (
                    <Button
                      type="submit"
                      id="add"
                      tabIndex={5}
                      text="Show"
                      onClick={(e) => preFunction.handleErrorFocus(errors)}
                    />
                  ) : (
                    <>
                      <div className="subhead-row">
                        <div className="subhead">Employee Detail </div>
                        <div className="col line-div"></div>
                      </div>
                      {employeeList.length > 0 && (
                        <div className="row no-gutters">
                          <div className="col-lg-9"></div>
                          <div className="col-lg-3 text-right mb-2">
                            <a
                              href="javascript:void(0)"
                              onClick={(e) => handleCheckBoxOnchange()}
                            >
                              Clear All Amount
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="row no-gutters">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th width="5%">Employee No.</th>
                              <th>Name</th>
                              <th width="8%">Amount (र)</th>
                            </tr>
                          </thead>
                          {employeeList.length === 0 ? (
                            <tbody>
                              <tr>
                                <td colSpan="4" className="text-center">
                                  No Employees found
                                </td>
                              </tr>
                            </tbody>
                          ) : (
                            <tbody>
                              {employeeList.map((item, index) => {
                                return (
                                  <tr>
                                    <td>{index + 1}</td>
                                    <td>{item.employeeID}</td>
                                    <td>{item.employeeName}</td>
                                    <td>
                                      <TextField
                                        isTable={true}
                                        isAmount={true}
                                        id={"amount" + index}
                                        placeholder=" "
                                        tabIndex={4}
                                        maxlength={6}
                                        mandatory={1}
                                        value={item.amount}
                                        onChange={(e) => {
                                          setEmployeeError(false);
                                          employeeList[index].amount =
                                            e.target.value;
                                          setEmployeeList([...employeeList]);
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
                        <ErrorMessage
                          view={employeeError}
                          Message={
                            "Please enter atleast one amount for employee"
                          }
                        />
                      </div>
                      {employeeList.length > 0 && (
                        <Button
                          id="save"
                          type="button"
                          tabIndex={6}
                          isTable={true}
                          text="F4 - Save"
                          onClick={(e) => handleReset(values)}
                        />
                      )}
                    </>
                  )}
                </div>
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default ResetAllowanceDeduction;
