import React, { useEffect, useState, useRef, createRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import DatePicker from "react-datepicker";
import moment from "moment";

import empApi from "../../api/EmployeeApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ReactSelectField from "../../component/FormField/ReactSelectField";
import Button from "../../component/FormField/Button";

const employeeSchema = Yup.object().shape({
  empCode: Yup.object().required("Please select Employee No."),
  month: Yup.string().required("Please select Month"),
});

function EmployeeWithHold() {
  //#region const
  const navigate = useNavigate();
  const location = useLocation();
  const [load, setLoad] = useState(false);
  const [empCode, setEmpCode] = useState("");
  const [empCodeList, setEmpCodeList] = useState([]);
  const [fromDate, setFromDate] = useState(
    new Date(moment().subtract(1, "months"))
  );
  const DateCustomInput = preFunction.DateCustomInput;
  const [employeeArr, setEmployeeArr] = useState([]);

  const handleAdd = async (values, { resetForm }) => {
    console.log("employeeArr---", employeeArr);
    let employeeDetails = employeeArr;
    let obj = {
      id: employeeArr.length + 1,
      // salary_component: values.allowance.value,
      // amount: values.allowanceAmount,
    };
    employeeDetails.push(obj);
    console.log("obj-----", employeeDetails);
    setEmployeeArr(employeeDetails);
    resetForm();
  };

  const handleDelete = (item) => {
    console.log("sdsfsdf");
    const deleteWithHold = employeeArr.filter((m) => m !== item);
    setEmployeeArr(deleteWithHold);
  };

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

      setLoad(false);
    } catch (error) {
      console.log("catch error---", error);
      setLoad(false);
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
      <div className="row" onClick={preFunction.hideNavbar}>
        <div className="pd row">
          <div className="col-lg-1"></div>
          <div className="bg-white pb-6 col-lg-10">
            <div className="row no-gutters text-center">
              <h4 className="mt-4 text-center">Employee With Hold</h4>
            </div>
            <div className="row no-gutters">
              <div className="row">
                <div className="row pt-5 p-3">
                  <div className="col-lg-2"></div>
                  <div className="col-lg-8">
                    <Formik
                      enableReinitialize={true}
                      initialValues={{
                        empCode: "",
                        month: "",
                      }}
                      validationSchema={employeeSchema}
                      onSubmit={handleAdd}
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
                            <table className="table table-bordered table-hover">
                              <thead>
                                <tr>
                                  <th width="1%">No.</th>
                                  <th>Employee No.</th>
                                  <th width="15%">With Hold Month</th>
                                  <th width="10%"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {employeeArr.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>{item.employee}</td>
                                      <td>{item.amount}</td>
                                    </tr>
                                  );
                                })}
                                {employeeArr.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>{item.employee}</td>
                                      <td>{item.date}</td>
                                      <td>
                                        <Button
                                          label="no"
                                          className="plus-button"
                                          text="-"
                                          onClick={() => handleDelete(item)}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                                <tr>
                                  <td>{employeeArr.length + 1}</td>
                                  <td>
                                    <ReactSelectField
                                      id="empCode"
                                      placeholder="Employee No. / Name"
                                      errors={errors.empCode}
                                      touched={touched.empCode}
                                      value={values.empCode}
                                      options={empCodeList}
                                      mandatory={1}
                                      style={{ width: "100%" }}
                                      onChange={(text) => {
                                        // setEmpCode(etxt);
                                        setFieldValue("empCode", text);
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <DatePicker
                                      name="fromDate"
                                      id="fromDate"
                                      openToDate={fromDate}
                                      value={fromDate}
                                      onChange={(e) => {
                                        setFromDate(e.target.value);
                                      }}
                                      minDate={moment().subtract(2, "years")._d}
                                      maxDate={new Date()}
                                    />
                                  </td>
                                  <td>
                                    <Button
                                      label={"no"}
                                      text="+"
                                      type="submit"
                                      className="plus-button"
                                      onClick={(e) =>
                                        preFunction.handleErrorFocus(errors)
                                      }
                                    />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </form>
                        );
                      }}
                    </Formik>
                  </div>
                  <div className="row">
                    <Button
                      text={"Save"}
                      type="button"
                      onClick={(e) => {
                        // handleSave(e);
                      }}
                    />
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

export default EmployeeWithHold;
