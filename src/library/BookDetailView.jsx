import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import libraryapi from "../api/libraryapi";

import Button from "../component/FormField/Button";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import preFunction from "../component/common/CommonFunction";
import ReadOnlyField from "../component/ReadOnlyField";
import ScreenTitle from "../component/common/ScreenTitle";

function BookDetailView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [accessNumberData, setAccessNumberData] = useState([]);

  const getBookPurchaseView = async () => {
    try {
      setLoad(true);
      const bookId = location.state.purchaseid;
      console.log("purchaseid----", bookId);
      const getAccessNumberRes = await libraryapi.findAccessFromTitle(bookId);
      console.log("getAccessNumberRes---", getAccessNumberRes);
      if (getAccessNumberRes.data.message.access_number_detail.length > 0) {
        setAccessNumberData(
          getAccessNumberRes.data.message.access_number_detail
        );
      }
      if (getAccessNumberRes.data.message.book_detail.length > 0) {
        setData(getAccessNumberRes.data.message.book_detail);
      }
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
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
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
              onClick={(e) => {
                navigate("/book-detail-list");
              }}
            />
          </div>
        </div>
        <div className="row no-gutters">
          <div className="row no-gutters">
            <div className="col-lg-6 pe-2">
              {data[0]?.main_title ? (
                <div className="col-lg-12">
                  <ReadOnlyField label="Title" value={data[0]?.main_title} />
                </div>
              ) : null}
              {data[0]?.author_origin ? (
                <div className="col-lg-12">
                  <ReadOnlyField
                    label="Author Origin"
                    value={data[0]?.author_origin}
                  />
                </div>
              ) : null}

              {data[0]?.book_department ? (
                <div className="col-lg-12">
                  <ReadOnlyField
                    label="Department"
                    value={data[0]?.book_department}
                  />
                </div>
              ) : null}
              <div className="row p-0">
                <div className="col-lg-6 p-0 pe-2">
                  {data[0]?.call_number ? (
                    <div className="col-lg-12">
                      <ReadOnlyField
                        label="Call number"
                        value={data[0]?.call_number}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="col-lg-6 p-0 ps-2">
                  {data[0]?.rack_number ? (
                    <div className="col-lg-12">
                      <ReadOnlyField
                        label="Rack Number"
                        value={data[0]?.rack_number}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="col-lg-6 ps-2">
              {data[0]?.author_name ? (
                <div className="col-lg-12">
                  <ReadOnlyField label="Author" value={data[0]?.author_name} />
                </div>
              ) : null}
              {data[0]?.publisher ? (
                <div className="col-lg-12">
                  <ReadOnlyField label="Publisher" value={data[0]?.publisher} />
                </div>
              ) : null}
              {data[0]?.book_type ? (
                <div className="col-lg-12">
                  <ReadOnlyField label="Type" value={data[0]?.book_type} />
                </div>
              ) : null}
              {data[0]?.isbn ? (
                <div className="col-lg-12">
                  <ReadOnlyField label="ISBN" value={data[0]?.isbn} />
                </div>
              ) : null}
            </div>
            {data[0]?.book_subject ? (
              <div className="col-lg-12">
                <ReadOnlyField label="Subject" value={data[0]?.subject_name} />
              </div>
            ) : null}
          </div>
          {accessNumberData.length > 0 ? (
            <>
              <div className="subhead-row">
                <div className="subhead">Access Number Detail</div>
                <div className="col line-div"></div>
              </div>
              <div className="row mt-1 p-0">
                <div className="col-lg-3"></div>
                <div className="col-lg-6 p-0">
                  <div className="table-responsive p-0 m-0">
                    <table className="table table-bordered mb-1">
                      <thead>
                        <tr>
                          <th width="1%">No.</th>
                          <th>Access Number</th>
                          <th>Available</th>
                          <th>Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessNumberData.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.access_number}</td>
                              <td>{item.is_available ? "Yes" : "No"}</td>
                              <td>{item.is_reference ? "Yes" : "No"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default BookDetailView;
