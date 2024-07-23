import React, { useState } from "react";
import moment from "moment";
import * as Yup from "yup";
import { Formik } from "formik";

import employeeapi from "../../api/EmployeeApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";

import Button from "../../component/FormField/Button";
import ScreenTitle from "../../component/common/ScreenTitle";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";

function ResetAllowanceDeductionList() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [showRes, setShowRes] = useState(false);

  const FormSchema = Yup.object().shape({
    fromDate: Yup.string().required("Please select Payroll Month"),
  });

  const getAllList = async (values) => {
    try {
      setLoad(true);

      const arrearSplitupRes = await employeeapi.getAdditionalSalary(
        moment(values.fromDate).startOf("month").format("yyyy-MM-DD"),
        moment(values.fromDate).endOf("month").format("yyyy-MM-DD")
      );
      console.log("ArrearSplitupRes---", arrearSplitupRes);
      setShowRes(true);
      setData(arrearSplitupRes.data.data);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <Formik
          enableReinitialize={false}
          initialValues={{
            fromDate: moment(),
          }}
          validationSchema={FormSchema}
          onSubmit={getAllList}
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
                <div className="row no-gutters mt-1 ">
                  <div className="col-lg-3 pe-4">
                    <DateFieldFormik
                      autoFocus
                      label={"Payroll Month"}
                      labelSize={6}
                      id="fromDate"
                      type="month"
                      tabindex={1}
                      mandatory={1}
                      onChange={(e) => {
                        setFieldValue("fromDate", e.target.value);
                      }}
                      maxDate={new Date()}
                      minDate={moment().subtract(2, "years")}
                    />
                  </div>
                  <div className="col-lg-2">
                    <Button
                      frmButton={false}
                      tabindex={2}
                      isCenter={false}
                      text="Show"
                    />
                  </div>
                </div>
              </form>
            );
          }}
        </Formik>

        {showRes && (
          <div className="table-responsive mt-3">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th width="1%">No.</th>
                  <th>Name</th>
                  <th width="25%">Allowance / Deduction</th>
                  <th width="10%">Payroll Month</th>
                  <th width="10%" style={{ textAlign: "right" }}>
                    Amount (र)
                  </th>
                </tr>
              </thead>
              {data.length > 0 ? (
                <tbody>
                  {data.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="nowrapWhiteSpace">
                          {item.employee_name}
                        </td>
                        <td>{item.salary_component}</td>
                        <td>{moment(item.payroll_date).format("MMMM-YYYY")}</td>
                        <td align="right">{item.amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td align="center" colSpan={6}>
                      No data found
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default ResetAllowanceDeductionList;
