import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeadingIcon from "@mui/icons-material/RecentActors";
import moment from "moment";

import DateField from "../../component/FormField/DateField";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ErrorMessage from "../../component/common/ErrorMessage";

import employeeApi from "../../api/EmployeeApi";
import string from "../../string";
import { Spinner } from "react-bootstrap";
import Button from "../../component/FormField/Button";
import ScreenTitle from "../../component/common/ScreenTitle";

function PermissionEntryList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const todyaDate = new Date();
  const oneWeekBefore = new Date();
  oneWeekBefore.setTime(todyaDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [fromDate, setFromDate] = useState(oneWeekBefore);
  const [toDate, setToDate] = useState(todyaDate);
  const [dateError, setDateError] = useState(false);
  const [dateErrorMessage, setDateErrorMessage] = useState("");

  const getPermissionEntryList = async () => {
    if (!fromDate || !toDate) {
      setDateError(true);
      setDateErrorMessage("Please select both From and To date");
      return;
    } else if (fromDate && toDate) {
      if (fromDate > toDate) {
        setDateError(true);
        setDateErrorMessage("From date should be less than To date");
        return;
      }
    }
    try {
      setLoad(true);
      const from = moment(fromDate).format("yyyy-MM-DD");
      const to = moment(toDate).format("yyyy-MM-DD");
      console.log("From:" + from + " to:" + to);
      const getLeaveEntryListRes = await employeeApi.getPermissionEntryList(
        from,
        to
      );
      console.log("getLeaveEntryListRes---", getLeaveEntryListRes);
      setShowRes(true);
      setData(getLeaveEntryListRes.data.data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {}, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-1">
          <div className="col-lg-2 row no-gutters">
            <div className="col-lg-3 mt-2">
              <label>From</label>
            </div>
            <div className={"col-lg-9"}>
              <DateField
                id="fromDate"
                value={fromDate}
                mandatory={1}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setShowRes(false);
                  setDateError(false);
                }}
                minDate={new Date(moment().subtract(1, "months"))}
                maxDate={toDate}
              />
            </div>
          </div>
          <div className="col-lg-2 row no-gutters ms-3">
            <div className="col-lg-2 mt-2">
              <label>To</label>
            </div>
            <div className={"col-lg-9"}>
              <DateField
                id="toDate"
                value={toDate}
                mandatory={1}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setShowRes(false);
                  setDateError(false);
                }}
                minDate={fromDate}
                maxDate={new Date(moment().add(1, "months"))}
              />
            </div>
          </div>
          <div className="col-lg-2 ps-2">
            <Button
              autoFocus
              frmButton={false}
              isCenter={false}
              onClick={() => {
                getPermissionEntryList();
              }}
              text="Show"
            />
          </div>
        </div>
        <div className="mt-2">
          <ErrorMessage Message={dateErrorMessage} view={dateError} />
        </div>
        {showRes && (
          <div className="row no-gutters mt-3">
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th width="1%">No.</th>
                    {/* <th>Employee</th> */}
                    <th width="20%">Employee Name</th>
                    <th width="10%">Permission Date</th>
                    <th>Department</th>
                    <th width="10%">Status</th>
                    <th width="5%">From Time</th>
                    <th width="5%">To Time</th>
                  </tr>
                </thead>
                {data.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={9} align="center">
                        No records found
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {data.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          {/* <td className="nowrapWhiteSpace">{item.employee}</td> */}
                          <td className="nowrapWhiteSpace">
                            {item.employee_name}
                          </td>
                          <td>{moment(item.date).format("DD-MM-YYYY")}</td>
                          <td className="nowrapWhiteSpace">
                            {item.department?.split("-")[0]}
                          </td>
                          <td className="nowrapWhiteSpace">{item.status}</td>
                          <td className="nowrapWhiteSpace">{item.from_time}</td>
                          <td className="nowrapWhiteSpace">{item.to_time}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default PermissionEntryList;
