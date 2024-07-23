import React, { useEffect, useRef, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import moment from "moment";

import empApi from "../../api/EmployeeApi";

import AuthContext from "../../auth/context";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ErrorMessage from "../../component/common/ErrorMessage";
import TextField from "../../component/FormField/TextField";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import Button from "../../component/FormField/Button";
import SelectFieldFormik from "../../component/FormField/SelectFieldFormik";
import ModalComponent from "../../component/ModalComponent";
import TextFieldFormik from "../../component/FormField/TextFieldFormik";
import ScreenTitle from "../../component/common/ScreenTitle";

import EmployeeCard from "../EmployeeCard";

const deductionSchema = Yup.object().shape({
  deduction: Yup.object().required("Please select Deduction type"),
  deductionAmount: Yup.number().required("Please enter valid Deduction amount"),
});

const allowanceSchema = Yup.object().shape({
  allowance: Yup.object().required("Please select Allowance type"),
  allowanceAmount: Yup.number().required("Please enter Allowance amount"),
});

function Increment() {
  //#region const
  const location = useLocation();
  const allowanceFormikRef = useRef();
  const deductionFormikRef = useRef();

  const [load, setLoad] = useState(false);
  const [showAllowanceError, setShowAllowanceError] = useState(false);
  const [showDeductionError, setShowDeductionError] = useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [allowanceList, setAllowanceList] = useState([]);
  const [deductionList, setDeductionList] = useState([]);

  const [oldAllowanceArr, setOldAllowanceArr] = useState([]);
  const [allowanceArr, setAllowanceArr] = useState([]);
  const [oldDeductionArr, setOldDeductionArr] = useState([]);
  const [deductionArr, setDeductionArr] = useState([]);

  const [employeeInfo, setEmployeeInfo] = useState();
  const [amountError, setAmountError] = useState(false);
  const [zeroAllowanceError, setZeroAllowanceError] = useState(false);
  const [zeroDeductionError, setZeroDeductionError] = useState(false);
  const [noChangesError, setNoChangesError] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
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

  const handleAllowanceAdd = async (values) => {
    console.log("values---", values);
    // if allowance amount is zero then return
    if (parseInt(values.allowanceAmount) === 0) {
      setZeroAllowanceError(true);
      document.getElementById("allowanceAmount")?.focus();
      setLoad(false);
      return;
    }
    let obj = {
      id: allowanceArr.length + 1,
      salary_component: values.allowance.salary_component,
      amount: values.allowanceAmount,
      salary_component_abbr: values.allowance.salary_component_abbr,
      statistical_component: values.allowance.statistical_component,
      depends_on_payment_days: values.allowance.depends_on_payment_days,
      is_tax_applicable: values.allowance.is_tax_applicable,
    };
    allowanceArr.push(obj);

    let arr = allowanceList.filter((e) => e.name != values.allowance.name);
    setAllowanceList(arr);

    allowanceFormikRef.current.resetForm();
    document.getElementById("allowance")?.focus();
  };

  const handleDeleteAllowance = (item) => {
    const deleteAllowance = allowanceArr.filter((m) => m !== item);
    setAllowanceArr(deleteAllowance);

    let arr = allowanceList;

    arr.push({
      depends_on_payment_days: item.depends_on_payment_days,
      is_tax_applicable: item.is_tax_applicable,
      name: item.salary_component,
      salary_component: item.salary_component,
      salary_component_abbr: item.salary_component_abbr,
      statistical_component: item.statistical_component,
      type: "Earning",
    });
    setAllowanceList(arr);
  };

  const handleDeductionAdd = async (values) => {
    console.log("values---", values);
    // if deduction amount is zero then return
    if (parseInt(values.deductionAmount) === 0) {
      setZeroDeductionError(true);
      document.getElementById("deductionAmount")?.focus();
      setLoad(false);
      return;
    }
    let obj = {
      id: deductionArr.length + 1,
      salary_component: values.deduction.salary_component,
      amount: values.deductionAmount,
      salary_component_abbr: values.deduction.salary_component_abbr,
      statistical_component: values.deduction.statistical_component,
      depends_on_payment_days: values.deduction.depends_on_payment_days,
      is_tax_applicable: values.deduction.is_tax_applicable,
    };
    deductionArr.push(obj);

    let arr = deductionList.filter((e) => e.name != values.deduction.name);
    setDeductionList(arr);

    deductionFormikRef.current.resetForm();
    document.getElementById("deduction")?.focus();
  };

  const handleDeleteDeduction = (item) => {
    const deleteDeduction = deductionArr.filter((m) => m !== item);
    setDeductionArr(deleteDeduction);

    let arr = deductionList;
    arr.push({
      depends_on_payment_days: item.depends_on_payment_days,
      is_tax_applicable: item.is_tax_applicable,
      name: item.salary_component,
      salary_component: item.salary_component,
      salary_component_abbr: item.salary_component_abbr,
      statistical_component: item.statistical_component,
      type: "Deduction",
    });
    setDeductionList(arr);
  };

  const getAllList = async () => {
    try {
      setLoad(true);

      const allowanceRes = await empApi.getAllowanceList(1);
      console.log("allowanceRes---", allowanceRes);

      let allowanceArr = [];
      let detArr = [];
      for (let i = 0; i < allowanceRes.data.data.length; i++) {
        if (allowanceRes.data.data[i].type == "Earning") {
          allowanceArr.push(allowanceRes.data.data[i]);
        } else {
          detArr.push(allowanceRes.data.data[i]);
        }
      }
      setAllowanceList(allowanceArr);
      setDeductionList(detArr);

      setLoad(false);
    } catch (error) {
      console.log("catch error---", error);
      setLoad(false);
    }
  };

  const salaryEmployee = async (empId) => {
    try {
      const allowanceRes = await empApi.getAllowanceList(1);
      console.log("allowanceRes---", allowanceRes);

      let allowanceArr = [];
      let detArr = [];
      for (let i = 0; i < allowanceRes.data.data.length; i++) {
        if (allowanceRes.data.data[i].type == "Earning") {
          allowanceArr.push(allowanceRes.data.data[i]);
        } else {
          detArr.push(allowanceRes.data.data[i]);
        }
      }

      const getSalary = await empApi.viewSalary(empId);
      console.log("getSalary---", getSalary);
      const Arr = [];
      if (getSalary.ok) {
        let arr = allowanceArr;
        if (getSalary.data.data.earnings.length >= 0) {
          for (let i = 0; i < getSalary.data.data.earnings.length; i++) {
            let obj = {
              id: i + 1,
              salary_component:
                getSalary.data.data.earnings[i].salary_component,
              amount: getSalary.data.data.earnings[i].amount,
              salary_component_abbr: getSalary.data.data.earnings[i].abbr,
              statistical_component:
                getSalary.data.data.earnings[i].statistical_component,
              depends_on_payment_days:
                getSalary.data.data.earnings[i].depends_on_payment_days,
              is_tax_applicable:
                getSalary.data.data.earnings[i].is_tax_applicable,
            };
            Arr.push(obj);
            arr = arr.filter(
              (e) =>
                e.salary_component !=
                getSalary.data.data.earnings[i].salary_component
            );
            console.log("arr", arr);
          }
          setAllowanceList(arr);
          setOldAllowanceArr(Arr);
        }
        const Arr1 = [];

        if (getSalary.data.data.deductions.length >= 0) {
          let arr = detArr;
          for (let i = 0; i < getSalary.data.data.deductions.length; i++) {
            let obj = {
              id: deductionArr.length + 1,
              salary_component:
                getSalary.data.data.deductions[i].salary_component,
              amount: getSalary.data.data.deductions[i].amount,
              salary_component_abbr: getSalary.data.data.deductions[i].abbr,
              statistical_component:
                getSalary.data.data.deductions[i].statistical_component,
              depends_on_payment_days:
                getSalary.data.data.deductions[i].depends_on_payment_days,
              is_tax_applicable:
                getSalary.data.data.deductions[i].is_tax_applicable,
            };
            Arr1.push(obj);
            arr = arr.filter(
              (e) =>
                e.salary_component !=
                getSalary.data.data.deductions[i].salary_component
            );
            console.log("arr", arr);
            setDeductionList(arr);
          }
          setOldDeductionArr(Arr1);
          setDeductionList(arr);
        }
      }
      return;
    } catch (error) {
      console.log("catch error---", error);
      setLoad(false);
      return;
    }
  };

  const handleSubmit = async () => {
    if (load) return;
    console.log("allowanceArrrr", allowanceArr);

    try {
      setLoad(true);

      // concat old and new allowance array
      let allowanceArray = oldAllowanceArr.concat(allowanceArr);
      console.log("allowanceArray---", allowanceArray);

      let deductionArray = oldDeductionArr.concat(deductionArr);
      console.log("deductionArray---", deductionArray);

      console.log("employeeInfo--", employeeInfo);
      // const add_CancelSalaryRes = await empApi.salaryStructureCancelReassign(
      //   employeeInfo?.name,
      //   allowanceArray,
      //   deductionArray,
      //   employeeInfo?.company,
      //   moment(employeeInfo.date_of_joining).format("YYYY-MM-DD")
      // );
      // console.log("salaryStructureCancelReassignRes---", add_CancelSalaryRes);

      // if (!add_CancelSalaryRes.data.message.success) {
      //   setLoad(false);
      //   return;
      // }
      // const createSalaryStructureRes =
      //   await empApi.insertSalaryStructureAssignment(
      //     employeeInfo?.name,
      //     allowanceArray,
      //     deductionArray,
      //     employeeInfo?.company,
      //     moment(employeeInfo.date_of_joining).format("YYYY-MM-DD")
      //   );
      // console.log("createSalaryStructureRes---", createSalaryStructureRes);
      // if (!createSalaryStructureRes.data.message.success) {
      //   setLoad(false);
      //   return;
      // }

      const getSalaryStructureAssignmentRes =
        await empApi.getSalaryStructureAssignment(employeeInfo?.name);
      console.log(
        "getSalaryStructureAssignmentRes---",
        getSalaryStructureAssignmentRes
      );
      if (getSalaryStructureAssignmentRes?.data?.data.length > 0) {
        const cancelDoctypeRes = await empApi.cancelDoctype(
          "Salary Structure Assignment",
          getSalaryStructureAssignmentRes?.data?.data[0]?.name
        );
        console.log("cancelDoctypeRes---", cancelDoctypeRes);
        if (!cancelDoctypeRes.ok) {
          setModalErrorOpen(true);
          setModalMessage(
            JSON.parse(
              JSON.parse(cancelDoctypeRes.data._server_messages)[0]
            ).message.split("<Br>")[0]
          );
          setModalTitle("Message");
          setLoad(false);
          return;
        }
      }
      //rename salary structure
      const renameSalaryStructureRes = await empApi.renameSalaryStructure(
        "Salary Structure",
        employeeInfo?.name,
        employeeInfo?.name + "_" + moment().format("YYYY-MM-DD HH:mm:ss")
      );
      console.log("renameSalaryStructureRes---", renameSalaryStructureRes);
      if (!renameSalaryStructureRes.ok) {
        setModalErrorOpen(true);
        setModalMessage(
          JSON.parse(
            JSON.parse(renameSalaryStructureRes.data._server_messages)[0]
          ).message.split("<Br>")[0]
        );
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      const addEmployeeSalaryDetailRes = await empApi.addEmployeeSalaryDetail(
        employeeInfo?.name,
        moment(employeeInfo.date_of_joining).format("YYYY-MM-DD"),
        employeeInfo?.company,
        allowanceArray,
        deductionArray
      );
      console.log("addEmployeeSalaryDetailRes---", addEmployeeSalaryDetailRes);
      if (!addEmployeeSalaryDetailRes?.data?.message?.success) {
        setModalErrorOpen(true);
        setModalMessage(addEmployeeSalaryDetailRes?.data?.message?.message);
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      const editIncrementDateRes = await empApi.editIncrementDate(
        employeeInfo?.name,
        moment()?.add(1, "years").format("YYYY-MM-DD")
      );
      console.log("editIncrementDateRes---", editIncrementDateRes);
      if (!editIncrementDateRes.ok) {
        setLoad(false);
        return;
      }
      handleUnSavedChanges(0);
      toast.success("Increment Processed Successfully");
      setEmployeeInfo("");
      setAllowanceArr([]);
      setDeductionArr([]);
      setOldAllowanceArr([]);
      setOldAllowanceArr([]);

      setNoChangesError(false);

      document.getElementById("empCode")?.focus();
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleValidate = async () => {
    if (load) return;
    let err = false;
    setAmountError(false);
    setShowAllowanceError(false);
    setShowDeductionError(false);
    setZeroAllowanceError(false);
    setZeroDeductionError(false);
    const allowanceValues = allowanceFormikRef.current.values;
    const deductionValues = deductionFormikRef.current.values;

    if (!noChangesError) {
      setModalErrorOpen(true);
      setModalTitle("Message");
      setModalMessage("No changes made");
      err = true;
      return;
    }

    if (allowanceValues.allowance && allowanceValues.allowanceAmount) {
      console.log("allowanceValues---", allowanceValues);
      handleAllowanceAdd(allowanceValues);
    }

    let totalAllowanceAmount = 0;
    allowanceArr.map((item) => {
      totalAllowanceAmount += item.amount != "" ? parseInt(item.amount) : 0;
    });
    let oldAllowanceAmount = 0;
    oldAllowanceArr.map((item) => {
      oldAllowanceAmount += item.amount != "" ? parseInt(item.amount) : 0;
    });

    console.log(
      "totalAllowanceAmount---",
      totalAllowanceAmount + oldAllowanceAmount
    );
    if (totalAllowanceAmount + oldAllowanceAmount == 0) {
      setShowAllowanceError(true);
      document.getElementById("oldAllowanceAmount0")?.focus();
      err = true;
      setLoad(false);
      return;
    }

    console.log("deductionValues---", deductionValues);
    if (deductionValues.deduction && deductionValues.deductionAmount) {
      console.log("deductionValues---", deductionValues);
      handleDeductionAdd(deductionValues);
    }

    let totalDeductionAmount = 0;
    deductionArr.map((item) => {
      totalDeductionAmount += item.amount != "" ? parseInt(item.amount) : 0;
    });
    let oldDeductionAmount = 0;
    oldDeductionArr.map((item) => {
      oldDeductionAmount += item.amount != "" ? parseInt(item.amount) : 0;
    });
    console.log(
      "totalDeductionAmount---",
      totalDeductionAmount + oldDeductionAmount
    );
    let totalAllowanceAmount1 = totalAllowanceAmount + oldAllowanceAmount;
    let totalDeductionAmount1 = totalDeductionAmount + oldDeductionAmount;

    if (totalDeductionAmount1 > totalAllowanceAmount1) {
      document.getElementById("oldDeductionAmount0")?.focus();
      setAmountError(true);
      err = true;
    }

    if (!err) {
      setLoad(true);
      handleSubmit();
    }
  };

  const employeeSearch = async (value) => {
    setEmpCodeList([]);
    try {
      if (value.length > 2) {
        const employeeRes = await empApi.employeeSearch(value);
        console.log("employeeRes", employeeRes);
        setEmpCodeList(employeeRes.data.message.employee_data);
        return employeeRes.data.message.employee_data;
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  const handlePromotion = async (id) => {
    console.log("id---", id);
    const empdata = await employeeSearch(id);
    console.log("empdata---", empdata);
    for (let i = 0; i < empdata.length; i++) {
      if (empdata[i].name === id) {
        console.log("here---", empdata[i]);
        setEmployeeInfo(empdata[i]);
        await handleGetEmployeeDetails(empdata[i]);
        break;
      }
    }
  };

  const handleGetEmployeeDetails = async (employeeDetail) => {
    console.log("employeeDetail---", employeeDetail);
    setEmployeeInfo(employeeDetail);
    setAllowanceArr([]);
    setOldAllowanceArr([]);
    setDeductionArr([]);
    setNoChangesError(false);
    setAmountError(false);
    setShowAllowanceError(false);
    setShowDeductionError(false);
    setZeroAllowanceError(false);
    setZeroDeductionError(false);
    try {
      setLoad(true);
      console.log("employeeDetail---", employeeDetail);
      await salaryEmployee(employeeDetail.name);
      allowanceFormikRef?.current?.resetForm();
      deductionFormikRef?.current?.resetForm();
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error----", error);
    }
  };

  useEffect(() => {
    location?.state?.id && handlePromotion(location?.state?.id);
    getAllList();
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
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="col-lg-9 mt-1">
          <ReactSelectField
            autoFocus
            label="Employee No. / Name"
            id="empCode"
            mandatory={1}
            tabIndex={1}
            value={employeeInfo}
            clear={false}
            labelSize={3}
            style={{ width: "70%" }}
            options={empCodeList}
            getOptionLabel={(option) =>
              option.custom_employeeid + " - " + option.employee_name
            }
            getOptionValue={(option) => option.name}
            onInputChange={(inputValue) => {
              employeeSearch(inputValue);
            }}
            onChange={(text) => {
              handleGetEmployeeDetails(text);
            }}
          />
        </div>
        {employeeInfo && (
          <>
            <div className="subhead-row">
              <div className="subhead">Employee Details</div>
              <div className="col line-div"></div>
            </div>
            <EmployeeCard employeeInfo={employeeInfo} />
            {/* <div className="subhead-row">
              <div className="subhead">Joining Date Details</div>
              <div className="col line-div"></div>
            </div>
            <DisplayText
              label="Date of Joining"
              value={moment(employeeInfo?.date_of_joining).format("DD-MM-YYYY")}
              labelSize={3}
            /> */}
            {employeeInfo.name ? (
              <>
                <div className="row no-gutters">
                  <div className="col-lg-6 pe-2">
                    <Formik
                      enableReinitialize={true}
                      innerRef={allowanceFormikRef}
                      initialValues={{
                        empCode: "",
                        allowance: "",
                        allowanceAmount: "",
                      }}
                      validationSchema={allowanceSchema}
                      onSubmit={handleAllowanceAdd}
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
                            <div className="subhead-row">
                              <div className="subhead">
                                New Allowance Detail
                              </div>
                              <div className="col line-div"></div>
                            </div>
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Allowance</th>
                                  <th width="15%">Allowance Amount(₹)</th>
                                  <th width="10%"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {oldAllowanceArr.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{item.salary_component}</td>
                                      <td align="right">
                                        <TextField
                                          placeholder={" "}
                                          isAmount={true}
                                          id={"oldAllowanceAmount" + index}
                                          mandatory={1}
                                          maxlength={7}
                                          tabIndex={6}
                                          value={item.amount}
                                          onChange={(e) => {
                                            setAmountError(false);
                                            handleUnSavedChanges(1);
                                            if (
                                              preFunction.amountValidation(
                                                e.target.value
                                              )
                                            ) {
                                              oldAllowanceArr[index].amount =
                                                e.target.value;
                                              setOldAllowanceArr([
                                                ...oldAllowanceArr,
                                              ]);
                                              console.log("oldAllowanceArr", [
                                                ...oldAllowanceArr,
                                              ]);
                                              setNoChangesError(true);
                                              setShowAllowanceError(false);
                                            }
                                          }}
                                        />
                                      </td>
                                      <td></td>
                                    </tr>
                                  );
                                })}
                                {allowanceArr.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{item.salary_component}</td>
                                      <td align="right">{item.amount}</td>
                                      <td>
                                        <Button
                                          isTable={true}
                                          type="button"
                                          className="plus-button"
                                          text="-"
                                          onClick={() =>
                                            handleDeleteAllowance(item)
                                          }
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                                {allowanceList.length > 0 ? (
                                  <tr>
                                    <td>
                                      <SelectFieldFormik
                                        id="allowance"
                                        mandatory={1}
                                        isTable={true}
                                        tabIndex={2}
                                        placeholder="Allowance"
                                        getOptionLabel={(option) => option.name}
                                        getOptionValue={(option) => option.name}
                                        options={allowanceList}
                                        maxlength={20}
                                        onChange={(text) => {
                                          setShowAllowanceError(false);
                                          setAmountError(false);
                                          setFieldValue("allowance", text);
                                          handleUnSavedChanges(1);
                                          setShowAllowanceError(false);
                                        }}
                                      />
                                    </td>
                                    <td align="right">
                                      <TextFieldFormik
                                        id="allowanceAmount"
                                        name="allowanceAmount"
                                        isTable={true}
                                        placeholder=" "
                                        tabIndex={3}
                                        mandatory={1}
                                        error={
                                          zeroAllowanceError
                                            ? "Please enter valid Allowance amount"
                                            : ""
                                        }
                                        onChange={(e) => {
                                          setShowAllowanceError(false);
                                          setAmountError(false);
                                          setZeroAllowanceError(false);
                                          if (
                                            preFunction.amountValidation(
                                              e.target.value
                                            )
                                          ) {
                                            setFieldValue(
                                              "allowanceAmount",
                                              e.target.value
                                            );
                                          }
                                          handleUnSavedChanges(1);
                                          setNoChangesError(true);
                                        }}
                                        maxlength={7}
                                        isAmount={true}
                                      />
                                    </td>
                                    <td>
                                      <Button
                                        isTable={true}
                                        text="+"
                                        tabIndex={4}
                                        type="submit"
                                        className="plus-button"
                                        onClick={(e) =>
                                          preFunction.handleErrorFocus(errors)
                                        }
                                      />
                                    </td>
                                  </tr>
                                ) : null}
                              </tbody>
                            </table>
                            <ErrorMessage
                              view={showAllowanceError}
                              Message={"Please enter New Allowance Detail"}
                            />
                            <ErrorMessage
                              view={amountError}
                              Message={
                                "Deduction amount is more than Allowance amount"
                              }
                            />
                          </form>
                        );
                      }}
                    </Formik>
                  </div>
                  <div className="col-lg-6 ps-2">
                    <Formik
                      enableReinitialize={true}
                      innerRef={deductionFormikRef}
                      initialValues={{
                        deduction: "",
                        deductionAmount: "",
                      }}
                      validationSchema={deductionSchema}
                      onSubmit={handleDeductionAdd}
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
                            <div className="subhead-row">
                              <div className="subhead">
                                New Deduction Detail
                              </div>
                              <div className="col line-div"></div>
                            </div>
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Deduction</th>
                                  <th width="15%">Deduction Amount(₹)</th>
                                  <th width="10%"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {oldDeductionArr.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{item.salary_component}</td>
                                      <td align="right">
                                        <TextField
                                          placeholder={" "}
                                          isAmount={true}
                                          id={"oldDeductionAmount" + index}
                                          mandatory={1}
                                          maxlength={7}
                                          tabIndex={6}
                                          value={item.amount}
                                          onChange={(e) => {
                                            setAmountError(false);
                                            handleUnSavedChanges(1);
                                            if (
                                              preFunction.amountValidation(
                                                e.target.value
                                              )
                                            ) {
                                              oldDeductionArr[index].amount =
                                                e.target.value;
                                              setOldDeductionArr([
                                                ...oldDeductionArr,
                                              ]);
                                              console.log("oldDeductionArr", [
                                                ...oldDeductionArr,
                                              ]);
                                              setNoChangesError(true);
                                              setShowDeductionError(false);
                                            }
                                          }}
                                        />
                                      </td>
                                      <td></td>
                                    </tr>
                                  );
                                })}
                                {deductionArr.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{item.salary_component}</td>
                                      <td align="right">{item.amount}</td>
                                      <td>
                                        <Button
                                          isTable={true}
                                          className="plus-button"
                                          text="-"
                                          onClick={() =>
                                            handleDeleteDeduction(item)
                                          }
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                                {deductionList.length > 0 ? (
                                  <tr>
                                    <td>
                                      <SelectFieldFormik
                                        id="deduction"
                                        mandatory={1}
                                        isTable={true}
                                        tabIndex={5}
                                        placeholder="Deduction"
                                        getOptionLabel={(option) => option.name}
                                        getOptionValue={(option) => option.name}
                                        options={deductionList}
                                        onChange={(text) => {
                                          setShowDeductionError(false);
                                          setAmountError(false);
                                          setFieldValue("deduction", text);
                                          handleUnSavedChanges(1);
                                          setShowDeductionError(false);
                                        }}
                                      />
                                    </td>
                                    <td align="right">
                                      <TextFieldFormik
                                        id="deductionAmount"
                                        name="deductionAmount"
                                        placeholder=" "
                                        isTable={true}
                                        mandatory={1}
                                        tabIndex={6}
                                        error={
                                          zeroDeductionError
                                            ? "Please enter valid Deduction amount"
                                            : ""
                                        }
                                        onChange={(e) => {
                                          if (
                                            preFunction.amountValidation(
                                              e.target.value
                                            )
                                          )
                                            setFieldValue(
                                              "deductionAmount",
                                              e.target.value
                                            );
                                          handleUnSavedChanges(1);
                                          setAmountError(false);
                                          setNoChangesError(true);
                                        }}
                                        maxlength={7}
                                        isAmount={true}
                                      />
                                    </td>
                                    <td>
                                      <Button
                                        isTable={true}
                                        text="+"
                                        type="submit"
                                        tabIndex={7}
                                        className="plus-button"
                                        onClick={(e) =>
                                          preFunction.handleErrorFocus(errors)
                                        }
                                      />
                                    </td>
                                  </tr>
                                ) : null}
                              </tbody>
                            </table>
                            <ErrorMessage
                              view={showDeductionError}
                              Message={"Please enter New Deduction Detail"}
                            />
                          </form>
                        );
                      }}
                    </Formik>
                  </div>
                </div>
                <Button
                  id="save"
                  tabIndex={8}
                  text={"F4 - Save"}
                  type={"button"}
                  isTable={true}
                  onClick={(e) => {
                    handleValidate();
                  }}
                />
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default Increment;
