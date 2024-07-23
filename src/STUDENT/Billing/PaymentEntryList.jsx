import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import api from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import DateField from "../../component/FormField/DateField";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";

import string from "../../string";

function PaymentEntryList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const todyaDate = new Date();
  const oneWeekBefore = new Date();
  oneWeekBefore.setTime(todyaDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [fromDate, setFromDate] = useState(oneWeekBefore);
  const [toDate, setToDate] = useState(todyaDate);

  const [showLoadMore, setShowLoadMore] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const getpaymententryList = async (showAll) => {
    try {
      setLoad(true);
      const from = moment(fromDate).format("yyyy-MM-DD");
      const to = moment(toDate).format("yyyy-MM-DD");
      console.log("From:" + from + " to:" + to);
      setData([]);
      setShowLoadMore(false);
      console.log("showAll", showAll);
      const allFeesCollections = await api.allFeesCollections(
        from,
        to,
        showAll ? showAll : 0
      );
      console.log("getAllStudentForList---", allFeesCollections);
      if (!allFeesCollections.data.message.success) {
        setModalMessage(allFeesCollections.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }

      if (showAll) {
        setData([]);
        setData(allFeesCollections.data.message.data.feesCollection);
        setShowLoadMore(false);
      } else {
        setData(allFeesCollections.data.message.data.feesCollection);
        if (
          allFeesCollections.data.message.data.feesCollection.length >=
          string.PAGE_LIMIT
        )
          setShowLoadMore(true);
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const handleViewPaymentEntry = (id) => {
    navigate("/view-payment-entry", { state: { id } });
  };

  useEffect(() => {
    getpaymententryList();
  }, []);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <ModalComponent
        title={modalTitle}
        isOpen={modalErrorOpen}
        message={modalMessage}
        okClick={() => setModalErrorOpen(false)}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1">
          <div className="row no-gutters mt-1 mb-1">
            <div className="col-lg-2">
              <label>From</label>

              <DateField
                id="fromDate"
                style={{ width: "80%" }}
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                }}
                minDate={new Date(moment().subtract(6, "years"))}
                maxDate={new Date()}
              />
            </div>
            <div className="col-lg-2">
              <label>To</label>
              <DateField
                id="toDate"
                value={toDate}
                style={{ width: "80%" }}
                onChange={(e) => {
                  setToDate(e.target.value);
                }}
                minDate={fromDate}
                maxDate={new Date()}
              />
            </div>
            <div className="col-lg-1">
              <Button
                className={"btn mt-4"}
                isTable={true}
                type="button"
                onClick={() => getpaymententryList()}
                text={"Show"}
              />
            </div>
            {/* <div className="col-lg-6 text-right">
              <Button
                isTable={true}
                type="button"
                onClick={() => navigate("/payment-entry")}
                text={"Add Fees Collection"}
              />
            </div> */}
          </div>
          <div className="row no-gutters mt-4">
            {data.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-bordered table-hover ">
                  <thead>
                    <tr>
                      <th width="1%">No.</th>
                      <th width="1%">Bill No.</th>
                      <th width="10%">Bill Date</th>
                      <th width="5%">Student No.</th>
                      <th width="15%">Student Name</th>
                      <th>Course</th>
                      <th width="5%">Pay Mode</th>
                      {/* <th width="5%">Semester</th> */}
                      <th width="5%">Amount(₹)</th>
                      <th width="5%">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index}>
                        <td align="center">{index + 1}</td>
                        <td>{item.id}</td>
                        <td>{moment(item.billDate).format("DD-MM-YYYY")}</td>
                        <td>{item.enrollNo}</td>
                        <td>{item.name}</td>
                        <td>{item.courseName}</td>
                        <td>{item.paymentMode}</td>
                        {/* <td>{item.semester}</td> */}
                        <td align="right">{item.totalAmount}</td>
                        <td>
                          <button
                            type="view"
                            className="btn-3"
                            title="View"
                            onClick={() => handleViewPaymentEntry(item.id)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {showLoadMore && (
                  <div className="row text-right">
                    <Button
                      text="ShowAll"
                      type="button"
                      isTable={true}
                      onClick={(e) => getpaymententryList(1)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="row no-gutters totcntstyle border p-3">
                No data found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default PaymentEntryList;
