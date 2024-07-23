import React, { useEffect, useState, useRef, createRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import moment from "moment";
import DateField from "../../component/FormField/DateField";
import string from "../../string";
import { Formik } from "formik";

import empApi from "../../api/EmployeeApi";

import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ErrorMessage from "../../component/common/ErrorMessage";
import TextField from "../../component/FormField/TextField";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import Button from "../../component/FormField/Button";

const loanSchema = Yup.object().shape({
  employeeCode: Yup.object().required("Please select Employee No."),
});

function LoanRepayment() {
  //#region const
  const navigate = useNavigate();
  const location = useLocation();
  const [load, setLoad] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmployeeLoanArrError, setShowEmployeeLoanArrError] =
    useState(false);
  const [empCodeList, setEmpCodeList] = useState([]);
  const [salaryComponentArr, setSalaryComponentArr] = useState([]);
  const [allowanceList, setAllowanceList] = useState([]);
  const [deductionList, setDeductionList] = useState([]);
  const [employeeLoanArr, setEmployeeLoanArr] = useState([]);

  const getAllList = async () => {
    try {
      setLoad(true);

      const empRes = await empApi.getAllEmployee();
      console.log("studentRes---", empRes);
      for (let i = 0; i < empRes.data.data.length; i++) {
        empRes.data.data[i].value = empRes.data.data[i].name;
        empRes.data.data[i].label =
          empRes.data.data[i].name + " - " + empRes.data.data[i].employee_name;
      }
      setEmpCodeList(empRes.data.data);
      console.log("studentRes---", empRes.data.data);
      const allowanceRes = await empApi.getAllowanceList();
      console.log("allowanceRes---", allowanceRes);
      setSalaryComponentArr(allowanceRes.data.data);
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

  const handleSubmit = async () => {
    try {
      setLoad(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
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
        <div className="pd row">
          <div className="col-lg-1"></div>
          <div className="bg-white pb-5 col-lg-10">
            <div className="row no-gutters text-center">
              <h4 className="mt-4 text-center">Loan Repayment</h4>
            </div>
            <div className="row no-gutters mt-2">
              <div className="row">
                <div className="col-lg-1"></div>
                <div className="col-lg-10">
                  <Formik
                    enableReinitialize={true}
                    initialValues={{
                      employeeCode: "",
                    }}
                    validationSchema={loanSchema}
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
                    }) => {
                      return (
                        <form onSubmit={handleSubmit} autoComplete="off">
                          <ReactSelectField
                            label="Employee No."
                            id="employeeCode"
                            error={errors.employeeCode}
                            touched={touched.employeeCode}
                            value={values.employeeCode}
                            options={empCodeList}
                            style={{ width: "80%" }}
                            mandatory={1}
                            onChange={(text) =>
                              setFieldValue("employeeCode", text)
                            }
                          />
                          {values.employeeCode ? (
                            <>
                              {values.employeeCode.employee_name ? (
                                <div className="row mt-1">
                                  <label className="control-label col-lg-5">
                                    Employee Name :
                                  </label>
                                  <div className=" col-lg-5 pt-2 ps-1 ">
                                    {values.employeeCode.employee_name}
                                  </div>
                                </div>
                              ) : null}
                              {values.employeeCode.department ? (
                                <div className="row mt-1">
                                  <label className="control-label col-lg-5">
                                    Department :
                                  </label>
                                  <div className=" col-lg-5 pt-2 ps-1 ">
                                    {
                                      values.employeeCode.department.split(
                                        "-"
                                      )[0]
                                    }
                                  </div>
                                </div>
                              ) : null}
                              {values.employeeCode.designation ? (
                                <div className="row mt-1">
                                  <label className="control-label col-lg-5">
                                    Desgination :
                                  </label>
                                  <div className=" col-lg-5 pt-2 ps-1 ">
                                    {values.employeeCode.designation}
                                  </div>
                                </div>
                              ) : null}
                            </>
                          ) : null}

                          <label className="mt-2">Employee Loan Details:</label>
                          <table className="table table-bordered table-hover">
                            <thead>
                              <tr>
                                <th>No.</th>
                                <th>Particulars</th>
                                <th>Total Amount</th>
                                <th>Paid Amount</th>
                                <th>Due Amount</th>
                                <th>Pay Amount</th>
                                <th>Paid</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* {employeeLoanArr.map((item, index) => {
                                  return ( */}
                              <tr>
                                <td>{1}</td>
                                <td>{"Employee Loan"}</td>
                                <td>{12000}</td>
                                <td>{5000}</td>
                                <td>{4000}</td>
                                <td>{1200}</td>
                                <td>{"Yes"}</td>
                              </tr>
                              {/* );
                                })} */}
                            </tbody>
                          </table>
                        </form>
                      );
                    }}
                  </Formik>
                </div>
              </div>
            </div>
            {/* <div className="row mt-3 ">
              <label className="control-label col-lg-5"></label>
              <div className="col-lg-7 ps-1">
                <div className="form-group col-lg-6">
                  <button
                    className="btn"
                    title="Save"
                    onClick={(e) => {
                      preFunction.handleErrorFocus(errors);
                      handleSubmit();
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanRepayment;
