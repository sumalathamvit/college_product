import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import HeadingIcon from "@mui/icons-material/DateRange";

import employeeapi from "../../api/EmployeeApi";

import { weekOffList } from "../../component/common/CommonArray";
import Button from "../../component/FormField/Button";
import DisplayText from "../../component/FormField/DisplayText";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import ScreenTitle from "../../component/common/ScreenTitle";

function ViewHolidayList() {
  //#region const
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [holidayListDetails, setHolidayListDetail] = useState([]);
  const [weekOff, setWeekOff] = useState([]);

  const viewPaymentEntry = async (l) => {
    try {
      if (!location.state || !location.state.id) {
        navigate("/holiday-list");
        return;
      }
      console.log("location.state.id--", location.state.id);
      setLoad(true);
      const viewHolidayListDetail = await employeeapi.viewHolidayListDetail(
        location.state.id
      );
      console.log("viewHolidayListDetail---", viewHolidayListDetail);
      if (viewHolidayListDetail) {
        calculateWeekOff(viewHolidayListDetail.data.data);
        setData(viewHolidayListDetail.data.data);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const calculateWeekOff = (values) => {
    let week = [];
    let holidayAddDetails = [];
    for (let i = 0; i < values.holidays.length; i++) {
      let isInUniqueArray = false;
      let holidayDescription = values.holidays[i].description;

      for (let j = 0; j < weekOffList.length; j++) {
        if (weekOffList[j].label === holidayDescription) {
          let days = {
            value: weekOffList[j].value,
            label: holidayDescription,
          };
          week.push(days);
          isInUniqueArray = true;
          break;
        }
      }
      if (!isInUniqueArray) {
        let obj = {
          holiday_date: moment(values.holidays[i].holiday_date).format(
            "YYYY-MM-DD"
          ),
          description: holidayDescription,
        };
        holidayAddDetails.push(obj);
      }
    }
    const uniqueArray = Array.from(new Set(week.map(JSON.stringify))).map(
      JSON.parse
    );
    holidayAddDetails.sort((a, b) => {
      return new Date(a.holiday_date) - new Date(b.holiday_date);
    });
    console.log("holidayAddDetails-----", holidayAddDetails, uniqueArray);
    setHolidayListDetail(holidayAddDetails);
    setWeekOff(uniqueArray);
  };

  useEffect(() => {
    viewPaymentEntry();
  }, []);

  return (
    <div className="content-area-report">
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position"} />
        <Button
          autoFocus
          text={"Back"}
          isTable={true}
          isCenter={false}
          className={"btn-3"}
          onClick={(e) => navigate("/holiday-list")}
        />
        <div className="row no-gutters">
          <div className="col-lg-12">
            <div className="row">
              <div className="row no-gutters">
                {data.name ? (
                  <DisplayText
                    label="Holiday Name"
                    // labelSize={3}
                    value={data.name ?? "-"}
                  />
                ) : null}
                {data.from_date ? (
                  <DisplayText
                    label="From Date"
                    // labelSize={3}
                    value={moment(data.from_date).format("DD-MM-YYYY")}
                  />
                ) : null}
                {data.to_date ? (
                  <DisplayText
                    label="To Date"
                    // labelSize={3}
                    value={moment(data.to_date).format("DD-MM-YYYY")}
                  />
                ) : null}
                {data.total_holidays ? (
                  <DisplayText
                    label="Total Holidays"
                    // labelSize={3}
                    value={data.total_holidays ?? "-"}
                  />
                ) : null}
                {weekOff ? (
                  <DisplayText
                    label="Weekly Off"
                    // labelSize={3}
                    value={weekOff
                      .map((item, index) => item.label.toString())
                      .join(", ")}
                  />
                ) : null}

                {holidayListDetails.length > 0 && (
                  <div className="mt-1 row no-gutters">
                    <div className="subhead-row">
                      <div className="subhead">Holiday Detail</div>
                      <div className="col line-div"></div>
                    </div>
                    <div className="col-lg-2"></div>
                    <div className="col-lg-8">
                      <table className="table table-bordered table-hover">
                        <thead className="tableHead">
                          <tr>
                            <th width="1%">No.</th>
                            <th width="25%">Holiday Date</th>
                            <th width="30%">Holiday</th>
                          </tr>
                        </thead>
                        <tbody>
                          {holidayListDetails.map((item, index) => (
                            <tr className="tableColor" key={index}>
                              <td>{index + 1}</td>
                              <td>
                                {moment(item.holiday_date).format("DD-MM-YYYY")}
                              </td>
                              <td>{item.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewHolidayList;
