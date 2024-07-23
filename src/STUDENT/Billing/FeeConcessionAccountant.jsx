import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../../api/StudentApi";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import Button from "../../component/FormField/Button";
import ScreenTitle from "../../component/common/ScreenTitle";
import ModalComponent from "../../component/ModalComponent";

import AuthContext from "../../auth/context";

function FeeConcessionAccountant() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);

  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const RENAME = useSelector((state) => state.web.rename);

  const collegeConfig = useSelector((state) => state.web.college);
  const { setUnSavedChanges, collegeId, role } = useContext(AuthContext);

  const getFeeModificationAccountantApproval = async () => {
    try {
      setLoad(true);
      const getFeesConcessionDataRes = await api.getFeesConcessionData(
        1,
        0,
        null,
        collegeConfig.common_cashier == 1 || role == "SuperAdmin"
          ? null
          : collegeId
      );
      console.log("getFeesConcessionDataRes---", getFeesConcessionDataRes);
      if (!getFeesConcessionDataRes.data.message.success) {
        setModalMessage(getFeesConcessionDataRes.data.message.message);
        setModalErrorOpen(true);
        setModalTitle("Already Exists");
        setLoad(false);
        return;
      }
      setData(getFeesConcessionDataRes.data.message.data);
      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  useEffect(() => {
    getFeeModificationAccountantApproval();
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
        <div className="row no-gutters mt-4">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th width="1%">No.</th>
                  <th width="10%">Student No.</th>
                  <th>Name</th>
                  <th width="35%">{RENAME?.course}</th>
                  <th width="10%">{RENAME?.sem}</th>
                  <th width="10%">Admission Type</th>
                  <th width="10%">View</th>
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
                  data.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td align="center">{index + 1}</td>
                        <td>{item.enrollNo}</td>
                        <td>{item.name}</td>
                        <td>{item.courseName}</td>
                        <td>{item.className}</td>
                        <td>{item.admissionType}</td>
                        <td>
                          <Button
                            type="button"
                            className="btn-3"
                            isTable={true}
                            onClick={() =>
                              navigate("/fee-concession-view", {
                                state: {
                                  studentID: item.studentID,
                                  id: item.feesConcessionID,
                                  accountApproval: 1,
                                  authorizedDetails: item,
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
        </div>
      </div>
    </div>
  );
}
export default FeeConcessionAccountant;
