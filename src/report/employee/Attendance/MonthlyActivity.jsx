import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import moment from "moment";
import { Formik } from "formik";

import AuthContext from "../../../auth/context";
import employeeapi from "../../../api/EmployeeApi";

import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import ScreenTitle from "../../../component/common/ScreenTitle";
import DateFieldFormik from "../../../component/FormField/DateFieldFormik";
import SelectFieldFormik from "../../../component/FormField/SelectFieldFormik";
import {
  boldStyle,
  topLineStyle,
  totStyle,
} from "../../../component/common/CommonArray";
import CommonApi from "../../../component/common/CommonApi";
import { days } from "../../../component/common/CommonArray";

import employeeApi from "../../../api/EmployeeApi";

let statusIndex = 0;

function MonthlyActivity() {
  const formifRef = useRef();

  const { collegeName, collegeId } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);

  const [empCodeList, setEmpCodeList] = useState([]);
  const [data, setData] = useState([]);
  const [leaveCountDetails, setLeaveCountDetails] = useState();
  const [departmentList, setDepartmentList] = useState([]);

  const FormSchema = Yup.object().shape({
    college: collegeConfig.is_university
      ? Yup.object().required("Please select College")
      : Yup.mixed().notRequired(),
    month: Yup.string().required("Please select From Date"),
  });

  const handleSearchEmployee = async (text) => {
    try {
      const empList = await CommonApi.searchEmployee(text);
      setEmpCodeList(empList);
    } catch (error) {
      console.log("error--", error);
    }
  };

  const handleCSVData = async (exportData, type, values) => {
    if (type === 1) {
      let filterContent = [];
      filterContent.push([
        {
          content:
            "From Date : " +
            moment(values.month).startOf("month").format("DD-MM-yyyy") +
            " To Date : " +
            moment(values.month).endOf("month").format("DD-MM-yyyy"),
          styles: boldStyle,
        },
      ]);
      (values.department || values.designation) &&
        filterContent.push([
          {
            content:
              "Department : " +
              (values.department ? values.department.department : "") +
              " Designation : " +
              (values.designation ? values.designation.designation : ""),
            styles: boldStyle,
          },
        ]);
      values.empCode &&
        filterContent.push([
          {
            content: "Employee : " + values.empCode.custom_employeeid,
            styles: boldStyle,
          },
        ]);

      let head = [
        [
          { content: "No.", styles: topLineStyle },
          { content: "Date.", styles: topLineStyle },
          { content: "In Time", styles: topLineStyle },
          { content: "Out Time", styles: topLineStyle },
          { content: "Late", styles: topLineStyle },
          { content: "Early Departure", styles: topLineStyle },
          { content: "Early Arrive", styles: topLineStyle },
          { content: "Delay", styles: topLineStyle },
          { content: "Remarks", styles: topLineStyle },
        ],
      ];

      let pdfData = [];
      let countIndex = 0;
      exportData.map((item, index) => {
        if (index === 0) {
          pdfData.push([
            {
              content: item.custom_employeeid + " - " + item.employee_name,
              colSpan: 11,
              styles: boldStyle,
            },
          ]);
        } else if (
          exportData[index - 1].custom_employeeid !== item.custom_employeeid
        ) {
          countIndex += 1;
          if (leaveCountDetails) {
            let content = "";
            Object.keys(leaveCountDetails[countIndex - 1])?.map((key1) => {
              if (key1 !== "custom_employeeid" && key1 !== "name")
                content +=
                  key1 +
                  " : " +
                  leaveCountDetails[countIndex - 1][key1] +
                  "    ";
            });

            pdfData.push([
              {
                content: content,
                colSpan: 11,
                styles: {
                  ...topLineStyle,
                  minCellHeight: 12,
                  valign: "middle",
                },
              },
            ]);
          }
          pdfData.push([
            {
              content: item.custom_employeeid + " - " + item.employee_name,
              colSpan: 11,
              styles: boldStyle,
            },
          ]);
        }

        pdfData.push([
          { content: index + 1 },
          { content: item.attendance_date },
          { content: item.in_time ?? "00:00:00" },
          { content: item.out_time ?? "00:00:00" },
          {
            content: item.late.includes("-")
              ? item.late.split("-")[1].split(".")[0]
              : moment(item.late.split(".")[0]).format("HH:mm:ss"),
          },
          {
            content:
              item.early_departure === "0"
                ? "00:00:00"
                : item.early_departure.split(".")[0],
          },
          {
            content:
              item.early_arrive === "0"
                ? "00:00:00"
                : item.early_arrive.split(".")[0],
          },
          {
            content: item.delay === "0" ? "00:00:00" : item.delay.split(".")[0],
          },
          {
            content: item.status != "On Leave" ? item.status : item.leave_type,
          },
        ]);
      });
      if (leaveCountDetails) {
        let content = "";
        Object.keys(leaveCountDetails[countIndex - 1])?.map((key1) => {
          if (key1 !== "custom_employeeid" && key1 !== "name")
            content +=
              key1 + " : " + leaveCountDetails[countIndex - 1][key1] + "    ";
        });

        pdfData.push([
          {
            content: content,
            colSpan: 11,
            styles: {
              ...topLineStyle,
              minCellHeight: 12,
              valign: "middle",
            },
          },
        ]);
      }

      let pdfHeadToPass = [[], [...head]];
      let pdfDataToPass = [filterContent, pdfData];
      let colWidthToPass = [[], [5, 8, 8, 8, 8, 10, 8, 8, 32]];
      preFunction.generatePDFContent(
        collegeName,
        "Monthly Activity Report",
        pdfHeadToPass,
        pdfDataToPass,
        colWidthToPass,
        "landscape"
      );
      return;
    }

    let csvData = [];
    csvData.push([
      "No.",
      "Date",
      "In Time",
      "Out Time",
      "Late",
      "Early Departure",
      "Early Arrive",
      "Delay",
      "Remarks",
    ]);
    let countIndex = 0;
    exportData.map((item, index) => {
      if (index === 0)
        csvData.push([item.custom_employeeid + " - " + item.employee_name]);
      else if (
        exportData[index - 1].custom_employeeid !== item.custom_employeeid
      ) {
        countIndex += 1;
        if (leaveCountDetails) {
          let content = "";
          Object.keys(leaveCountDetails[countIndex - 1])?.map((key1) => {
            if (key1 !== "custom_employeeid" && key1 !== "name")
              content += key1 + ",";
          });
          csvData.push([content]);
          content = "";
          Object.keys(leaveCountDetails[countIndex - 1])?.map((key1) => {
            if (key1 !== "custom_employeeid" && key1 !== "name")
              content += leaveCountDetails[countIndex - 1][key1] + ",";
          });
          csvData.push([content]);
        }
        csvData.push([item.custom_employeeid + " - " + item.employee_name]);
      }

      csvData.push([
        index + 1,
        item.attendance_date,
        item.in_time ?? "00:00:00",
        item.out_time ?? "00:00:00",
        item.late.includes("-")
          ? item.late.split("-")[1].split(".")[0]
          : moment(item.late.split(".")[0]).format("HH:mm:ss"),
        item.early_departure === "0"
          ? "00:00:00"
          : item.early_departure.split(".")[0],
        item.early_arrive === "0"
          ? "00:00:00"
          : item.early_arrive.split(".")[0],
        item.delay === "0" ? "00:00:00" : item.delay.split(".")[0], //item.delay.split(".")[0],
        item.status != "On Leave" ? item.status : item.leave_type,
      ]);
    });
    if (leaveCountDetails) {
      let content = "";
      Object.keys(leaveCountDetails[countIndex - 1])?.map((key1) => {
        if (key1 !== "custom_employeeid" && key1 !== "name")
          content += key1 + ",";
      });
      csvData.push([content]);
      content = "";
      Object.keys(leaveCountDetails[countIndex - 1])?.map((key1) => {
        if (key1 !== "custom_employeeid" && key1 !== "name")
          content += leaveCountDetails[countIndex - 1][key1] + ",";
      });
      csvData.push([content]);
    }

    preFunction.downloadCSV(csvData, "Monthly Activity Report");
    return;
  };

  const handleShow = async (values, report) => {
    if (load) return;
    console.log("values---", values);
    if (report) {
      handleCSVData(data, report, values);
      return;
    }
    try {
      setLoad(true);
      setShowRes(true);
      const monthlyActivityListRes = await employeeApi.monthlyActivityList(
        collegeConfig.is_university ? values.college.collegeID : collegeId,
        values.empCode ? values?.empCode?.custom_employeeid : null,
        values.department ? values?.department?.department_id : null,
        moment(values.month).startOf("month").format("yyyy-MM-DD"),
        moment(values.month).endOf("month").format("yyyy-MM-DD"),
        0
      );
      console.log("monthlyActivityListRes---", monthlyActivityListRes);

      setData(
        monthlyActivityListRes?.data?.message?.data
          ?.attendance_monthly_activity_report
      );
      const holidayDetail = await getHolidayList(
        moment(values.month).startOf("month").format("yyyy-MM-DD"),
        moment(values.month).endOf("month").format("yyyy-MM-DD")
      );
      console.log("holidayDetail---", holidayDetail);
      for (
        let i = 0;
        i < monthlyActivityListRes.data.message.data.leave_count_details.length;
        i++
      ) {
        monthlyActivityListRes.data.message.data.leave_count_details[i][
          "WeekOff"
        ] = holidayDetail.weekOff;
        monthlyActivityListRes.data.message.data.leave_count_details[i][
          "Holidays"
        ] = holidayDetail.holidays;
      }
      setLeaveCountDetails(
        monthlyActivityListRes.data.message.data.leave_count_details
      );

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getHolidayList = async (fromDate, toDate) => {
    console.log("fromDate---", fromDate, toDate);
    try {
      setLoad(true);
      const viewHolidayListDetail = await employeeapi.viewHolidayListDetail(
        fromDate.split("-")[0]
      );
      console.log("viewHolidayListDetail---", viewHolidayListDetail);
      if (viewHolidayListDetail.data.data.holidays.length === 0) {
        setLoad(false);
        return { weekOff: [], holidays: [] };
      }

      let arr = [];
      const holidayList = viewHolidayListDetail.data.data.holidays;

      holidayList.forEach((holiday) => {
        if (
          fromDate <= holiday.holiday_date &&
          toDate >= holiday.holiday_date
        ) {
          arr.push(holiday);
        }
      });
      console.log("arr---", arr);

      const holidays = getWeekOff(arr);
      setLoad(false);
      console.log("holidays---", holidays);
      return holidays;
    } catch (error) {
      console.log("error--", error);
      setLoad(false);
    }
  };

  const getWeekOff = async (monthHoliday) => {
    try {
      setLoad(true);
      let weekOff = 0;
      let holidays = 0;
      for (let i = 0; i < monthHoliday.length; i++) {
        let isInUniqueArray = false;

        for (let j = 0; j < days.length; j++) {
          if (days[j].label === monthHoliday[i].description) {
            weekOff += 1;
            isInUniqueArray = true;
            break;
          }
        }
        if (!isInUniqueArray) {
          holidays += 1;
        }
      }
      console.log("week---", weekOff, holidays);
      setLoad(false);
      return { weekOff, holidays };
    } catch (error) {
      console.log("error--", error);
      setLoad(false);
    }
  };

  const getDepartmentList = async (college_id) => {
    setDepartmentList([]);
    if (college_id) {
      try {
        const masterRes = await employeeApi.getAllMasters(2, college_id);
        console.log("masterRes---", masterRes);
        setDepartmentList(masterRes?.data?.message?.data?.department);
      } catch (error) {
        console.log("error--", error);
      }
    }
  };

  useEffect(() => {
    if (!collegeConfig.is_university) {
      getDepartmentList(collegeId);
    }
  }, [collegeConfig]);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position" />
        <Formik
          innerRef={formifRef}
          enableReinitialize={false}
          initialValues={{
            college: "",
            month: moment().subtract(1, "months"),
            empCode: null,
          }}
          validationSchema={FormSchema}
          onSubmit={(values) => handleShow(values, 0)}
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
                <div className={"col-lg-9"}>
                  {collegeConfig.is_university && (
                    <SelectFieldFormik
                      autoFocus
                      tabIndex={0}
                      label="College"
                      id="college"
                      mandatory={1}
                      matchFrom="start"
                      options={collegeConfig?.collegeList}
                      getOptionLabel={(option) => option?.collegeName}
                      getOptionValue={(option) => option?.collegeID}
                      searchIcon={false}
                      clear={false}
                      onChange={(text) => {
                        setFieldValue("college", text);
                        getDepartmentList(text?.collegeID);
                        setShowRes(false);
                      }}
                    />
                  )}
                  <DateFieldFormik
                    autoFocus={!collegeConfig.is_university}
                    label={"Month"}
                    id="month"
                    type="month"
                    mandatory={1}
                    tabIndex={1}
                    onChange={(e) => {
                      setFieldValue("month", e.target.value);
                      setShowRes(false);
                    }}
                    minDate={moment().subtract(10, "months")}
                    maxDate={moment()}
                    style={{ width: "30%" }}
                  />
                  <SelectFieldFormik
                    label={"Department"}
                    id="department"
                    tabIndex={2}
                    mandatory={0}
                    clear={true}
                    getOptionLabel={(option) => option.department}
                    getOptionValue={(option) => option.department_id}
                    onChange={(e) => {
                      setFieldValue("department", e);
                      setShowRes(false);
                    }}
                    options={departmentList}
                  />
                  <SelectFieldFormik
                    label="Employee No. / Name"
                    id="empCode"
                    tabIndex={3}
                    clear={true}
                    searchIcon={true}
                    options={empCodeList}
                    getOptionLabel={(option) =>
                      option.custom_employeeid + " - " + option.employee_name
                    }
                    getOptionValue={(option) => option.name}
                    onInputChange={(inputValue) => {
                      handleSearchEmployee(inputValue);
                    }}
                    onChange={(text) => {
                      setFieldValue("empCode", text);
                      setShowRes(false);
                    }}
                  />
                </div>
                <div className="text-center mt-2">
                  <Button
                    frmButton={false}
                    className={"btn me-3"}
                    onClick={() => {
                      preFunction.handleErrorFocus(errors);
                    }}
                    tabIndex={4}
                    text="Show"
                  />
                  <Button
                    type="button"
                    className={"btn ms-3"}
                    frmButton={false}
                    onClick={() => {
                      formifRef.current.resetForm();
                    }}
                    tabIndex={5}
                    text="Clear"
                  />
                </div>
                {showRes && (
                  <div className="row no-gutters mt-3 border p-3">
                    {data.length > 0 && (
                      <div className="text-right mb-2">
                        <Button
                          frmButton={false}
                          className={"btn me-3"}
                          type="button"
                          onClick={(e) => handleShow(values, 2)}
                          text="Export Excel"
                        />
                        <Button
                          type="button"
                          frmButton={false}
                          onClick={(e) => {
                            handleShow(values, 1);
                          }}
                          text="Export PDF"
                        />
                      </div>
                    )}
                    <div className="table-responsive mt-2">
                      <table className="table table-bordered table-hover">
                        <thead>
                          <tr>
                            <th width="1%">No.</th>
                            <th width="12%">Date</th>
                            <th width="5%">In Time</th>
                            <th width="5%">Out Time</th>
                            <th width="5%">Late</th>
                            <th width="5%">Early Departure</th>
                            <th width="5%">Early Arrive</th>
                            <th width="5%">Delay</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.length == 0 ? (
                            <tr>
                              <td colspan={9} align="center">
                                No data found
                              </td>
                            </tr>
                          ) : (
                            <>
                              {data?.map((item, index) => {
                                if (index === 0) {
                                  statusIndex = 0;
                                } else if (
                                  data[index - 1].custom_employeeid !=
                                  item.custom_employeeid
                                ) {
                                  statusIndex += 1;
                                }

                                return (
                                  <>
                                    {index === 0 ? (
                                      <tr>
                                        <th
                                          colspan="9"
                                          className="student-text"
                                        >
                                          {item.custom_employeeid +
                                            " - " +
                                            item.employee_name}
                                        </th>
                                      </tr>
                                    ) : data[index - 1].custom_employeeid !=
                                        item.custom_employeeid &&
                                      leaveCountDetails ? (
                                      <>
                                        <tr>
                                          <td colspan="9">
                                            <table
                                              width="100%"
                                              className="table table-bordered table-hover"
                                              style={{ marginBottom: 0 }}
                                            >
                                              <tr>
                                                {leaveCountDetails[
                                                  statusIndex - 1
                                                ] &&
                                                  Object?.keys(
                                                    leaveCountDetails[
                                                      statusIndex - 1
                                                    ]
                                                  )?.map(
                                                    (key1) =>
                                                      key1 !==
                                                        "custom_employeeid" &&
                                                      key1 !== "name" && (
                                                        <th>{key1}</th>
                                                      )
                                                  )}
                                              </tr>
                                              <tr>
                                                {leaveCountDetails[
                                                  statusIndex - 1
                                                ] &&
                                                  Object?.keys(
                                                    leaveCountDetails[
                                                      statusIndex - 1
                                                    ]
                                                  )?.map(
                                                    (key1) =>
                                                      key1 !==
                                                        "custom_employeeid" &&
                                                      key1 !== "name" && (
                                                        <td>
                                                          {
                                                            leaveCountDetails[
                                                              statusIndex - 1
                                                            ][key1]
                                                          }
                                                        </td>
                                                      )
                                                  )}
                                              </tr>
                                            </table>
                                          </td>
                                        </tr>
                                        <tr>
                                          <th
                                            colspan="9"
                                            className="student-text"
                                          >
                                            {item.custom_employeeid +
                                              " - " +
                                              item.employee_name}
                                          </th>
                                        </tr>
                                      </>
                                    ) : (
                                      ""
                                    )}
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>
                                        {moment(item.attendance_date).format(
                                          "DD-MM-yyyy"
                                        )}
                                      </td>
                                      <td>{item.in_time ?? "00:00:00"}</td>
                                      <td>{item.out_time ?? "00:00:00"}</td>
                                      <td>
                                        {item.late.includes("-")
                                          ? item.late
                                              .split("-")[1]
                                              .split(".")[0]
                                          : moment(
                                              item.late.split(".")[0]
                                            ).format("HH:mm:ss")}
                                      </td>
                                      <td>
                                        {item.early_departure === "0"
                                          ? "00:00:00"
                                          : item.early_departure.split(".")[0]}
                                      </td>
                                      <td>
                                        {item.early_arrive === "0"
                                          ? "00:00:00"
                                          : item.early_arrive.split(".")[0]}
                                      </td>
                                      <td>
                                        {item.delay === "0"
                                          ? "00:00:00"
                                          : item.delay.split(".")[0]}
                                      </td>
                                      <td>
                                        {item.status != "On Leave"
                                          ? item.status
                                          : item.leave_type}
                                      </td>
                                    </tr>
                                  </>
                                );
                              })}
                              {leaveCountDetails?.length > 0 && (
                                <tr>
                                  <td colspan="9">
                                    <table
                                      width={"100%"}
                                      className="table table-bordered"
                                      style={{ marginBottom: 0 }}
                                    >
                                      <tr>
                                        {leaveCountDetails[statusIndex] &&
                                          Object?.keys(
                                            leaveCountDetails[statusIndex]
                                          )?.map(
                                            (key1) =>
                                              key1 !== "custom_employeeid" &&
                                              key1 !== "name" && <th>{key1}</th>
                                          )}
                                      </tr>
                                      <tr>
                                        {leaveCountDetails[statusIndex] &&
                                          Object?.keys(
                                            leaveCountDetails[statusIndex]
                                          )?.map(
                                            (key1) =>
                                              key1 !== "custom_employeeid" &&
                                              key1 !== "name" && (
                                                <td>
                                                  {
                                                    leaveCountDetails[
                                                      statusIndex
                                                    ][key1]
                                                  }
                                                </td>
                                              )
                                          )}
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              )}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
export default MonthlyActivity;
