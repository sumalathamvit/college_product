import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Formik } from "formik";

import attendanceApi from "../../api/attendanceapi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import DateField from "../../component/FormField/DateField";
import Button from "../../component/FormField/Button";
import ScreenTitle from "../../component/common/ScreenTitle";
import ErrorMessage from "../../component/common/ErrorMessage";
import DateFieldFormik from "../../component/FormField/DateFieldFormik";

function PayBillReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [salarySlipError, setSalarySlipError] = useState(false);
  const [needFinalize, setNeedFinalize] = useState(false);
  const [load, setLoad] = useState(false);
  const [fromDateError, setFromDateError] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [fromDate, setFromDate] = useState(
    new Date(moment().subtract(1, "months"))
  );

  const FormSchema = Yup.object().shape({
    fromDate: Yup.string().required("Please select Payroll Month"),
  });

  const getAllList = async (values) => {
    setData([]);
    try {
      const salSlipRes = await attendanceApi.getAllSalarySlips(
        moment(values.fromDate).startOf("month").format("yyyy-MM-DD"),
        moment(values.fromDate).endOf("month").format("yyyy-MM-DD")
      );
      console.log("salSlipRes---", salSlipRes);
      for (let i = 0; i < salSlipRes.data.data.length; i++) {
        if (salSlipRes.data.data[i].docstatus == 0) {
          setNeedFinalize(true);
          break;
        }
      }
      setData(salSlipRes.data.data);
      setShowRes(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFinalize = async () => {
    if (load) return;
    let slipIds = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      if (checkbox.id != "selectAll" && checkbox.checked) {
        slipIds.push(checkbox.value);
      }
    });
    console.log("slipIds---", slipIds);
    if (slipIds.length == 0) {
      setSalarySlipError(true);
      return;
    }
    try {
      setLoad(true);
      for (let i = 0; i < slipIds.length; i++) {
        const submitSalarySlipRes = await attendanceApi.submitSalarySlip(
          slipIds[i]
        );
        console.log("submitSalarySlipRes---", submitSalarySlipRes);
      }
      toast.success("Salary Slips Finalized Successfully");
      getAllList(fromDate);
    } catch (error) {
      console.log("error---", error);
    }
    setLoad(false);
  };

  const checkAll = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    if (document.getElementById("selectAll").checked) {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });
    } else {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
    }
  };

  useEffect(() => {
    // getAllList(fromDate);
    if (location?.state?.fromDate) {
      getAllList(location?.state?.fromDate);
      setFromDate(location?.state?.fromDate);
    }
  }, []);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <Formik
          enableReinitialize={false}
          // innerRef={formikRef}
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
          <div className="row no-gutters mt-3">
            <div className="table-responsive">
              <table className="table table-bordered table-bordered">
                <thead>
                  <tr>
                    <th width="1%">No.</th>
                    {/* <th width="5%">Code</th> */}
                    <th>Name</th>
                    <th width="12%">Designation</th>
                    <th width="23%">Department</th>
                    {/* <th width="5%">Worked</th>
                    <th width="5%">Unmarked</th>
                    <th width="5%">Without Pay</th>
                    <th width="5%">Absent</th>
                    <th width="5%">Payment</th> */}
                    <th width="5%">Earnings (₹)</th>
                    <th width="5%">Deductions (₹)</th>
                    <th width="5%">Gross Pay (₹)</th>
                    <th width="5%">Net Pay (₹)</th>
                    {needFinalize && <th width="5%">Edit</th>}
                    <th width="5%">View</th>
                    {needFinalize && (
                      <th width="1%">
                        <input
                          type="checkbox"
                          name="selectAll"
                          id="selectAll"
                          onClick={(e) => checkAll()}
                        />
                      </th>
                    )}
                  </tr>
                </thead>
                {data?.length > 0 ? (
                  <tbody>
                    {data.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          {/* <td>{item.employee}</td> */}
                          <td>{item.employee_name}</td>
                          <td>{item.designation}</td>
                          <td>{item.department.split("-")[0]}</td>
                          {/* <td align="right">{item.total_working_days}</td>
                          <td align="right">{item.unmarked_days}</td>
                          <td align="right">{item.leave_without_pay}</td>
                          <td align="right">{item.absent_days}</td>
                          <td align="right">{item.payment_days}</td> */}
                          <td align="right">{item.base_gross_pay}</td>
                          <td align="right">{item.total_deduction}</td>
                          <td align="right">{item.gross_pay}</td>
                          <td align="right">{item.net_pay}</td>
                          {needFinalize && (
                            <td>
                              {item.docstatus == 0 && (
                                <Button
                                  isTable={true}
                                  className="btn-3"
                                  title="View"
                                  onClick={() =>
                                    navigate("/edit-salary-slip", {
                                      state: {
                                        id: item.name,
                                        fromDate: fromDate,
                                      },
                                    })
                                  }
                                  text={"Edit"}
                                />
                              )}
                            </td>
                          )}
                          <td>
                            <Button
                              isTable={true}
                              className="btn-3"
                              onClick={() =>
                                navigate("/view-salary-slip", {
                                  state: {
                                    id: item.name,
                                    employeeId: item.employee,
                                    fromDate: fromDate,
                                  },
                                })
                              }
                              text={"View"}
                            />
                          </td>
                          {needFinalize && (
                            <td>
                              {item.docstatus == 0 && (
                                <input
                                  type="checkbox"
                                  name="finalize"
                                  id="finalize"
                                  value={item.name}
                                  onChange={(e) => {}}
                                />
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {needFinalize && (
                      <tr>
                        <td colSpan={9}></td>
                        <td colSpan={2}>
                          <Button
                            isTable={true}
                            type="button"
                            onClick={() => handleFinalize()}
                            text={"Finalize"}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan={20} align="center">
                        No records found
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
              <ErrorMessage
                Message={"Please select atleast one salary slip to Finalize"}
                view={salarySlipError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default PayBillReport;
