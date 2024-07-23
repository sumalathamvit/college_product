import React, { useState, useRef, useEffect } from "react";
import moment from "moment";

import employeeApi from "../api/EmployeeApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import Button from "../component/FormField/Button";
import ModalComponent from "../component/ModalComponent";

import ScreenTitle from "../component/common/ScreenTitle";
import string from "../string";

function ActivityLog() {
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleShow = async () => {
    try {
      setLoad(true);

      const errorRes = await employeeApi.getActivityLog();

      console.log("errorRes", errorRes);

      if (errorRes.data.message.success) {
        setData(errorRes.data.message.data);
      } else {
        setModalMessage(errorRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setLoad(false);
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  };

  useEffect(() => {
    handleShow();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
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
        <ScreenTitle
          title="Web Error Log"
          titleClass="page-heading-position-report"
        />
        <div className="subhead-row mb-3">
          <div className="subhead">Activity Files</div>
          <div className="col line-div"></div>
        </div>
        <div className="row no-gutters">
          <div className="col-lg-2"> </div>
          <div className="col-lg-8">
            <div className="table-responsive p-0">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th width="5%">No.</th>
                    <th width="40%">File</th>
                    <th>Size</th>
                    <th> Updated On</th>
                    <th width="20%" className="text-center">
                      Download
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={6} align="center">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <tr className="tableColor" key={index}>
                        <td>{index + 1}</td>
                        <td>{item.file}</td>
                        <td>{(item.size / 1024).toFixed(2) + " KB"} </td>
                        <td>
                          {moment(item.modified_date).format(
                            "DD-MM-YYYY HH:mm:ss"
                          )}
                        </td>
                        <td>
                          {item.download && (
                            <Button
                              type="button"
                              isTable={true}
                              className={"btn-3"}
                              text={"Download"}
                              onClick={(e) => {
                                const uniqueUrl = `${
                                  string.FILEURL + item.download
                                }?t=${new Date().getTime()}`;
                                window.open(uniqueUrl, "_blank");
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-lg-2"> </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;
