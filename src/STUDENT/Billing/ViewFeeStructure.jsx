import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import DisplayText from "../../component/FormField/DisplayText";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";

function ViewFeeStructure() {
  //#region const
  const location = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [feeDetails, setFeeDetails] = useState([]);
  const collegeConfig = useSelector((state) => state?.web?.college);
  const RENAME = useSelector((state) => state?.web?.rename);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const viewFeeStructure = async () => {
    try {
      if (!location?.state || !location?.state?.id) {
        navigate("/fee-structure-list");
        return;
      }
      console.log("location.state--", location?.state);
      setLoad(true);
      const viewFeeStructure = await api.feesStructureDetailByid(
        location?.state?.id,
        collegeConfig?.institution_type
      );
      console.log("---viewFeeStructure", viewFeeStructure);
      if (!viewFeeStructure?.data?.message?.success) {
        setModalMessage(viewFeeStructure?.data?.message?.message);
        setModalErrorOpen(true);
        setModalTitle("Message");
        setLoad(false);
        return;
      }
      setData(viewFeeStructure?.data?.message?.data?.feesStructure[0]);
      setFeeDetails(viewFeeStructure?.data?.message?.data?.feesStructureDetail);

      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  useEffect(() => {
    viewFeeStructure();
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
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-1 col-lg-8">
          <div className="col-lg-2">
            <div>
              <Button
                autoFocus
                text={"Back"}
                tableIndex={1}
                className={"btn-3"}
                frmButton={false}
                onClick={() => {
                  console.log("location.state--", location?.state);
                  navigate("/fee-structure-list", {
                    state: location?.state,
                  });
                }}
              />
            </div>
          </div>
          <div className="col-lg-10">
            <DisplayText
              label={RENAME?.course}
              labelSize={4}
              value={data?.courseName}
            />
            {collegeConfig.institution_type === 1 ? (
              <DisplayText
                label={RENAME?.sem}
                labelSize={4}
                value={data?.className}
              />
            ) : (
              <DisplayText
                label={RENAME?.batch}
                labelSize={4}
                value={location?.state?.batch}
              />
            )}
            <DisplayText
              label={"Admission Type"}
              labelSize={4}
              value={data?.admissionType}
            />
          </div>
        </div>
        <div className="row no-gutters mt-1">
          {feeDetails?.length > 0 && (
            <>
              <div className="row no-gutters">
                <div className="subhead-row">
                  <div className="subhead">Particular Detail</div>
                  <div className="col line-div"></div>
                </div>
                <div className="row no-gutters table-responsive">
                  <table className="table table-bordered report-table">
                    <thead>
                      <tr>
                        <th width="1%">No.</th>
                        <th>Particular</th>
                        {collegeConfig?.institution_type === 1 ||
                        collegeConfig?.institution_type === 5 ? (
                          <th width="3%">Amount (₹)</th>
                        ) : (
                          [...Array(parseInt(data?.duration * 2))].map(
                            (_, tableIndex) => (
                              <th width="3%">Sem {tableIndex + 1} (₹)</th>
                            )
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {feeDetails?.map((item, index) => {
                        return (
                          <tr>
                            <td>{index + 1}</td>
                            <td>{item?.particular}</td>
                            {collegeConfig?.institution_type === 1 ||
                            collegeConfig?.institution_type === 5 ? (
                              <td align="right">{item["sem1"]}</td>
                            ) : (
                              [...Array(parseInt(data?.duration * 2))].map(
                                (_, tableIndex) => (
                                  <td className="text-right">
                                    {item["sem" + (tableIndex + 1)] > 0 &&
                                      item["sem" + (tableIndex + 1)]}
                                  </td>
                                )
                              )
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewFeeStructure;
