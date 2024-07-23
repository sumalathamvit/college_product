import React, { useEffect, useState } from "react";
import HeadingIcon from "@mui/icons-material/RecentActors";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import employeeapi from "../../api/EmployeeApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import DateField from "../../component/FormField/DateField";
import ErrorMessage from "../../component/common/ErrorMessage";
import ScreenTitle from "../../component/common/ScreenTitle";

import string from "../../string";

function TourEntryList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const todyaDate = new Date();
  const oneWeekBefore = new Date();
  oneWeekBefore.setTime(todyaDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [fromDate, setFromDate] = useState(oneWeekBefore);
  const [toDate, setToDate] = useState(todyaDate);
  const [dateError, setDateError] = useState(false);
  const [dateErrorMessage, setDateErrorMessage] = useState("");
  const [showRes, setShowRes] = useState(false);

  const getTourEntryList = async () => {
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
      setShowRes(true);
      const from = moment(fromDate).format("yyyy-MM-DD");
      const to = moment(toDate).format("yyyy-MM-DD");
      console.log("From:" + from + " to:" + to);

      const tourEntryRes = await employeeapi.getAllTourEntry(from, to);
      console.log("tourEntryRes---", tourEntryRes);
      setData(tourEntryRes.data.data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  // useEffect(() => {}, [fromDate, toDate]);

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
                  // getTourEntryList(e.target.value, toDate);
                  setShowRes(false);
                  setDateError(false);
                }}
                minDate={new Date(moment().subtract(1, "years"))}
                maxDate={new Date(moment().add(1, "months"))}
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
                  // getTourEntryList(fromDate, e.target.value);
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
                getTourEntryList();
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
                    {/* <th width="10%">Employee Number</th> */}
                    <th width="25%">Name</th>
                    <th>Department</th>
                    <th width="10%">From Date</th>
                    <th width="10%">To Date</th>
                    <th width="5%">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colspan={9} align="center">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          {/* <td className="nowrapWhiteSpace">{item.name}</td> */}
                          <td className="nowrapWhiteSpace">
                            {item.employee_name}
                          </td>
                          <td className="nowrapWhiteSpace">
                            {item.department.split(" - ")[0]}
                          </td>
                          <td className="nowrapWhiteSpace">
                            {moment(item.from_date).format("DD-MM-YYYY")}
                          </td>
                          <td className="nowrapWhiteSpace">
                            {moment(item.to_date).format("DD-MM-YYYY")}
                          </td>
                          <td>{item.total_leave_days}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default TourEntryList;
