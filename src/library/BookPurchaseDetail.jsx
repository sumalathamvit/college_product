import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

import libraryapi from "../api/libraryapi";

import headingSvg from "../assests/svg/book-detail-report.svg";
import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import DateField from "../component/FormFieldLibrary/DateField";
import Button from "../component/FormField/Button";
import string from "../string";

import ScreenTitle from "../component/common/ScreenTitle";

function BookPurchaseDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showAll, setShowAll] = useState(0);
  const todayDate = new Date();
  const oneWeekBefore = new Date();
  oneWeekBefore.setTime(todayDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [fromDate, setFromDate] = useState(oneWeekBefore);
  const [toDate, setToDate] = useState(todayDate);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [fromDateError, setFromDateError] = useState(false);
  const [toDateError, setToDateError] = useState(false);
  const [changes, setChanges] = useState(true);

  const handleBackList = async () => {
    if (!location?.state) return;
    setFromDate(location?.state?.fromDate);
    setToDate(location?.state?.toDate);
    setShowAll(location?.state?.showAll);
    document.getElementById("fromDate").select();
    try {
      setLoad(true);
      setShowRes(true);
      setData([]);
      const from = moment(location?.state?.fromDate).format("yyyy-MM-DD");
      const to = moment(location?.state?.toDate).format("yyyy-MM-DD");
      const libBookPurchaseRes = await libraryapi.getBookPurchaseDetail(
        from,
        to,
        location?.state?.showAll == 1 ? "None" : string.PAGE_LIMIT
      );
      console.log("libBookPurchaseRes---", libBookPurchaseRes);
      setData(libBookPurchaseRes.data.data);
      setChanges(false);
      document.getElementById("fromDate").select();
      if (libBookPurchaseRes.data.data.length === string.PAGE_LIMIT) {
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  const handleBookPurchaseList = async (showAll = 0) => {
    document.getElementById("fromDate").select();
    if (!changes) return;
    setFromDateError(false);
    setToDateError(false);
    let todayDate = new Date();
    console.log("todayDate", todayDate);
    if (
      fromDate == "" ||
      fromDate > moment().format("YYYY-MM-DD") ||
      fromDate < moment().subtract(2, "years").format("YYYY-MM-DD")
    ) {
      console.log("test");
      setFromDateError(true);
      setShowRes(false);
      document.getElementById("fromDate").select();
      return;
    }
    if (
      toDate == "" ||
      toDate > moment().format("YYYY-MM-DD") ||
      toDate < moment(fromDate).format("YYYY-MM-DD")
    ) {
      console.log("testing");
      setToDateError(true);
      setShowRes(false);
      document.getElementById("toDate").select();
      return;
    }
    try {
      setLoad(true);
      setShowRes(true);
      setData([]);
      const from = moment(fromDate).format("yyyy-MM-DD");
      const to = moment(toDate).format("yyyy-MM-DD");
      const libBookPurchaseRes = await libraryapi.getBookPurchaseDetail(
        from,
        to,
        showAll == 1 ? "None" : string.PAGE_LIMIT
      );
      console.log("libBookPurchaseRes---", libBookPurchaseRes);
      setData(libBookPurchaseRes.data.data);
      setChanges(false);
      document.getElementById("fromDate").select();
      if (libBookPurchaseRes.data.data.length === string.PAGE_LIMIT) {
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  useEffect(() => {
    handleBackList();
    // if (!location.state) handleBookPurchaseList();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="row no-gutters">
          <div className="row no-gutters mb-2">
            <div className="col-lg-2 pe-2">
              <DateField
                label="From"
                id="fromDate"
                minDate={moment().subtract(2, "years")}
                maxDate={new Date()}
                mandatory={1}
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setFromDateError(false);
                  setShowRes(false);
                  setChanges(true);
                }}
                error={fromDateError ? "Please select valid Date" : ""}
                touched={fromDateError ? true : false}
                onKeyUp={(e) => e.keyCode == 13 && handleBookPurchaseList()}
              />
            </div>
            <div className="col-lg-2 ps-2 pe-2">
              <DateField
                label="To"
                id="toDate"
                mandatory={1}
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setToDateError(false);
                  setShowRes(false);
                  setChanges(true);
                }}
                minDate={fromDate}
                maxDate={new Date()}
                onKeyUp={(e) => e.keyCode == 13 && handleBookPurchaseList()}
                error={toDateError ? "Please select valid Date" : ""}
                touched={toDateError ? true : false}
              />
            </div>
            <div className="col-lg-2 ps-2">
              <Button
                autoFocus
                isTable={true}
                label={true}
                isCenter={false}
                text={"Show"}
                onClick={handleBookPurchaseList}
              />
            </div>
          </div>
          {showRes && (
            <>
              <div className="row no-gutters">
                <div className="row totcntstyle"></div>

                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th>Supplier</th>
                        <th width="5%">Invoice No.</th>
                        <th width="5%">Invoice Date</th>
                        <th width="5%">Total (₹)</th>
                        <th width="5%">Paid Amount (₹)</th>
                        <th width="2%">View Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length == 0 ? (
                        <tr>
                          <td colSpan="12" className="text-center">
                            No data found
                          </td>
                        </tr>
                      ) : (
                        data.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.supplier}</td>
                              <td>{item.invoice_number}</td>
                              <td>
                                {moment(item.invoice_date).format("DD-MM-yyyy")}
                              </td>
                              <td align="right">{item.total_value}</td>
                              <td align="right">
                                {Math.round(item.paid_amount)}
                              </td>
                              <td>
                                <Button
                                  className="btn-3"
                                  isTable={true}
                                  onClick={() =>
                                    navigate("/view-book-purchase-detail", {
                                      state: {
                                        purchaseid: item.name,
                                        fromDate: fromDate,
                                        toDate: toDate,
                                        showAll: showAll,
                                      },
                                    })
                                  }
                                  text="View"
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {showLoadMore && (
                  <Button
                    text="Show All"
                    className={"btn mt-3"}
                    isTable={true}
                    onClick={(e) => {
                      handleBookPurchaseList(1);
                      setShowAll(1);
                      setChanges(true);
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default BookPurchaseDetail;
