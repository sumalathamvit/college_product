import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { Tab, Tabs } from "react-bootstrap";

import academicApi from "../api/AcademicApi";

import Button from "../component/FormField/Button";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import StudentCard from "../component/StudentCard";
import { useSelector } from "react-redux";
import ScreenTitle from "../component/common/ScreenTitle";

function StudentFeesView() {
  const RENAME = useSelector((state) => state.web.rename);
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [studentInfo, setStudentInfo] = useState("");
  const [unPaid, setUnPaid] = useState([]);
  const [paid, setPaid] = useState([]);
  const [history, setHistory] = useState([]);
  const collegeConfig = useSelector((state) => state.web.college);

  const getViewStudentFees = async () => {
    try {
      if (!location.state || (!location.state.id && !location.state.semester)) {
        navigate("/employee-list");
        return;
      }
      console.log("location.state.id--", location);
      setLoad(true);
      const viewStudentFeesDetail = await academicApi.viewStudentFeesDetail(
        location.state.id,
        location.state.semester
      );
      console.log("viewStudentFeesDetail----", viewStudentFeesDetail);
      const viewStudentDetail = await academicApi.viewStudentDetail(
        location.state.id
      );
      console.log("viewStudentDetail----", viewStudentDetail);
      setStudentInfo(viewStudentDetail.data.message);
      setHistory(viewStudentFeesDetail.data.message.data.bill_history);
      setPaid(viewStudentFeesDetail.data.message.data.paid_bill);
      setUnPaid(viewStudentFeesDetail.data.message.data.unpaid);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  useEffect(() => {
    getViewStudentFees();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="col-lg-12">
          {studentInfo ? (
            <div className="mb-4 pb-2 mt-3">
              <div className="subhead-row">
                <div className="subhead">Student Details</div>
                <div className="col line-div"></div>
              </div>

              {studentInfo && <StudentCard studentInfo={studentInfo} />}
            </div>
          ) : null}
          <Tabs id="uncontrolled-tab-example" className="text-center mt-1" fill>
            <Tab eventKey={1} title="Paid Fees Detail" className="py-2">
              {paid.length > 0 ? (
                paid.map((item, index) => {
                  return (
                    <div className="row px-4 py-2 my-2">
                      <div className="card p-4">
                        <div className="row p-0 mb-1">
                          <div className="row col-lg-6 text-left p-0">
                            <div className="p-0">
                              <label>Bill No : </label> {item.billNo}
                            </div>
                          </div>
                          <div className="row col-lg-6 text-right p-0">
                            <div className="p-0">
                              <label>Bill Date : </label> {item.billDate}
                            </div>
                          </div>
                        </div>
                        <div className="row mb-1">
                          <div className="row col-lg-6 text-left p-0">
                            <div className="p-0">
                              <label>{RENAME?.sem}</label> {item.className}
                            </div>
                          </div>
                          <div className="row col-lg-6 text-right p-0">
                            <div className="p-0">
                              <label>Payment Mode : </label> {item.paymentMode}
                            </div>
                          </div>
                        </div>
                        <table className="table table-bordered m-0">
                          <thead>
                            <tr>
                              <th width="1%">No.</th>
                              <th>Particular</th>
                              <th width="5%">Concession(₹)</th>
                              <th width="5%">Opening Balance(₹)</th>
                              <th width="5%">Balance(₹)</th>
                              <th width="5%">Paid(₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.particulars.map((item1, index1) => (
                              <tr className="tableColor" key={index1}>
                                <td>{index1 + 1}</td>
                                <td>{item1.particular}</td>
                                <td align="right">{item1.concession}</td>
                                <td align="right">{item1.openingBalance}</td>
                                <td align="right">{item1.balance}</td>
                                <td align="right">{item1.paid}</td>
                              </tr>
                            ))}
                            <tr className="tableColor">
                              <td colSpan={2} align="right"></td>
                              <td align="right"></td>
                              <td align="right"></td>
                              <td align="right">Total(₹)</td>
                              <td align="right">{item.totalAmount}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="row px-4 py-2 my-2">
                  <div className="card p-4">
                    <table className="table table-bordered m-0">
                      <thead>
                        <tr>
                          <th width="1%">No.</th>
                          <th>Particular</th>
                          <th width="5%">Concession(₹)</th>
                          <th width="5%">Opening Balance(₹)</th>
                          <th width="5%">Balance(₹)</th>
                          <th width="5%">Paid(₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colspan={9} align="center">
                            No data found
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Tab>
            <Tab eventKey={2} title="Due Detail" className="py-2">
              {unPaid.length > 0 ? (
                unPaid.map((item, index) => {
                  return (
                    <div className="row px-4 py-2 my-2">
                      <div className="card">
                        <div className="row p-2">
                          <table className="table table-bordered m-0">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th>Particular</th>
                                <th width="5%">{RENAME?.sem}</th>
                                <th width="5%">Concession(₹)</th>
                                <th width="5%">Opening Balance(₹)</th>
                                <th width="5%">Balance(₹)</th>
                                <th width="5%">Paid(₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="tableColor" key={index}>
                                <td>{index + 1}</td>
                                <td>{item.particular}</td>
                                <td>{item.className}</td>
                                <td align="right">{item.concession}</td>
                                <td align="right">{item.openingBalance}</td>
                                <td align="right">{item.balance}</td>
                                <td align="right">{item.paid}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="row px-4 py-2 my-2">
                  <div className="card p-4">
                    <table className="table table-bordered m-0">
                      <thead>
                        <tr>
                          <th width="1%">No.</th>
                          <th>Particular</th>
                          <th width="5%">{RENAME?.sem}</th>
                          <th width="5%">Concession(₹)</th>
                          <th width="5%">Opening Balance(₹)</th>
                          <th width="5%">Balance(₹)</th>
                          <th width="5%">Paid(₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colspan={9} align="center">
                            No data found
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Tab>
            <Tab eventKey={3} title="Transaction History" className="py-2">
              {history.length > 0 ? (
                history.map((item, index) => {
                  return (
                    <div className="row px-4 py-2 my-2">
                      <div className="card p-4">
                        <div className="row p-0 mb-1">
                          <div className="row col-lg-6 text-left p-0">
                            <div className="p-0">
                              <label>Bill No : </label> {item.billNo}
                            </div>
                          </div>
                          <div className="row col-lg-6 text-right p-0">
                            <div className="p-0">
                              <label>Bill Date : </label> {item.billDate}
                            </div>
                          </div>
                        </div>
                        <div className="row mb-1">
                          <div className="row col-lg-6 text-left p-0">
                            <div className="p-0">
                              <label>{RENAME?.sem}</label>
                              {item.className}
                            </div>
                          </div>
                          <div className="row col-lg-6 text-right p-0">
                            <div className="p-0">
                              <label>Payment Mode : </label> {item.paymentMode}
                            </div>
                          </div>
                        </div>
                        {history.length > 0 ? (
                          <table className="table table-bordered m-0">
                            <thead>
                              <tr>
                                <th width="1%">No.</th>
                                <th>Particular</th>
                                <th width="5%">Concession(₹)</th>
                                <th width="5%">Opening Balance(₹)</th>
                                <th width="5%">Balance(₹)</th>
                                <th width="5%">Paid(₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.particulars.map((item1, index1) => (
                                <tr className="tableColor" key={index1}>
                                  <td>{index1 + 1}</td>
                                  <td>{item1.particular}</td>
                                  <td align="right">{item1.concession}</td>
                                  <td align="right">{item1.openingBalance}</td>
                                  <td align="right">{item1.balance}</td>
                                  <td align="right">{item1.paid}</td>
                                </tr>
                              ))}
                              <tr className="tableColor">
                                <td colSpan={2} align="right"></td>
                                <td align="right"></td>
                                <td align="right"></td>
                                <td align="right">Total(₹)</td>
                                <td align="right">{item.totalAmount}</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="row px-4 py-2 my-2">
                  <div className="card p-4">
                    <table className="table table-bordered m-0">
                      <thead>
                        <tr>
                          <th width="1%">No.</th>
                          <th>Particular</th>
                          <th width="5%">Concession(₹)</th>
                          <th width="5%">Opening Balance(₹)</th>
                          <th width="5%">Balance(₹)</th>
                          <th width="5%">Paid(₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colspan={9} align="center">
                            No data found
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Tab>
          </Tabs>
          <Button
            text={"Back"}
            onClick={() =>
              navigate("/student-fees-report", {
                state: {
                  id: location.state.id,
                  semester: location.state.semester,
                  className: location.state.className,
                  classID: location.state.classID,
                  section: location.state.section,
                  course: location.state.course,
                  courseID: location.state.courseID,
                  batch: location.state.batch,
                  batchID: location.state.batchID,
                },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

export default StudentFeesView;
