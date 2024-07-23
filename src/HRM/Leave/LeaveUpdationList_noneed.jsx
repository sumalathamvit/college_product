import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import DateField from "../../component/FormField/DateField";
import HeadingIcon from "@mui/icons-material/RecentActors";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import employeeapi from "../../api/EmployeeApi";
import ScreenTitle from "../../component/common/ScreenTitle";
const prefixerror = "MedicineList";

function LeaveUpdationList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const todyaDate = new Date();
  const oneWeekBefore = new Date();
  oneWeekBefore.setTime(todyaDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [fromDate, setFromDate] = useState(oneWeekBefore);
  const [toDate, setToDate] = useState(todyaDate);
  const date = new Date();
  const DateCustomInput = preFunction.DateCustomInput;

  const getLeaveUpdationList = async (fromDate, toDate) => {
    try {
      setLoad(true);
      const from = moment(fromDate).format("yyyy-MM-DD");
      const to = moment(toDate).format("yyyy-MM-DD");
      console.log("From:" + from + " to:" + to);
      const feeschedule = await employeeapi.getLeaveUpdationList(from, to);
      console.log("feeschedule---", feeschedule);
      setData(feeschedule.data.data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getLeaveUpdationList(fromDate, toDate);
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters mt-4 mb-1">
          <div className="col-lg-2 row no-gutters">
            <div className="col-lg-3 mt-2">
              <label>From</label>
            </div>
            <div className={"col-lg-9"}>
              <DateField
                isTable={true}
                name="fromDate"
                id="fromDate"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  getLeaveUpdationList(e.target.value, toDate);
                }}
                minDate={new Date(moment().subtract(1, "months"))}
                maxDate={new Date()}
              />
            </div>
          </div>

          <div className="col-lg-2 row">
            <div className="col-lg-2 mt-2">
              <label>To</label>
            </div>
            <div className={"col-lg-10"}>
              <DateField
                isTable={true}
                name="toDate"
                id="toDate"
                openToDate={toDate}
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  getLeaveUpdationList(fromDate, e.target.value);
                }}
                minDate={fromDate}
                maxDate={new Date()}
              />
            </div>
          </div>
          <div className="form-group col-lg-8 text-right">
            <button className="btn" onClick={() => navigate("/el-cl-updation")}>
              Leave Updation
            </button>
          </div>
        </div>
        <div className="row no-gutters">
          {data.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th width="1%">No.</th>
                    <th>Employee</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Leave Type</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Allocated Leaves</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="nowrapWhiteSpace">{item.employee}</td>
                        <td className="nowrapWhiteSpace">
                          {item.employee_name}
                        </td>
                        <td className="nowrapWhiteSpace">
                          {item.department.split("-")[0]}
                        </td>
                        <td className="nowrapWhiteSpace">{item.leave_type}</td>
                        <td className="nowrapWhiteSpace">
                          {moment(item.from_date).format("DD-MM-YYYY")}
                        </td>
                        <td className="nowrapWhiteSpace">
                          {moment(item.to_date).format("DD-MM-YYYY")}
                        </td>
                        <td>{item.new_leaves_allocated}</td>
                        {/* <td className="nowrapWhiteSpace">
                                      <button
                                        type="view"
                                        className="btn-3"
                                        title="View"
                                        onClick={() =>
                                          handleViewFeeSchedule(item.name)
                                        }
                                      >
                                        View
                                      </button>
                                    </td> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            "No data found"
          )}
        </div>
      </div>
    </div>
  );
}
export default LeaveUpdationList;
