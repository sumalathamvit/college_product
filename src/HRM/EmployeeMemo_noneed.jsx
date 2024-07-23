import React, { useEffect, useState } from "react";
import { Formik, yupToFormErrors } from "formik";
import moment from "moment";

import "react-datepicker/dist/react-datepicker.css";
import empApi from "../api/EmployeeApi";

import { authorizedByList } from "../component/common/CommonArray";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ReactSelectField from "../component/FormField/ReactSelectField";
import TextAreaField from "../component/FormField/TextareaField";
import Button from "../component/FormField/Button";
import DateField from "../component/FormField/DateField";

function BookReturn() {
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [empCode, setEmpCode] = useState("");
  const [empCodeList, setEmpCodeList] = useState([]);
  const [issueBy, setIssueBy] = useState("");
  const DateCustomInput = preFunction.DateCustomInput;

  const getAllList = async () => {
    try {
      const empRes = await empApi.getAllEmployee();
      console.log("studentRes---", empRes);
      for (let i = 0; i < empRes.data.data.length; i++) {
        empRes.data.data[i].value = empRes.data.data[i].name;
        empRes.data.data[i].label =
          empRes.data.data[i].name + " - " + empRes.data.data[i].employee_name;
      }
      setEmpCodeList(empRes.data.data);
    } catch (error) {
      console.log("error----", error);
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
        <div className="pd mb-4">
          <div className="row">
            <div className="col-lg-2"></div>
            <div className="bg-white pb-5 col-lg-8">
              <div className="row">
                <h4 className="text-center mt-4">Employee Memo</h4>
              </div>
              <div className="row mt-3">
                <Formik
                  enableReinitialize={true}
                  initialValues={{
                    empCode: empCode,
                  }}
                  // validationSchema={OtherDetailsSchema}
                  // onSubmit={(values) => {
                  //   console.log(values);
                  //   handleSave(values);
                  // }}
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
                        <div className="row mt-3">
                          <ReactSelectField
                            label="Employee Number"
                            id="salutation"
                            mandatory={1}
                            value={values.empCode}
                            error={errors.empCode}
                            touched={touched.empCode}
                            placeholder="Employee Number"
                            options={empCodeList}
                            onChange={(etxt) => {
                              setEmpCode(etxt);
                            }}
                          />
                          {empCode ? (
                            <>
                              {empCode.employee_name ? (
                                <div className="row mt-1">
                                  <label className="control-label col-lg-5">
                                    Employee Name :
                                  </label>
                                  <div className=" col-lg-5 pt-2 ps-1 ">
                                    {empCode.employee_name}
                                  </div>
                                </div>
                              ) : null}
                              {empCode.department ? (
                                <div className="row mt-1">
                                  <label className="control-label col-lg-5">
                                    Department :
                                  </label>
                                  <div className=" col-lg-5 pt-2 ps-1 ">
                                    {empCode.department.split("-")[0]}
                                  </div>
                                </div>
                              ) : null}
                              {empCode.designation ? (
                                <div className="row mt-1">
                                  <label className="control-label col-lg-5">
                                    Desgination :
                                  </label>
                                  <div className=" col-lg-5 pt-2 ps-1 ">
                                    {empCode.designation}
                                  </div>
                                </div>
                              ) : null}
                              <DateField
                                label="Issue Date"
                                id="issueDate"
                                error={errors.issueDate}
                                touched={touched.issueDate}
                                maxDate={new Date()}
                                minDate={new Date()}
                                value={values.issueDate}
                                onChange={(e) => {
                                  setFieldValue("issueDate", e.target.value);
                                }}
                              />

                              <ReactSelectField
                                label="Issue By"
                                id="issueBy"
                                mandatory={1}
                                value={values.issueBy}
                                error={errors.issueBy}
                                touched={touched.issueBy}
                                placeholder="Issue By"
                                options={authorizedByList}
                                onChange={(etxt) => {
                                  setIssueBy(etxt);
                                }}
                              />
                              <TextAreaField
                                id="memoReason"
                                placeholder="Memo Reason"
                                label="Memo Reason"
                                value={values.memoReason}
                                error={errors.memoReason}
                                touched={touched.memoReason}
                                onChange={handleChange}
                                style={{ width: "150%" }}
                                maxlength={140}
                                mandatory={1}
                              />
                              <Button text="Next" type="submit" />
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
        </div>
      </div>
    </div>
  );
}

export default BookReturn;
