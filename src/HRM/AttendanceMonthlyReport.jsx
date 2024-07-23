import React, { useState } from "react";
import moment from "moment";

import attendanceApi from "../api/attendanceapi";
import employeeApi from "../api/EmployeeApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import DateField from "../component/FormField/DateField";
import ScreenTitle from "../component/common/ScreenTitle";

function AttendanceReport() {
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [columnData, setColumnData] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [headData, setHeadData] = useState([]);
  const [fromDateError, setFromDateError] = useState(false);
  const [showRes, setShowRes] = useState(false);

  const handleShow = async (date) => {
    try {
      setLoad(true);
      setFromDateError(false);
      if (fromDate == null || fromDate == "") {
        setFromDateError(true);
        return;
      }
      const monthlyReportRes = await attendanceApi.getMonthlyReport(
        moment(date).format("M"),
        moment(date).format("yyyy")
      );
      console.log("monthlyReportRes---", monthlyReportRes);
      setData(monthlyReportRes.data.message);
      setHeadData(monthlyReportRes.data.message.columns);

      let empArr = [];
      for (let i = 0; i < monthlyReportRes.data.message.result.length; i++) {
        empArr.push(monthlyReportRes.data.message.result[i].employee);
      }
      const getEmployeeByNamesRes = await employeeApi.getEmployeeByNames(
        empArr
      );
      console.log("getEmployeeByNamesRes---", getEmployeeByNamesRes);

      let empIdArr = [];
      for (let i = 0; i < getEmployeeByNamesRes.data.data.length; i++) {
        empIdArr[getEmployeeByNamesRes.data.data[i].name] =
          getEmployeeByNamesRes.data.data[i].custom_employeeid;
      }
      for (let i = 0; i < monthlyReportRes.data.message.result.length; i++) {
        monthlyReportRes.data.message.result[i].employee =
          empIdArr[monthlyReportRes.data.message.result[i].employee];
      }
      if (
        monthlyReportRes.data.message.result.length == 0 &&
        monthlyReportRes.data.message.columns.length == 0
      ) {
        setShowRes(true);
      } else {
        setShowRes(false);
      }
      setColumnData(monthlyReportRes.data.message.result);
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
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
        <div className="row no-gutters mt-1">
          <form autoComplete="off">
            <div className="row no-gutters mt-1 ">
              <div className="col-lg-2 pe-4">
                <DateField
                  autoFocus
                  id="fromDate"
                  type="month"
                  value={fromDate}
                  tabindex={1}
                  mandatory={1}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setFromDateError(false);
                    setData([]);
                    setHeadData([]);
                    setColumnData([]);
                    setShowRes(false);
                  }}
                  maxDate={new Date()}
                  minDate={moment().subtract(2, "years")}
                  error={fromDateError ? "Please select Month" : ""}
                  touched={fromDateError}
                />
              </div>
              <div className="col-lg-2">
                <Button
                  frmButton={false}
                  tabindex={2}
                  type="button"
                  isCenter={false}
                  onClick={() => handleShow(fromDate)}
                  text="Show"
                />
              </div>
            </div>
            {headData.length > 0 && columnData.length > 0 ? (
              <div className="row no-gutters mt-4">
                <div className="table-responsive">
                  <table className="purchase-table table-bordered">
                    <thead>
                      <tr>
                        {headData.map((item, index) => {
                          return <th>{item.label}</th>;
                        })}
                        <th>P</th>
                        <th>WFH</th>
                        <th>WO</th>
                        <th>H</th>
                        <th>L</th>
                        <th>A</th>
                        <th>HD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {columnData.map((item, index) => {
                        let p = 0,
                          wo = 0,
                          h = 0,
                          wfh = 0,
                          a = 0,
                          l = 0,
                          hd = 0;
                        return (
                          <tr key={index}>
                            <td className="nowrapWhiteSpace">
                              {item["employee"]}
                            </td>
                            <td className="nowrapWhiteSpace">
                              {item["employee_name"]}
                            </td>
                            <td>{item["shift"]}</td>
                            {Object.keys(item).map((key) => {
                              if (
                                key !== "shift" &&
                                key !== "employee" &&
                                key !== "employee_name"
                              ) {
                                if (item[key] == "P") p++;
                                else if (item[key] == "WO") wo++;
                                else if (item[key] == "H") h++;
                                else if (item[key] == "WFH") wfh++;
                                else if (item[key] == "L") l++;
                                else if (item[key] == "A") a++;
                                else if (item[key] == "HD") hd++;
                                return (
                                  <td
                                    style={{
                                      fontWeight: "bold",
                                      textAlign: "center",
                                      color:
                                        item[key] == "P" || item[key] == "WFH"
                                          ? "green"
                                          : item[key] == "L"
                                          ? "#318AD8"
                                          : item[key] == "A"
                                          ? "red"
                                          : item[key] == "HD"
                                          ? "orange"
                                          : item[key] == "WO" ||
                                            item[key] == "H"
                                          ? "#ccc"
                                          : "#d1cdcd",
                                    }}
                                  >
                                    {item[key] != "" ? item[key] : "NA"}
                                  </td>
                                );
                              } else if (key == "shift") {
                                return (
                                  <>
                                    <td
                                      style={{
                                        color: "green",
                                        fontWeight: "bold",
                                        textAlign: "right",
                                      }}
                                    >
                                      {p}
                                    </td>
                                    <td
                                      style={{
                                        color: "green",
                                        fontWeight: "bold",
                                        textAlign: "right",
                                      }}
                                    >
                                      {wfh}
                                    </td>
                                    <td
                                      style={{
                                        color: "#ccc",
                                        textAlign: "right",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {wo}
                                    </td>
                                    <td
                                      style={{
                                        color: "#ccc",
                                        textAlign: "right",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {h}
                                    </td>
                                    <td
                                      style={{
                                        color: "#318AD8",
                                        fontWeight: "bold",
                                        textAlign: "right",
                                      }}
                                    >
                                      {l}
                                    </td>
                                    <td
                                      style={{
                                        color: "red",
                                        fontWeight: "bold",
                                        textAlign: "right",
                                      }}
                                    >
                                      {a}
                                    </td>
                                    <td
                                      style={{
                                        color: "orange",
                                        fontWeight: "bold",
                                        textAlign: "right",
                                      }}
                                    >
                                      {hd}
                                    </td>
                                  </>
                                );
                                p = 0;
                                wo = 0;
                                h = 0;
                                wfh = 0;
                                l = 0;
                                a = 0;
                                hd = 0;
                              }
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div
                  className="row mt-2"
                  dangerouslySetInnerHTML={{
                    __html: data.message,
                  }}
                ></div>
              </div>
            ) : (
              showRes && (
                <div className="row no-gutters mt-3">
                  <div className="card">
                    <table className="table table-bordered table-hover">
                      <thead>
                        <tr>
                          <th width="10%">Employee</th>
                          <th width="5%">Employee Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colspan={6} align="center">
                            No data found
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AttendanceReport;
