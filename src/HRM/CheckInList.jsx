import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeadingIcon from "@mui/icons-material/FormatListBulleted";
import moment from "moment";

import employeeapi from "../api/EmployeeApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import DateField from "../component/FormField/DateField";
import ErrorMessage from "../component/common/ErrorMessage";
import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";

function CheckInList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const oneWeekBefore = new Date();
  oneWeekBefore.setTime(oneWeekBefore.getTime() - 6 * 24 * 60 * 60 * 1000);
  const [fromDate, setFromDate] = useState(oneWeekBefore);
  const [toDate, setToDate] = useState(new Date());
  const [page, setPage] = useState(1);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const date = new Date();
  const [dateError, setDateError] = useState(false);
  const [dateErrorMessage, setDateErrorMessage] = useState("");
  const [showRes, setShowRes] = useState(false);

  const getEmployeeCheckin = async () => {
    try {
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
      setLoad(true);
      const from = moment(fromDate).format("yyyy-MM-DD");
      const to = moment(toDate).format("yyyy-MM-DD");
      console.log("From:" + from + " to:" + to);
      const EmployeeCheckin = await employeeapi.getEmployeeCheckin(from, to);
      console.log("Employee Checkin---", EmployeeCheckin);
      setShowRes(true);
      setData(EmployeeCheckin.data.data);
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
                autoFocus
                id="fromDate"
                value={fromDate}
                tabindex={1}
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
                tabindex={2}
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
              // autoFocus
              frmButton={false}
              tabindex={3}
              isCenter={false}
              onClick={() => {
                getEmployeeCheckin();
              }}
              text="Show"
            />
          </div>
        </div>
        <div className="mt-2">
          <ErrorMessage Message={dateErrorMessage} view={dateError} />
        </div>
        <div className="row no-gutters mt-3">
          <>
            {showRes && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th width="1%">No.</th>
                      {/* <th width="15%">Employee No.</th> */}
                      <th>Name</th>
                      {/* <th>Log Type</th> */}
                      {/* <th>Shift</th> */}
                      <th width="15%">Date Time</th>
                      <th width="10%">Device ID</th>
                      {/* <th>Skip Auto Attendance</th> */}
                      <th width="5%">Modified</th>
                    </tr>
                  </thead>
                  {data.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={8} align="center">
                          No checkin found
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {data.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          {/* <td className="nowrapWhiteSpace">{item.employee}</td> */}
                          <td className="nowrapWhiteSpace">
                            {item.employee_name}
                          </td>
                          {/* <td className="nowrapWhiteSpace">
                                {item.log_type}
                              </td> */}
                          {/* <td className="nowrapWhiteSpace">{item.shift}</td> */}
                          <td className="nowrapWhiteSpace">
                            {moment(item.time).format("DD-MM-yyyy HH.mm")}
                          </td>
                          <td className="nowrapWhiteSpace">{item.device_id}</td>
                          {/* <td className="nowrapWhiteSpace">
                        {item.skip_auto_attendance ? "Yes" : "No"}
                      </td> */}
                          <td className="nowrapWhiteSpace">
                            {item.is_modified ? "Yes" : "No"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>
            )}
            {showLoadMore && (
              <div className="row text-right">
                <a
                  href="javascript:void(0)"
                  onClick={(e) => getEmployeeCheckin(page + 1)}
                >
                  Load More...
                </a>
              </div>
            )}
          </>
        </div>
      </div>
    </div>
  );
}

export default CheckInList;
