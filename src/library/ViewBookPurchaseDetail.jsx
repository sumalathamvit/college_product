import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

import libraryApi from "../api/libraryapi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import ReadOnlyField from "../component/ReadOnlyField";
import Icon from "../component/Icon";
import string from "../string";
import ScreenTitle from "../component/common/ScreenTitle";

function ViewBookPurchaseDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [purchaseDetail, setPurchaseDetail] = useState([]);

  const getBookPurchaseView = async () => {
    try {
      setLoad(true);
      if (!location.state.purchaseid) {
        navigate("/book-purchase-detail");
        return;
      }
      console.log("purchaseid----", location.state.purchaseid);

      const getPurchaseByIdRes = await libraryApi.getBookPurchasebyPuchaseID(
        location.state.purchaseid
      );
      console.log("getPurchaseByIdRes----", getPurchaseByIdRes);

      setPurchaseDetail(getPurchaseByIdRes.data.message.data.purchase_data[0]);
      setData(getPurchaseByIdRes.data.message.data.purchase_detail);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error---", error);
    }
  };

  useEffect(() => {
    getBookPurchaseView();
  }, []);

  return (
    <div className="content-area-bigreport" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position-report" />
        <div className="col-lg-2">
          <div>
            <Button
              autoFocus
              text="Back"
              isTable={true}
              frmButton={false}
              className={"btn-3 me-2"}
              type="button"
              onClick={(e) =>
                navigate("/book-purchase-detail", {
                  state: {
                    fromDate: location?.state?.fromDate,
                    toDate: location?.state?.toDate,
                    showAll: location?.state?.showAll,
                  },
                })
              }
            />
          </div>
        </div>
        <div className="row no-gutters">
          <div className="row no-gutters">
            <div className="col-lg-4 pe-2">
              <ReadOnlyField label="Supplier" value={purchaseDetail.supplier} />
            </div>
            {purchaseDetail.po_number ? (
              <div className="col-lg-3 ps-2 pe-2">
                <ReadOnlyField
                  label="PO Number"
                  value={purchaseDetail.po_number}
                />
              </div>
            ) : null}
            <div className="col-lg-3 ps-2 pe-2">
              <ReadOnlyField
                label="Invoice Number"
                value={purchaseDetail.invoice_number}
              />
            </div>

            {purchaseDetail.invoice_date ? (
              <div className="col-lg-2 pe-2 ps-2">
                <ReadOnlyField
                  label="Invoice Date"
                  value={moment(purchaseDetail.invoice_date).format(
                    "DD-MM-yyy"
                  )}
                />
              </div>
            ) : null}
          </div>

          <div className="row mt-3 p-0">
            <div className="row no-gutters">
              <div className="">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th width="1%">No.</th>
                      <th>Book Name</th>
                      <th width="5%">Edition</th>
                      <th width="5%">Pages</th>
                      <th width="5%">YOP</th>
                      <th width="10%">Access No.</th>
                      <th width="10%">Remarks</th>
                      <th width="3%">Qty</th>
                      <th width="5%">MRP (₹)</th>
                      <th width="5%">Disc %</th>
                      <th width="5%">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length == 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center">
                          No data found
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.main_title}</td>
                            <td>{item.edition}</td>
                            <td>{item.pages}</td>
                            <td>
                              {item.year_of_publish ? item.year_of_publish : ""}
                            </td>
                            <td>{item.access_number}</td>
                            <td>{item.remarks}</td>
                            <td align="right">{item.quantity}</td>
                            <td align="right">{item.mrp}</td>
                            <td align="right">{item.discount_percentage}</td>
                            <td align="right">
                              {item.total_amount.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                    <tr>
                      <td colSpan="10" className="text-right student-text">
                        Total
                      </td>
                      <td align="right" className="student-text">
                        {Math.round(purchaseDetail?.paid_amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {purchaseDetail.file_path && purchaseDetail.file_path != "" && (
              <div className="row no-gutters">
                <a
                  href={string.FILEURL + purchaseDetail?.file_path}
                  target="_blank"
                >
                  Purchase Copy
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewBookPurchaseDetail;
