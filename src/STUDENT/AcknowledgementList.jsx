import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TransferWithinAStationIcon from "@mui/icons-material/TransferWithinAStation";

import StudentApi from "../api/StudentApi";

import preFunction from "../component/common/CommonFunction";
import CustomActivityIndicator from "../component/common/CustomActivityIndicator";
import ErrorMessage from "../component/common/ErrorMessage";

import Button from "../component/FormField/Button";
import ScreenTitle from "../component/common/ScreenTitle";

function AcknowledgementList() {
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [load, setLoad] = useState(false);

  const getStudentAckApproval = async () => {
    try {
      setLoad(true);

      const accountApproval = 1;
      const administrativeOfficer = 0;
      const getStudentAckRes = await StudentApi.studentAckApprovalList(null);
      console.log("getStudentAckRes---", getStudentAckRes);
      setData(getStudentAckRes.data.message.data.student_acknowledgement);

      setLoad(false);
      return;
    } catch (error) {
      setLoad(false);
      console.log("exception--", error);
    }
  };

  useEffect(() => {
    getStudentAckApproval();
  }, []);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass={"page-heading-position-report"} />
        <div className="row no-gutters mt-4">
          {data?.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th width="1%">No.</th>
                      <th width="15%">Student No.</th>
                      <th width="15%">Name</th>
                      <th width="15%">Category</th>
                      <th>Course</th>
                      <th width="10%">Batch</th>
                      <th width="5%">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.map((item, index) => (
                      <tr key={index}>
                        <td align="center">{index + 1}</td>
                        <td>{item.enrollNo}</td>
                        <td>{item.name}</td>
                        <td>{item.studentCategory}</td>
                        <td>{item.courseName}</td>
                        <td>{item.batch}</td>
                        <td>
                          <Button
                            type="button"
                            text="View"
                            className="btn-3"
                            onClick={() =>
                              navigate("/view-acknowledgement", {
                                state: {
                                  item: item,
                                },
                              })
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <ErrorMessage view={true} Message={"No Request pending"} />
          )}
        </div>
      </div>
    </div>
  );
}
export default AcknowledgementList;
