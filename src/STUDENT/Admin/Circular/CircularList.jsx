import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import moment from "moment";
import Button from "../../../component/FormField/Button";
import preFunction from "../../../component/common/CommonFunction";
import CustomActivityIndicator from "../../../component/common/CustomActivityIndicator";
import academicApi from "../../../api/AcademicApi";
import { Formik } from "formik";
import DateFieldFormik from "../../../component/FormField/DateFieldFormik";
import { useSelector } from "react-redux";
import ScreenTitle from "../../../component/common/ScreenTitle";

const FormSchema = Yup.object().shape({
  fromDate: Yup.date().required("Please select From Date"),
  toDate: Yup.date().required("Please select To Date"),
});

const retainState = {
  fromDate: moment().subtract(1, "months").format("YYYY-MM-DD"),
  toDate: new Date(),
  data: [],
  showRes: false,
};

function CircularList() {
  const RENAME = useSelector((state) => state.web.rename);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(
    moment().subtract(1, "months")
  );
  const [selectedToDate, setSelectedToDate] = useState(moment());
  const collegeConfig = useSelector((state) => state.web.college);

  const handleShow = async () => {
    if (load) return;
    try {
      setLoad(true);

      const getCircularListRes = await academicApi.getCircularList(
        moment(selectedFromDate).format("YYYY-MM-DD"),
        // selectedtoDate is add 1 day to the date
        moment(selectedToDate).add(1, "days").format("YYYY-MM-DD")
      );
      console.log("getCircularListRes---", getCircularListRes);

      setData(getCircularListRes.data.message.data.circulars);
      setShowRes(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters">
          <Formik
            enableReinitialize={false}
            initialValues={{
              fromDate: selectedFromDate,
              toDate: selectedToDate,
            }}
            validationSchema={FormSchema}
            onSubmit={handleShow}
          >
            {({ errors, handleSubmit, setFieldValue }) => {
              return (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="row no-gutters">
                    <div className="col-lg-3"></div>
                    <div className="col-lg-6 border p-3">
                      <DateFieldFormik
                        autoFocus
                        tabIndex={1}
                        label="From Date"
                        labelSize={3}
                        id="fromDate"
                        mandatory={1}
                        maxDate={new Date(moment().add(3, "months"))}
                        minDate={moment().subtract(4, "months")}
                        style={{ width: "30%" }}
                        onChange={(e) => {
                          setFieldValue("fromDate", e.target.value);
                          setSelectedFromDate(e.target.value);
                          setShowRes(false);
                        }}
                      />
                      <DateFieldFormik
                        tabIndex={2}
                        labelSize={3}
                        label="To Date"
                        id="toDate"
                        mandatory={1}
                        maxDate={moment().add(3, "months")}
                        minDate={moment().subtract(4, "month")}
                        style={{ width: "30%" }}
                        onChange={(e) => {
                          setFieldValue("toDate", e.target.value);
                          setSelectedToDate(e.target.value);
                          setShowRes(false);
                        }}
                      />
                      <Button
                        tabIndex={3}
                        // isTable={true}
                        text={"Show"}
                        type="submit"
                        onClick={(e) => {
                          preFunction.handleErrorFocus(errors);
                        }}
                      />
                    </div>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
        <div className="row no-gutters mt-3">
          {showRes ? (
            <div className="table-responsive">
              <table className="table table-hover table-bordered ">
                <thead>
                  <tr>
                    <th width={"1%"}>No.</th>
                    {collegeConfig.is_university && (
                      <th width={"17%"}>College</th>
                    )}
                    <th>Department</th>
                    <th width={"20%"}>{RENAME?.course}</th>
                    <th width={"10%"}>{RENAME?.sem}</th>
                    <th width={"15%"}>Topic</th>
                    {/* <th width={"13%"}>Description</th> */}
                    <th width={"1%"}>Circular For</th>
                    {/* <th>Created by</th> */}
                    <th width={"10%"}>Created at</th>
                    <th width={"1%"}>View</th>
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
                          {collegeConfig.is_university && (
                            <td>{item.college}</td>
                          )}
                          <td>{item.department}</td>
                          <td>{item.course}</td>
                          <td>{item.className}</td>
                          <td>{item.circularTopic}</td>
                          {/* <td>{item.description}</td> */}
                          <td>{item.isStaffOnly ? "Staff" : "Student"}</td>
                          {/* <td>{item.modifiedBy}</td> */}
                          <td>{moment(item.modified).format("DD-MM-YYYY")}</td>
                          <td>
                            <Button
                              isTable={true}
                              className={"btn-3"}
                              text={"View"}
                              onClick={() =>
                                navigate("/view-circular", {
                                  state: {
                                    item: item,
                                  },
                                })
                              }
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export default CircularList;
