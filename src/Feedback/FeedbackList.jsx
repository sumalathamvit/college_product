import React, { useEffect, useState } from "react";
import moment from "moment";
import Rating from "@mui/material/Rating";
import HeadingIcon from "@mui/icons-material/RecentActors";

import academicApi from "../api/AcademicApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import DateField from "../component/FormField/DateField";

import string from "../string";
import ScreenTitle from "../component/common/ScreenTitle";

function FeedbackList() {
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const todyaDate = new Date();
  const oneWeekBefore = new Date();
  oneWeekBefore.setTime(todyaDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [fromDate, setFromDate] = useState(oneWeekBefore);
  const [toDate, setToDate] = useState(todyaDate);

  const handleFeedbackList = async () => {
    if (load) return;
    try {
      setLoad(true);
      const from = moment(fromDate).format("yyyy-MM-DD");
      const to = moment(toDate).format("yyyy-MM-DD");
      console.log("From:" + from + " to:" + to);

      const feedbackRes = await academicApi.getAllFeedback(from, to);
      console.log("feedbackRes---", feedbackRes);
      setData(feedbackRes.data.message.data.staffFeedback);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const openLink = (item) => {
    console.log("yyyy---", string.FILEURL + item);
    window.open(string.FILEURL + item);
  };

  useEffect(() => {
    handleFeedbackList();
  }, []);

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
                onChange={(e) => {
                  setFromDate(e.target.value);
                }}
                minDate={new Date(moment().subtract(10, "years"))}
                maxDate={new Date()}
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
                onChange={(e) => {
                  setToDate(e.target.value);
                }}
                minDate={fromDate}
                maxDate={new Date(moment().add(1, "months"))}
              />
            </div>
          </div>
          <div className="col-lg-2">
            <Button
              text="Show"
              isTable={true}
              type="button"
              onClick={handleFeedbackList}
            />
          </div>
        </div>
        <div className="row no-gutters mt-2">
          <div className="table-responsive">
            <table className="table table-hover ">
              <thead>
                <tr>
                  <th>No</th>
                  <th width="20%">Student/Employee ID</th>
                  <th width="20%">Student/Employee Name</th>
                  <th width="20%">Rating</th>
                  <th width="15%">Comments</th>
                  <th width="15%">Error Screen</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colspan={9} align="center">
                      No records found
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.employeeID}</td>
                        <td>{item.employeeName}</td>
                        <td>
                          <Rating
                            name="read-only"
                            value={item.rating}
                            readOnly
                          />
                        </td>
                        <td>{item.comment}</td>
                        <td>
                          <Button
                            text="View"
                            isTable={true}
                            type="button"
                            onClick={() => {
                              openLink(item.errorScreen);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FeedbackList;
