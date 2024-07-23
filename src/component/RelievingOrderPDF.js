import React from "react";
import moment from "moment";

function RelievingOrderPDFDetail({ employee, secondCopy = false }) {
  return (
    <>
      <div className="row no-gutters p-4">
        <div className="row no-gutters">
          <div className="row bonafide-completion-label-bold ps-1">
            <div className="col-6 text-left ps-3"></div>
            <div className="col-6 text-right pe-3">
              Date:{"  "}
              {moment().format("DD/MM/YYYY")}
            </div>
          </div>
          <table className="table" style={{ marginBottom: "0px" }}>
            <tr>
              <td>
                <div className="receipt-copy text-center bonafide-completion-label-bold">
                  <u>EXPERIENCE CERTIFICATE</u>
                </div>
              </td>
            </tr>
            <div className="bonafide-completion-content mt-4 pt-2 ps-1 pe-1">
              This is to certify that{" "}
              <span className="bonafide-completion-print m-0 ps-1">
                {employee?.employee_name}
              </span>{" "}
              worked as a
              <span className="bonafide-completion-print m-0 ps-1">
                {employee?.designation}
              </span>{" "}
              in our organization from
              <span className="bonafide-completion-print m-0 ps-1">
                {moment(employee?.date_of_joining).format("DD-MM-YYYY")} to{" "}
                {moment(employee?.relieving_date).format("DD-MM-YYYY")}
              </span>{" "}
              to our entire satisfaction. During his working period, we found
              him to be a sincere, hardworking and dedicated employee with a
              professional attitude and excellent job knowledge.
            </div>
            <div className="bonafide-completion-content mt-4 pt-2 ps-1 pe-1">
              He is amiable in nature and possesses strong moral character. We
              have no objection to him pursuing better career opportunities and
              have no outstanding liabilities towards our company.
            </div>
            <div className="bonafide-completion-content mt-4 pt-2 ps-1 pe-1">
              We wish him all the best in his future endeavors.
            </div>

            <div className="bonafide-completion-content mt-4 pt-1 ps-1 pe-1">
              <div className="fw-bold mt-4">Authorized Signatory</div>
              <div className="fw-bold mt-5">{employee?.authorizedBy}</div>
              <div>{employee?.authorizedByDesignation}</div>
            </div>
          </table>
        </div>
      </div>
    </>
  );
}

export default RelievingOrderPDFDetail;
