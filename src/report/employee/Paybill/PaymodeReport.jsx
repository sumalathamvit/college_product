import React, { useEffect, useState, useContext, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";

import { useSelector } from "react-redux";

import AuthContext from "../../../auth/context";

import empApi from "../../../api/EmployeeApi";

import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import Button from "../../../component/FormField/Button";
import DateFieldFormik from "../../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import ScreenTitle from "../../../component/common/ScreenTitle";
import ErrorMessage from "../../../component/common/ErrorMessage";

import {
  boldStyle,
  topLineStyle,
  totStyle,
} from "../../../component/common/CommonArray";

import string from "../../../string";

function PaymodeReport() {
  const formikRef = useRef();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [filterError, setFilterError] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const [empCodeList, setEmpCodeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [payModeList, setPayModeList] = useState([]);
  const [bankList, setBankList] = useState([]);

  const { collegeId, collegeName } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  let totalPay = 0;

  const reportSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    salaryMonth: Yup.date()
      .min(
        moment().subtract(10, "years").toDate(),
        `The Payroll Month should be  ${moment()
          .subtract(10, "years")
          .format("MM-YYYY")}`
      )
      .max(
        moment().toDate(),
        `The Payroll Month should be  ${moment().format("MM-YYYY")} or before`
      )
      .required("Please select Payroll Month"),
  });

  const handleCSVData = async (exportData, type, values) => {
    console.log("exportData", exportData);
    try {
      setLoad(true);

      var pdfData = [];

      if (type === 2) {
        pdfData.push([
          "No.",
          "Emp. No.",
          "Emp. Name",
          "Designation",
          "Bank Name",
          "IFSC Code",
          "Account No.",
          "Net Pay",
        ]);
      } else {
        var filterContent = [];

        filterContent.push([
          {
            content: `Payroll Month : ${moment(values.salaryMonth).format(
              "MMM-YYYY"
            )}`,
            styles: boldStyle,
          },
        ]);

        (values.payMode || values.bankName) &&
          filterContent.push([
            {
              content:
                (values.payMode
                  ? `Pay Mode : ${values.payMode.salary_mode}`
                  : "") +
                (values.bankName
                  ? `   Bank Name : ${values.bankName.bank}`
                  : ""),
              styles: boldStyle,
            },
          ]);

        (values.department || values.designation) &&
          filterContent.push([
            {
              content:
                (values.department
                  ? `Department : ${values.department.department}`
                  : "") +
                (values.designation
                  ? `   Designation : ${values.designation.designation}`
                  : ""),
              styles: boldStyle,
            },
          ]);

        values.employeeNumber &&
          filterContent.push([
            {
              content: values.employeeNumber
                ? `Employee No. / Name : ${values.employeeNumber.custom_employeeid} - ${values.employeeNumber.employee_name}`
                : "",
              styles: boldStyle,
            },
          ]);

        var head1 = [
          [
            { content: "No.", styles: topLineStyle },
            { content: "Emp. No.", styles: topLineStyle },
            { content: "Emp. Name", styles: topLineStyle },
            { content: "Designation", styles: topLineStyle },
            { content: "Bank Name", styles: topLineStyle },
            { content: "IFSC Code", styles: topLineStyle },
            { content: "Account No.", styles: topLineStyle },
            { content: "Net Pay", styles: topLineStyle },
          ],
        ];
      }

      exportData.map((item, index) => {
        if (index === 0 || exportData[index - 1].bank_name !== item.bank_name) {
          if (type === 1) {
            pdfData.push([
              {
                content: item.bank_name
                  ? `Bank Name : ${item.bank_name}`
                  : `Cash`,
                styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                colSpan: 9,
              },
            ]);
          } else {
            pdfData.push([
              item.bank_name
                ? `Bank Name : ${item.bank_name}, , , , ,`
                : `Cash, , , , ,`,
            ]);
          }
        }

        if (
          index === 0 ||
          exportData[index - 1].department !== item.department
        ) {
          if (type === 1) {
            pdfData.push([
              {
                content: `${"Department: " + item.department.split(" - ")[0]} `,
                styles: { textColor: [50, 50, 50], fontStyle: "bold" },
                colSpan: 9,
              },
            ]);
          } else {
            pdfData.push([
              "Department : " + item.department.split(" - ")[0] + ", , , , ,",
            ]);
          }
        }

        pdfData.push([
          index + 1,
          item.custom_employeeid,
          item.employee_name,
          item.designation,
          item.bank_name,
          item.ifsc_code,
          item.bank_account_no,
          type === 1
            ? {
                content: item.net_pay,
                styles: { halign: "right" },
              }
            : item.net_pay,
        ]);

        if (index === exportData.length - 1) {
          totalPay = exportData.reduce(
            (acc, item) => acc + parseFloat(item.net_pay),
            0
          );
          if (type === 1) {
            pdfData.push([
              {
                content: `Total : ${totalPay}`,
                styles: totStyle,
                colSpan: 9,
              },
            ]);
          } else {
            pdfData.push([`, , , , , , Total : ${totalPay}`]);
          }
        }
      });

      if (type === 2) {
        preFunction.downloadCSV(pdfData, "Pay Mode Report.csv");
      } else {
        let pdfHeadToPass = [[], [...head1]];
        let pdfDataToPass = [filterContent, [...pdfData]];

        var columnWidth = [5, 8, 15, 15, 22, 13, 15, 7];

        let colWidthToPass = [[], [...columnWidth]];

        preFunction.generatePDFContent(
          collegeName,
          "Pay Mode Report",
          pdfHeadToPass,
          pdfDataToPass,
          colWidthToPass,
          "Portrait",
          "a3"
        );
      }

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const handleShow = async (values, showAll, report) => {
    console.log("values", values);
    setShowRes(true);
    try {
      setLoad(true);
      setShowRes(true);

      let fromDate = moment(values.salaryMonth)
        .startOf("month")
        .format("YYYY-MM-DD");
      let toDate = moment(values.salaryMonth)
        .endOf("month")
        .format("YYYY-MM-DD");

      const payModeRes = await empApi.getPayModeReport(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        fromDate,
        toDate,
        values.payMode ? values.payMode.salary_mode : null,
        values.bankName ? values.bankName.bank : null,
        values.department ? values.department.department_id : null,
        values.designation ? values.designation.designation : null,
        values.employeeNumber ? values.employeeNumber.custom_employeeid : null,
        showAll == 1 ? 1 : 0
      );

      console.log("studentRes", payModeRes);

      let payModeData =
        payModeRes?.data?.message?.data?.pay_mode_bank_detail_report;

      if (report) {
        handleCSVData(payModeData, report, values);
      } else {
        setData(payModeData);
        setShowLoadMore(false);
        if (payModeData.length === string.PAGE_LIMIT) {
          setShowLoadMore(true);
        }
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  const getAllList = async (collegeId) => {
    try {
      if (collegeId) {
        const masterList = await empApi.getAllMasters(2, collegeId);
        console.log("MasterList5", masterList);
        setDepartmentList(masterList.data.message.data.department);
        setDesignationList(masterList.data.message.data.designation);
        setPayModeList(masterList.data.message.data.salaryMode);
        setBankList(masterList.data.message.data.bank);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const employeeSearch = async (value) => {
    try {
      if (value.length > 2) {
        const employeeRes = await empApi.employeeSearch(value);
        console.log("employeeRes", employeeRes.data.message.employee_data);
        setEmpCodeList(employeeRes.data.message.employee_data);
      } else {
        setEmpCodeList([]);
      }
    } catch (error) {
      console.log("error----", error);
    }
  };

  const handleClear = () => {
    setData([]);
    setShowRes(false);
    setFilterError(false);
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getAllList(collegeId);
    }
  }, [collegeConfig.is_university]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <Formik
            enableReinitialize={false}
            innerRef={formikRef}
            initialValues={{
              college: "",
              salaryMonth: moment().subtract(1, "months").format("yyyy-MM"),
              payMode: "",
              bankName: "",
              department: "",
              designation: "",
              employeeNumber: "",
            }}
            validationSchema={reportSchema}
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
                  {collegeConfig.institution_type !== 1 ? (
                    <>
                      {collegeConfig.is_university ? (
                        <SelectFieldFormik
                          autoFocus
                          tabIndex={1}
                          label="College"
                          id="college"
                          mandatory={1}
                          options={collegeConfig.collegeList}
                          getOptionLabel={(option) => option.collegeName}
                          getOptionValue={(option) => option.collegeID}
                          style={{ width: "60%" }}
                          searchIcon={false}
                          clear={false}
                          onChange={(text) => {
                            setFieldValue("college", text);
                            getAllList(text ? text.collegeID : null);
                          }}
                        />
                      ) : null}
                    </>
                  ) : null}
                  <DateFieldFormik
                    label="Payroll Month"
                    type="month"
                    id="salaryMonth"
                    tabIndex={collegeConfig.institution_type == 1 ? 1 : 2}
                    style={{ width: "20%" }}
                    maxDate={new Date()}
                    minDate={new Date(moment().subtract(10, "years"))}
                    mandatory={1}
                    onChange={(e) => {
                      setFieldValue("salaryMonth", e.target.value);
                    }}
                  />
                  <SelectFieldFormik
                    label="Pay Mode"
                    id="payMode"
                    tabIndex={collegeConfig.institution_type === 1 ? 2 : 3}
                    style={{ width: "20%" }}
                    clear={true}
                    getOptionLabel={(option) => option.salary_mode}
                    getOptionValue={(option) => option.salary_mode}
                    options={payModeList}
                    onChange={(text) => {
                      setFieldValue("payMode", text);
                      handleClear();
                    }}
                    maxlength={15}
                  />
                  <SelectFieldFormik
                    label="Bank Name"
                    tabIndex={collegeConfig.institution_type === 1 ? 3 : 4}
                    id="bankName"
                    style={{ width: "60%" }}
                    clear={true}
                    getOptionLabel={(option) => option.bank}
                    getOptionValue={(option) => option.bank}
                    options={bankList}
                    onChange={(text) => {
                      setFieldValue("bankName", text);
                      handleClear();
                    }}
                    maxlength={30}
                  />
                  <SelectFieldFormik
                    tabIndex={collegeConfig.institution_type === 1 ? 4 : 5}
                    label="Department"
                    id="department"
                    style={{ width: "40%" }}
                    options={departmentList}
                    clear={true}
                    getOptionLabel={(option) => option.department}
                    getOptionValue={(option) => option.department_id}
                    onChange={(text) => {
                      setFieldValue("department", text);
                      handleClear();
                    }}
                  />
                  <SelectFieldFormik
                    tabIndex={collegeConfig.institution_type === 1 ? 5 : 6}
                    label="Designation"
                    id="designation"
                    style={{ width: "40%" }}
                    options={designationList}
                    clear={true}
                    getOptionLabel={(option) => option.designation}
                    getOptionValue={(option) => option.designation}
                    onChange={(text) => {
                      setFieldValue("designation", text);
                      handleClear();
                    }}
                  />

                  <SelectFieldFormik
                    tabIndex={collegeConfig.institution_type === 1 ? 6 : 7}
                    label="Employee No. / Name"
                    id="employeeNumber"
                    style={{ width: "50%" }}
                    options={empCodeList}
                    searchIcon={true}
                    clear={true}
                    getOptionLabel={(option) =>
                      option.custom_employeeid + " - " + option.employee_name
                    }
                    getOptionValue={(option) => option.name}
                    onInputChange={(inputValue) => {
                      employeeSearch(inputValue);
                    }}
                    onChange={(text) => {
                      setFieldValue("employeeNumber", text);
                      handleClear();
                    }}
                  />
                  {filterError && (
                    <div className="row no-gutters text-center mt-3">
                      <ErrorMessage
                        Message={"Please apply atleast one filter"}
                        view={filterError}
                      />
                    </div>
                  )}
                  <div className="row no-gutters">
                    <div className="col-lg-6 text-right pe-1">
                      <Button
                        tabIndex={collegeConfig.institution_type === 1 ? 7 : 8}
                        type="submit"
                        text="Show"
                        isCenter={false}
                        onClick={(e) => preFunction.handleErrorFocus(errors)}
                      />
                    </div>
                    <div className="col-lg-5 ms-2">
                      <Button
                        type="button"
                        text="Clear"
                        isCenter={false}
                        onClick={() => {
                          resetForm();
                          handleClear();
                        }}
                      />
                    </div>
                  </div>
                  {showRes ? (
                    <>
                      <div className="row mt-4 border p-3">
                        <div className="row no-gutters">
                          <div className="col-lg-6"></div>
                          {data.length > 0 && (
                            <div className="col-lg-6">
                              <div className="text-right">
                                <Button
                                  frmButton={false}
                                  className={"btn me-3"}
                                  type="button"
                                  onClick={(e) => handleShow(values, 1, 2)}
                                  text="Export Excel"
                                />
                                <Button
                                  type="button"
                                  frmButton={false}
                                  onClick={(e) => {
                                    handleShow(values, 1, 1);
                                  }}
                                  text="Export PDF"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="table-responsive mt-4 p-0">
                          <table
                            className="table table-bordered"
                            // id="pdf-table"
                          >
                            <thead>
                              <tr>
                                <th width="5%">No.</th>
                                <th width="7%">Emp. No.</th>
                                <th width="18%">Emp. Name</th>
                                <th width="15%">Designation</th>
                                <th width="20%">Bank Name</th>
                                <th width="15%">IFSC Code</th>
                                <th width="10%">Account No.</th>
                                <th width="10%">Net Pay</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.length === 0 ? (
                                <tr>
                                  <td align="center" colSpan={10}>
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                data.map((item, index) => {
                                  return (
                                    <>
                                      {index === 0 ||
                                      data[index - 1].bank_name !==
                                        item.bank_name ? (
                                        <tr>
                                          <td
                                            colSpan={10}
                                            className="table-total"
                                          >
                                            {!item?.bank_name
                                              ? `Cash`
                                              : `Bank Name : ${item.bank_name}`}
                                          </td>
                                        </tr>
                                      ) : null}
                                      {index === 0 ||
                                      data[index - 1].department !==
                                        item.department ? (
                                        <tr>
                                          <td
                                            colSpan={10}
                                            className="table-total"
                                          >
                                            &nbsp;&nbsp;&nbsp;&nbsp;
                                            &nbsp;&nbsp;&nbsp;&nbsp;
                                            {`Department : ${
                                              item.department.split(" - ")[0]
                                            }`}
                                          </td>
                                        </tr>
                                      ) : null}
                                      <tr>
                                        <td>{index + 1}</td>
                                        <td>{item.custom_employeeid}</td>
                                        <td>{item.employee_name}</td>
                                        <td>{item.designation}</td>
                                        <td>{item.bank_name}</td>
                                        <td>{item.ifsc_code}</td>
                                        <td>{item.bank_account_no}</td>
                                        <td className="text-end">
                                          {item.net_pay}
                                        </td>
                                      </tr>
                                      {index === data.length - 1 ? (
                                        <tr>
                                          <td
                                            colSpan={10}
                                            className="table-total text-end"
                                          >
                                            Total :{" "}
                                            {data.reduce(
                                              (acc, item) =>
                                                acc + parseFloat(item.net_pay),
                                              0
                                            )}
                                          </td>
                                        </tr>
                                      ) : null}
                                    </>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                        {showLoadMore && (
                          <div className="row text-right">
                            <Button
                              text="Show All"
                              type="button"
                              onClick={(e) => handleShow(values, 1)}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
export default PaymodeReport;
