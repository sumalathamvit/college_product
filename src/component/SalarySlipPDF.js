import React, { useContext } from "react";
import moment from "moment";
import RupeeInWords from "./common/RupeeInWords";
import { useSelector } from "react-redux";
import AuthContext from "../auth/context";

function SalarySlipPDFDetail({ salarySlip, employee }) {
  const collegeConfig = useSelector((state) => state.web.college);
  const { collegeName, instituteArray } = useContext(AuthContext);

  return (
    <>
      <div
        className="row no-gutters table-responsive"
        style={{
          border: "1px solid #000",
        }}
      >
        <table width={"100%"}>
          <tr>
            <td>
              <div className="row no-gutters">
                <div className="col-1"></div>
                <div className="col-10">
                  <div className="row no-gutters">
                    <div className="col-2 pt-3 text-center">
                      <img
                        src={
                          instituteArray.find(
                            (obj) => obj.collegeID == employee.custom_college_id
                          )?.logo ?? require("../assests/png/pdf_logo.png")
                        }
                        className="print-logo"
                      />
                    </div>
                    <div className="col-8 text-center">
                      <div className="college-name">
                        {instituteArray &&
                          instituteArray
                            .find(
                              (obj) =>
                                obj.collegeID == employee.custom_college_id
                            )
                            ?.name.toUpperCase()}
                      </div>
                      {instituteArray.find(
                        (obj) => obj.collegeID == employee.custom_college_id
                      )?.second_line != "" && (
                        <div className="second-line">
                          {
                            instituteArray.find(
                              (obj) =>
                                obj.collegeID == employee.custom_college_id
                            )?.second_line
                          }
                        </div>
                      )}
                      {instituteArray.find(
                        (obj) => obj.collegeID == employee.custom_college_id
                      )?.third_line != "" && (
                        <div className="third-line">
                          {
                            instituteArray.find(
                              (obj) =>
                                obj.collegeID == employee.custom_college_id
                            )?.third_line
                          }
                        </div>
                      )}
                      {instituteArray.find(
                        (obj) => obj.collegeID == employee.custom_college_id
                      )?.fourth_line != "" && (
                        <div className="address-line">
                          {
                            instituteArray.find(
                              (obj) =>
                                obj.collegeID == employee.custom_college_id
                            )?.fourth_line
                          }
                        </div>
                      )}
                      {instituteArray.find(
                        (obj) => obj.collegeID == employee.custom_college_id
                      )?.fifth_line != "" && (
                        <div className="address-line">
                          {
                            instituteArray.find(
                              (obj) =>
                                obj.collegeID == employee.custom_college_id
                            )?.fifth_line
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="receipt-copy">
                <div className="line" style={{ marginTop: "-1px" }}></div>
                <div className="line" style={{ marginTop: "2px" }}></div>
                <div className="receipt-text">Pay Slip</div>
              </div>
            </td>
          </tr>
          <tr>
            <td className="px-4 pb-1">
              <table width={"100%"} cellPadding={1} cellSpacing={0}>
                <tr>
                  <td width={"12%"} className="label-bold">
                    Name
                  </td>
                  <td width="50%" colSpan={3}>
                    : {employee?.salutation + employee?.employee_name}
                  </td>
                  <td width={"12%"} className="label-bold">
                    Pay Slip for
                  </td>
                  <td>
                    <div>
                      : {moment(salarySlip?.start_date).format("MMM-YYYY")}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="label-bold">Designation</td>
                  <td width="35%" colSpan={3}>
                    <div>: {salarySlip?.designation}</div>
                  </td>
                  <td className="label-bold">E.P.F. No.</td>
                  <td width="35%">: {employee?.provident_fund_account}</td>
                </tr>
                <tr>
                  <td className="label-bold">Employee No.</td>
                  <td colSpan={3}>: {employee?.custom_employeeid}</td>
                  <td className="label-bold">Bank A/c. No.</td>
                  <td>: {salarySlip?.bank_account_no}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td>
              <table className="with-design-print-table">
                <thead>
                  <tr>
                    <th width="42%">Pay Particulars</th>
                    <th
                      width="5%"
                      style={{
                        borderRight: "1px solid #000",
                      }}
                    >
                      Amount (₹)
                    </th>
                    <th>Deductions</th>
                    <th width="5%">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td height={"150px"}>
                      {salarySlip?.earnings.map((earning, index) => {
                        return <div>{earning.salary_component}</div>;
                      })}
                    </td>
                    <td
                      align="right"
                      style={{
                        borderRight: "1px solid #000",
                      }}
                    >
                      {salarySlip?.earnings.map((earning, index) => {
                        return <div>{earning.amount}</div>;
                      })}
                    </td>
                    <td>
                      {salarySlip?.deductions.map((deduction, index) => {
                        return <div>{deduction.salary_component}</div>;
                      })}
                    </td>
                    <td align="right">
                      {salarySlip?.deductions.map((deduction, index) => {
                        return <div>{deduction.amount}</div>;
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        borderTop: "1px solid #599159",
                        fontWeight: "bold",
                      }}
                      className="label-bold"
                      align="right"
                    >
                      Gross Salary
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        borderTop: "1px solid #000",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {salarySlip?.base_gross_pay}
                    </td>
                    <td
                      style={{
                        borderTop: "1px solid #599159",
                        fontWeight: "bold",
                      }}
                      className="label-bold"
                      align="right"
                    >
                      Total Deduction
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        borderTop: "1px solid #6c6599",
                      }}
                    >
                      {salarySlip?.base_total_deduction}
                    </td>
                  </tr>
                </tbody>
                <tr
                  style={{
                    borderTop: "1px solid #000",
                    borderBottom: "1px solid #000",
                  }}
                >
                  <td colSpan={4} align="right" className="label-bold">
                    <span style={{ float: "left" }}>
                      <b>Net Salary : </b>
                      {salarySlip?.base_net_pay} {"   "}(
                      <RupeeInWords number={salarySlip?.base_net_pay} />)
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <div className="row no-gutters label-bold mt-5 mb-1">
                <div className="col-4 text-center">Prepared by HR</div>
                <div className="col-4 text-center">Accounts Officer</div>
                <div className="col-4 text-center">Administrative Officer</div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </>
  );
}

export default SalarySlipPDFDetail;
