import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import StudentApi from "../../api/StudentApi";

import Button from "../../component/FormField/Button";
import moment from "moment";
import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import DisplayText from "../../component/FormField/DisplayText";
import ModalComponent from "../../component/ModalComponent";

import StudentCard from "../../component/StudentCard";
import string from "../../string";

function FeeModificationView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState();
  const [studentInfo, setStudentInfo] = useState();

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [routeData, setRouteData] = useState(location?.state);

  const handleApprove = async () => {
    console.log("----", routeData);

    if (load) return;
    try {
      setLoad(true);
      const updateModificationApprovalRes =
        await StudentApi.updateFeeModificationApproval(
          routeData?.id,
          routeData?.accountApproval ? routeData?.accountApproval : 0,
          routeData?.administrativeOfficer
            ? routeData?.administrativeOfficer
            : 0
        );
      console.log(
        "updateModificationApprovalRes---",
        updateModificationApprovalRes
      );
      if (!updateModificationApprovalRes.data.message.success) {
        setModalMessage(updateModificationApprovalRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(updateModificationApprovalRes.data.message.message);
      if (routeData?.accountApproval) {
        navigate("/fee-modification-accountant");
      } else {
        navigate("/fee-modification-ao");
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const handleReject = async () => {
    console.log("----", routeData);

    if (load) return;
    try {
      setLoad(true);
      const updateModificationApprovalRes =
        await StudentApi.rejectFeeModification(
          routeData?.id,
          routeData?.accountApproval ? routeData?.accountApproval : 0,
          routeData?.administrativeOfficer
            ? routeData?.administrativeOfficer
            : 0
        );
      console.log(
        "updateModificationApprovalRes---",
        updateModificationApprovalRes
      );
      if (!updateModificationApprovalRes.data.message.success) {
        setModalMessage(updateModificationApprovalRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      toast.success(updateModificationApprovalRes.data.message.message);
      if (routeData?.accountApproval) {
        navigate("/fee-modification-accountant");
      } else {
        navigate("/fee-modification-ao");
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("Exception--", error);
    }
  };

  const getFeeModificationDetail = async () => {
    try {
      setLoad(true);
      console.log("routeData---", routeData, location?.state);
      if (!location?.state?.id) {
        navigate("/fee-modification-accountant");
        return;
      }
      console.log(
        "location---",
        location?.state?.accountApproval ? location?.state?.accountApproval : 0,
        location?.state?.administrativeOfficer
          ? location?.state?.administrativeOfficer
          : 0,
        location?.state?.id
      );
      const getFeesModificationDataRes =
        await StudentApi.getFeesModificationData(
          location?.state?.accountApproval
            ? location?.state?.accountApproval
            : 0,
          location?.state?.administrativeOfficer
            ? location?.state?.administrativeOfficer
            : 0,
          location?.state?.id
        );
      console.log("getFeesModificationDataRes---", getFeesModificationDataRes);
      if (!getFeesModificationDataRes.data.message.success) {
        setModalMessage(getFeesModificationDataRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setData(
        getFeesModificationDataRes.data.message.data.fees_modification_details
      );
      setStudentInfo({
        enrollNo: location?.state.authorizedDetails?.enrollNo,
        photo: location?.state?.authorizedDetails?.photo ?? null,
        name: location?.state?.authorizedDetails?.name,
        fatherName: location?.state?.authorizedDetails?.fatherName,
        batch: location?.state?.authorizedDetails?.batch,
        courseName: location?.state?.authorizedDetails?.courseName,
        semester: location?.state?.authorizedDetails?.semester,
        studyYear: location?.state?.authorizedDetails?.studyYear,
        className: location?.state?.authorizedDetails?.className,
      });

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    setLoad(false);
    getFeeModificationDetail();
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
        <div className="row no-gutters">
          <div className="page-heading">
            <div>
              <CurrencyRupeeIcon
                style={{
                  width: "3em",
                  height: "3em",
                  color: "#e9ecf1",
                }}
                className="page-heading-position-report"
              />
              Fees Modification Detail -{" "}
              {routeData?.accountApproval ? "Accountant" : "AO"} Approval
            </div>
          </div>
        </div>
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
                window.history.back();
              }}
            />
          </div>
        </div>
        {data && (
          <div className="row no-gutters">
            {studentInfo && (
              <>
                <div className="subhead-row">
                  <div className="subhead">Student Detail </div>
                  <div className="col line-div"></div>
                </div>
                <StudentCard studentInfo={studentInfo} />

                <>
                  <div className="row no-gutters">
                    <div className="subhead-row">
                      <div className="subhead">Authorization Detail </div>
                      <div className="col line-div"></div>
                    </div>
                  </div>
                  <div className="col-lg-9">
                    <DisplayText
                      label={"Authorized By"}
                      labelSize={3}
                      value={routeData?.authorizedDetails?.authorizedBy}
                    />
                    <DisplayText
                      label={"Reference Number"}
                      labelSize={3}
                      value={routeData?.authorizedDetails?.referenceNo}
                    />
                    <DisplayText
                      label={"Reference Date"}
                      labelSize={3}
                      value={moment(
                        routeData.authorizedDetails?.referenceDate
                      ).format("DD-MM-yyyy")}
                    />
                    <DisplayText
                      label="Document Proof"
                      labelSize={3}
                      value={
                        <a
                          href={
                            string.FILEURL +
                            routeData?.authorizedDetails?.letterDoc
                          }
                          target="_blank"
                        >
                          View Document
                        </a>
                      }
                    />
                    <DisplayText
                      label={"Note"}
                      labelSize={3}
                      value={routeData?.authorizedDetails?.note}
                    />
                  </div>
                  <div className="row no-gutters">
                    <div className="subhead-row">
                      <div className="subhead">Fees Due Detail </div>
                      <div className="col line-div"></div>
                    </div>
                  </div>
                  <div className="table-responsive mt-2">
                    <table className="table table-bordered table-hover">
                      <thead>
                        <tr>
                          <th width="1%" className="p-2">
                            No.
                          </th>
                          <th>Particular</th>
                          <th width="10%">Opening Bal. (₹)</th>
                          <th width="10%">Paid (₹)</th>
                          <th width="10%">Concession (₹)</th>
                          <th width="10%">Refund (₹)</th>
                          <th width="15%">Outstanding Bal.(₹)</th>
                          <th width="10%">Modified Opening Bal.(₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.particular}</td>
                            <td>{item.openingBalance}</td>
                            <td>{item.paid}</td>
                            <td>{item.concession}</td>
                            <td>{item.refund}</td>
                            <td>{item.balance}</td>
                            <td>
                              {item.openingBalance +
                                item.currentModifyOpeningBalance}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
                <div className="row no-gutters mt-2">
                  <div className="col-lg-4"></div>
                  <div className="col-lg-1">
                    <Button
                      className={"btn ms-2"}
                      text="F4 - Approve"
                      tabIndex="1"
                      frmButton={false}
                      isTable={true}
                      onClick={(e) => {
                        handleApprove();
                      }}
                      id="save"
                    />
                  </div>
                  <div className="col-lg-2 ms-5 ps-3">
                    <Button
                      className={"btn"}
                      text="Reject"
                      frmButton={false}
                      isTable={true}
                      onClick={(e) => {
                        handleReject();
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FeeModificationView;
