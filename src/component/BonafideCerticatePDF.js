import React, { useContext } from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import AuthContext from "../auth/context";
import "../Print.css";

function BonafideCertificatePDFDetail({ student, secondCopy = false }) {
  console.log("student", student);
  const collegeConfig = useSelector((state) => state.web.college);
  const { instituteArray } = useContext(AuthContext);

  return (
    <>
      <div className="row no-gutters border">
        <div className="row no-gutters">
          <div className="col-1"></div>
          <div className="col-10">
            <div className="row no-gutters">
              <div className="col-2 pt-3 text-center">
                <img
                  src={
                    instituteArray.find((obj) => obj.name == student?.college)
                      ?.logo ?? require("../assests/png/pdf_logo.png")
                  }
                  className="print-logo"
                />
              </div>
              <div className="col-8 text-center">
                <div className="college-name">
                  {instituteArray &&
                    instituteArray
                      .find((obj) => obj.name == student?.college)
                      ?.name.toUpperCase()}
                </div>
                {instituteArray.find((obj) => obj.name == student?.college)
                  ?.second_line != "" && (
                  <div className="second-line">
                    {
                      instituteArray.find((obj) => obj.name == student?.college)
                        ?.second_line
                    }
                  </div>
                )}
                {instituteArray.find((obj) => obj.name == student?.college)
                  ?.third_line != "" && (
                  <div className="third-line">
                    {
                      instituteArray.find((obj) => obj.name == student?.college)
                        ?.third_line
                    }
                  </div>
                )}
                {instituteArray.find((obj) => obj.name == student?.college)
                  ?.fourth_line != "" && (
                  <div className="address-line">
                    {
                      instituteArray.find((obj) => obj.name == student?.college)
                        ?.fourth_line
                    }
                  </div>
                )}
                {instituteArray.find((obj) => obj.name == student?.college)
                  ?.fifth_line != "" && (
                  <div className="address-line">
                    {
                      instituteArray.find((obj) => obj.name == student?.college)
                        ?.fifth_line
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row bonafide-completion-label-bold ps-1">
          <div className="col-6 text-left ps-3">No:</div>
          <div className="col-6 text-right pe-3">
            Date:{"  "}
            {moment().format("DD/MM/YYYY")}
          </div>
        </div>
        <table className="table" style={{ marginBottom: "0px" }}>
          <tr>
            <td>
              <div className="receipt-copy text-center bonafide-completion-label-bold">
                <u>BONAFIDE CERTIFICATE</u>
              </div>
            </td>
          </tr>
          <div className="bonafide-completion-content mt-4 pt-2 ps-1 pe-1">
            This is to certify that Mr./Ms.
            <span className="bonafide-completion-print m-0 ps-1">
              {student?.name.toUpperCase()} (Student No. {student?.enrollNo})
            </span>{" "}
            is a bonafide student of this Institution, studying in
            <span className="bonafide-completion-print m-0 ps-1">
              {collegeConfig.institution_type === 1 && "Class "}
              {student?.studyYear}
              {collegeConfig.institution_type !== 1 && " Year "}
            </span>
            <span className="bonafide-completion-print m-0 ps-1">
              {student?.courseName?.toUpperCase()}
            </span>{" "}
            during the academic year {student?.academicYear}. He/She has been
            admitted under the{" "}
            <span className="bonafide-completion-print m-0 ps-1">
              {student?.admissionType}
            </span>{" "}
            quota.
          </div>
          <div className="row p-0">
            <div className="col-9 p-0">
              <div className="bonafide-completion-content mt-3">
                {"His / Her character and conduct have been good."}
              </div>
              <div className="bonafide-completion-bold mt-3">
                <div>{collegeConfig.address}</div>
                <div>{collegeConfig.phone}</div>
                {collegeConfig.print_email}
              </div>
            </div>
            <div className="col-3 text-center label-bold mt-5">PRINCIPAL</div>
          </div>
        </table>
      </div>
    </>
  );
}

export default BonafideCertificatePDFDetail;
