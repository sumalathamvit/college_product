import React from "react";
import moment from "moment";

function AppointmentOrderPDFDetail({ employee, secondCopy = false }) {
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
                  <u>APPOINTMENT ORDER</u>
                </div>
              </td>
            </tr>
            <div className="bonafide-completion-content mt-4 pt-2 ps-1 pe-1">
              Dear{" "}
              <span className="bonafide-completion-print m-0 ps-1">
                {employee?.employeeName}
              </span>{" "}
              Congratulations on your appointment as
              <span className="bonafide-completion-print m-0 ps-1">
                {employee?.designation}
              </span>{" "}
              and welcome to
              <span className="bonafide-completion-print m-0 ps-1">
                {employee?.college}
              </span>{" "}
              We look forward to years of fruitful cooperation and success. We
              wish you the best of luck in your new post.
            </div>
            <div className="bonafide-completion-content mt-4 pt-2 ps-1 pe-1">
              We would like to confirm your appointment with
              <span className="bonafide-completion-print m-0 ps-1">
                {employee?.college}
              </span>{" "}
              Your employment is subject to the terms and conditions listed
              below.
            </div>

            <div className="bonafide-completion-content mt-4 pt-2 ps-1 pe-1">
              <div className="fw-bold">Starting Date</div>
              <div>
                Your starting date is{" "}
                {moment(employee?.joiningDate).format("DD-MM-YYYY")}
              </div>
              <div className="fw-bold">Salary</div>
              <div>Your salary will be INR {employee?.salary}</div>
              <div className="fw-bold mt-5">Authorized Signatory</div>
              <div className="fw-bold mt-5">
                {employee?.authorizedEmployee?.employee_name}
              </div>
              <div>{employee?.authorizedEmployee?.designation}</div>
            </div>
          </table>
        </div>
      </div>
    </>
  );
}

export default AppointmentOrderPDFDetail;
